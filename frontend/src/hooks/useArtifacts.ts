'use client'
import { useState, useCallback } from 'react';

export interface SmartContractArtifact {
  id: string;
  contractName: string;
  abi: any[];
  bytecode: `0x${string}`;
  framework: 'foundry' | 'hardhat';
  constructorArgs?: any[];
  dependsOn?: string[]; // Array of contract names this contract depends on
}

// export const useArtifacts = () => {
//   const [artifacts, setArtifacts] = useState<SmartContractArtifact[]>([]);
//   const [isParsing, setIsParsing] = useState(false);

//   const parseFiles = useCallback(async (files: File[]) => {
//     setIsParsing(true);
//     try {
//       const parsingPromises = files
//         .filter(file => file.name.endsWith('.json'))
//         .map(async (file) => {
//           try {
//             const text = await file.text();
//             const json = JSON.parse(text);
            
//             // Foundry artifact
//             if (json.bytecode?.object && json.abi) {
//               return {
//                 id: crypto.randomUUID(),
//                 contractName: file.name.replace('.json', ''),
//                 abi: json.abi,
//                 bytecode: json.bytecode.object.startsWith('0x') 
//                   ? json.bytecode.object 
//                   : `0x${json.bytecode.object}`,
//                 framework: 'foundry',
//                 constructorArgs: [],
//                 dependsOn: []
//               };
//             } 
//             // Hardhat artifact
//             else if (typeof json.bytecode === 'string' && json.bytecode.startsWith('0x') && json.abi) {
//               return {
//                 id: crypto.randomUUID(),
//                 contractName: json.contractName || file.name.replace('.json', ''),
//                 abi: json.abi,
//                 bytecode: json.bytecode,
//                 framework: 'hardhat',
//                 constructorArgs: [],
//                 dependsOn: []
//               };
//             }
//           } catch (e) {
//             console.error("Failed to parse file:", file.name, e);
//             return null;
//           }
//           return null;
//         });

//       const parsedArtifacts = (await Promise.all(parsingPromises)).filter(Boolean) as SmartContractArtifact[];
      
//       // Update state with new artifacts, avoiding duplicates by contractName
//       setArtifacts(prev => {
//         const existingNames = new Set(prev.map(a => a.contractName));
//         const newArtifacts = parsedArtifacts.filter(a => !existingNames.has(a.contractName));
//         return [...prev, ...newArtifacts];
//       });
      
//       return parsedArtifacts;
//     } catch (error) {
//       console.error("Error parsing files:", error);
//       return [];
//     } finally {
//       setIsParsing(false);
//     }
//   }, []);

//   const updateArtifact = useCallback((id: string, updates: Partial<SmartContractArtifact>) => {
//     setArtifacts(prev => 
//       prev.map(artifact => 
//         artifact.id === id ? { ...artifact, ...updates } : artifact
//       )
//     );
//   }, []);

//   const removeArtifact = useCallback((id: string) => {
//     setArtifacts(prev => prev.filter(a => a.id !== id));
//   }, []);

//   const clearArtifacts = useCallback(() => {
//     setArtifacts([]);
//   }, []);

//   return {
//     artifacts,
//     isParsing,
//     parseFiles,
//     updateArtifact,
//     removeArtifact,
//     clearArtifacts
//   };
// };


// 'use client'
// import { useState } from 'react';

// export interface SmartContractArtifact {
//   contractName: string;
//   abi: any[];
//   bytecode: `0x${string}`;
//   framework: 'foundry' | 'hardhat';
// }

export const useArtifacts = () => {
  const [artifacts, setArtifacts] = useState<SmartContractArtifact[]>([]);

  const parseFiles = async (files: File[]) => {
    const detectedArtifacts: SmartContractArtifact[] = [];

    for (const file of files) {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        try {
          const json = JSON.parse(text);
          
          // Foundry Check: Looks for "bytecode" object with an "object" property
          if (json.bytecode?.object && json.abi) {
            detectedArtifacts.push({
              id: crypto.randomUUID(),
              contractName: file.name.replace('.json', ''),
              abi: json.abi,
              bytecode: json.bytecode.object.startsWith('0x') ? json.bytecode.object : `0x${json.bytecode.object}`,
              framework: 'foundry',
              constructorArgs: [],
              dependsOn: []
            });
          } 
          // Hardhat Check: Bytecode is usually a direct hex string
          else if (typeof json.bytecode === 'string' && json.bytecode.startsWith('0x') && json.abi) {
            detectedArtifacts.push({
              id: crypto.randomUUID(),
              contractName: json.contractName || file.name.replace('.json', ''),
              abi: json.abi,
              bytecode: json.bytecode,
              framework: 'hardhat',
              constructorArgs: [],
              dependsOn: []
            });
          }
        } catch (e) {
          console.error("Failed to parse JSON file:", file.name);
        }
      }
    }
    setArtifacts(detectedArtifacts);
  };

  return { artifacts, parseFiles };
};