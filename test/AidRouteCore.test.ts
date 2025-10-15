import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseUnits } from "viem";

describe("AidRouteCore", function () {
  async function deployFixture() {
    const [owner, coordinator, supplier, beneficiary, donor, verifier] =
      await hre.viem.getWalletClients();

    // Deploy Mock PYUSD
    const mockPYUSD = await hre.viem.deployContract("MockPYUSD", []);

    // Deploy AidRouteCore
    const aidRouteCore = await hre.viem.deployContract("AidRouteCore", [
      mockPYUSD.address,
    ]);

    const publicClient = await hre.viem.getPublicClient();

    // Mint PYUSD to donor for testing
    await mockPYUSD.write.mint([
      donor.account.address,
      parseUnits("100000", 6),
    ]);

    // Grant roles
    const COORDINATOR_ROLE = await aidRouteCore.read.COORDINATOR_ROLE();
    const VERIFIER_ROLE = await aidRouteCore.read.VERIFIER_ROLE();

    await aidRouteCore.write.grantRole([
      COORDINATOR_ROLE,
      coordinator.account.address,
    ]);
    await aidRouteCore.write.grantRole([
      VERIFIER_ROLE,
      verifier.account.address,
    ]);

    return {
      aidRouteCore,
      mockPYUSD,
      owner,
      coordinator,
      supplier,
      beneficiary,
      donor,
      verifier,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should deploy with correct PYUSD address", async function () {
      const { aidRouteCore, mockPYUSD } = await deployFixture();

      const pyusdAddress = await aidRouteCore.read.pyusdToken();
      expect(getAddress(pyusdAddress)).to.equal(getAddress(mockPYUSD.address));
    });

    it("Should grant deployer admin role", async function () {
      const { aidRouteCore, owner } = await deployFixture();

      const DEFAULT_ADMIN_ROLE = await aidRouteCore.read.DEFAULT_ADMIN_ROLE();
      const hasRole = await aidRouteCore.read.hasRole([
        DEFAULT_ADMIN_ROLE,
        owner.account.address,
      ]);

      expect(hasRole).to.be.true;
    });
  });

  describe("Need Registration", function () {
    it("Should register a new need", async function () {
      const { aidRouteCore, coordinator } = await deployFixture();

      const needId = "need-001";
      const location = "Camp Alpha";
      const urgency = 3; // Critical
      const estimatedFunds = parseUnits("5000", 6);

      await aidRouteCore.write.registerNeed(
        [needId, location, urgency, estimatedFunds],
        { account: coordinator.account }
      );

      const need = await aidRouteCore.read.needs([needId]);
      expect(need[0]).to.equal(needId); // id
      expect(need[1]).to.equal(location); // location
      expect(need[2]).to.equal(urgency); // urgency
    });

    it("Should not allow duplicate need registration", async function () {
      const { aidRouteCore, coordinator } = await deployFixture();

      const needId = "need-001";
      await aidRouteCore.write.registerNeed(
        [needId, "Camp Alpha", 3, parseUnits("5000", 6)],
        { account: coordinator.account }
      );

      await expect(
        aidRouteCore.write.registerNeed(
          [needId, "Camp Beta", 2, parseUnits("3000", 6)],
          { account: coordinator.account }
        )
      ).to.be.rejected;
    });

    it("Should only allow coordinators to register needs", async function () {
      const { aidRouteCore, supplier } = await deployFixture();

      await expect(
        aidRouteCore.write.registerNeed(
          ["need-002", "Camp Beta", 2, parseUnits("3000", 6)],
          { account: supplier.account }
        )
      ).to.be.rejected;
    });
  });

  describe("Mission Creation", function () {
    it("Should create a mission", async function () {
      const { aidRouteCore, coordinator, supplier, beneficiary } =
        await deployFixture();

      const needId = "need-001";
      await aidRouteCore.write.registerNeed(
        [needId, "Camp Alpha", 3, parseUnits("5000", 6)],
        { account: coordinator.account }
      );

      const location = "Warehouse A";
      const destination = "Camp Alpha";
      const items = ["Medical Supplies", "Water"];
      const quantities = [100n, 500n];
      const fundsRequired = parseUnits("5000", 6);
      const urgency = 3;
      const metadata = "ipfs://QmTest123";

      const hash = await aidRouteCore.write.createMission(
        [
          needId,
          supplier.account.address,
          beneficiary.account.address,
          location,
          destination,
          items,
          quantities,
          fundsRequired,
          urgency,
          metadata,
        ],
        { account: coordinator.account }
      );

      const mission = await aidRouteCore.read.missions([0n]);
      expect(mission[0]).to.equal(0n); // id
      expect(mission[1]).to.equal(needId); // needId
      expect(getAddress(mission[3])).to.equal(
        getAddress(supplier.account.address)
      ); // supplier
    });

    it("Should track missions by coordinator", async function () {
      const { aidRouteCore, coordinator, supplier, beneficiary } =
        await deployFixture();

      await aidRouteCore.write.createMission(
        [
          "",
          supplier.account.address,
          beneficiary.account.address,
          "Warehouse A",
          "Camp Alpha",
          ["Medical Supplies"],
          [100n],
          parseUnits("5000", 6),
          3,
          "",
        ],
        { account: coordinator.account }
      );

      const missions = await aidRouteCore.read.getCoordinatorMissions([
        coordinator.account.address,
      ]);
      expect(missions.length).to.equal(1);
      expect(missions[0]).to.equal(0n);
    });

    it("Should reject mission with invalid supplier", async function () {
      const { aidRouteCore, coordinator, beneficiary } = await deployFixture();

      await expect(
        aidRouteCore.write.createMission(
          [
            "",
            "0x0000000000000000000000000000000000000000",
            beneficiary.account.address,
            "Warehouse A",
            "Camp Alpha",
            ["Medical Supplies"],
            [100n],
            parseUnits("5000", 6),
            3,
            "",
          ],
          { account: coordinator.account }
        )
      ).to.be.rejected;
    });
  });

  describe("Mission Approval and Funding", function () {
    it("Should approve a proposed mission", async function () {
      const { aidRouteCore, coordinator, supplier, beneficiary } =
        await deployFixture();

      // Create mission
      await aidRouteCore.write.createMission(
        [
          "",
          supplier.account.address,
          beneficiary.account.address,
          "Warehouse A",
          "Camp Alpha",
          ["Medical Supplies"],
          [100n],
          parseUnits("5000", 6),
          3,
          "",
        ],
        { account: coordinator.account }
      );

      // Approve mission
      await aidRouteCore.write.approveMission([0n], {
        account: coordinator.account,
      });

      const mission = await aidRouteCore.read.missions([0n]);
      expect(mission[10]).to.equal(1); // status should be Approved (1)
    });

    it("Should lock funds for approved mission", async function () {
      const {
        aidRouteCore,
        coordinator,
        supplier,
        beneficiary,
        donor,
        mockPYUSD,
      } = await deployFixture();

      const fundsRequired = parseUnits("5000", 6);

      // Create and approve mission
      await aidRouteCore.write.createMission(
        [
          "",
          supplier.account.address,
          beneficiary.account.address,
          "Warehouse A",
          "Camp Alpha",
          ["Medical Supplies"],
          [100n],
          fundsRequired,
          3,
          "",
        ],
        { account: coordinator.account }
      );

      await aidRouteCore.write.approveMission([0n], {
        account: coordinator.account,
      });

      // Approve PYUSD spending
      await mockPYUSD.write.approve([aidRouteCore.address, fundsRequired], {
        account: donor.account,
      });

      // Lock funds
      await aidRouteCore.write.lockFunds([0n, fundsRequired], {
        account: donor.account,
      });

      const mission = await aidRouteCore.read.missions([0n]);
      expect(mission[9]).to.equal(fundsRequired); // fundsLocked
      expect(mission[10]).to.equal(2); // status should be FundsLocked (2)
    });

    it("Should reject funding unapproved mission", async function () {
      const { aidRouteCore, coordinator, supplier, beneficiary, donor } =
        await deployFixture();

      await aidRouteCore.write.createMission(
        [
          "",
          supplier.account.address,
          beneficiary.account.address,
          "Warehouse A",
          "Camp Alpha",
          ["Medical Supplies"],
          [100n],
          parseUnits("5000", 6),
          3,
          "",
        ],
        { account: coordinator.account }
      );

      await expect(
        aidRouteCore.write.lockFunds([0n, parseUnits("5000", 6)], {
          account: donor.account,
        })
      ).to.be.rejected;
    });
  });

  describe("Mission Completion and Verification", function () {
    it("Should complete mission with proof", async function () {
      const {
        aidRouteCore,
        coordinator,
        supplier,
        beneficiary,
        donor,
        mockPYUSD,
      } = await deployFixture();

      const fundsRequired = parseUnits("5000", 6);

      // Create, approve, and fund mission
      await aidRouteCore.write.createMission(
        [
          "",
          supplier.account.address,
          beneficiary.account.address,
          "Warehouse A",
          "Camp Alpha",
          ["Medical Supplies"],
          [100n],
          fundsRequired,
          3,
          "",
        ],
        { account: coordinator.account }
      );

      await aidRouteCore.write.approveMission([0n], {
        account: coordinator.account,
      });

      await mockPYUSD.write.approve([aidRouteCore.address, fundsRequired], {
        account: donor.account,
      });

      await aidRouteCore.write.lockFunds([0n, fundsRequired], {
        account: donor.account,
      });

      // Update status to Delivering
      await aidRouteCore.write.updateMissionStatus([0n, 4], {
        // 4 = Delivering
        account: coordinator.account,
      });

      // Complete mission
      const proofHash =
        "0x1234567890123456789012345678901234567890123456789012345678901234";
      await aidRouteCore.write.completeMission([0n, proofHash], {
        account: coordinator.account,
      });

      const mission = await aidRouteCore.read.missions([0n]);
      expect(mission[10]).to.equal(5); // status should be Completed (5)
      expect(mission[14]).to.equal(proofHash); // proofHash
    });

    it("Should verify and release funds", async function () {
      const {
        aidRouteCore,
        coordinator,
        supplier,
        beneficiary,
        donor,
        verifier,
        mockPYUSD,
      } = await deployFixture();

      const fundsRequired = parseUnits("5000", 6);

      // Create, approve, fund, and complete mission
      await aidRouteCore.write.createMission(
        [
          "",
          supplier.account.address,
          beneficiary.account.address,
          "Warehouse A",
          "Camp Alpha",
          ["Medical Supplies"],
          [100n],
          fundsRequired,
          3,
          "",
        ],
        { account: coordinator.account }
      );

      await aidRouteCore.write.approveMission([0n], {
        account: coordinator.account,
      });

      await mockPYUSD.write.approve([aidRouteCore.address, fundsRequired], {
        account: donor.account,
      });

      await aidRouteCore.write.lockFunds([0n, fundsRequired], {
        account: donor.account,
      });

      await aidRouteCore.write.updateMissionStatus([0n, 4], {
        account: coordinator.account,
      });

      const proofHash =
        "0x1234567890123456789012345678901234567890123456789012345678901234";
      await aidRouteCore.write.completeMission([0n, proofHash], {
        account: coordinator.account,
      });

      // Verify and release funds
      const supplierBalanceBefore = await mockPYUSD.read.balanceOf([
        supplier.account.address,
      ]);

      await aidRouteCore.write.verifyAndReleaseFunds([0n], {
        account: verifier.account,
      });

      const supplierBalanceAfter = await mockPYUSD.read.balanceOf([
        supplier.account.address,
      ]);

      expect(supplierBalanceAfter - supplierBalanceBefore).to.equal(
        fundsRequired
      );

      const mission = await aidRouteCore.read.missions([0n]);
      expect(mission[10]).to.equal(6); // status should be Verified (6)
    });

    it("Should track total funds deployed", async function () {
      const {
        aidRouteCore,
        coordinator,
        supplier,
        beneficiary,
        donor,
        verifier,
        mockPYUSD,
      } = await deployFixture();

      const fundsRequired = parseUnits("5000", 6);

      // Complete full mission flow
      await aidRouteCore.write.createMission(
        [
          "",
          supplier.account.address,
          beneficiary.account.address,
          "Warehouse A",
          "Camp Alpha",
          ["Medical Supplies"],
          [100n],
          fundsRequired,
          3,
          "",
        ],
        { account: coordinator.account }
      );

      await aidRouteCore.write.approveMission([0n], {
        account: coordinator.account,
      });

      await mockPYUSD.write.approve([aidRouteCore.address, fundsRequired], {
        account: donor.account,
      });

      await aidRouteCore.write.lockFunds([0n, fundsRequired], {
        account: donor.account,
      });

      await aidRouteCore.write.updateMissionStatus([0n, 4], {
        account: coordinator.account,
      });

      await aidRouteCore.write.completeMission(
        [
          0n,
          "0x1234567890123456789012345678901234567890123456789012345678901234",
        ],
        { account: coordinator.account }
      );

      await aidRouteCore.write.verifyAndReleaseFunds([0n], {
        account: verifier.account,
      });

      const totalFundsDeployed = await aidRouteCore.read.totalFundsDeployed();
      expect(totalFundsDeployed).to.equal(fundsRequired);
    });
  });

  describe("Mission Cancellation", function () {
    it("Should cancel mission and refund funds", async function () {
      const {
        aidRouteCore,
        coordinator,
        supplier,
        beneficiary,
        donor,
        mockPYUSD,
      } = await deployFixture();

      const fundsRequired = parseUnits("5000", 6);

      // Create, approve, and fund mission
      await aidRouteCore.write.createMission(
        [
          "",
          supplier.account.address,
          beneficiary.account.address,
          "Warehouse A",
          "Camp Alpha",
          ["Medical Supplies"],
          [100n],
          fundsRequired,
          3,
          "",
        ],
        { account: coordinator.account }
      );

      await aidRouteCore.write.approveMission([0n], {
        account: coordinator.account,
      });

      await mockPYUSD.write.approve([aidRouteCore.address, fundsRequired], {
        account: donor.account,
      });

      await aidRouteCore.write.lockFunds([0n, fundsRequired], {
        account: donor.account,
      });

      const coordinatorBalanceBefore = await mockPYUSD.read.balanceOf([
        coordinator.account.address,
      ]);

      // Cancel mission
      await aidRouteCore.write.cancelMission([0n, "Emergency cancellation"], {
        account: coordinator.account,
      });

      const coordinatorBalanceAfter = await mockPYUSD.read.balanceOf([
        coordinator.account.address,
      ]);

      expect(coordinatorBalanceAfter - coordinatorBalanceBefore).to.equal(
        fundsRequired
      );

      const mission = await aidRouteCore.read.missions([0n]);
      expect(mission[10]).to.equal(8); // status should be Cancelled (8)
    });
  });

  describe("Statistics", function () {
    it("Should return accurate statistics", async function () {
      const { aidRouteCore, coordinator, supplier, beneficiary } =
        await deployFixture();

      // Create multiple missions
      for (let i = 0; i < 3; i++) {
        await aidRouteCore.write.createMission(
          [
            "",
            supplier.account.address,
            beneficiary.account.address,
            "Warehouse A",
            "Camp Alpha",
            ["Medical Supplies"],
            [100n],
            parseUnits("5000", 6),
            3,
            "",
          ],
          { account: coordinator.account }
        );
      }

      const stats = await aidRouteCore.read.getStats();
      expect(stats[0]).to.equal(3n); // totalMissions
    });
  });
});
