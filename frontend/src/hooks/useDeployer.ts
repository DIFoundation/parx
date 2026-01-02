import { useWriteContract, usePublicClient, useConnection, useSendTransaction } from 'wagmi';
import { encodeDeployData, type Address } from 'viem';
import { useState } from 'react';

export const useDeployer = () => {
  const { address } = useConnection();
  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();
  
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

      // 2. Get gas estimate
      const gasEstimate = await publicClient.estimateGas({
        data: deployData,
        account: address,
      });

      // 3. Get current gas price
      const { maxFeePerGas, maxPriorityFeePerGas } = await publicClient.estimateFeesPerGas();

      // 4. Send the transaction using sendTransaction which handles EIP-1559
      const hash = await sendTransactionAsync({
        data: deployData,
        gas: gasEstimate,
        maxFeePerGas,
        maxPriorityFeePerGas,
      });

      // 5. Wait for transaction receipt
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