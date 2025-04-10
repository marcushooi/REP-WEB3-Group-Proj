import React from 'react';
import type { NextPage } from 'next';
import Layout from '../components/layout/Layout';

const CoalitionLoyalty: NextPage = () => {
  // Simulated data
  const coalitionData = {
    name: 'Clarity2',
    schemaId: 'onchain_evm_11155111_0xb994',
    totalPoints: 506,
    totalMerchants: 3,
    totalEarned: {
      usd: 1250.50,
      eth: 0.75
    },
    merchants: [
      {
        id: 'merchant-a',
        name: 'Dyson Store',
        address: '0x1234...5678',
        pointsIssued: 180,
        moneyEarned: {
          usd: 450.25,
          eth: 0.25
        }
      },
      {
        id: 'merchant-b',
        name: 'Merchant B',
        address: '0x2345...6789',
        pointsIssued: 156,
        moneyEarned: {
          usd: 390.00,
          eth: 0.20
        }
      },
      {
        id: 'merchant-c',
        name: 'Merchant C',
        address: '0x3456...7890',
        pointsIssued: 170,
        moneyEarned: {
          usd: 410.25,
          eth: 0.30
        }
      }
    ]
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className='flex flex-row items-center justify-between'>
        <h1 className='text-left text-3xl font-bold text-black px-4 pb-8'>Clarity2 Coalition Loyalty Dashboard</h1>
        
        <h2 className='text-left text-xl font-bold text-blue-700 px-4 pb-8 underline'> <a href="https://testnet-scan.sign.global/schema/onchain_evm_11155111_0xb994" target="_blank" rel="noopener noreferrer">View on the blockchain</a></h2>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Loyalty Program Summary</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Loyalty Points Issued</h2>
              <p className="text-3xl font-bold text-blue-600">{coalitionData.totalPoints}</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Participating Merchants</h2>
              <p className="text-3xl font-bold text-blue-600">{coalitionData.totalMerchants}</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Earned</h2>
              <p className="text-2xl font-bold text-blue-600">${coalitionData.totalEarned.usd}</p>
              <p className="text-lg text-gray-600">{coalitionData.totalEarned.eth} ETH</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Merchant Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coalitionData.merchants.map((merchant) => (
              <div key={merchant.id} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{merchant.name}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Address:</span> {merchant.address}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-800">Total Points Issued:</span> {merchant.pointsIssued}
                  </p>
                  <p className="font-medium text-gray-800">Total Money Earned:</p>
                  <p className="ml-4 text-blue-600">${merchant.moneyEarned.usd}</p>
                  <p className="ml-4 text-gray-600">{merchant.moneyEarned.eth} ETH</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoalitionLoyalty; 