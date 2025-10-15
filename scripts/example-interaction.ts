/**
 * Example Script: Complete AidRoute Mission Flow
 *
 * This script demonstrates a complete mission lifecycle:
 * 1. Register suppliers and beneficiaries
 * 2. Register a humanitarian need
 * 3. Create a mission
 * 4. Approve and fund the mission
 * 5. Complete with proof
 * 6. Verify and release funds
 *
 * Run with: npx hardhat run scripts/example-interaction.ts --network localhost
 */

import hre from "hardhat";
import { parseUnits, formatUnits } from "viem";

async function main() {
  console.log("🌍 AidRoute Example Mission Flow\n");
  console.log("=".repeat(60));

  // Get signers
  const [
    deployer,
    coordinator,
    supplier,
    beneficiary,
    donor,
    verifier1,
    verifier2,
  ] = await hre.viem.getWalletClients();

  console.log("\n👥 Participants:");
  console.log(
    "   Deployer:     ",
    deployer.account.address.slice(0, 10) + "..."
  );
  console.log(
    "   Coordinator:  ",
    coordinator.account.address.slice(0, 10) + "..."
  );
  console.log(
    "   Supplier:     ",
    supplier.account.address.slice(0, 10) + "..."
  );
  console.log(
    "   Beneficiary:  ",
    beneficiary.account.address.slice(0, 10) + "..."
  );
  console.log("   Donor:        ", donor.account.address.slice(0, 10) + "...");

  // Deploy contracts (in real scenario, use deployed addresses)
  console.log("\n📦 Deploying Contracts...");

  const mockPYUSD = await hre.viem.deployContract("MockPYUSD", []);
  console.log(
    "   ✅ MockPYUSD:              ",
    mockPYUSD.address.slice(0, 10) + "..."
  );

  const aidRouteCore = await hre.viem.deployContract("AidRouteCore", [
    mockPYUSD.address,
  ]);
  console.log(
    "   ✅ AidRouteCore:           ",
    aidRouteCore.address.slice(0, 10) + "..."
  );

  const supplierRegistry = await hre.viem.deployContract(
    "SupplierRegistry",
    []
  );
  console.log(
    "   ✅ SupplierRegistry:       ",
    supplierRegistry.address.slice(0, 10) + "..."
  );

  const beneficiaryRegistry = await hre.viem.deployContract(
    "BeneficiaryRegistry",
    []
  );
  console.log(
    "   ✅ BeneficiaryRegistry:    ",
    beneficiaryRegistry.address.slice(0, 10) + "..."
  );

  const missionVerifier = await hre.viem.deployContract("MissionVerifier", []);
  console.log(
    "   ✅ MissionVerifier:        ",
    missionVerifier.address.slice(0, 10) + "..."
  );

  // Grant roles
  console.log("\n🔐 Setting Up Roles...");

  const COORDINATOR_ROLE = await aidRouteCore.read.COORDINATOR_ROLE();
  const VERIFIER_ROLE = await aidRouteCore.read.VERIFIER_ROLE();

  await aidRouteCore.write.grantRole([
    COORDINATOR_ROLE,
    coordinator.account.address,
  ]);
  await aidRouteCore.write.grantRole([
    VERIFIER_ROLE,
    verifier1.account.address,
  ]);

  await beneficiaryRegistry.write.grantRole([
    await beneficiaryRegistry.read.COORDINATOR_ROLE(),
    coordinator.account.address,
  ]);

  await supplierRegistry.write.grantRole([
    await supplierRegistry.read.VERIFIER_ROLE(),
    verifier1.account.address,
  ]);

  await missionVerifier.write.grantRole([
    await missionVerifier.read.VERIFIER_ROLE(),
    verifier1.account.address,
  ]);
  await missionVerifier.write.grantRole([
    await missionVerifier.read.VERIFIER_ROLE(),
    verifier2.account.address,
  ]);

  console.log("   ✅ Roles granted");

  // Mint PYUSD to donor
  console.log("\n💰 Minting PYUSD to Donor...");
  await mockPYUSD.write.mint([donor.account.address, parseUnits("10000", 6)]);
  const donorBalance = await mockPYUSD.read.balanceOf([donor.account.address]);
  console.log(`   ✅ Donor has ${formatUnits(donorBalance, 6)} PYUSD`);

  // Step 1: Register Supplier
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 1: Register Supplier");
  console.log("=".repeat(60));

  await supplierRegistry.write.registerSupplier(
    [
      "Global Aid Co.",
      "Nairobi, Kenya",
      ["Medical Supplies", "Food Rations", "Water"],
      "ipfs://QmSupplierMetadata123",
    ],
    { account: supplier.account }
  );
  console.log("   ✅ Supplier registered: Global Aid Co.");

  await supplierRegistry.write.verifySupplier([supplier.account.address], {
    account: verifier1.account,
  });
  console.log("   ✅ Supplier verified");

  const supplierData = await supplierRegistry.read.getSupplier([
    supplier.account.address,
  ]);
  console.log("   📊 Reputation Score:", supplierData[4].toString());

  // Step 2: Register Beneficiary
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 2: Register Beneficiary");
  console.log("=".repeat(60));

  await beneficiaryRegistry.write.registerBeneficiary(
    [
      beneficiary.account.address,
      "Camp Alpha Community",
      "Dadaab, Kenya",
      0, // Individual
      "ipfs://QmBeneficiaryMetadata456",
    ],
    { account: coordinator.account }
  );
  console.log("   ✅ Beneficiary registered: Camp Alpha Community");

  await beneficiaryRegistry.write.verifyBeneficiary(
    [beneficiary.account.address],
    { account: coordinator.account }
  );
  console.log("   ✅ Beneficiary verified");

  // Step 3: Register Need
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 3: Register Humanitarian Need");
  console.log("=".repeat(60));

  const needId = "need-emergency-001";
  await aidRouteCore.write.registerNeed(
    [
      needId,
      "Dadaab Camp Alpha",
      3, // Critical
      parseUnits("5000", 6),
    ],
    { account: coordinator.account }
  );
  console.log("   ✅ Need registered:", needId);
  console.log("   📍 Location: Dadaab Camp Alpha");
  console.log("   🚨 Urgency: Critical");
  console.log("   💵 Estimated Funds: $5,000 PYUSD");

  // Step 4: Create Mission
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 4: Create Mission");
  console.log("=".repeat(60));

  await aidRouteCore.write.createMission(
    [
      needId,
      supplier.account.address,
      beneficiary.account.address,
      "Nairobi Warehouse",
      "Dadaab Camp Alpha",
      ["Medical Supplies", "Water Purification", "Food Rations"],
      [200n, 50n, 1000n],
      parseUnits("5000", 6),
      3, // Critical
      "ipfs://QmMissionMetadata789",
    ],
    { account: coordinator.account }
  );
  console.log("   ✅ Mission created");
  console.log("   🏭 Supplier: Global Aid Co.");
  console.log("   👥 Beneficiary: Camp Alpha Community");
  console.log("   📦 Items: Medical Supplies (200), Water (50), Food (1000)");
  console.log("   💵 Required: $5,000 PYUSD");

  const missionId = 0n;

  // Step 5: Approve Mission
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 5: Approve Mission");
  console.log("=".repeat(60));

  await aidRouteCore.write.approveMission([missionId], {
    account: coordinator.account,
  });
  console.log("   ✅ Mission approved by coordinator");

  // Step 6: Lock Funds
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 6: Lock PYUSD Funds");
  console.log("=".repeat(60));

  // Donor approves PYUSD
  await mockPYUSD.write.approve([aidRouteCore.address, parseUnits("5000", 6)], {
    account: donor.account,
  });
  console.log("   ✅ PYUSD approved for spending");

  // Lock funds
  await aidRouteCore.write.lockFunds([missionId, parseUnits("5000", 6)], {
    account: donor.account,
  });
  console.log("   ✅ $5,000 PYUSD locked in contract");
  console.log("   🔒 Funds will be released to supplier upon verification");

  // Step 7: Execute Mission (simulate)
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 7: Execute Mission");
  console.log("=".repeat(60));

  console.log("   🚚 Updating status: In Transit...");
  await aidRouteCore.write.updateMissionStatus([missionId, 3], {
    // InTransit
    account: coordinator.account,
  });

  console.log("   📦 Updating status: Delivering...");
  await aidRouteCore.write.updateMissionStatus([missionId, 4], {
    // Delivering
    account: coordinator.account,
  });

  // Step 8: Submit Delivery Proof
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 8: Submit Delivery Proof");
  console.log("=".repeat(60));

  const proofData =
    "Delivery completed at Camp Alpha - Photos: ipfs://QmProof123";
  const proofHash = hre.viem.keccak256(hre.viem.toBytes(proofData));

  await aidRouteCore.write.completeMission([missionId, proofHash], {
    account: coordinator.account,
  });
  console.log("   ✅ Mission completed with proof");
  console.log("   🔐 Proof Hash:", proofHash.slice(0, 20) + "...");

  // Step 9: Submit to MissionVerifier
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 9: Multi-Witness Verification");
  console.log("=".repeat(60));

  await missionVerifier.write.submitDeliveryProof(
    [
      missionId,
      [0, 1, 2], // PhotoHash, GPSCoordinates, RecipientSignature
      [
        hre.viem.keccak256(hre.viem.toBytes("photo1")),
        hre.viem.keccak256(hre.viem.toBytes("gps1")),
        hre.viem.keccak256(hre.viem.toBytes("signature1")),
      ],
      ["ipfs://QmPhoto", "ipfs://QmGPS", "ipfs://QmSignature"],
      1234567n, // GPS latitude
      36789012n, // GPS longitude
      "ipfs://QmProofMetadata",
    ],
    { account: coordinator.account }
  );
  console.log("   ✅ Delivery proof submitted to verifier");

  // Add witnesses
  await missionVerifier.write.addWitness([missionId], {
    account: verifier1.account,
  });
  console.log("   ✅ Witness 1 verified");

  await missionVerifier.write.addWitness([missionId], {
    account: verifier2.account,
  });
  console.log("   ✅ Witness 2 verified");
  console.log("   🎉 Auto-verified (2 witnesses met threshold)");

  // Step 10: Verify and Release Funds
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 10: Release Funds to Supplier");
  console.log("=".repeat(60));

  const supplierBalanceBefore = await mockPYUSD.read.balanceOf([
    supplier.account.address,
  ]);

  await aidRouteCore.write.verifyAndReleaseFunds([missionId], {
    account: verifier1.account,
  });

  const supplierBalanceAfter = await mockPYUSD.read.balanceOf([
    supplier.account.address,
  ]);

  console.log(
    "   ✅ Funds released to supplier:",
    formatUnits(supplierBalanceAfter - supplierBalanceBefore, 6),
    "PYUSD"
  );

  // Step 11: Record Aid Delivery
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 11: Record Aid in Beneficiary Registry");
  console.log("=".repeat(60));

  await beneficiaryRegistry.write.recordAidDelivery(
    [
      beneficiary.account.address,
      missionId,
      parseUnits("5000", 6),
      ["Medical Supplies", "Water Purification", "Food Rations"],
      [200n, 50n, 1000n],
    ],
    { account: coordinator.account }
  );
  console.log("   ✅ Aid delivery recorded in beneficiary history");

  // Step 12: Record Mission in Supplier Registry
  console.log("\n" + "=".repeat(60));
  console.log("📝 Step 12: Update Supplier Reputation");
  console.log("=".repeat(60));

  await supplierRegistry.write.recordMission(
    [supplier.account.address, missionId, true, parseUnits("5000", 6)],
    { account: deployer.account }
  );

  const updatedSupplier = await supplierRegistry.read.getSupplier([
    supplier.account.address,
  ]);
  console.log(
    "   ✅ Supplier reputation updated:",
    updatedSupplier[4].toString(),
    "(+10 for successful mission)"
  );

  // Final Statistics
  console.log("\n" + "=".repeat(60));
  console.log("📊 Final Statistics");
  console.log("=".repeat(60));

  const stats = await aidRouteCore.read.getStats();
  console.log("   Total Missions:        ", stats[0].toString());
  console.log("   Completed Missions:    ", stats[1].toString());
  console.log(
    "   Total Funds Deployed:  $" + formatUnits(stats[2], 6),
    "PYUSD"
  );
  console.log("   Active Missions:       ", stats[3].toString());

  const beneficiaryData = await beneficiaryRegistry.read.getBeneficiary([
    beneficiary.account.address,
  ]);
  console.log(
    "\n   Beneficiary Aid Received: $" + formatUnits(beneficiaryData[4], 6),
    "PYUSD"
  );
  console.log("   Number of Deliveries:    ", beneficiaryData[5].toString());

  const successRate = await supplierRegistry.read.getSupplierSuccessRate([
    supplier.account.address,
  ]);
  console.log("\n   Supplier Success Rate:   ", successRate.toString() + "%");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Mission Complete! Aid delivered successfully!");
  console.log("=".repeat(60));
  console.log("\n✨ This demonstrates the complete AidRoute workflow:");
  console.log("   1. Supplier & Beneficiary registration");
  console.log("   2. Need registration");
  console.log("   3. Mission creation");
  console.log("   4. PYUSD funding");
  console.log("   5. Mission execution");
  console.log("   6. Proof submission");
  console.log("   7. Multi-witness verification");
  console.log("   8. Automated fund release");
  console.log("   9. Reputation updates");
  console.log("   10. Complete audit trail\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
