export const SCHEMA_ID = "0xb994";

export const TRANSACTION_TYPES = {
	PURCHASE: "purchase",
	REFUND: "refund",
	EXCHANGE: "exchange",
} as const;

export type TransactionType =
	(typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export const POINTS_TIERS = {
	BRONZE: "100",
	SILVER: "200",
	GOLD: "300",
	PLATINUM: "500",
} as const;

export type PointsTier = (typeof POINTS_TIERS)[keyof typeof POINTS_TIERS];

export const SCHEMA = [
	{ name: "buyer", type: "address" },
	{ name: "merchant", type: "address" },
	{ name: "eth", type: "string" },
	{ name: "usd", type: "string" },
	{ name: "items", type: "string[]" },
	{ name: "time", type: "uint256" },
	{ name: "points", type: "string" },
	{ name: "transactiontype", type: "string" },
	{ name: "txHash", type: "string" },
] as const;
