'use client'
import {
  usePublicClient,
  useConnection,
  useWalletClient,
} from "wagmi";
import { encodeDeployData, type Address } from "viem";
import { useState } from "react";

export const useDeployer = () => {
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<Address | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  const deploy = async (artifact: any, args: any[]) => {
    if (!address || !publicClient || !walletClient) {
      const error = "Please connect your wallet first";
      setDeploymentError(error);
      throw new Error(error);
    }

    setIsDeploying(true);
    setDeploymentError(null);

    try {
      // 1. Prepare the Deployment Data (Bytecode + Encoded Args)
      const deployData = encodeDeployData({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        args: args,
      });

      // 2. Get gas estimate
      const gasEstimate = await publicClient.estimateGas({
        data: deployData,
        account: address,
      });

      // 3. Get current gas price
      const { maxFeePerGas, maxPriorityFeePerGas } = await publicClient.estimateFeesPerGas();

      // 4. Send the transaction using walletClient
      const hash = await walletClient.sendTransaction({
        data: deployData,
        gas: gasEstimate,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });

      // 5. Wait for transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      if (!receipt.contractAddress) {
        throw new Error("No contract address in receipt");
      }

      setDeployedAddress(receipt.contractAddress);
      
      console.log('Deployed Contract', deployedAddress);

      return {
        address: receipt.contractAddress,
        hash,
        receipt
      };

    } catch (error: any) {
      console.error("Deployment failed:", error);
      const errorMessage = error?.message || "Failed to deploy contract";
      setDeploymentError(errorMessage);
      throw error;
    } finally {
      setIsDeploying(false);
    }
  };

  return { 
    deploy, 
    isDeploying, 
    deployedAddress, 
    address, 
    walletClient,
    error: deploymentError 
  };
};
