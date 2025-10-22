// Contract deployment status component
"use client";

import { useState, useEffect } from "react";
import { isContractDeployed } from "@/lib/contract-integration";
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Copy,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeploymentStatusProps {
  onDeploymentComplete?: () => void;
}

export function DeploymentStatus({
  onDeploymentComplete,
}: DeploymentStatusProps) {
  const [isDeployed, setIsDeployed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setIsDeployed(isContractDeployed("sepolia"));
    if (isDeployed && onDeploymentComplete) {
      onDeploymentComplete();
    }
  }, [isDeployed, onDeploymentComplete]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isDeployed) {
    return (
      <></>
      // <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
      //   <div className="flex items-center gap-2 text-green-600">
      //     <CheckCircle className="w-5 h-5" />
      //     <span className="font-semibold">Contract Address Set!</span>
      //   </div>
      //   <p className="text-sm text-green-600/80 mt-1">
      //     Contract address configured. For real testing, deploy with actual
      //     private key.
      //   </p>
      //   <div className="mt-2 text-xs text-green-600/70">
      //     <strong>Note:</strong> This is a mock address for UI testing. Real
      //     transactions require actual contract deployment.
      //   </div>
      // </div>
    );
  }

  return (
    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 text-orange-600 mb-3">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-semibold">Contract Not Deployed</span>
      </div>

      <p className="text-sm text-orange-600/80 mb-3">
        The AidRouteMissions smart contract needs to be deployed before you can
        create missions or make donations.
      </p>

      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="text-sm text-orange-600 hover:text-orange-700 underline"
      >
        {showInstructions ? "Hide" : "Show"} deployment instructions
      </button>

      {showInstructions && (
        <div className="mt-4 space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Terminal className="w-4 h-4" />
              <span className="text-sm font-mono">Deployment Commands</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <code className="text-green-400 text-sm flex-1">
                  npx tsx scripts/test-deployment.ts
                </code>
                <button
                  onClick={() =>
                    copyToClipboard("npx tsx scripts/test-deployment.ts")
                  }
                  className="text-gray-400 hover:text-gray-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-orange-600">Prerequisites:</h4>
            <ol className="text-sm text-orange-600/80 space-y-1 ml-4">
              <li>
                1. Get Sepolia ETH from{" "}
                <a
                  href="https://sepoliafaucet.com/"
                  target="_blank"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  sepoliafaucet.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                2. Get PYUSD from{" "}
                <a
                  href="https://faucet.paxos.com/"
                  target="_blank"
                  className="text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  faucet.paxos.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                3. Add your private key to .env file:{" "}
                <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                  SEPOLIA_PRIVATE_KEY=0x...
                </code>
              </li>
              <li>4. Run the deployment command above</li>
            </ol>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm text-blue-600">
              <strong>Note:</strong> This will deploy the contract with small
              test amounts ($1-$50 PYUSD) to minimize costs during development
              and testing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeploymentStatus;
