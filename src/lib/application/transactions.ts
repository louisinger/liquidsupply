import type { AssetChainTransaction } from '$lib/domain/transaction';

export type TransactionRepository = {
	getTransactionsData(assetHash: string): Promise<AssetChainTransaction[]>;
	addTransactionsData(assetHash: string, txs: AssetChainTransaction[]): Promise<void>;
};

export class InMemorySupplyTransactionRepository implements TransactionRepository {
	private txs: Map<string, AssetChainTransaction[]> = new Map();

	getTransactionsData(assetHash: string): Promise<AssetChainTransaction[]> {
		return Promise.resolve(this.txs.get(assetHash) || []);
	}

	addTransactionsData(assetHash: string, txs: AssetChainTransaction[]): Promise<void> {
		const existingTxs = this.txs.get(assetHash) || [];
		this.txs.set(assetHash, [...existingTxs, ...txs]);
		return Promise.resolve();
	}
}
