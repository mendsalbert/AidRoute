import { expect } from "chai";
import hre from "hardhat";
import { parseUnits } from "viem";

describe("SupplierRegistry", function () {
  async function deployFixture() {
    const [owner, supplier1, supplier2, verifier, reviewer] =
      await hre.viem.getWalletClients();

    const supplierRegistry = await hre.viem.deployContract(
      "SupplierRegistry",
      []
    );

    const publicClient = await hre.viem.getPublicClient();

    // Grant verifier role
    const VERIFIER_ROLE = await supplierRegistry.read.VERIFIER_ROLE();
    await supplierRegistry.write.grantRole([
      VERIFIER_ROLE,
      verifier.account.address,
    ]);

    return {
      supplierRegistry,
      owner,
      supplier1,
      supplier2,
      verifier,
      reviewer,
      publicClient,
    };
  }

  describe("Supplier Registration", function () {
    it("Should register a new supplier", async function () {
      const { supplierRegistry, supplier1 } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        [
          "Global Aid Co.",
          "Nairobi, Kenya",
          ["Medical Supplies", "Food"],
          "ipfs://QmTest123",
        ],
        { account: supplier1.account }
      );

      const supplier = await supplierRegistry.read.getSupplier([
        supplier1.account.address,
      ]);
      expect(supplier[1]).to.equal("Global Aid Co."); // name
      expect(supplier[2]).to.equal("Nairobi, Kenya"); // location
      expect(supplier[4]).to.equal(500n); // reputationScore (starts at 500)
    });

    it("Should not allow duplicate registration", async function () {
      const { supplierRegistry, supplier1 } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Global Aid Co.", "Nairobi", ["Medical"], ""],
        { account: supplier1.account }
      );

      await expect(
        supplierRegistry.write.registerSupplier(
          ["Another Name", "Nairobi", ["Food"], ""],
          { account: supplier1.account }
        )
      ).to.be.rejected;
    });

    it("Should require name and capabilities", async function () {
      const { supplierRegistry, supplier1 } = await deployFixture();

      await expect(
        supplierRegistry.write.registerSupplier(
          ["", "Nairobi", ["Medical"], ""],
          { account: supplier1.account }
        )
      ).to.be.rejected;

      await expect(
        supplierRegistry.write.registerSupplier(
          ["Global Aid", "Nairobi", [], ""],
          { account: supplier1.account }
        )
      ).to.be.rejected;
    });
  });

  describe("Supplier Verification", function () {
    it("Should verify a registered supplier", async function () {
      const { supplierRegistry, supplier1, verifier } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Global Aid Co.", "Nairobi", ["Medical"], ""],
        { account: supplier1.account }
      );

      await supplierRegistry.write.verifySupplier([supplier1.account.address], {
        account: verifier.account,
      });

      const supplier = await supplierRegistry.read.getSupplier([
        supplier1.account.address,
      ]);
      expect(supplier[8]).to.equal(1); // status should be Verified (1)
    });

    it("Should only allow verifiers to verify suppliers", async function () {
      const { supplierRegistry, supplier1, supplier2 } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Global Aid Co.", "Nairobi", ["Medical"], ""],
        { account: supplier1.account }
      );

      await expect(
        supplierRegistry.write.verifySupplier([supplier1.account.address], {
          account: supplier2.account,
        })
      ).to.be.rejected;
    });
  });

  describe("Mission Recording", function () {
    it("Should record successful mission and increase reputation", async function () {
      const { supplierRegistry, supplier1, owner } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Global Aid Co.", "Nairobi", ["Medical"], ""],
        { account: supplier1.account }
      );

      const initialSupplier = await supplierRegistry.read.getSupplier([
        supplier1.account.address,
      ]);
      const initialReputation = initialSupplier[4];

      await supplierRegistry.write.recordMission(
        [supplier1.account.address, 1n, true, parseUnits("5000", 6)],
        { account: owner.account }
      );

      const updatedSupplier = await supplierRegistry.read.getSupplier([
        supplier1.account.address,
      ]);

      expect(updatedSupplier[5]).to.equal(1n); // totalMissionsCompleted
      expect(updatedSupplier[4]).to.be.greaterThan(initialReputation); // reputation increased
    });

    it("Should record failed mission and decrease reputation", async function () {
      const { supplierRegistry, supplier1, owner } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Global Aid Co.", "Nairobi", ["Medical"], ""],
        { account: supplier1.account }
      );

      const initialSupplier = await supplierRegistry.read.getSupplier([
        supplier1.account.address,
      ]);
      const initialReputation = initialSupplier[4];

      await supplierRegistry.write.recordMission(
        [supplier1.account.address, 1n, false, parseUnits("5000", 6)],
        { account: owner.account }
      );

      const updatedSupplier = await supplierRegistry.read.getSupplier([
        supplier1.account.address,
      ]);

      expect(updatedSupplier[6]).to.equal(1n); // totalMissionsFailed
      expect(updatedSupplier[4]).to.be.lessThan(initialReputation); // reputation decreased
    });
  });

  describe("Reviews", function () {
    it("Should add a review for a supplier", async function () {
      const { supplierRegistry, supplier1, reviewer } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Global Aid Co.", "Nairobi", ["Medical"], ""],
        { account: supplier1.account }
      );

      await supplierRegistry.write.addReview(
        [supplier1.account.address, 1n, 5, "Excellent service!"],
        { account: reviewer.account }
      );

      const reviews = await supplierRegistry.read.getSupplierReviews([
        supplier1.account.address,
      ]);
      expect(reviews.length).to.equal(1);
      expect(reviews[0][2]).to.equal(5); // rating
    });

    it("Should adjust reputation based on review rating", async function () {
      const { supplierRegistry, supplier1, reviewer } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Global Aid Co.", "Nairobi", ["Medical"], ""],
        { account: supplier1.account }
      );

      const initialSupplier = await supplierRegistry.read.getSupplier([
        supplier1.account.address,
      ]);
      const initialReputation = initialSupplier[4];

      // Good review
      await supplierRegistry.write.addReview(
        [supplier1.account.address, 1n, 5, "Great!"],
        { account: reviewer.account }
      );

      const updatedSupplier = await supplierRegistry.read.getSupplier([
        supplier1.account.address,
      ]);
      expect(updatedSupplier[4]).to.be.greaterThan(initialReputation);
    });

    it("Should validate rating range", async function () {
      const { supplierRegistry, supplier1, reviewer } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Global Aid Co.", "Nairobi", ["Medical"], ""],
        { account: supplier1.account }
      );

      await expect(
        supplierRegistry.write.addReview(
          [supplier1.account.address, 1n, 0, "Bad"],
          { account: reviewer.account }
        )
      ).to.be.rejected;

      await expect(
        supplierRegistry.write.addReview(
          [supplier1.account.address, 1n, 6, "Too high"],
          { account: reviewer.account }
        )
      ).to.be.rejected;
    });
  });

  describe("Supplier Queries", function () {
    it("Should get all suppliers", async function () {
      const { supplierRegistry, supplier1, supplier2 } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Supplier 1", "Location 1", ["Medical"], ""],
        { account: supplier1.account }
      );

      await supplierRegistry.write.registerSupplier(
        ["Supplier 2", "Location 2", ["Food"], ""],
        { account: supplier2.account }
      );

      const allSuppliers = await supplierRegistry.read.getAllSuppliers();
      expect(allSuppliers.length).to.equal(2);
    });

    it("Should get verified suppliers only", async function () {
      const { supplierRegistry, supplier1, supplier2, verifier } =
        await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Supplier 1", "Location 1", ["Medical"], ""],
        { account: supplier1.account }
      );

      await supplierRegistry.write.registerSupplier(
        ["Supplier 2", "Location 2", ["Food"], ""],
        { account: supplier2.account }
      );

      await supplierRegistry.write.verifySupplier([supplier1.account.address], {
        account: verifier.account,
      });

      const verifiedSuppliers =
        await supplierRegistry.read.getVerifiedSuppliers();
      expect(verifiedSuppliers.length).to.equal(1);
    });

    it("Should calculate success rate correctly", async function () {
      const { supplierRegistry, supplier1, owner } = await deployFixture();

      await supplierRegistry.write.registerSupplier(
        ["Supplier 1", "Location 1", ["Medical"], ""],
        { account: supplier1.account }
      );

      // Record 3 successful and 1 failed mission
      await supplierRegistry.write.recordMission(
        [supplier1.account.address, 1n, true, parseUnits("1000", 6)],
        { account: owner.account }
      );
      await supplierRegistry.write.recordMission(
        [supplier1.account.address, 2n, true, parseUnits("1000", 6)],
        { account: owner.account }
      );
      await supplierRegistry.write.recordMission(
        [supplier1.account.address, 3n, true, parseUnits("1000", 6)],
        { account: owner.account }
      );
      await supplierRegistry.write.recordMission(
        [supplier1.account.address, 4n, false, parseUnits("1000", 6)],
        { account: owner.account }
      );

      const successRate = await supplierRegistry.read.getSupplierSuccessRate([
        supplier1.account.address,
      ]);
      expect(successRate).to.equal(75n); // 75% success rate
    });
  });
});
