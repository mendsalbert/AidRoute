/**
 * AidRoute Deployment Script
 *
 * This script deploys all AidRoute contracts and performs initial setup
 * Run with: npx hardhat run scripts/deploy.ts --network <network-name>
 */

import hre from "hardhat";

async function main() {
  console.log("🚀 Starting AidRoute deployment...\n");

  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  console.log("📍 Deploying from account:", deployer.account.address);
  console.log("🌐 Network:", hre.network.name);

  // PYUSD addresses for different networks
  const PYUSD_ADDRESSES: Record<string, `0x${string}`> = {
    sepolia: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
    mainnet: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
    // For local testing, you might deploy a mock PYUSD
    hardhat: "0x0000000000000000000000000000000000000000", // Will be replaced with mock
    localhost: "0x0000000000000000000000000000000000000000", // Will be replaced with mock
  };

  let pyusdAddress = PYUSD_ADDRESSES[hre.network.name];

  // Deploy mock PYUSD for local networks if needed
  if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
    console.log("\n📝 Deploying Mock PYUSD for local testing...");
    const mockPYUSD = await hre.viem.deployContract("MockPYUSD", []);
    pyusdAddress = mockPYUSD.address;
    console.log("✅ Mock PYUSD deployed at:", pyusdAddress);
  }

  if (
    !pyusdAddress ||
    pyusdAddress === "0x0000000000000000000000000000000000000000"
  ) {
    throw new Error(
      `PYUSD address not configured for network: ${hre.network.name}`
    );
  }

  console.log("💰 Using PYUSD at:", pyusdAddress);

  // Deploy SupplierRegistry
  console.log("\n📦 Deploying SupplierRegistry...");
  const supplierRegistry = await hre.viem.deployContract(
    "SupplierRegistry",
    []
  );
  console.log("✅ SupplierRegistry deployed at:", supplierRegistry.address);

  // Deploy BeneficiaryRegistry
  console.log("\n📦 Deploying BeneficiaryRegistry...");
  const beneficiaryRegistry = await hre.viem.deployContract(
    "BeneficiaryRegistry",
    []
  );
  console.log(
    "✅ BeneficiaryRegistry deployed at:",
    beneficiaryRegistry.address
  );

  // Deploy MissionVerifier
  console.log("\n📦 Deploying MissionVerifier...");
  const missionVerifier = await hre.viem.deployContract("MissionVerifier", []);
  console.log("✅ MissionVerifier deployed at:", missionVerifier.address);

  // Deploy AidRouteCore
  console.log("\n📦 Deploying AidRouteCore...");
  const aidRouteCore = await hre.viem.deployContract("AidRouteCore", [
    pyusdAddress,
  ]);
  console.log("✅ AidRouteCore deployed at:", aidRouteCore.address);

  // Setup roles and permissions
  console.log("\n🔐 Setting up roles and permissions...");

  // Grant COORDINATOR_ROLE to deployer on AidRouteCore
  const COORDINATOR_ROLE = await aidRouteCore.read.COORDINATOR_ROLE();
  await aidRouteCore.write.grantRole([
    COORDINATOR_ROLE,
    deployer.account.address,
  ]);
  console.log("✅ Granted COORDINATOR_ROLE to deployer on AidRouteCore");

  // Grant VERIFIER_ROLE to deployer on AidRouteCore
  const VERIFIER_ROLE = await aidRouteCore.read.VERIFIER_ROLE();
  await aidRouteCore.write.grantRole([VERIFIER_ROLE, deployer.account.address]);
  console.log("✅ Granted VERIFIER_ROLE to deployer on AidRouteCore");

  // Grant COORDINATOR_ROLE on BeneficiaryRegistry
  const BENEFICIARY_COORDINATOR_ROLE =
    await beneficiaryRegistry.read.COORDINATOR_ROLE();
  await beneficiaryRegistry.write.grantRole([
    BENEFICIARY_COORDINATOR_ROLE,
    deployer.account.address,
  ]);
  console.log("✅ Granted COORDINATOR_ROLE to deployer on BeneficiaryRegistry");

  // Grant VERIFIER_ROLE on SupplierRegistry
  const SUPPLIER_VERIFIER_ROLE = await supplierRegistry.read.VERIFIER_ROLE();
  await supplierRegistry.write.grantRole([
    SUPPLIER_VERIFIER_ROLE,
    deployer.account.address,
  ]);
  console.log("✅ Granted VERIFIER_ROLE to deployer on SupplierRegistry");

  // Grant VERIFIER_ROLE on MissionVerifier
  const MISSION_VERIFIER_ROLE = await missionVerifier.read.VERIFIER_ROLE();
  await missionVerifier.write.grantRole([
    MISSION_VERIFIER_ROLE,
    deployer.account.address,
  ]);
  console.log("✅ Granted VERIFIER_ROLE to deployer on MissionVerifier");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 AidRoute Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployment Summary:");
  console.log("─".repeat(60));
  console.log("PYUSD Token:           ", pyusdAddress);
  console.log("AidRouteCore:          ", aidRouteCore.address);
  console.log("SupplierRegistry:      ", supplierRegistry.address);
  console.log("BeneficiaryRegistry:   ", beneficiaryRegistry.address);
  console.log("MissionVerifier:       ", missionVerifier.address);
  console.log("─".repeat(60));

  // Save deployment addresses to a file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.account.address,
    contracts: {
      pyusd: pyusdAddress,
      aidRouteCore: aidRouteCore.address,
      supplierRegistry: supplierRegistry.address,
      beneficiaryRegistry: beneficiaryRegistry.address,
      missionVerifier: missionVerifier.address,
    },
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}-latest.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(
    `\n💾 Deployment info saved to: ${deploymentsDir}/${hre.network.name}-latest.json`
  );

  // Print next steps
  console.log("\n📝 Next Steps:");
  console.log("1. Verify contracts on block explorer (if on public network)");
  console.log("2. Register suppliers using SupplierRegistry");
  console.log("3. Register beneficiaries using BeneficiaryRegistry");
  console.log("4. Create missions using AidRouteCore");
  console.log("5. Configure AI agents with contract addresses");
  console.log("\n✨ Happy coordinating aid with AidRoute! ✨\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
