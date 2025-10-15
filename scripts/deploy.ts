import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Deployment script for AidRouteMissions contract
 * Deploys to Sepolia testnet with PYUSD integration
 */
async function main() {
  console.log("🚀 Starting AidRoute deployment to Sepolia testnet...\n");

  // Get PYUSD address from environment or use Sepolia default
  const PYUSD_ADDRESS =
    process.env.PYUSD_ADDRESS || "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

  console.log("📋 Deployment Configuration:");
  console.log("  - Network:", hre.network.name);
  console.log("  - PYUSD Address:", PYUSD_ADDRESS);

  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  console.log("  - Deployer:", deployer.account.address);
  console.log("\n⏳ Deploying AidRouteMissions contract...");

  // Deploy the contract
  const aidRouteMissions = await hre.viem.deployContract("AidRouteMissions", [
    PYUSD_ADDRESS,
  ]);

  console.log("✅ AidRouteMissions deployed successfully!");
  console.log("📍 Contract Address:", aidRouteMissions.address);

  // Get initial stats
  console.log("\n📊 Initial Contract State:");
  const stats = await aidRouteMissions.read.getStats();
  console.log("  - Total Missions:", stats[0].toString());
  console.log("  - Total Donations:", stats[1].toString());
  console.log("  - Total Deployed:", stats[2].toString());
  console.log("  - General Fund:", stats[3].toString());
  console.log("  - Contract Balance:", stats[4].toString());

  const owner = await aidRouteMissions.read.owner();
  console.log("  - Owner:", owner);

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("  1. Save the contract address:", aidRouteMissions.address);
  console.log("  2. Get PYUSD from Sepolia faucet: https://faucet.paxos.com/");
  console.log("  3. Approve PYUSD spending for the contract");
  console.log("  4. Start creating missions and accepting donations!");
  console.log("\n💡 Verify contract on Etherscan:");
  console.log(
    `  npx hardhat verify --network sepolia ${aidRouteMissions.address} ${PYUSD_ADDRESS}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
