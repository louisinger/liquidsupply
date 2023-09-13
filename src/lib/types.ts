import type { SupplyGraph } from "./domain/supplyGraph"

export type Network = 'liquid' | 'testnet'

export function isNetwork(network: string): network is Network {
    return network === 'liquid' || network === 'testnet'
}

export type AssetHash = string

export function isAssetHash(asset: string): asset is AssetHash {
    return asset.length === 64 && /^[0-9a-fA-F]+$/.test(asset)
}

export type SupplyPageParams = {
    network: Network
    asset: AssetHash
}

export type SupplyPageData = {
    params: SupplyPageParams
    supply: SupplyGraph
}