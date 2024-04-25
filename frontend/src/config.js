const contractPerNetwork = {
	mainnet: "hello.near-examples.near",
	testnet: "donation.near-examples.testnet",
};

export const NetworkId = "testnet";
export const DonationNearContract = contractPerNetwork[NetworkId];
