import { expect } from "chai";
import hre from "hardhat";
import { parseUnits } from "viem";

describe("BeneficiaryRegistry", function () {
  async function deployFixture() {
    const [owner, coordinator, beneficiary1, beneficiary2] =
      await hre.viem.getWalletClients();

    const beneficiaryRegistry = await hre.viem.deployContract(
      "BeneficiaryRegistry",
      []
    );

    const publicClient = await hre.viem.getPublicClient();

    // Grant coordinator role
    const COORDINATOR_ROLE = await beneficiaryRegistry.read.COORDINATOR_ROLE();
    await beneficiaryRegistry.write.grantRole([
      COORDINATOR_ROLE,
      coordinator.account.address,
    ]);

    return {
      beneficiaryRegistry,
      owner,
      coordinator,
      beneficiary1,
      beneficiary2,
      publicClient,
    };
  }

  describe("Beneficiary Registration", function () {
    it("Should register a new beneficiary", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [
          beneficiary1.account.address,
          "Camp Alpha Community",
          "Dadaab, Kenya",
          0, // Individual
          "ipfs://QmTest123",
        ],
        { account: coordinator.account }
      );

      const beneficiary = await beneficiaryRegistry.read.getBeneficiary([
        beneficiary1.account.address,
      ]);
      expect(beneficiary[1]).to.equal("Camp Alpha Community"); // name
      expect(beneficiary[2]).to.equal("Dadaab, Kenya"); // location
      expect(beneficiary[3]).to.equal(0); // beneficiaryType (Individual)
    });

    it("Should not allow duplicate registration", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community 1", "Location 1", 0, ""],
        { account: coordinator.account }
      );

      await expect(
        beneficiaryRegistry.write.registerBeneficiary(
          [beneficiary1.account.address, "Community 2", "Location 2", 1, ""],
          { account: coordinator.account }
        )
      ).to.be.rejected;
    });

    it("Should require name and location", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1 } =
        await deployFixture();

      await expect(
        beneficiaryRegistry.write.registerBeneficiary(
          [beneficiary1.account.address, "", "Location", 0, ""],
          { account: coordinator.account }
        )
      ).to.be.rejected;

      await expect(
        beneficiaryRegistry.write.registerBeneficiary(
          [beneficiary1.account.address, "Name", "", 0, ""],
          { account: coordinator.account }
        )
      ).to.be.rejected;
    });

    it("Should only allow coordinators to register", async function () {
      const { beneficiaryRegistry, beneficiary1, beneficiary2 } =
        await deployFixture();

      await expect(
        beneficiaryRegistry.write.registerBeneficiary(
          [beneficiary1.account.address, "Community", "Location", 0, ""],
          { account: beneficiary2.account }
        )
      ).to.be.rejected;
    });
  });

  describe("Beneficiary Verification", function () {
    it("Should verify a beneficiary", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community", "Location", 0, ""],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.verifyBeneficiary(
        [beneficiary1.account.address],
        { account: coordinator.account }
      );

      const beneficiary = await beneficiaryRegistry.read.getBeneficiary([
        beneficiary1.account.address,
      ]);
      expect(beneficiary[8]).to.be.true; // isVerified
    });

    it("Should not verify already verified beneficiary", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community", "Location", 0, ""],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.verifyBeneficiary(
        [beneficiary1.account.address],
        { account: coordinator.account }
      );

      await expect(
        beneficiaryRegistry.write.verifyBeneficiary(
          [beneficiary1.account.address],
          { account: coordinator.account }
        )
      ).to.be.rejected;
    });
  });

  describe("Aid Recording", function () {
    it("Should record aid delivery", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community", "Location", 0, ""],
        { account: coordinator.account }
      );

      const missionId = 1n;
      const fundsValue = parseUnits("5000", 6);
      const items = ["Medical Supplies", "Water"];
      const quantities = [100n, 500n];

      await beneficiaryRegistry.write.recordAidDelivery(
        [
          beneficiary1.account.address,
          missionId,
          fundsValue,
          items,
          quantities,
        ],
        { account: coordinator.account }
      );

      const beneficiary = await beneficiaryRegistry.read.getBeneficiary([
        beneficiary1.account.address,
      ]);
      expect(beneficiary[4]).to.equal(fundsValue); // totalAidReceived
      expect(beneficiary[5]).to.equal(1n); // missionCount
    });

    it("Should track aid history", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community", "Location", 0, ""],
        { account: coordinator.account }
      );

      // Record multiple aid deliveries
      await beneficiaryRegistry.write.recordAidDelivery(
        [
          beneficiary1.account.address,
          1n,
          parseUnits("1000", 6),
          ["Food"],
          [100n],
        ],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.recordAidDelivery(
        [
          beneficiary1.account.address,
          2n,
          parseUnits("2000", 6),
          ["Water"],
          [200n],
        ],
        { account: coordinator.account }
      );

      const aidHistory = await beneficiaryRegistry.read.getAidHistory([
        beneficiary1.account.address,
      ]);
      expect(aidHistory.length).to.equal(2);
      expect(aidHistory[0][0]).to.equal(1n); // first mission ID
      expect(aidHistory[1][0]).to.equal(2n); // second mission ID
    });

    it("Should validate items and quantities match", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community", "Location", 0, ""],
        { account: coordinator.account }
      );

      await expect(
        beneficiaryRegistry.write.recordAidDelivery(
          [
            beneficiary1.account.address,
            1n,
            parseUnits("1000", 6),
            ["Food", "Water"],
            [100n], // Mismatch: 2 items but 1 quantity
          ],
          { account: coordinator.account }
        )
      ).to.be.rejected;
    });
  });

  describe("Beneficiary Updates", function () {
    it("Should update beneficiary information", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Old Name", "Old Location", 0, ""],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.updateBeneficiary(
        [
          beneficiary1.account.address,
          "New Name",
          "New Location",
          "ipfs://QmUpdated",
        ],
        { account: coordinator.account }
      );

      const beneficiary = await beneficiaryRegistry.read.getBeneficiary([
        beneficiary1.account.address,
      ]);
      expect(beneficiary[1]).to.equal("New Name");
      expect(beneficiary[2]).to.equal("New Location");
    });
  });

  describe("Beneficiary Queries", function () {
    it("Should get all beneficiaries", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1, beneficiary2 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community 1", "Location 1", 0, ""],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary2.account.address, "Community 2", "Location 2", 1, ""],
        { account: coordinator.account }
      );

      const allBeneficiaries =
        await beneficiaryRegistry.read.getAllBeneficiaries();
      expect(allBeneficiaries.length).to.equal(2);
    });

    it("Should get beneficiaries by location", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1, beneficiary2 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community 1", "Dadaab", 0, ""],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary2.account.address, "Community 2", "Nairobi", 1, ""],
        { account: coordinator.account }
      );

      const dadaabBeneficiaries =
        await beneficiaryRegistry.read.getBeneficiariesByLocation(["Dadaab"]);
      expect(dadaabBeneficiaries.length).to.equal(1);
    });

    it("Should get verified beneficiaries only", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1, beneficiary2 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community 1", "Location 1", 0, ""],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary2.account.address, "Community 2", "Location 2", 1, ""],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.verifyBeneficiary(
        [beneficiary1.account.address],
        { account: coordinator.account }
      );

      const verifiedBeneficiaries =
        await beneficiaryRegistry.read.getVerifiedBeneficiaries();
      expect(verifiedBeneficiaries.length).to.equal(1);
    });

    it("Should get correct platform statistics", async function () {
      const { beneficiaryRegistry, coordinator, beneficiary1, beneficiary2 } =
        await deployFixture();

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary1.account.address, "Community 1", "Location 1", 0, ""],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.registerBeneficiary(
        [beneficiary2.account.address, "Community 2", "Location 2", 1, ""],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.verifyBeneficiary(
        [beneficiary1.account.address],
        { account: coordinator.account }
      );

      await beneficiaryRegistry.write.recordAidDelivery(
        [
          beneficiary1.account.address,
          1n,
          parseUnits("5000", 6),
          ["Food"],
          [100n],
        ],
        { account: coordinator.account }
      );

      const stats = await beneficiaryRegistry.read.getStats();
      expect(stats[0]).to.equal(2n); // totalBeneficiaries
      expect(stats[1]).to.equal(parseUnits("5000", 6)); // totalAidDistributed
      expect(stats[2]).to.equal(1n); // verifiedCount
    });
  });
});
