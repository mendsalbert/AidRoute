import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Starting AidRoute deployment to Sepolia testnet...\n");

  // Configuration
  const PYUSD_ADDRESS = process.env.PYUSD_ADDRESS || "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";
  const RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

  if (!PRIVATE_KEY || PRIVATE_KEY === "0x0000000000000000000000000000000000000000000000000000000000000001") {
    console.error("❌ Error: Please set a valid SEPOLIA_PRIVATE_KEY in .env file");
    console.log("\n📝 To fix this:");
    console.log("1. Get a test wallet private key from MetaMask");
    console.log("2. Add it to .env file: SEPOLIA_PRIVATE_KEY=0x...");
    console.log("3. Get Sepolia ETH from: https://sepoliafaucet.com/");
    console.log("4. Get PYUSD from: https://faucet.paxos.com/");
    return;
  }

  console.log("📋 Deployment Configuration:");
  console.log("  - Network: Sepolia Testnet");
  console.log("  - RPC URL:", RPC_URL);
  console.log("  - PYUSD Address:", PYUSD_ADDRESS);

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("  - Deployer Address:", wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("  - Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ Error: Deployer has no ETH for gas fees");
    console.log("Get Sepolia ETH from: https://sepoliafaucet.com/");
    return;
  }

  // Load contract artifact
  const artifactPath = path.join(__dirname, "../artifacts/contracts/AidRouteMissions.sol/AidRouteMissions.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Error: Contract artifact not found. Run 'npx hardhat compile' first");
    return;
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  console.log("\n⏳ Deploying AidRouteMissions contract...");

  // Deploy contract
  const contractFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  try {
    const contract = await contractFactory.deploy(PYUSD_ADDRESS);
    console.log("📤 Transaction sent, waiting for confirmation...");
    
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("✅ AidRouteMissions deployed successfully!");
    console.log("📍 Contract Address:", contractAddress);

    // Get initial stats
    console.log("\n📊 Initial Contract State:");
    try {
      const stats = await contract.getStats();
      console.log("  - Total Missions:", stats[0].toString());
      console.log("  - Total Donations:", stats[1].toString());
      console.log("  - Total Deployed:", stats[2].toString());
      console.log("  - General Fund:", stats[3].toString());
      console.log("  - Contract Balance:", stats[4].toString());

      const owner = await contract.owner();
      console.log("  - Owner:", owner);
    } catch (error) {
      console.log("  - Could not fetch initial stats");
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("  1. Save the contract address:", contractAddress);
    console.log("  2. Update your frontend to use this address");
    console.log("  3. Get PYUSD from Sepolia faucet: https://faucet.paxos.com/");
    console.log("  4. Test contract functions!");

    console.log("\n💡 Verify contract on Etherscan:");
    console.log(`  npx hardhat verify --network sepolia ${contractAddress} ${PYUSD_ADDRESS}`);

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      pyusdAddress: PYUSD_ADDRESS,
      network: "sepolia",
      deployedAt: new Date().toISOString(),
      deployer: wallet.address,
    };

    fs.writeFileSync(
      path.join(__dirname, "../deployment.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Deployment info saved to deployment.json");

  } catch (error: any) {
    console.error("❌ Deployment failed:", error.message);
    if (error.code === "INSUFFICIENT_FUNDS") {
      console.log("💡 Get more Sepolia ETH from: https://sepoliafaucet.com/");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
