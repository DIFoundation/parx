"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi'; // useConnection is usually for low-level, useAccount for UI
import ArtifactUploader from '@/components/ArtifactUploader';
import { SmartContractArtifact } from '@/hooks/useArtifacts';
import ConstructorForm from '@/components/ConstructorForm';
import { useDeployer } from '@/hooks/useDeployer';
import TerminalLog from '@/components/TerminalLog';
import Link from 'next/link';

// Define the structure for an item in our deployment queue
interface PlanItem {
  id: string;
  artifact: SmartContractArtifact;
  args: any[];
  status: 'idle' | 'deploying' | 'success' | 'error';
  address?: string;
}

export default function ParxHome() {
  const { chain } = useAccount();
  const [activeTab, setActiveTab] = useState<'deploy' | 'verify' | 'explorer'>('deploy');
  
  // THE CORE CHANGE: A list of contracts to be deployed
  const [deploymentPlan, setDeploymentPlan] = useState<PlanItem[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const { deploy, isDeploying } = useDeployer();

  // Helper to add contracts to the queue from the uploader
  const handleAddContracts = (artifacts: SmartContractArtifact[]) => {
    const newItems: PlanItem[] = artifacts.map(art => ({
      id: crypto.randomUUID(),
      artifact: art,
      args: [], // Initial empty args
      status: 'idle'
    }));
    setDeploymentPlan(prev => [...prev, ...newItems]);
  };

  const resolveArgs = (args: any[], resolvedAddresses: Record<string, string>) => {
    return args.map(arg => {
      if (typeof arg === 'string' && arg.startsWith('{{') && arg.endsWith('}}')) {
        const contractName = arg.replace('{{', '').replace('}}', '');
        const addr = resolvedAddresses[contractName];
        if (!addr) throw new Error(`Dependency ${contractName} not found or not deployed yet.`);
        return addr;
      }
      return arg;
    });
  };

  const runPipeline = async () => {
    setLogs(prev => [...prev, "🚀 Starting Deployment Pipeline..."]);
    const sessionAddresses: Record<string, string> = {};

    for (const item of deploymentPlan) {
      if (item.status === 'success') continue; // Skip already deployed

      try {
        setLogs(prev => [...prev, `Preparing ${item.artifact.contractName}...`]);
        
        // Update status in UI
        updateItemStatus(item.id, 'deploying');

        // 1. Resolve Dependencies
        const finalArgs = resolveArgs(item.args, sessionAddresses);

        // 2. Deploy
        const result = await deploy(item.artifact, finalArgs);

        // 3. Record success
        sessionAddresses[item.artifact.contractName] = result.address;
        updateItemStatus(item.id, 'success', result.address);
        
        setLogs(prev => [...prev, `✅ ${item.artifact.contractName} deployed at ${result.address}`]);
      } catch (err: any) {
        updateItemStatus(item.id, 'error');
        setLogs(prev => [...prev, `❌ Error deploying ${item.artifact.contractName}: ${err.message}`]);
        break; // Stop pipeline on error
      }
    }
  };

  const updateItemStatus = (id: string, status: PlanItem['status'], address?: string) => {
    setDeploymentPlan(prev => prev.map(item => 
      item.id === id ? { ...item, status, address: address || item.address } : item
    ));
  };

  return (
    <main className="min-h-screen bg-black text-gray-100 p-8 font-sans">
      <section className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Artifacts & Plan */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase text-gray-500 mb-4">1. Load Project</h2>
            <ArtifactUploader onContractSelect={(arts: any) => handleAddContracts(Array.isArray(arts) ? arts : [arts])} />
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase text-gray-500">Deployment Queue</h2>
            {deploymentPlan.length === 0 && <p className="text-xs text-gray-600">Queue is empty</p>}
            {deploymentPlan.map((item) => (
              <div key={item.id} className={`p-3 rounded-lg border flex justify-between items-center ${item.status === 'success' ? 'border-green-900 bg-green-900/10' : 'border-gray-800 bg-gray-900'}`}>
                <div>
                  <p className="text-sm font-mono">{item.artifact.contractName}</p>
                  {item.address && <p className="text-[10px] text-gray-500 truncate w-32">{item.address}</p>}
                </div>
                <button onClick={() => setDeploymentPlan(prev => prev.filter(i => i.id !== item.id))} className="text-gray-600 hover:text-red-500 text-xs">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Configuration */}
        <div className="lg:col-span-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Pipeline Configuration</h2>
            
            {deploymentPlan.length === 0 ? (
              <p className="text-gray-500">Add contracts from the left to configure parameters.</p>
            ) : (
              <div className="space-y-12">
                {deploymentPlan.map((item) => (
                  <div key={item.id} className="relative pl-6 border-l border-gray-800">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="text-lg font-bold text-white mb-4">{item.artifact.contractName}</h3>
                    
                    <ConstructorForm
                      artifact={item.artifact}
                      currentArgs={item.args}
                      availableContracts={deploymentPlan.map(p => p.artifact.contractName)}
                      onArgsChange={(newArgs) => {
                        setDeploymentPlan(prev => prev.map(p => p.id === item.id ? { ...p, args: newArgs } : p));
                      }}
                    />
                  </div>
                ))}

                <button
                  disabled={isDeploying || deploymentPlan.length === 0}
                  onClick={runPipeline}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-900/20 transition-all"
                >
                  {isDeploying ? "Deploying Pipeline..." : `Run Sequence on ${chain?.name || 'Network'}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto mt-10">
        <TerminalLog logs={logs} />
      </div>
    </main>
  );
}