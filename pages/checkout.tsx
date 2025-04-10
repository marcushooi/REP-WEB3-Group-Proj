import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import Layout from '../components/layout/Layout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { convertUSDToETH, getEthPriceInUsd } from '../utils/priceFeed';
import { ethers } from 'ethers';
import { MERCHANT_ADDRESS } from '../utils/constants';
import { makePayment, getOnchainData, type OnchainData } from '../utils/ethereumUtils';
import { createAttestation, type AttestationData } from '../utils/attestationUtils';

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{
    hash: string;
    timestamp: string;
    amount: string;
  } | null>(null);
  const [onchainData, setOnchainData] = useState<OnchainData | null>(null);
  const [isFetchingOnchainData, setIsFetchingOnchainData] = useState(false);
  const [attestationId, setAttestationId] = useState<string | null>(null);
  const [isCreatingAttestation, setIsCreatingAttestation] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState<{
    totalUSD: number;
    totalETH: number;
    items: string[];
  } | null>(null);
  const [totalETH, setTotalETH] = useState<number>(0);
  const [currentEthPrice, setCurrentEthPrice] = useState<string>('0');
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);

  const totalUSD = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  useEffect(() => {
    const fetchETHPrice = async () => {
      try {
        setIsPriceLoading(true);
        setPriceError(null);
        
        // First get the current ETH price
        const ethPrice = await getEthPriceInUsd();
        setCurrentEthPrice(ethPrice);
        
        if (totalUSD <= 0) {
          setTotalETH(0);
          return;
        }
        
        const ethTotal = await convertUSDToETH(totalUSD);
        console.log('Converted ETH amount:', ethTotal);
        setTotalETH(ethTotal);
      } catch (err) {
        console.error('Error converting USD to ETH:', err);
        setPriceError('Failed to fetch ETH price');
        setTotalETH(0);
        setCurrentEthPrice('0');
      } finally {
        setIsPriceLoading(false);
      }
    };

    fetchETHPrice();
    // Update price every minute
    const interval = setInterval(fetchETHPrice, 60000);
    return () => clearInterval(interval);
  }, [totalUSD]);

  const handleButtonClick = async () => {
    if (!isConnected) {
      // Use the first available connector
      if (connectors[0]) {
        await connect({ connector: connectors[0] });
      }
      return;
    }
    await handleBuyNow();
  };

  const handleBuyNow = async () => {
    if (isProcessing || isSuccess) {
      return;
    }

    setIsProcessing(true);
    setIsSuccess(false);
    setTransactionDetails(null);
    setOnchainData(null);

    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum provider found');
      }

      // Get the provider from the wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // Get chain ID
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      // Format ETH amount with fixed 6 decimal places and convert to wei
      const formattedEthAmount = totalETH.toFixed(6);
      const amountInWei = ethers.parseUnits(formattedEthAmount, 18);

      // Create the message to sign
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'address', 'uint256', 'uint256'],
        [
          userAddress,
          MERCHANT_ADDRESS,
          amountInWei.toString(),
          chainId.toString()
        ]
      );

      // Sign the message using MetaMask
      const signature = await signer.signMessage(ethers.getBytes(messageHash));

      // Make the payment using our utility function
      const tx = await makePayment(MERCHANT_ADDRESS, totalUSD, signature);
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt not received');
      }

      setTransactionDetails({
        hash: receipt.hash,
        timestamp: new Date().toISOString(),
        amount: `${totalUSD} USD (${totalETH.toFixed(6)} ETH)`,
      });

      // Fetch onchain data
      setIsFetchingOnchainData(true);
      try {
        const data = await getOnchainData(receipt.hash);
        setOnchainData(data);
        
        // Store purchase details before clearing cart
        setPurchaseDetails({
          totalUSD,
          totalETH,
          items: cartItems.map(item => `${item.name} x ${item.quantity}`)
        });

        // Create attestation only after successful payment and onchain data fetch
        setIsCreatingAttestation(true);
        const attestationData: AttestationData = {
          buyer: userAddress,
          merchant: MERCHANT_ADDRESS,
          eth: totalETH.toFixed(6),
          usd: totalUSD.toFixed(2),
          items: cartItems.map(item => item.name),
          time: Math.floor(Date.now() / 1000),
          points: totalUSD.toFixed(2),
          transactiontype: 'purchase',
          txHash: receipt.hash
        };

        const attestationId = await createAttestation(attestationData);
        setAttestationId(attestationId);
        console.log('Attestation created with ID:', attestationId);
      } catch (error) {
        console.error('Error fetching onchain data:', error);
      } finally {
        setIsFetchingOnchainData(false);
        setIsCreatingAttestation(false);
        setIsSuccess(true);
        clearCart();
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to complete purchase. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Clarity 2 Checkout Page (SDK)</h1>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-gray-800">Item</th>
              <th className="text-center py-2 text-gray-800">Quantity</th>
              <th className="text-right py-2 text-gray-800">Price</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2 text-gray-800">{item.name}</td>
                <td className="text-center py-2 text-gray-800">
                  {item.quantity}
                </td>
                <td className="text-right py-2 text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">Total (USD):</span>
            <span className="text-xl font-bold text-gray-800">
              ${totalUSD.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">Total (ETH):</span>
            <span className="text-xl font-bold text-gray-800">
              {isPriceLoading ? 'Loading...' : priceError ? 'Price unavailable' : `${totalETH.toFixed(6)} ETH`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">Loyalty Points:</span>
            <span className="text-xl font-bold text-gray-800">
              {isPriceLoading ? 'Loading...' : priceError ? 'Price unavailable' : `${totalUSD.toFixed(2)} Clarity2 Points`}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {isPriceLoading ? 'Loading ETH price...' : 
             priceError ? <span className="text-red-500">{priceError}</span> : 
             `Current ETH Price: $${currentEthPrice}`}
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium">Merchant Address:</span> {MERCHANT_ADDRESS}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-1/4 bg-gray-600 text-white text-center py-2 rounded hover:bg-gray-700"
          >
            Back to Shop
          </button>
          {address ? (
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={isProcessing || isSuccess}
              className={`w-3/4 bg-blue-600 text-white py-2 rounded ${
                (isProcessing || isSuccess) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isProcessing ? 'Processing...' : isSuccess ? 'Payment Completed' : 'Complete Order'}
            </button>
          ) : (
            <div className="w-3/4">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    type="button"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    onClick={openConnectModal}
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          )}
        </div>

        {transactionDetails && (
          <div className="mt-4 p-4 bg-green-50 rounded">
            <h3 className="text-green-800 font-bold">Transaction Successful!</h3>
            <p className="text-green-700">Amount: {transactionDetails.amount}</p>
            <p className="text-green-700">
              Transaction Hash:{' '}
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionDetails.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {transactionDetails.hash}
              </a>
            </p>
            <p className="text-green-700">Time: {new Date(transactionDetails.timestamp).toLocaleString()}</p>
            
            {isFetchingOnchainData ? (
              <p className="text-green-700 mt-2">Fetching onchain data...</p>
            ) : onchainData && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-green-800 font-bold mb-2">Onchain Data:</h4>
                <div className="space-y-1">
                  <p className="text-green-700">Block Number: {onchainData.blockNumber}</p>
                  <p className="text-green-700">From: {onchainData.from}</p>
                  <p className="text-green-700">Contract Address: {onchainData.to}</p>
                  <p className="text-green-700">Merchant Address: {MERCHANT_ADDRESS}</p>
                  <p className="text-green-700">Value: {onchainData.value} ETH</p>
                  <p className="text-green-700">Status: {onchainData.status}</p>
                  <p className="text-green-700">Timestamp: {new Date(onchainData.timestamp * 1000).toLocaleString()}</p>
                </div>
              </div>
            )}

            {isCreatingAttestation ? (
              <p className="text-green-700 mt-4">Creating attestation...</p>
            ) : attestationId && purchaseDetails && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-green-800 font-bold mb-2">Attestation Created:</h4>
                <p className="text-green-700">
                  Attestation ID:{' '}
                  <a
                    href={`https://testnet-scan.sign.global/attestation/onchain_evm_11155111_${attestationId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {attestationId}
                  </a>
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-green-700">Buyer: {address}</p>
                  <p className="text-green-700">Merchant: {MERCHANT_ADDRESS}</p>
                  <p className="text-green-700">Amount: {purchaseDetails.totalUSD} USD ({purchaseDetails.totalETH.toFixed(6)} ETH)</p>
                  <p className="text-green-700">Items: {purchaseDetails.items.join(', ')}</p>
                  <p className="text-green-700">Points Earned: {purchaseDetails.totalUSD}</p>
                  <p className="text-green-700">Transaction Hash: {transactionDetails?.hash}</p>
                  <p className="text-green-700">Time: {new Date().toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
} 