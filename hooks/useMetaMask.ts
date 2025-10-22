// MetaMask integration hook for real blockchain transactions
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  AidRouteContractHelper,
  CONTRACT_ADDRESSES,
  isContractDeployed,
} from "@/lib/contract-integration";

interface MetaMaskAccount {
  address: string;
  balance: string;
  chainId: string;
}

interface TransactionRequest {
  to: string;
  value: string;
  data: string;
  gas?: string;
  gasPrice?: string;
}

export function useMetaMask() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<MetaMaskAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled =
    typeof window !== "undefined" &&
    typeof window.ethereum !== "undefined" &&
    window.ethereum.isMetaMask;

  // Connect to MetaMask
  const connect = async () => {
    if (!isMetaMaskInstalled) {
      setError(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        setError("MetaMask not available");
        return false;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        setError("No accounts found. Please unlock MetaMask.");
        return false;
      }

      // Get account details
      const address = accounts[0];
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setAccount({
        address,
        balance: (parseInt(balance, 16) / 1e18).toFixed(4),
        chainId,
      });

      setIsConnected(true);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to connect to MetaMask");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to Sepolia testnet
  const switchToSepolia = async () => {
    if (!isMetaMaskInstalled || !window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Sepolia testnet
      });
      return true;
    } catch (err: any) {
      // If Sepolia is not added, add it
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia Test Network",
                rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
                nativeCurrency: {
                  name: "SepoliaETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          return true;
        } catch (addErr) {
          setError("Failed to add Sepolia network");
          return false;
        }
      }
      setError("Failed to switch to Sepolia network");
      return false;
    }
  };

  // Send transaction (this will trigger MetaMask popup)
  const sendTransaction = async (transaction: TransactionRequest) => {
    if (!isMetaMaskInstalled || !isConnected || !window.ethereum) {
      setError("Please connect to MetaMask first");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This will trigger the MetaMask popup
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });

      return txHash;
    } catch (err: any) {
      setError(err.message || "Transaction failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Send contract interaction (this will trigger MetaMask popup)
  const sendContractTransaction = async (
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[],
    value: string = "0x0"
  ) => {
    if (!isMetaMaskInstalled || !isConnected || !window.ethereum) {
      setError("Please connect to MetaMask first");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This will trigger the MetaMask popup
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            to: contractAddress,
            value: value,
            data: "0x", // This would need to be encoded properly in a real implementation
          },
        ],
      });

      return txHash;
    } catch (err: any) {
      setError(err.message || "Contract transaction failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAccount(null);
      } else {
        // Reconnect with new account
        connect();
      }
    };

    const handleChainChanged = (chainId: string) => {
      // Reload page when chain changes
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [isMetaMaskInstalled]);

  // Create mission on contract
  const createMission = async (
    location: string,
    description: string,
    items: string[],
    fundingGoalUSD: number
  ) => {
    if (!isMetaMaskInstalled || !isConnected) {
      setError("Please connect to MetaMask first");
      return null;
    }

    if (!isContractDeployed("sepolia")) {
      setError(
        "Contract not deployed. Please deploy first using: npx tsx scripts/test-deployment.ts"
      );
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!window.ethereum) throw new Error("MetaMask not available");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractHelper = new AidRouteContractHelper(signer, "sepolia");

      const receipt = await contractHelper.createMission(
        location,
        description,
        items,
        fundingGoalUSD
      );
      return receipt.hash;
    } catch (err: any) {
      setError(err.message || "Mission creation failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Donate to mission
  const donateTo = async (amountUSD: number, missionId: number = 0) => {
    if (!isMetaMaskInstalled || !isConnected) {
      setError("Please connect to MetaMask first");
      return null;
    }

    if (!isContractDeployed("sepolia")) {
      setError(
        "Contract not deployed. Please deploy first using: npx tsx scripts/test-deployment.ts"
      );
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!window.ethereum) throw new Error("MetaMask not available");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractHelper = new AidRouteContractHelper(signer, "sepolia");

      const receipt = await contractHelper.donate(amountUSD, missionId);
      return receipt.hash;
    } catch (err: any) {
      setError(err.message || "Donation failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Deploy funds for mission
  const deployMissionFunds = async (
    missionId: number,
    amountUSD: number,
    recipient: string
  ) => {
    if (!isMetaMaskInstalled || !isConnected) {
      setError("Please connect to MetaMask first");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!window.ethereum) throw new Error("MetaMask not available");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractHelper = new AidRouteContractHelper(signer, "sepolia");

      const receipt = await contractHelper.deployFunds(
        missionId,
        amountUSD,
        recipient
      );
      return receipt.hash;
    } catch (err: any) {
      setError(err.message || "Fund deployment failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get contract stats
  const getContractStats = async () => {
    if (!isMetaMaskInstalled) return null;

    try {
      if (!window.ethereum) return null;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contractHelper = new AidRouteContractHelper(provider, "sepolia");
      return await contractHelper.getStats();
    } catch (err: any) {
      console.error("Failed to get contract stats:", err);
      return null;
    }
  };

  return {
    isMetaMaskInstalled,
    isConnected,
    account,
    isLoading,
    error,
    connect,
    switchToSepolia,
    sendTransaction,
    sendContractTransaction,
    // Contract interactions
    createMission,
    donateTo,
    deployMissionFunds,
    getContractStats,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (
        event: string,
        callback: (...args: any[]) => void
      ) => void;
    };
  }
}
