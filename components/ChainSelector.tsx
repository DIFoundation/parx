"use client";

import React, { useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { mainnet, base, celo, sepolia, baseSepolia, celoSepolia } from "wagmi/chains";

interface Chain {
  id: number;
  name: string;
  symbol: string;
  color: string;
}

const mainnetChains: Chain[] = [
  { id: mainnet.id, name: "Ethereum Mainnet", symbol: "ETH", color: "blue" },
  { id: base.id, name: "Base", symbol: "ETH", color: "cyan" },
  { id: celo.id, name: "Celo", symbol: "CELO", color: "green" },
];

const testnetChains: Chain[] = [
  { id: sepolia.id, name: "Sepolia Testnet", symbol: "ETH", color: "blue" },
  { id: baseSepolia.id, name: "Base Sepolia", symbol: "ETH", color: "cyan" },
  { id: celoSepolia.id, name: "Celo Sepolia", symbol: "CELO", color: "green" },
];

interface ChainSelectorProps {
  onChainSelect: (chain: Chain) => void;
}

export default function ChainSelector({ onChainSelect }: ChainSelectorProps) {
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  const { open } = useAppKit();
  const [activeTab, setActiveTab] = useState<'mainnet' | 'testnet'>('mainnet');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChainSelect = (chain: Chain) => {
    if (!address) {
      open();
      return;
    }
    
    switchChain({ chainId: chain.id });
    onChainSelect(chain);
    setIsDropdownOpen(false);
  };

  const currentChain = [...mainnetChains, ...testnetChains].find(c => c.id === currentChainId);
  const activeChains = activeTab === 'mainnet' ? mainnetChains : testnetChains;

  return (
    <div className="space-y-4">
      {!address ? (
        <div className="text-center p-4 border border-gray-700 rounded-lg bg-gray-900/50">
          <p className="text-gray-400 text-sm mb-3">Connect your wallet to select a chain</p>
          <button
            onClick={() => open()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Current Chain:</span>
            {currentChain && (
              <span className={`text-sm font-medium text-${currentChain.color}-400`}>
                {currentChain.name}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border border-gray-700 rounded-lg bg-gray-900/50">
            <button
              onClick={() => setActiveTab('mainnet')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-l-lg ${
                activeTab === 'mainnet'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mainnet
            </button>
            <button
              onClick={() => setActiveTab('testnet')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-r-lg ${
                activeTab === 'testnet'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Testnet
            </button>
          </div>

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-3 border border-gray-700 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-colors text-left flex items-center justify-between"
            >
              <span className="text-sm text-white">
                {activeTab === 'mainnet' ? 'Select Mainnet' : 'Select Testnet'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 border border-gray-700 rounded-lg bg-gray-900/95 backdrop-blur-sm shadow-lg">
                {activeChains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleChainSelect(chain)}
                    className={`w-full p-3 text-left transition-colors border-b border-gray-800 last:border-b-0 ${
                      currentChainId === chain.id
                        ? 'bg-blue-900/20'
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="font-medium text-sm text-white">{chain.name}</div>
                    <div className="text-xs text-gray-400">{chain.symbol}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}