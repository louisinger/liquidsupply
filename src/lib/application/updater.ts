import type { AssetChainTransaction } from '../domain/transaction';
import type { ChainSource } from './chainsource';
import type { TransactionRepository } from './transactions';

export class Updater {
	private loaders: Map<string, boolean> = new Map();

	constructor(private chainSource: ChainSource, private txsRepository: TransactionRepository) {}

	async safeGetTxs(assetHash: string): Promise<AssetChainTransaction[]> {
		try {
			return await this.txsRepository.getTransactionsData(assetHash);
		} catch (e) {
			console.error('updater: ', e);
			return [];
		}
	}

	async update(assetHash: string) {
		if (this.loaders.has(assetHash)) return;
		this.loaders.set(assetHash, true);
		try {
			const txs = await this.safeGetTxs(assetHash);

			let lastSeenTxID = undefined;
			if (txs.length > 0) {
				// get the last (max block height) txID
				lastSeenTxID = txs.reduceRight((prev, current) => {
					return prev.blockHeight > current.blockHeight ? prev : current;
				}).txID;
			}

			let newTxs = [];
			do {
				newTxs = await this.chainSource.getChainTransactions(assetHash, lastSeenTxID);
				if (newTxs.length > 0) {
					await this.txsRepository.addTransactionsData(assetHash, newTxs);
					lastSeenTxID = newTxs[newTxs.length - 1].txID;
				}
			} while (newTxs.length > 0);
		} finally {
			this.loaders.delete(assetHash);
		}
	}
}
