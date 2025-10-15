import hre from "hardhat";
import * as dotenv from "dotenv";
import { parseUnits, formatUnits } from "viem";

dotenv.config();

/**
 * Interaction script for AidRouteMissions contract
 * Demonstrates how to interact with the deployed contract
 */
async function main() {
  console.log("🔗 AidRoute Contract Interaction Script\n");

  // Replace with your deployed contract address
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

  if (!CONTRACT_ADDRESS) {
    console.error("❌ Please set CONTRACT_ADDRESS in .env file");
    process.exit(1);
  }

  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  console.log("📋 Configuration:");
  console.log("  - Network:", hre.network.name);
  console.log("  - Account:", deployer.account.address);
  console.log("  - Contract:", CONTRACT_ADDRESS);
  console.log("");

  // Get contract instance
  const aidRoute = await hre.viem.getContractAt(
    "AidRouteMissions",
    CONTRACT_ADDRESS as `0x${string}`
  );

  // Get contract stats
  console.log("📊 Contract Statistics:");
  const stats = await aidRoute.read.getStats();
  console.log("  - Total Missions:", stats[0].toString());
  console.log("  - Total Donations:", formatUnits(stats[1], 6), "PYUSD");
  console.log("  - Total Deployed:", formatUnits(stats[2], 6), "PYUSD");
  console.log("  - General Fund:", formatUnits(stats[3], 6), "PYUSD");
  console.log("  - Contract Balance:", formatUnits(stats[4], 6), "PYUSD");
  console.log("");

  // Example: Create a mission
  console.log("📝 Example: Creating a new mission...");
  const location = "Syria - Aleppo";
  const description = "Emergency medical supplies for field hospital";
  const items = ["Bandages", "Antibiotics", "IV Fluids", "Surgical kits"];
  const fundingGoal = parseUnits("5000", 6); // 5000 PYUSD

  try {
    const hash = await aidRoute.write.createMission([
      location,
      description,
      items,
      fundingGoal,
    ]);

    console.log("  - Transaction hash:", hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("  - Block number:", receipt.blockNumber);

    // Get the new mission ID
    const newStats = await aidRoute.read.getStats();
    const missionId = newStats[0];

    console.log("  - Mission ID:", missionId.toString());
    console.log("✅ Mission created successfully!");
    console.log("");

    // Get mission details
    console.log("📋 Mission Details:");
    const mission = await aidRoute.read.getMission([missionId]);
    console.log("  - Location:", mission.location);
    console.log("  - Description:", mission.description);
    console.log(
      "  - Funding Goal:",
      formatUnits(mission.fundingGoal, 6),
      "PYUSD"
    );
    console.log(
      "  - Funds Allocated:",
      formatUnits(mission.fundsAllocated, 6),
      "PYUSD"
    );
    console.log("  - Status:", getStatusName(mission.status));
  } catch (error) {
    console.error("❌ Error creating mission:", error);
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
