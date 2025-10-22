import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting AidRoute deployment to Sepolia testnet...\n");

  // Configuration - using public testnet
  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
  
  // For demo purposes, I'll create a test wallet
  // In production, you would use your own private key
  const testWallet = ethers.Wallet.createRandom();
  console.log("📋 Demo Deployment Configuration:");
  console.log("  - Network: Sepolia Testnet");
  console.log("  - RPC URL:", RPC_URL);
  console.log("  - PYUSD Address:", PYUSD_ADDRESS);
  console.log("  - Demo Wallet Address:", testWallet.address);
  console.log("  - Demo Private Key:", testWallet.privateKey);

  console.log("\n⚠️  IMPORTANT: This is a demo deployment!");
  console.log("📝 To deploy with your own wallet:");
  console.log("1. Get Sepolia ETH from: https://sepoliafaucet.com/");
  console.log("2. Add your private key to .env: SEPOLIA_PRIVATE_KEY=0x...");
  console.log("3. Run: npx tsx scripts/deploy-ethers.ts");

  // Setup provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Check if demo wallet has funds
  const balance = await provider.getBalance(testWallet.address);
  console.log("\n💰 Demo Wallet Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.log("\n❌ Demo wallet has no funds for deployment");
    console.log("💡 This is expected - the demo wallet is randomly generated");
  }

  // Load contract artifact to verify it exists
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AidRouteMissions.sol/AidRouteMissions.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Error: Contract artifact not found. Run 'npx hardhat compile' first");
    return;
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  console.log("\n✅ Contract artifact loaded successfully");
  console.log("  - Contract Name:", artifact.contractName);
  console.log("  - Bytecode Size:", artifact.bytecode.length, "characters");

  // Show what the deployment would look like
  console.log("\n📊 Contract Constructor Parameters:");
  console.log("  - PYUSD Token Address:", PYUSD_ADDRESS);

  console.log("\n🔧 Contract Functions Available:");
  const functions = artifact.abi
    .filter((item: any) => item.type === 'function' && item.stateMutability !== 'view')
    .map((item: any) => item.name);
  
  functions.forEach((func: string) => {
    console.log(`  - ${func}()`);
  });

  console.log("\n📋 Contract Events:");
  const events = artifact.abi
    .filter((item: any) => item.type === 'event')
    .map((item: any) => item.name);
  
  events.forEach((event: string) => {
    console.log(`  - ${event}`);
  });

  // Create deployment info template
  const deploymentTemplate = {
    contractAddress: "0x0000000000000000000000000000000000000000", // Will be filled after deployment
    pyusdAddress: PYUSD_ADDRESS,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
    deployer: "YOUR_WALLET_ADDRESS",
    abi: artifact.abi,
    functions: functions,
    events: events,
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment-template.json"),
    JSON.stringify(deploymentTemplate, null, 2)
  );

  console.log("\n📄 Deployment template saved to deployment-template.json");
  console.log("\n🎯 Next Steps:");
  console.log("1. Fund a wallet with Sepolia ETH");
  console.log("2. Set SEPOLIA_PRIVATE_KEY in .env file");
  console.log("3. Run: npx tsx scripts/deploy-ethers.ts");
  console.log("4. Update frontend with deployed contract address");

  console.log("\n🔗 Useful Links:");
  console.log("  - Sepolia Faucet: https://sepoliafaucet.com/");
  console.log("  - PYUSD Faucet: https://faucet.paxos.com/");
  console.log("  - Sepolia Explorer: https://sepolia.etherscan.io/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
