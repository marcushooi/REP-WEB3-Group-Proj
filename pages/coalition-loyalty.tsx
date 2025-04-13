import React from 'react';
import type { NextPage } from 'next';
import Layout from '../components/layout/Layout';

const CoalitionLoyalty: NextPage = () => {
  // Simulated data
  const coalitionData = {
    name: 'Clarity',
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
        <h1 className='text-left text-3xl font-bold text-black px-4 pb-8 flex items-center'>
          <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2" aria-label="Clarity Logo" role="img">
            <path d="M2 12.5C2 9.7 4.2 7.5 7 7.5C9.8 7.5 12 9.7 12 12.5M2 12.5C2 18.0228 6.47715 22.5 12 22.5C17.5228 22.5 22 18.0228 22 12.5M2 12.5C2 6.97715 6.47715 2.5 12 2.5C17.5228 2.5 22 6.97715 22 12.5M12 12.5C12 15.3 14.2 17.5 17 17.5C19.8 17.5 22 15.3 22 12.5M12 12.5C10.8463 11.837 9.47638 11.6593 8.19175 12.0062C6.90713 12.3532 5.81294 13.1962 5.1499 14.3499C4.48686 15.5036 4.30928 16.8734 4.65622 18.1581C5.00316 19.4427 5.84621 20.5369 6.9999 21.1999M12 12.5C12.5647 12.8283 13.1884 13.0421 13.8357 13.1293C14.4831 13.2165 15.1413 13.1754 15.7727 13.0082C16.4041 12.8411 16.9965 12.5512 17.5159 12.1551C18.0353 11.7591 18.4716 11.2646 18.7999 10.6999C19.1282 10.1352 19.3421 9.5114 19.4293 8.86406C19.5165 8.21673 19.4754 7.55855 19.3082 6.92711C19.1411 6.29567 18.8512 5.70334 18.4551 5.18393C18.0591 4.66452 17.5646 4.22821 16.9999 3.8999M7 3.79992C8.14043 3.13688 9.49754 2.95403 10.7728 3.2916C12.048 3.62916 13.137 4.45949 13.8 5.59992C14.463 6.74035 14.6459 8.09747 14.3083 9.37271C13.9708 10.648 13.1404 11.7369 12 12.3999C10.8596 13.063 10.0292 14.1519 9.69167 15.4271C9.35411 16.7024 9.53696 18.0595 10.2 19.1999C10.863 20.3404 11.952 21.1707 13.2272 21.5082C14.5025 21.8458 15.8596 21.663 17 20.9999" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Clarity2 Coalition Loyalty Dashboard
        </h1>
        
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