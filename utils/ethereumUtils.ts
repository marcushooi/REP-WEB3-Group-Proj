import { ethers } from "ethers";
import {
	PURCHASE_CONTRACT_ADDRESS,
	PURCHASE_CONTRACT_ABI,
} from "./contractConfig";
import { convertUSDToETH } from "./priceFeed";
import { SEPOLIA_CHAIN_ID } from "./priceFeed";

export async function makePayment(
	merchantAddress: string,
	amountInUSD: number,
	signature: string,
): Promise<ethers.ContractTransactionResponse> {
	if (typeof window === "undefined" || !window.ethereum) {
		throw new Error("Please install MetaMask or another Web3 wallet");
	}

	try {
		const provider = new ethers.BrowserProvider(window.ethereum);
		const signer = await provider.getSigner();

		const network = await provider.getNetwork();
		if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
			throw new Error("Please connect to Sepolia testnet");
		}

		const ethAmount = await convertUSDToETH(amountInUSD);
		const amountInWei = ethers.parseUnits(ethAmount.toFixed(6), 18);

		const purchaseContract = new ethers.Contract(
			PURCHASE_CONTRACT_ADDRESS,
			PURCHASE_CONTRACT_ABI,
			signer,
		);

		const signatureBytes = ethers.getBytes(signature);

		// Send the transaction with the ETH value
		const tx = await purchaseContract.purchase(
			merchantAddress,
			signatureBytes,
			{ value: amountInWei }, // This is crucial - it sends the ETH with the transaction
		);

		return tx;
	} catch (error) {
		console.error("Error making payment:", error);
		if (error instanceof Error) {
			if (error.message.includes("user rejected")) {
				throw new Error("User rejected the transaction");
			}
			if (error.message.includes("insufficient funds")) {
				throw new Error("Insufficient funds for transaction");
			}
			throw error;
		}
		throw new Error("Failed to make payment");
	}
}

export interface OnchainData {
	transactionHash: string;
	blockNumber: number;
	timestamp: number;
	from: string;
	to: string;
	value: string;
	status: "success" | "failed";
}

export async function getOnchainData(txHash: string): Promise<OnchainData> {
	if (typeof window === "undefined" || !window.ethereum) {
		throw new Error("Please install MetaMask or another Web3 wallet");
	}

	try {
		const provider = new ethers.BrowserProvider(window.ethereum);
		const tx = await provider.getTransaction(txHash);
		const receipt = await provider.getTransactionReceipt(txHash);
		const block = await provider.getBlock(tx?.blockNumber || 0);

		if (!tx || !receipt || !block) {
			throw new Error("Transaction data not found");
		}

		return {
			transactionHash: tx.hash,
			blockNumber: tx.blockNumber || 0,
			timestamp: block.timestamp,
			from: tx.from,
			to: tx.to || "",
			value: ethers.formatEther(tx.value),
			status: receipt.status === 1 ? "success" : "failed",
		};
	} catch (error) {
		console.error("Error fetching onchain data:", error);
		throw error;
	}
}
