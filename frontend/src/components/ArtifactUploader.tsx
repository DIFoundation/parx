import { useDropzone } from 'react-dropzone';
import { useArtifacts } from '@/hooks/useArtifacts';
import { SmartContractArtifact } from '@/hooks/useArtifacts';

interface Props {
    onContractSelect: (contract: SmartContractArtifact) => void;
}

export default function ArtifactUploader({ onContractSelect }: Props) {
    const { artifacts, parseFiles } = useArtifacts();

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: parseFiles,
        noClick: false,
        noKeyboard: false,
        // Add support for multiple files
        accept: {
            'application/json': ['.json'],
        },
        multiple: true,
    });

    return (
        <div className="p-8 border-2 border-dashed border-gray-700 rounded-xl bg-gray-900 text-center cursor-pointer hover:border-blue-500 transition-all">
            <div {...getRootProps()} className="...">
                <input {...getInputProps()} webkitdirectory="" directory="" />
                <p className="text-gray-400">Drag & drop your <span className="text-white font-bold">build folders</span> here</p>
                <span className="text-xs text-gray-500">(Supports Foundry /out and Hardhat /artifacts)</span>
            </div>

            {artifacts.length > 0 && (
                <div className="mt-4 space-y-2 max-h-100 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">Select Contract:</h3>
                    <ul className="space-y-1">
                        {artifacts.map((art, i) => (
                            <li
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent re-triggering dropzone
                                    onContractSelect(art);
                                }}
                                className="text-xs bg-gray-800 p-2 rounded border border-gray-700 flex justify-between"
                            >
                                <span>{art.contractName}</span>
                                <span className="text-gray-500 uppercase">{art.framework}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
