import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";

export type AttestationData = {
	buyer: string;
	merchant: string;
	eth: string;
	usd: string;
	items: string[];
	time: number;
	points: string;
	transactiontype: string;
	txHash: string;
};

export const SchemaData = [
	{ name: "buyer", type: "address" },
	{ name: "merchant", type: "address" },
	{ name: "eth", type: "string" },
	{ name: "usd", type: "string" },
	{ name: "items", type: "string[]" },
	{ name: "time", type: "uint256" },
	{ name: "points", type: "string" },
	{ name: "transactiontype", type: "string" },
	{ name: "txHash", type: "string" },
];
const offChainSchemaId = "0xb994";

export const createAttestation = async (
	data: AttestationData,
): Promise<string> => {
	try {
		const client = new SignProtocolClient(SpMode.OnChain, {
			chain: EvmChains.sepolia,
			rpcUrl: "https://1rpc.io/sepolia",
		});

		const res = await client.createAttestation({
			schemaId: offChainSchemaId,
			data: {
				buyer: data.buyer,
				merchant: data.merchant,
				eth: data.eth,
				usd: data.usd,
				items: data.items,
				time: data.time,
				points: data.points,
				transactiontype: data.transactiontype,
				txHash: data.txHash,
			},
			indexingValue: data.buyer.toLowerCase(),
		});

		if (!res) {
			throw new Error("Failed to create attestation");
		}

		return res.attestationId;
	} catch (error) {
		console.error("Error creating attestation:", error);
		throw error;
	}
};
