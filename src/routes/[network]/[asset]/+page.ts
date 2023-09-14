import { error } from "@sveltejs/kit";
import type { SupplyPageData, SupplyPageParams } from "$lib/types";
import { isAssetHash, isNetwork } from "$lib/types";
import { InMemorySupplyTransactionRepository } from "$lib/application/transactions";
import { Updater } from "$lib/application/updater";
import { EsploraChainSource } from "$lib/application/chainsource";
import { makeSupplyGraph } from "$lib/domain/supplyGraph";

export const load = async ({ params }: { params: SupplyPageParams }): Promise<SupplyPageData> => {
    if (!isNetwork(params.network)) {
        throw error(404, 'invalid network')
    }

    if (!isAssetHash(params.asset)) {
        throw error(404, 'invalid asset')
    }

    const chainSource = new EsploraChainSource(
        params.network === 'liquid' ? "https://blockstream.info/liquid/api/" : "https://blockstream.info/liquidtestnet/api/"
    )

    const txsRepository = new InMemorySupplyTransactionRepository()
    const updater = new Updater(
        chainSource,
        txsRepository
    )

    // fetch new txs not in repo
    await updater.update(params.asset)

    const txs = await txsRepository.getTransactionsData(params.asset)
    const supply = makeSupplyGraph(txs)

    return {
        params,
        supply
    }
}

export const ssr = false