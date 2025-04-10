export const PURCHASE_CONTRACT_ADDRESS =
	process.env.NEXT_PUBLIC_PURCHASE_CONTRACT_ADDRESS || "";

export const PURCHASE_CONTRACT_ABI = [
	{
		inputs: [
			{
				internalType: "address payable",
				name: "merchant",
				type: "address",
			},
			{
				internalType: "bytes",
				name: "signature",
				type: "bytes",
			},
		],
		name: "purchase",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "buyer",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "merchant",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "PurchaseCompleted",
		type: "event",
	},
];
