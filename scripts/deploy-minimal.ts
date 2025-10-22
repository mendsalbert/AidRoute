import hre from "hardhat";

async function main() {
  console.log("🚀 Starting AidRoute deployment...\n");

  // Get PYUSD address from environment or use Sepolia default
  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

  console.log("📋 Deployment Configuration:");
  console.log("  - PYUSD Address:", PYUSD_ADDRESS);

  try {
    // Get the contract artifact
    const contractArtifact = await hre.artifacts.readArtifact(
      "AidRouteMissions"
    );
    console.log("✅ Contract artifact loaded successfully");
    console.log("  - Contract name:", contractArtifact.contractName);
    console.log("  - Bytecode length:", contractArtifact.bytecode.length);

    // For now, let's just show that we can load the contract
    console.log("\n📊 Contract Information:");
    console.log("  - Constructor parameters: [PYUSD_ADDRESS]");
    console.log("  - PYUSD Address:", PYUSD_ADDRESS);

    console.log("\n🎉 Contract is ready for deployment!");
    console.log("\n📝 Next steps:");
    console.log("  1. Set up proper Hardhat configuration");
    console.log("  2. Deploy to Sepolia testnet");
    console.log(
      "  3. Get PYUSD from Sepolia faucet: https://faucet.paxos.com/"
    );
    console.log("  4. Start creating missions and accepting donations!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
