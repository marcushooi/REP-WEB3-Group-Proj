import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Layout from '../components/layout/Layout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createAttestation, type AttestationData } from '../utils/attestationUtils';
import { MERCHANT_ADDRESS } from '../utils/constants';
import { useRouter } from 'next/router';
import { privateKeyToAccount } from 'viem/accounts';

const onChainSchemaId = "onchain_evm_11155111_0xb994";
const offChainSchemaId = "0xb994";
import {
  SignProtocolClient,
  SpMode,
  EvmChains,
  IndexService,
  decodeOnChainData,
  DataLocationOnChain
} from "@ethsign/sp-sdk";
import type { Schema } from "@ethsign/sp-sdk";

type SchemaDetails = {
  id: string;
  mode: string;
  chainType: string;
  chainId: string;
  schemaId: string;
  transactionHash: string;
  name: string;
  description: string;
  revocable: boolean;
  maxValidFor: string;
  resolver: string;
  registerTimestamp: string;
  registrant: string;
  data: Array<{
    name: string;
    type: string;
  }>;
};

export default function AttestationPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifyingSchema, setIsVerifyingSchema] = useState(false);
  const [schemaVerified, setSchemaVerified] = useState<boolean | null>(null);
  const [schemaDetails, setSchemaDetails] = useState<SchemaDetails | null>(null);
  const [attestationId, setAttestationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AttestationData>({
    buyer: address || '',
    merchant: MERCHANT_ADDRESS,
    eth: '0.000432',
    usd: '0.78',
    items: ['Dyson Supersonic 2'],
    time: 0,
    points: '0.78',
    transactiontype: 'purchase',
    txHash: '0x31d2f7a47a7fbfb174ac6aa0e185a4601b45f12ab0e01405a51639220876564e',
  });

  // Update buyer address and timestamp when wallet connection changes
  useEffect(() => {
    if (address) {
      setFormData(prev => ({
        ...prev,
        buyer: address,
        time: Math.floor(Date.now() / 1000)
      }));
    }
  }, [address]);

  const handleAttest = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setError(null);
    setIsProcessing(true);
    try {
      const id = await createAttestation(formData);
      setAttestationId(id);
    } catch (error) {
      console.error('Error creating attestation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create attestation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const verifySchema = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsVerifyingSchema(true);
    setError(null);
    try {
      const indexService = new IndexService("testnet");
      const schemaId = "onchain_evm_11155111_0xb994";
      console.log('Verifying schema with ID:', schemaId);
      
      const res = await indexService.querySchema(schemaId);
      console.log('Schema response:', res);
      
      if (res) {
        console.log('Schema found:', {
          id: res.id,
          name: res.name,
          description: res.description,
          data: res.data,
          maxValidFor: res.maxValidFor,
          revocable: res.revocable,
          registrant: res.registrant,
          registerTimestamp: res.registerTimestamp
        });
        setSchemaDetails(res);
        setSchemaVerified(true);
        setError(null);
      } else {
        console.warn('Schema not found for ID:', schemaId);
        setSchemaVerified(false);
        setError('Schema not found on Sepolia');
      }
    } catch (error) {
      console.error('Error verifying schema:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      setSchemaVerified(false);
      setError(error instanceof Error ? error.message : 'Failed to verify schema');
    } finally {
      setIsVerifyingSchema(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Not set';
    return timestamp.toString();
  };

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Attestation</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Schema Verification Section */}
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Schema Verification</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={verifySchema}
              disabled={isVerifyingSchema}
              className={`px-4 py-2 rounded ${
                isVerifyingSchema 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isVerifyingSchema ? 'Verifying...' : 'Verify Schema'}
            </button>
            
            {schemaVerified !== null && (
              <div className={`flex items-center gap-2 ${
                schemaVerified ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="font-medium">
                  {schemaVerified ? 'Schema Verified' : 'Schema Not Found'}
                </span>
              </div>
            )}
          </div>

          {schemaDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium text-gray-800 mb-2">Schema Details:</h3>
              <pre className="text-sm text-gray-600 overflow-x-auto">
                {JSON.stringify(schemaDetails, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Preview Section */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Preview</h2>
            <div className="space-y-2 text-gray-800">
              <p><span className="font-medium">Buyer:</span> {formData.buyer}</p>
              <p><span className="font-medium">Merchant:</span> {formData.merchant}</p>
              <p><span className="font-medium">ETH Amount:</span> {formData.eth} ETH</p>
              <p><span className="font-medium">USD Amount:</span> ${formData.usd}</p>
              <p><span className="font-medium">Items:</span> {formData.items.join(', ')}</p>
              <p><span className="font-medium">Time (Unix Epoch):</span> {formatDate(formData.time)}</p>
              <p><span className="font-medium">Points:</span> {formData.points}</p>
              <p><span className="font-medium">Transaction Type:</span> {formData.transactiontype}</p>
              <p>
                <span className="font-medium">Transaction Hash:</span>{' '}
                <a
                  href={`https://sepolia.etherscan.io/tx/${formData.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {formData.txHash}
                </a>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-600 text-white text-center py-2 rounded hover:bg-gray-700"
            >
              Back to Shop
            </button>
            {address ? (
            <button
                type="button"
                onClick={
                    async () => {
                        if (!address) {
                            setError('Please connect your wallet first');
                            return;
                        }

                        if (isProcessing) {
                            return; // Prevent multiple clicks
                        }

                        setIsProcessing(true);
                        setError(null);

                        try {
                            const client = new SignProtocolClient(SpMode.OnChain, {
                                chain: EvmChains.sepolia,
                                rpcUrl: "https://1rpc.io/sepolia",
                                
                            });

                            const res = await client.createAttestation({
                                schemaId: offChainSchemaId,
                                data: {
                                    buyer: formData.buyer,
                                    merchant: formData.merchant,
                                    eth: formData.eth,
                                    usd: formData.usd,
                                    items: formData.items,
                                    time: formData.time,
                                    points: formData.points,
                                    transactiontype: formData.transactiontype,
                                    txHash: formData.txHash
                                },
                                indexingValue: formData.buyer.toLowerCase()
                            });

                            if (res) {
                                setAttestationId(res.attestationId);
                                setError(null);
                            }
                        } catch (error) {
                            console.error('Error creating attestation:', error);
                            setError(error instanceof Error ? error.message : 'Failed to create attestation. Please try again.');
                        } finally {
                            setIsProcessing(false);
                        }
                    }}
                    disabled={isProcessing}
                    className={`flex-1 bg-blue-600 text-white py-2 rounded ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                >
                    {isProcessing ? 'Creating Attestation...' : 'Create Attestation'}
                </button>
            
            ) : (
              <div className="flex-1">
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

          {/* Success Message */}
          {attestationId && (
            <div className="mt-4 p-4 bg-green-50 rounded">
              <h3 className="text-green-800 font-bold">Attestation Created Successfully!</h3>
              <div className="mt-2 space-y-2">
                <p className="text-green-700">
                  <span className="font-medium">Attestation ID:</span>{' '}
                  <a
                    href={`https://testnet-scan.sign.global/attestation/onchain_evm_11155111_${attestationId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {attestationId}
                  </a>
                </p>
                <div className="mt-4 p-4 bg-white rounded border">
                  <h4 className="font-medium text-gray-800 mb-2">Attestation Details:</h4>
                  <div className="space-y-2 text-sm text-gray-800">
                    <p><span className="font-medium">Buyer:</span> {formData.buyer}</p>
                    <p><span className="font-medium">Merchant:</span> {formData.merchant}</p>
                    <p><span className="font-medium">ETH Amount:</span> {formData.eth} ETH</p>
                    <p><span className="font-medium">USD Amount:</span> ${formData.usd}</p>
                    <p><span className="font-medium">Items:</span> {formData.items.join(', ')}</p>
                    <p><span className="font-medium">Time:</span> {new Date(formData.time * 1000).toLocaleString()}</p>
                    <p><span className="font-medium">Points:</span> {formData.points}</p>
                    <p><span className="font-medium">Transaction Type:</span> {formData.transactiontype}</p>
                    <p>
                      <span className="font-medium">Transaction Hash:</span>{' '}
                      <a
                        href={`https://sepolia.etherscan.io/tx/${formData.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {formData.txHash}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 