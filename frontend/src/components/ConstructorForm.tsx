'use client'
import { useState } from 'react';
import { mapSolidityTypeToInput } from '@/utils/abi-mapper';

export default function ConstructorForm({ artifact, onArgsChange }: { 
  artifact: any, 
  onArgsChange: (args: any[]) => void 
}) {
  const [inputs, setInputs] = useState<any>({});

  // Find the constructor in the ABI
  const constructor = artifact.abi.find((item: any) => item.type === 'constructor');
  const params = constructor?.inputs || [];

  const handleInputChange = (name: string, value: string | boolean) => {
    const newInputs = { ...inputs, [name]: value };
    setInputs(newInputs);
    
    // Convert current inputs state to an ordered array for Viem
    const orderedArgs = params.map((p: any) => {
        const val = newInputs[p.name];
        if (p.type.startsWith('uint')) return BigInt(val || 0);
        if (p.type === 'bool') return Boolean(val);
        return val;
    });
    onArgsChange(orderedArgs);
  };

  if (params.length === 0) {
    return <p className="text-gray-500 italic">No constructor arguments required.</p>;
  }

  return (
    <div className="space-y-4 bg-gray-800/30 p-4 rounded-lg border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-2">Constructor Parameters</h3>
      {params.map((param: any) => (
        <div key={param.name} className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-mono">
            {param.name} <span className="text-blue-400">({param.type})</span>
          </label>
          <input
            type={mapSolidityTypeToInput(param.type)}
            placeholder={`Enter ${param.type}...`}
            onChange={(e) => handleInputChange(param.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value)}
            className="bg-black border border-gray-700 rounded p-2 text-sm focus:border-blue-500 outline-none transition-all"
          />
        </div>
      ))}
    </div>
  );
}