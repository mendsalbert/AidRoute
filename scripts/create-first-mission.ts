/**
 * Create your first mission on the deployed AidRoute contract
 */

import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
  formatUnits,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

async function main() {
  console.log("🌍 Creating your first AidRoute mission...\n");

  // Configuration
  const RPC_URL =
    process.env.SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com";
  const PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  if (!PRIVATE_KEY) {
    console.error("❌ SEPOLIA_PRIVATE_KEY not found in .env file");
    process.exit(1);
  }

  if (!CONTRACT_ADDRESS) {
    console.error("❌ CONTRACT_ADDRESS not found in .env file");
    console.log("Add this line to your .env:");
    console.log("CONTRACT_ADDRESS=0x681735982373ae65a8f8b2074922a924780ba360");
    process.exit(1);
  }

  // Setup account and clients
  const account = privateKeyToAccount(`0x${PRIVATE_KEY}` as `0x${string}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(RPC_URL),
  });

  console.log("📋 Configuration:");
  console.log("  - Network:", sepolia.name);
  console.log("  - Contract:", CONTRACT_ADDRESS);
  console.log("  - Your Address:", account.address);
  console.log("");

  // Load contract ABI
  const artifactPath = path.join(
    process.cwd(),
    "artifacts",
    "contracts",
    "AidRouteMissions.sol",
    "AidRouteMissions.json"
  );

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  // Example mission details
  const mission = {
    location: "Gaza, Palestine",
    description:
      "Emergency medical supplies for field hospital - urgent need for antibiotics, bandages, and basic surgical equipment",
    items: [
      "Antibiotics (Amoxicillin, Ciprofloxacin)",
      "Sterile bandages and gauze",
      "IV fluids and administration sets",
      "Basic surgical kits",
      "Pain medication",
      "Wound care supplies",
    ],
    fundingGoal: parseUnits("5000", 6), // 5000 PYUSD
  };

  console.log("📝 Mission Details:");
  console.log("  - Location:", mission.location);
  console.log("  - Description:", mission.description);
  console.log("  - Items Needed:", mission.items.length, "items");
  console.log(
    "  - Funding Goal:",
    formatUnits(mission.fundingGoal, 6),
    "PYUSD"
  );
  console.log("");

  try {
    console.log("⏳ Creating mission...");

    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: "createMission",
      args: [
        mission.location,
        mission.description,
        mission.items,
        mission.fundingGoal,
      ],
      account,
    });

    const hash = await walletClient.writeContract(request);
    console.log("  - Transaction hash:", hash);
    console.log("  - Waiting for confirmation...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("\n✅ Mission created successfully!");
    console.log("  - Block number:", receipt.blockNumber);
    console.log("  - Gas used:", receipt.gasUsed.toString());

    // Get mission ID from stats
    const stats = (await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: "getStats",
    })) as any;

    const missionId = stats[0];
    console.log("  - Mission ID:", missionId.toString());

    // Get mission details
    const missionData = (await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: "getMission",
      args: [missionId],
    })) as any;

    console.log("\n📊 Mission Information:");
    console.log("  - ID:", missionData.id.toString());
    console.log("  - Location:", missionData.location);
    console.log("  - Status:", getStatusName(Number(missionData.status)));
    console.log(
      "  - Funding Goal:",
      formatUnits(missionData.fundingGoal, 6),
      "PYUSD"
    );
    console.log(
      "  - Funds Allocated:",
      formatUnits(missionData.fundsAllocated, 6),
      "PYUSD"
    );
    console.log(
      "  - Created:",
      new Date(Number(missionData.createdAt) * 1000).toLocaleString()
    );

    console.log("\n🎉 Success! Your first mission is live!");
    console.log("\n📝 Next Steps:");
    console.log("  1. Get PYUSD from faucet: https://faucet.paxos.com/");
    console.log("  2. Approve PYUSD spending for the contract");
    console.log("  3. Donate to mission #" + missionId.toString());
    console.log("\n🔗 View on Etherscan:");
    console.log(`  https://sepolia.etherscan.io/tx/${hash}`);
  } catch (error: any) {
    console.error("\n❌ Failed to create mission:");
    console.error(error.message || error);

    if (error.message?.includes("Not authorized")) {
      console.log(
        "\n💡 Tip: Only the contract owner and authorized coordinators can create missions."
      );
      console.log("Your address:", account.address);
    }
  }
}

function getStatusName(status: number): string {
  const statuses = [
    "Pending",
    "Funded",
    "InProgress",
    "EnRoute",
    "Delivered",
    "Verified",
    "Completed",
    "Cancelled",
  ];
  return statuses[status] || "Unknown";
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
