"use client";

import { useState } from 'react';
import ArtifactUploader from '@/components/ArtifactUploader';
import { SmartContractArtifact } from '@/hooks/useArtifacts';
import ConstructorForm from '@/components/ConstructorForm';

export default function ParxHome() {
  const [selectedContract, setSelectedContract] = useState<SmartContractArtifact | null>(null);
  const [activeTab, setActiveTab] = useState<'deploy' | 'verify' | 'explorer'>('deploy');
  const [constructorArgs, setConstructorArgs] = useState<any[]>([]);

  return (
    <main className="min-h-screen bg-black text-gray-100 p-8 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            PARX<span className="text-blue-500">.</span>
          </h1>
          <p className="text-gray-400 mt-2">Parameterized Action Runner for EVM</p>
        </div>

        <nav className="flex gap-6 border-b border-gray-800">
          {['deploy', 'verify', 'explorer'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 px-1 capitalize transition-all ${activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Upload & Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
              1. Load Project
            </h2>
            <ArtifactUploader onContractSelect={setSelectedContract} />
          </div>

          {selectedContract && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-blue-400 font-medium">Selected Contract</p>
              <p className="text-lg font-mono text-white">{selectedContract.contractName}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase">Framework: {selectedContract.framework}</p>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Action Area */}
        <div className="lg:col-span-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl min-h-[500px] p-8">
            {!selectedContract ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📂</span>
                </div>
                <p className="text-gray-400 max-w-xs">
                  Upload your build artifacts to begin the parameterized deployment process.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6">Configure Action: {activeTab}</h2>
                {/* This is where our Constructor Form will go */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Deploy: {selectedContract.contractName}</h2>

                  <ConstructorForm
                    artifact={selectedContract}
                    onArgsChange={setConstructorArgs}
                  />

                  <button
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all"
                    onClick={() => {/* We will add the Viem deployment logic here next! */ }}
                  >
                    Deploy to Network
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}