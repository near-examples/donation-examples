// src/config.ts

// Define the contract per network
const contractPerNetwork: Record<string, string> = {
  testnet: "donation.near-examples.testnet",
  mainnet: "donation.near-examples.near",
};

// Define network type (matches WalletSelector Network type)
export type NearNetwork = "testnet" | "mainnet";

// Set current network
export const NetworkId: NearNetwork = "testnet";

// Get the contract for the current network
export const DonationNearContract: string = contractPerNetwork[NetworkId];

// Chains for EVM Wallets
interface EVMWalletChain {
  chainId: number;
  name: string;
  explorer: string;
  rpc: string;
}

const evmWalletChains: Record<NearNetwork, EVMWalletChain> = {
  mainnet: {
    chainId: 397,
    name: "Near Mainnet",
    explorer: "https://eth-explorer.near.org",
    rpc: "https://eth-rpc.mainnet.near.org",
  },
  testnet: {
    chainId: 398,
    name: "Near Testnet",
    explorer: "https://eth-explorer-testnet.near.org",
    rpc: "https://eth-rpc.testnet.near.org",
  },
};

// Export the current EVM wallet chain
export const EVMWalletChain: EVMWalletChain = evmWalletChains[NetworkId];
