import hre from "hardhat";

async function main() {
  console.log("🔍 Debugging Hardhat environment...");
  console.log("hre keys:", Object.keys(hre));
  console.log("hre.viem:", hre.viem);
  console.log("hre.ethers:", hre.ethers);
  console.log("hre.network:", hre.network);

  if (hre.ethers) {
    console.log("✅ ethers is available");
    try {
      const signers = await hre.ethers.getSigners();
      console.log("Signers:", signers.length);
      console.log("First signer:", signers[0].address);
    } catch (error) {
      console.log("Error getting signers:", error);
    }
  }

  if (hre.viem) {
    console.log("✅ viem is available");
  } else {
    console.log("❌ viem is not available");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
