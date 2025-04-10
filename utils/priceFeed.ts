import type { PublicClient } from "viem";
import { ethers } from "ethers";

// Chainlink ETH/USD Price Feed address on Sepolia
export const ETH_USD_PRICE_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
export const SEPOLIA_CHAIN_ID = 11155111;

// AggregatorV3Interface ABI for Chainlink Price Feed
const AGGREGATOR_V3_INTERFACE_ABI = [
	{
		inputs: [],
		name: "decimals",
		outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "description",
		outputs: [{ internalType: "string", name: "", type: "string" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "latestRoundData",
		outputs: [
			{ internalType: "uint80", name: "roundId", type: "uint80" },
			{ internalType: "int256", name: "answer", type: "int256" },
			{ internalType: "uint256", name: "startedAt", type: "uint256" },
			{ internalType: "uint256", name: "updatedAt", type: "uint256" },
			{ internalType: "uint80", name: "answeredInRound", type: "uint80" },
		],
		stateMutability: "view",
		type: "function",
	},
];

export async function getEthPriceInUsd(): Promise<string> {
	if (typeof window === "undefined" || !window.ethereum) {
		throw new Error("Please install MetaMask or another Web3 wallet");
	}

	try {
		const provider = new ethers.BrowserProvider(window.ethereum);
		const network = await provider.getNetwork();
		if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
			throw new Error("Please connect to Sepolia testnet");
		}

		const priceFeed = new ethers.Contract(
			ETH_USD_PRICE_FEED,
			AGGREGATOR_V3_INTERFACE_ABI,
			provider,
		);

		const decimals = await priceFeed.decimals();
		const roundData = await Promise.race([
			priceFeed.latestRoundData(),
			new Promise((_, reject) =>
				setTimeout(
					() => reject(new Error("Price feed request timed out")),
					10000,
				),
			),
		]);

		const price = roundData.answer;
		const formattedPrice = ethers.formatUnits(price, decimals);
		// Format to 2 decimal places for display
		return Number(formattedPrice).toFixed(2);
	} catch (error) {
		console.error("Error fetching ETH price:", error);
		if (error instanceof Error) {
			if (error.message.includes("user rejected")) {
				throw new Error("User rejected the request");
			}
			if (error.message.includes("timed out")) {
				throw new Error("Request timed out. Please try again.");
			}
			throw error;
		}
		throw new Error("Failed to fetch ETH price");
	}
}

export async function convertUSDToETH(usdAmount: number): Promise<number> {
	try {
		const ethPrice = await getEthPriceInUsd();
		console.log("Current ETH price in USD:", ethPrice); // Debug log

		// Convert USD to ETH directly using division
		const ethAmount = usdAmount / Number(ethPrice);
		console.log("Calculated ETH amount:", ethAmount); // Debug log

		// Round to 6 decimal places
		return Number(ethAmount.toFixed(6));
	} catch (error) {
		console.error("Error converting USD to ETH:", error);
		throw error;
	}
}
