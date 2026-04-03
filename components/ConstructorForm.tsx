'use client'
import { mapSolidityTypeToInput } from '@/utils/abi-mapper';

interface ConstructorFormProps {
  artifact: any;
  currentArgs: any[]; // The values currently stored in the plan for THIS contract
  onArgsChange: (newArgs: any[]) => void;
  availableContracts: string[]; // Names of other contracts for the "Dependency Link"
}

export default function ConstructorForm({ 
  artifact, 
  currentArgs, 
  onArgsChange,
  availableContracts 
}: ConstructorFormProps) {
  
  const constructor = artifact.abi.find((item: any) => item.type === 'constructor');
  const params = constructor?.inputs || [];

  const updateValue = (index: number, value: any) => {
    const updatedArgs = [...currentArgs];
    
    // Type Casting for Viem
    const type = params[index].type;
    let finalValue = value;

    if (type.startsWith('uint') && typeof value === 'string' && !value.startsWith('{{')) {
        finalValue = value === "" ? 0n : BigInt(value);
    }

    updatedArgs[index] = finalValue;
    onArgsChange(updatedArgs);
  };

  if (params.length === 0) return <p className="text-gray-500 italic text-sm">No constructor arguments required.</p>;

  return (
    <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
      {params.map((param: any, index: number) => (
        <div key={index} className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-400 font-mono">
              {param.name || `arg[${index}]`} <span className="text-blue-500">({param.type})</span>
            </label>
            
            {/* Dependency Link Dropdown */}
            {param.type === 'address' && (
              <select 
                className="text-[10px] bg-gray-800 border-none rounded px-1 text-blue-400 cursor-pointer"
                onChange={(e) => updateValue(index, `{{${e.target.value}}}`)}
                value={typeof currentArgs[index] === 'string' && currentArgs[index].startsWith('{{') ? currentArgs[index].replace('{{','').replace('}}','') : ""}
              >
                <option value="">Link Address...</option>
                {availableContracts.filter(name => name !== artifact.contractName).map(name => (
                  <option key={name} value={name}>{name}.address</option>
                ))}
              </select>
            )}
          </div>

          <input
            type={mapSolidityTypeToInput(param.type)}
            value={currentArgs[index]?.toString() || ""}
            placeholder={typeof currentArgs[index] === 'string' && currentArgs[index].startsWith('{{') ? "Linked to contract..." : `Enter ${param.type}...`}
            disabled={typeof currentArgs[index] === 'string' && currentArgs[index].startsWith('{{')}
            onChange={(e) => updateValue(index, e.target.value)}
            className="bg-black border border-gray-700 rounded p-2 text-sm focus:border-blue-500 outline-none"
          />
        </div>
      ))}
    </div>
  );
}