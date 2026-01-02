"use client";

import { useState } from 'react';
import { useConnection } from 'wagmi';
import ArtifactUploader from '@/components/ArtifactUploader';
import { SmartContractArtifact } from '@/hooks/useArtifacts';
import ConstructorForm from '@/components/ConstructorForm';
import { useDeployer } from '@/hooks/useDeployer';
import TerminalLog from '@/components/TerminalLog';

interface PlanItem {
  id: string;
  artifact: SmartContractArtifact;
  args: any[]; // These might contain placeholders like "{{ContractA}}"
  status: 'idle' | 'deploying' | 'success' | 'error';
  deployedAddress?: string;
}

function Option({
  activeTab,
  onTabChange
}: {
  activeTab: 'deploy' | 'verify' | 'explorer',
  onTabChange: (tab: 'deploy' | 'verify' | 'explorer') => void
}) {
  return (
    <header className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
      <nav className="flex gap-6 border-b border-gray-800">
        {['deploy', 'verify', 'explorer'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab as any)}
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
  );
}

export default function ParxHome() {
  const { chain } = useConnection();
  const [selectedContract, setSelectedContract] = useState<SmartContractArtifact | null>(null);
  const [activeTab, setActiveTab] = useState<'deploy' | 'verify' | 'explorer'>('deploy');
  const [constructorArgs, setConstructorArgs] = useState<any[]>([]);

  const { deploy, isDeploying } = useDeployer();
  const [logs, setLogs] = useState<string[]>([]);

  const [deployedInfo, setDeployedInfo] = useState<{ address: string, hash: string } | null>(null);
  const [sessionAddresses, setSessionAddresses] = useState<Record<string, string>>({});

  const handleDeploy = async () => {
    setLogs(prev => [...prev, `Starting deployment of ${selectedContract?.contractName}...`]);

    try {
      const address = await deploy(selectedContract, constructorArgs);
      setLogs(prev => [...prev, `Success! Contract deployed at: ${address.address}`]);
      setLogs(prev => [...prev, `Check your wallet or block explorer for confirmation. at ${address.hash}`]);
      if (address.address) {
        setDeployedInfo({ address: address.address, hash: address.hash });
      }
    } catch (err: any) {
      setLogs(prev => [...prev, `Error: ${err.message || "User rejected request"}`]);
      console.log(err);
    }
  };


  const resolveArgs = (args: any[]) => {
    return args.map(arg => {
      // If the argument is a string like "{{MyToken}}", look up its address
      if (typeof arg === 'string' && arg.startsWith('{{') && arg.endsWith('}}')) {
        const contractName = arg.replace('{{', '').replace('}}', '');
        return sessionAddresses[contractName] || arg; // Fallback to original if not found
      }
      return arg;
    });
  };

  const runPipeline = async (orderedContracts: any[]) => {
    let currentAddresses = { ...sessionAddresses };

    for (const contract of orderedContracts) {
      setLogs(prev => [...prev, `Resolving dependencies for ${contract.name}...`]);

      // 1. Resolve Placeholders
      const finalArgs = resolveArgs(contract.args);

      // 2. Deploy
      try {
        const result = await deploy(contract.artifact, finalArgs);

        // 3. Save to Session for next contracts
        currentAddresses[contract.name] = result.address;
        setSessionAddresses(currentAddresses);

        setLogs(prev => [...prev, `Deployed ${contract.name} at ${result.address}`]);
      } catch (e) {
        setLogs(prev => [...prev, `Pipeline stopped: ${contract.name} failed.`]);
        break;
      }
    }
  };

  const explorerLink = [
    {
      name: "Base",
      url: "https://base.blockscout.com/tx/"
    },
    {
      name: "Celo",
      url: "https://celo.blockscout.com/tx/"
    }
  ]

  return (
    <main className="min-h-screen bg-black text-gray-100 p-8 font-sans">
      {/* Header */}
      <Option
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
                    onClick={() => handleDeploy()}
                  >
                    Deploy to {chain?.name} Network
                  </button>
                </div>
              </div>
            )}
          </div>

          {deployedInfo && (
            <div className="mt-6 p-6 bg-green-500/10 border border-green-500/50 rounded-xl animate-in fade-in zoom-in duration-300">
              <h3 className="text-green-400 font-bold flex items-center gap-2">
                <span>✅</span> Deployment Successful!
              </h3>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Contract Address</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-black p-2 rounded block w-full text-sm border border-gray-800">
                      {deployedInfo.address}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(deployedInfo.address)}
                      className="p-2 hover:bg-gray-800 rounded transition-colors"
                      title="Copy Address"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Transaction Hash</p>
                  {explorerLink.map((link: { name: string, url: string }) => (
                    <a
                      key={link.name}
                      href={`${link.url}${deployedInfo.hash}`}
                      target="_blank"
                      className="text-xs text-blue-400 hover:underline font-mono"
                    >
                      {link.name} Explorer
                    </a>
                  ))}
                </div>
              </div>

              {/* Verification Link */}
              <button
                onClick={() => setActiveTab('verify')}
                className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-bold transition-all"
              >
                Verify This Contract Now
              </button>
            </div>
          )}
        </div>
      </section>

      <TerminalLog logs={logs} />

    </main>
  );
}