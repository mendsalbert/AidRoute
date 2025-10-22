import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting AidRoute local deployment...\n");

  // Configuration for local network
  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"; // We'll use this as placeholder
  const RPC_URL = "http://127.0.0.1:8545";
  
  // Use first Hardhat test account
  const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

  console.log("📋 Deployment Configuration:");
  console.log("  - Network: Hardhat Local");
  console.log("  - RPC URL:", RPC_URL);
  console.log("  - PYUSD Address:", PYUSD_ADDRESS);

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("  - Deployer Address:", wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("  - Balance:", ethers.formatEther(balance), "ETH");

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
      
      const isAuthorized = await contract.isAuthorized(wallet.address);
      console.log("  - Deployer Authorized:", isAuthorized);
    } catch (error) {
      console.log("  - Could not fetch initial stats:", error);
    }

    console.log("\n🎉 Local deployment completed successfully!");
    console.log("\n📝 Contract Functions Available:");
    console.log("  - createMission(location, description, items[], fundingGoal)");
    console.log("  - donate(amount, missionId)");
    console.log("  - deployFunds(missionId, amount, recipient)");
    console.log("  - updateMissionStatus(missionId, status)");

    // Test creating a mission
    console.log("\n🧪 Testing contract functions...");
    
    try {
      const createTx = await contract.createMission(
        "Test Location",
        "Test emergency mission",
        ["Medical supplies", "Food", "Water"],
        ethers.parseUnits("1000", 6) // 1000 PYUSD (6 decimals)
      );
      
      await createTx.wait();
      console.log("✅ Test mission created successfully!");
      
      const mission = await contract.getMission(1);
      console.log("  - Mission ID:", mission.id.toString());
      console.log("  - Location:", mission.location);
      console.log("  - Funding Goal:", ethers.formatUnits(mission.fundingGoal, 6), "PYUSD");
      console.log("  - Status:", mission.status.toString());
      
    } catch (error) {
      console.log("❌ Error testing mission creation:", error);
    }

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      pyusdAddress: PYUSD_ADDRESS,
      network: "localhost",
      deployedAt: new Date().toISOString(),
      deployer: wallet.address,
      abi: artifact.abi,
    };

    fs.writeFileSync(
      path.join(__dirname, "../deployment-local.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Deployment info saved to deployment-local.json");
    console.log("\n🔗 Ready to integrate with frontend!");

  } catch (error: any) {
    console.error("❌ Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
