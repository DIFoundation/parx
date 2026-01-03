import { useDropzone } from 'react-dropzone';
import { useArtifacts } from '@/hooks/useArtifacts';
import { SmartContractArtifact } from '@/hooks/useArtifacts';
import { useState } from 'react';

interface Props {
    onContractSelect: (contract: SmartContractArtifact[]) => void;
    onRefresh: () => void;
}

export default function ArtifactUploader({ onContractSelect, onRefresh }: Props) {
    const { artifacts, parseFiles } = useArtifacts();
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedContracts, setSelectedContracts] = useState<Set<number>>(new Set());

    const toggleContract = (index: number) => {
        const newSelection = new Set(selectedContracts);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedContracts(newSelection);
    };

    const handleDone = () => {
        const selected = Array.from(selectedContracts).map(i => artifacts[i]);
        onContractSelect(selected);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            const folderPath = acceptedFiles[0]?.path || '';
            const folderName = folderPath.split('/').slice(0, -1).pop() || 'Selected Folder';
            setSelectedFolder(folderName);
            setSelectedContracts(new Set()); // Reset selection on new folder
            parseFiles(acceptedFiles);
        },
        noClick: false,
        noKeyboard: false,
        accept: {
            'application/json': ['.json'],
        },
        multiple: true,
    });

    return (
        <div className="p-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900 text-center cursor-pointer hover:border-blue-500 transition-all">
            <div {...getRootProps()} className="space-y-2 cursor-pointer">
                <input {...getInputProps()} webkitdirectory="folder" directory="folder" type="file" />
                {selectedFolder ? (
                    <>
                        <p className="text-gray-400">
                            Selected: <span className="text-white font-bold">{selectedFolder}</span>
                        </p>
                        <p className="text-xs text-gray-500">Click to select a different folder</p>
                    </>
                ) : (
                    <>
                        <p className="text-gray-400">
                            Drag & drop your <span className="text-white font-bold">build folders</span> here
                        </p>
                        <p className="text-xs text-gray-500">(Supports Foundry /out and Hardhat /artifacts)</p>
                    </>
                )}
            </div>

            {artifacts.length > 0 && (
                <div className="mt-4 space-y-2 max-h-100 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-blue-400">
                            Select Contracts ({selectedContracts.size} selected)
                        </h3>
                        {selectedContracts.size > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDone();
                                }}
                                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                            >
                                Done
                            </button>
                        )}
                    </div>
                    <ul className="space-y-1">
                        {artifacts.map((art, i) => (
                            <li
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleContract(i);
                                }}
                                className={`text-xs p-2 rounded border flex items-center space-x-2 cursor-pointer 
                                    ${selectedContracts.has(i) ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-800 border-gray-700'}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedContracts.has(i)}
                                    onChange={() => {}}
                                    className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <span className="flex-1">{art.contractName}</span>
                                <span className="text-gray-500 uppercase text-2xs">{art.framework}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
