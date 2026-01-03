import { SmartContractArtifact } from '@/hooks/useArtifacts';

/**
 * Determines the deployment order of contracts based on their dependencies
 */
export function getDeploymentOrder(contracts: SmartContractArtifact[]): SmartContractArtifact[] {
  const result: SmartContractArtifact[] = [];
  const visited = new Set<string>();
  const temp = new Set<string>();
  
  function visit(contract: SmartContractArtifact) {
    if (temp.has(contract.contractName)) {
      throw new Error(`Circular dependency detected involving ${contract.contractName}`);
    }
    
    if (!visited.has(contract.contractName)) {
      temp.add(contract.contractName);
      
      // Visit dependencies first
      contract.dependsOn?.forEach(depName => {
        const dep = contracts.find(c => c.contractName === depName);
        if (dep) visit(dep);
      });
      
      temp.delete(contract.contractName);
      visited.add(contract.contractName);
      result.push(contract);
    }
  }
  
  contracts.forEach(contract => visit(contract));
  return result;
}

/**
 * Resolves constructor arguments by replacing placeholders with actual deployed addresses
 */
export function resolveConstructorArgs(
  args: any[], 
  deployedAddresses: Record<string, string>
): any[] {
  return args.map(arg => {
    if (typeof arg === 'string' && arg.startsWith('{{') && arg.endsWith('}}')) {
      const contractName = arg.slice(2, -2).trim();
      const address = deployedAddresses[contractName];
      if (!address) {
        throw new Error(`Dependency not deployed: ${contractName}`);
      }
      return address;
    }
    return arg;
  });
}

/**
 * Extracts contract names from constructor arguments for dependency tracking
 */
export function extractDependencies(args: any[] = []): string[] {
  return args
    .filter(arg => typeof arg === 'string' && arg.startsWith('{{') && arg.endsWith('}}'))
    .map(arg => arg.slice(2, -2).trim());
}
