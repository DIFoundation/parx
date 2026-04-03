import React from 'react';
import { SmartContractArtifact } from '@/hooks/useArtifacts';

interface ContractListProps {
  artifacts: SmartContractArtifact[];
  deployedAddresses: Record<string, string>;
  onUpdate: (id: string, updates: Partial<SmartContractArtifact>) => void;
  onRemove: (id: string) => void;
  onDeploy: () => void;
  isDeploying: boolean;
}

export const ContractList: React.FC<ContractListProps> = ({
  artifacts,
  deployedAddresses,
  onUpdate,
  onRemove,
  onDeploy,
  isDeploying
}) => {
  const renderConstructorInputs = (artifact: SmartContractArtifact) => {
    // Find the constructor in the ABI
    const constructorAbi = artifact.abi.find(
      (item: any) => item.type === 'constructor' && item.inputs?.length > 0
    );

    if (!constructorAbi?.inputs?.length) {
      return <p className="text-sm text-gray-400">No constructor parameters</p>;
    }

    return (
      <div className="mt-2 space-y-2">
        <h4 className="text-xs font-semibold text-gray-400">Constructor Parameters:</h4>
        <div className="space-y-2">
          {constructorAbi.inputs.map((input: any, index: number) => (
            <div key={index} className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">
                {input.name || `param_${index}`} ({input.type})
              </label>
              <input
                type="text"
                value={artifact.constructorArgs?.[index] || ''}
                onChange={(e) => {
                  const newArgs = [...(artifact.constructorArgs || [])];
                  newArgs[index] = e.target.value;
                  onUpdate(artifact.id, { constructorArgs: newArgs });
                }}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                placeholder={input.type}
              />
              <p className="text-xs text-gray-500 mt-1">
                {input.internalType || input.type}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Selected Contracts</h3>
        <div className="flex space-x-2">
          <button
            onClick={onDeploy}
            disabled={isDeploying || artifacts.length === 0}
            className={`px-4 py-2 rounded ${
              isDeploying || artifacts.length === 0
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isDeploying ? 'Deploying...' : `Deploy All (${artifacts.length})`}
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {artifacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No contracts selected. Upload contract artifacts to get started.
          </div>
        ) : (
          artifacts.map((artifact) => (
            <div
              key={artifact.id}
              className="border border-gray-700 rounded-lg p-4 bg-gray-900/50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{artifact.contractName}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-300">
                      {artifact.framework}
                    </span>
                    {deployedAddresses[artifact.contractName] && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full">
                        Deployed
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(artifact.id)}
                  className="text-gray-400 hover:text-red-400"
                  title="Remove contract"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {renderConstructorInputs(artifact)}

              {deployedAddresses[artifact.contractName] && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-xs text-gray-400">Deployed at:</p>
                  <div className="flex items-center mt-1">
                    <code className="text-xs bg-gray-800 px-2 py-1 rounded">
                      {deployedAddresses[artifact.contractName]}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(deployedAddresses[artifact.contractName])}
                      className="ml-2 text-gray-400 hover:text-white"
                      title="Copy address"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2v-2a1 1 0 112 0v2a4 4 0 01-4 4H6a4 4 0 01-4-4V5a4 4 0 014-4h2a1 1 0 011 1z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
