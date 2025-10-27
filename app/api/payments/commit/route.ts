import { NextRequest, NextResponse } from "next/server";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  isAddress,
  getAddress,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CommitRequest {
  missionId: number;
  amount: number; // PYUSD units (not wei)
  recipient: string; // address or identifier
  reference?: string;
  description?: string;
}

// Contract ABI for the deployFunds function
const ABI = [
  {
    name: "deployFunds",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "missionId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [],
  },
] as const;

// Contract configuration
const CONTRACT_ADDRESS = "0x681735982373ae65a8f8b2074922a924780ba360" as const;
const RPC_URL =
  process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

/**
 * POST /api/payments/commit
 * Real blockchain interaction: Calls deployFunds on AidRouteMissions contract
 * This sends actual PYUSD to recipients via the smart contract
 */
export async function POST(request: NextRequest) {
  try {
    const {
      missionId,
      amount,
      recipient,
      reference,
      description,
    }: CommitRequest = await request.json();

    if (!missionId || !amount || !recipient) {
      return NextResponse.json(
        { error: "missionId, amount, and recipient are required" },
        { status: 400 }
      );
    }

    // Validate recipient is a valid Ethereum address
    if (!isAddress(recipient)) {
      return NextResponse.json(
        { error: "recipient must be a valid Ethereum address" },
        { status: 400 }
      );
    }

    // Get properly checksummed address
    const checksummedRecipient = getAddress(recipient);

    // Check if we have a valid private key for blockchain interaction
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY;
    if (
      !privateKey ||
      privateKey.length < 64 ||
      !privateKey.match(/^(0x)?[a-fA-F0-9]{64}$/)
    ) {
      // Fallback to development mode if no private key
      const transaction_id = `dev-txn-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      await new Promise((r) => setTimeout(r, 600));

      return NextResponse.json({
        status: "simulated",
        transaction_id,
        missionId,
        amount,
        recipient,
        reference: reference || null,
        description: description || null,
        note: "Simulated transaction - add SEPOLIA_PRIVATE_KEY to .env for real blockchain interaction",
      });
    }

    try {
      // Ensure private key has 0x prefix
      const formattedPrivateKey = privateKey.startsWith("0x")
        ? privateKey
        : `0x${privateKey}`;

      // Set up blockchain clients
      const account = privateKeyToAccount(formattedPrivateKey as `0x${string}`);
      const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(RPC_URL),
      });

      const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(RPC_URL),
      });

      console.log(
        `🔗 Deploying ${amount} PYUSD to ${recipient} for mission ${missionId}`
      );

      // Convert PYUSD amount to wei (PYUSD has 6 decimals)
      const amountWei = parseUnits(amount.toString(), 6);

      // Call deployFunds on the smart contract
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "deployFunds",
        args: [BigInt(missionId), amountWei, checksummedRecipient],
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
      });

      return NextResponse.json({
        status: "completed",
        transaction_id: hash,
        transaction_hash: hash,
        block_number: receipt.blockNumber.toString(),
        gas_used: receipt.gasUsed.toString(),
        missionId,
        amount,
        recipient,
        reference: reference || null,
        description: description || null,
        blockchain: true,
        network: "sepolia",
      });
    } catch (blockchainError: any) {
      // Return detailed error for debugging
      return NextResponse.json(
        {
          error: "blockchain_transaction_failed",
          message: blockchainError?.message || "Blockchain transaction failed",
          details: {
            code: blockchainError?.code,
            reason: blockchainError?.reason,
            missionId,
            amount,
            recipient,
          },
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "commit_failed",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
