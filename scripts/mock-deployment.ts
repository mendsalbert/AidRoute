// Mock contract deployment for testing
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🧪 Creating mock contract deployment for testing...\n");

  // Generate a mock contract address (looks like a real Ethereum address)
  const mockContractAddress =
    "0x" +
    Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

  console.log("📋 Mock Deployment Configuration:");
  console.log("  - Contract Address:", mockContractAddress);
  console.log("  - Network: Sepolia Testnet (Mock)");
  console.log("  - PYUSD Address: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9");

  // Create mock deployment info
  const deploymentInfo = {
    contractAddress: mockContractAddress,
    pyusdAddress: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
    network: "sepolia",
    deployedAt: new Date().toISOString(),
    deployer: "MOCK_DEPLOYER",
    abi: [], // Empty ABI for mock
    testAmounts: {
      smallDonation: 1, // $1 PYUSD
      mediumDonation: 10, // $10 PYUSD
      largeDonation: 50, // $50 PYUSD
      testMissionGoal: 25, // $25 PYUSD
      emergencyFund: 15, // $15 PYUSD
    },
    isMock: true,
    note: "This is a mock deployment for testing. Real contract deployment requires a private key and Sepolia ETH.",
  };

  // Save deployment info
  fs.writeFileSync(
    path.join(__dirname, "../deployment-mock.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Update the contract integration file with the mock address
  const contractIntegrationPath = path.join(
    __dirname,
    "../lib/contract-integration.ts"
  );
  let contractIntegration = fs.readFileSync(contractIntegrationPath, "utf8");

  // Replace the sepolia contract address
  contractIntegration = contractIntegration.replace(
    /sepolia: "0x0000000000000000000000000000000000000000"/,
    `sepolia: "${mockContractAddress}"`
  );

  fs.writeFileSync(contractIntegrationPath, contractIntegration);

  console.log("\n✅ Mock deployment created successfully!");
  console.log("📍 Mock Contract Address:", mockContractAddress);
  console.log("📄 Deployment info saved to deployment-mock.json");
  console.log("📝 Contract integration updated with mock address");

  console.log("\n🎯 What this enables:");
  console.log("  - Frontend will show 'Contract Deployed' status");
  console.log("  - MetaMask integration will attempt real transactions");
  console.log("  - Error messages will be more helpful");
  console.log("  - UI will be fully functional for testing");

  console.log("\n⚠️  Important Notes:");
  console.log("  - This is a MOCK deployment for UI testing only");
  console.log("  - Real transactions will fail (contract doesn't exist)");
  console.log("  - For real testing, deploy with actual private key");
  console.log("  - Mock address:", mockContractAddress);

  console.log("\n🚀 Next Steps:");
  console.log("  1. Refresh the frontend to see 'Contract Deployed' status");
  console.log("  2. Test the UI with mock contract address");
  console.log("  3. For real testing, use: npx tsx scripts/test-deployment.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Mock deployment failed:", error);
    process.exit(1);
  });
