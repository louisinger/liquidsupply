import axios, { type AxiosInstance } from 'axios';
import axiosThrottle from 'axios-request-throttle';
import type { Asset } from '../domain/asset';
import type { AssetChainTransaction } from '../domain/transaction';
import type { AssetHash } from '$lib/types';

axiosThrottle.use(axios, { requestsPerSecond: 5 });

export interface ChainSource {
  getAsset(asset: AssetHash): Promise<Asset>;
  getChainTransactions(
    assetHash: AssetHash,
    lastSeenTxID?: string
  ): Promise<AssetChainTransaction[]>;
}

type EsploraTransaction = {
  txid: string;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_time?: number;
  };
  vin: Array<{
    txID: string;
    vout: number;
    issuance?: {
      asset_id: string;
      is_reissuance: boolean;
      assetamount?: number;
      tokenamount?: number;
    };
  }>;
  vout: Array<{
    scriptpubkey: string;
    value?: number;
    asset?: string;
  }>;
};

function toAssetChainTransaction(
  a: EsploraTransaction,
  assetHash: string
): AssetChainTransaction {
  const issuances = a.vin
    .filter(
      (i) =>
        i.issuance &&
        i.issuance.asset_id === assetHash &&
        i.issuance.assetamount
    )
    .map(({ issuance }) => {
      return {
        assetAmount: issuance?.assetamount || 0,
        tokenAmount: issuance?.tokenamount || 0,
        isReissuance: issuance?.is_reissuance || false,
      };
    });

  const burnOutputs = a.vout
    .filter((o) => o.scriptpubkey && o.scriptpubkey.startsWith('6a') && o.value)
    .map((o) => {
      return {
        vout: a.vout.indexOf(o),
        amount: o.value || 0,
      };
    });

  return {
    txID: a.txid,
    issuances,
    burnOutputs,
    blockHeight: a.status.block_height || -1,
    blockTime: a.status.block_time || -1,
  };
}

type EsploraAsset = {
  asset_id: string;
  name: string;
  precision?: number;
  ticker?: string;
};

function toAsset(a: EsploraAsset): Asset {
  return {
    assetHash: a.asset_id,
    name: a.name,
    ticker: a.ticker,
    precision: a.precision || 0,
  };
}

export class EsploraChainSource implements ChainSource {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
    });
  }

  async getAsset(
    assetHash: string,
  ): Promise<Asset> {
    const response = await this.axiosInstance.get<EsploraAsset>(
      `/asset/${assetHash}`
    );

    return toAsset(response.data);
  } 

  async getChainTransactions(
    assetHash: string,
    lastSeenTxID?: string
  ): Promise<AssetChainTransaction[]> {
    const response = await this.axiosInstance.get<EsploraTransaction[]>(
      `/asset/${assetHash}/txs/chain/${lastSeenTxID}`
    );

    return response.data.map((t) => toAssetChainTransaction(t, assetHash));
  }
}
