import { useWriteContract, usePublicClient, useConnection } from 'wagmi';
import { encodeDeployData, type Address } from 'viem';
import { useState } from 'react';

export const useDeployer = () => {
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<Address | null>(null);

  const deploy = async (artifact: any, args: any[]) => {
    if (!address || !publicClient) return alert("Please connect your wallet first");

    try {
      setIsDeploying(true);

      // 1. Prepare the Deployment Data (Bytecode + Encoded Args)
      const deployData = encodeDeployData({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        args: args,
      });

      // 2. Send Transaction
      // Note: In Viem/Wagmi, deploying is a 'sendTransaction' with data but no 'to' address.
      // However, AppKit/Wagmi v2 often prefers using 'sendTransaction' directly for deployments.
      const hash = await publicClient.sendTransaction({
        account: address,
        data: deployData,
      });

      // 3. Wait for Receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (receipt.contractAddress) {
        setDeployedAddress(receipt.contractAddress);
        return receipt.contractAddress;
      }
    } catch (error) {
      console.error("Deployment failed:", error);
      throw error;
    } finally {
      setIsDeploying(false);
    }
  };

  return { deploy, isDeploying, deployedAddress };
};