import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Layout from '../components/layout/Layout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { IndexService, decodeOnChainData, DataLocationOnChain, type SchemaItem } from "@ethsign/sp-sdk";

type Attestation = {
  id: string;
  schemaId: string;
  attester: string;
  validUntil: string;
  time: string;
  revoked: boolean;
  data: string;
  decodedData?: Record<string, unknown>;
};

export default function MyTransactionsPage() {
  const { address, isConnected } = useAccount();
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalPurchases: 0,
    totalUsdSpent: 0
  });
  const [expandedAttestations, setExpandedAttestations] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedAttestations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (address) {
      fetchUserAttestations();
    }
  }, [address]);

  useEffect(() => {
    // Calculate stats whenever attestations change
    const newStats = attestations.reduce((acc, attestation) => {
      if (attestation.decodedData) {
        const points = Number.parseFloat(attestation.decodedData.points as string) || 0;
        const usd = Number.parseFloat(attestation.decodedData.usd as string) || 0;
        
        return {
          totalPoints: acc.totalPoints + points,
          totalPurchases: acc.totalPurchases + 1,
          totalUsdSpent: acc.totalUsdSpent + usd
        };
      }
      return acc;
    }, { totalPoints: 0, totalPurchases: 0, totalUsdSpent: 0 });

    setStats(newStats);
  }, [attestations]);

  const fetchUserAttestations = async () => {
    try {
      setLoading(true);
      setError(null);

      const indexService = new IndexService("testnet");
      const response = await indexService.queryAttestationList({
        indexingValue: address?.toLowerCase(),
        page: 1,
        mode: "onchain"
      });

      console.log('Raw attestation response:', response);
      
      if (response?.rows) {
        const formattedAttestations = await Promise.all(response.rows.map(async (attestation) => {
          try {
            // Query the schema for this attestation
            const schemaResponse = await indexService.querySchemaList({
              id: attestation.schema.id,
              page: 1
            });

            if (!schemaResponse?.rows?.[0]?.data) {
              throw new Error('Schema data not found');
            }

            // Decode the attestation data using the schema
            const decodedData = decodeOnChainData(
              attestation.data,
              DataLocationOnChain.ONCHAIN,
              schemaResponse.rows[0].data as SchemaItem[]
            );

            return {
              id: attestation.id,
              schemaId: attestation.schemaId,
              attester: attestation.attester,
              validUntil: attestation.validUntil,
              time: attestation.attestTimestamp,
              revoked: attestation.revoked,
              data: attestation.data,
              decodedData
            };
          } catch (decodeError) {
            console.error('Error decoding attestation data:', decodeError);
            return {
              id: attestation.id,
              schemaId: attestation.schemaId,
              attester: attestation.attester,
              validUntil: attestation.validUntil,
              time: attestation.attestTimestamp,
              revoked: attestation.revoked,
              data: attestation.data
            };
          }
        }));
        
        console.log('Formatted attestations with decoded data:', formattedAttestations);
        setAttestations(formattedAttestations);
      }
    } catch (err) {
      console.error('Error fetching attestations:', err);
      setError('Failed to fetch your transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(Number.parseInt(timestamp)).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const serializeBigInt = (key: string, value: unknown) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  return (
    <Layout>
    <h1  className='text-center text-black'>My Transactions</h1>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-black">My Transactions</h1>
        
        {!isConnected ? (
          <div className="text-center">
            <p className="mb-4 text-black">Please connect your wallet to view your transactions</p>
            <ConnectButton />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-black mb-2">Total Points</h3>
                <p className="text-3xl font-bold text-black">{stats.totalPoints.toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-black mb-2">Total Purchases</h3>
                <p className="text-3xl font-bold text-black">{stats.totalPurchases}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-black mb-2">Total USD Spent</h3>
                <p className="text-3xl font-bold text-black">${stats.totalUsdSpent.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-1">({(stats.totalUsdSpent * 0.0005).toFixed(4)} ETH)</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-black">Loading your transactions...</div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : attestations.length === 0 ? (
              <div className="text-center text-black">No transactions found</div>
            ) : (
              <div className="grid gap-4">
                {attestations.map((attestation) => (
                  <div
                    key={attestation.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-black break-all">Transaction ID: {attestation.id}</h3>
                          {attestation.decodedData && (
                            <>
                              <p className="text-sm text-black mt-1">
                                <span className="font-medium">Amount:</span> ${(attestation.decodedData.usd as string)}
                                <span className="text-gray-500 ml-2">({(attestation.decodedData.eth as string)} ETH)</span>
                              </p>
                              <p className="text-sm text-black">
                                Points: {attestation.decodedData.points as string}
                              </p>
                              <p className="text-sm text-black">
                                Merchant: {attestation.decodedData.merchant as string}
                              </p>
                              <p className="text-sm text-black">
                                Date: {formatDate(attestation.time)}
                              </p>
                            </>
                          )}
                        </div>
                        <a
                          href={`https://testnet-scan.sign.global/attestation/${attestation.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View on Explorer
                        </a>
                      </div>
                      {attestation.decodedData && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(attestation.id)}
                            className="flex items-center text-black hover:text-gray-700"
                            title="Toggle decoded data"
                          >
                            <span className="font-medium">View Details</span>
                            <svg
                              className={`w-4 h-4 ml-2 transform transition-transform ${
                                expandedAttestations.has(attestation.id) ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {expandedAttestations.has(attestation.id) && (
                            <div className="mt-2 p-3 bg-gray-50 rounded">
                              <div className="grid grid-cols-2 gap-4 text-sm text-black">
                                <div>
                                  <p className="font-medium">Items:</p>
                                  <p>{(attestation.decodedData.items as string[]).join(', ')}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Type:</p>
                                  <p>{attestation.decodedData.transactiontype as string}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Points:</p>
                                  <p>{attestation.decodedData.points as string}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Buyer:</p>
                                  <p>{formatAddress(attestation.decodedData.buyer as string)}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Merchant:</p>
                                  <p>{attestation.decodedData.merchant as string}</p>
                                </div>
                                <div>
                                  <p className="font-medium">Transaction Hash:</p>
                                  <p className="break-all">{attestation.decodedData.txHash as string}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 