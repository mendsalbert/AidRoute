import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseUnits, formatUnits } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("AidRouteMissions", function () {
  // Fixture for deploying the contract
  async function deployAidRouteFixture() {
    // Deploy a mock ERC20 token to simulate PYUSD
    const mockPYUSD = await hre.viem.deployContract("MockPYUSD");

    // Deploy AidRouteMissions contract
    const aidRoute = await hre.viem.deployContract("AidRouteMissions", [
      mockPYUSD.address,
    ]);

    const [owner, donor1, donor2, coordinator, supplier] =
      await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    return {
      aidRoute,
      mockPYUSD,
      owner,
      donor1,
      donor2,
      coordinator,
      supplier,
      publicClient,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { aidRoute, owner } = await loadFixture(deployAidRouteFixture);
      expect(await aidRoute.read.owner()).to.equal(
        getAddress(owner.account.address)
      );
    });

    it("Should set the PYUSD token address", async function () {
      const { aidRoute, mockPYUSD } = await loadFixture(deployAidRouteFixture);
      expect(await aidRoute.read.pyusd()).to.equal(
        getAddress(mockPYUSD.address)
      );
    });

    it("Should initialize with zero missions", async function () {
      const { aidRoute } = await loadFixture(deployAidRouteFixture);
      const stats = await aidRoute.read.getStats();
      expect(stats[0]).to.equal(0n); // Total missions
    });

    it("Should authorize owner as coordinator", async function () {
      const { aidRoute, owner } = await loadFixture(deployAidRouteFixture);
      expect(await aidRoute.read.isAuthorized([owner.account.address])).to.be
        .true;
    });
  });

  describe("Mission Creation", function () {
    it("Should create a mission successfully", async function () {
      const { aidRoute, owner } = await loadFixture(deployAidRouteFixture);

      const location = "Gaza, Palestine";
      const description = "Emergency medical supplies needed";
      const items = ["Bandages", "Antibiotics", "Water purification tablets"];
      const fundingGoal = parseUnits("1000", 6); // 1000 PYUSD

      const hash = await aidRoute.write.createMission([
        location,
        description,
        items,
        fundingGoal,
      ]);

      await hre.viem.getPublicClient().waitForTransactionReceipt({ hash });

      const mission = await aidRoute.read.getMission([1n]);
      expect(mission.location).to.equal(location);
      expect(mission.description).to.equal(description);
      expect(mission.fundingGoal).to.equal(fundingGoal);
      expect(mission.status).to.equal(0); // Pending status
    });

    it("Should emit MissionCreated event", async function () {
      const { aidRoute, publicClient, owner } = await loadFixture(
        deployAidRouteFixture
      );

      const fundingGoal = parseUnits("1000", 6);

      const hash = await aidRoute.write.createMission([
        "Syria",
        "Food supplies",
        ["Rice", "Flour"],
        fundingGoal,
      ]);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const logs = await aidRoute.getEvents.MissionCreated();

      expect(logs.length).to.be.greaterThan(0);
      expect(logs[0].args.missionId).to.equal(1n);
      expect(logs[0].args.location).to.equal("Syria");
    });

    it("Should not allow non-authorized users to create missions", async function () {
      const { aidRoute, donor1 } = await loadFixture(deployAidRouteFixture);

      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      await expect(
        aidRouteAsDonor.write.createMission([
          "Location",
          "Description",
          ["Item"],
          parseUnits("100", 6),
        ])
      ).to.be.rejectedWith("Not authorized");
    });

    it("Should increment mission IDs", async function () {
      const { aidRoute } = await loadFixture(deployAidRouteFixture);

      await aidRoute.write.createMission([
        "Location 1",
        "Description 1",
        ["Item 1"],
        parseUnits("100", 6),
      ]);

      await aidRoute.write.createMission([
        "Location 2",
        "Description 2",
        ["Item 2"],
        parseUnits("200", 6),
      ]);

      const mission1 = await aidRoute.read.getMission([1n]);
      const mission2 = await aidRoute.read.getMission([2n]);

      expect(mission1.id).to.equal(1n);
      expect(mission2.id).to.equal(2n);
    });
  });

  describe("Donations", function () {
    it("Should accept donations to a specific mission", async function () {
      const { aidRoute, mockPYUSD, donor1, publicClient } = await loadFixture(
        deployAidRouteFixture
      );

      // Create a mission
      await aidRoute.write.createMission([
        "Location",
        "Description",
        ["Item"],
        parseUnits("1000", 6),
      ]);

      // Mint PYUSD to donor
      const donationAmount = parseUnits("500", 6);
      await mockPYUSD.write.mint([donor1.account.address, donationAmount]);

      // Approve AidRoute to spend PYUSD
      const mockPYUSDAsDonor = await hre.viem.getContractAt(
        "MockPYUSD",
        mockPYUSD.address,
        { client: { wallet: donor1 } }
      );

      await mockPYUSDAsDonor.write.approve([aidRoute.address, donationAmount]);

      // Donate
      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      const hash = await aidRouteAsDonor.write.donate([donationAmount, 1n]);
      await publicClient.waitForTransactionReceipt({ hash });

      // Check mission funds
      const mission = await aidRoute.read.getMission([1n]);
      expect(mission.fundsAllocated).to.equal(donationAmount);

      // Check stats
      const stats = await aidRoute.read.getStats();
      expect(stats[1]).to.equal(donationAmount); // Total donations
    });

    it("Should accept donations to general fund", async function () {
      const { aidRoute, mockPYUSD, donor1, publicClient } = await loadFixture(
        deployAidRouteFixture
      );

      const donationAmount = parseUnits("1000", 6);
      await mockPYUSD.write.mint([donor1.account.address, donationAmount]);

      const mockPYUSDAsDonor = await hre.viem.getContractAt(
        "MockPYUSD",
        mockPYUSD.address,
        { client: { wallet: donor1 } }
      );

      await mockPYUSDAsDonor.write.approve([aidRoute.address, donationAmount]);

      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      await aidRouteAsDonor.write.donate([donationAmount, 0n]);

      const stats = await aidRoute.read.getStats();
      expect(stats[3]).to.equal(donationAmount); // General fund
    });

    it("Should update mission status to Funded when goal reached", async function () {
      const { aidRoute, mockPYUSD, donor1, publicClient } = await loadFixture(
        deployAidRouteFixture
      );

      const fundingGoal = parseUnits("1000", 6);
      await aidRoute.write.createMission([
        "Location",
        "Description",
        ["Item"],
        fundingGoal,
      ]);

      await mockPYUSD.write.mint([donor1.account.address, fundingGoal]);

      const mockPYUSDAsDonor = await hre.viem.getContractAt(
        "MockPYUSD",
        mockPYUSD.address,
        { client: { wallet: donor1 } }
      );

      await mockPYUSDAsDonor.write.approve([aidRoute.address, fundingGoal]);

      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      const hash = await aidRouteAsDonor.write.donate([fundingGoal, 1n]);
      await publicClient.waitForTransactionReceipt({ hash });

      const mission = await aidRoute.read.getMission([1n]);
      expect(mission.status).to.equal(1); // Funded status
    });

    it("Should emit DonationReceived event", async function () {
      const { aidRoute, mockPYUSD, donor1, publicClient } = await loadFixture(
        deployAidRouteFixture
      );

      const donationAmount = parseUnits("100", 6);
      await mockPYUSD.write.mint([donor1.account.address, donationAmount]);

      const mockPYUSDAsDonor = await hre.viem.getContractAt(
        "MockPYUSD",
        mockPYUSD.address,
        { client: { wallet: donor1 } }
      );

      await mockPYUSDAsDonor.write.approve([aidRoute.address, donationAmount]);

      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      const hash = await aidRouteAsDonor.write.donate([donationAmount, 0n]);
      await publicClient.waitForTransactionReceipt({ hash });

      const logs = await aidRoute.getEvents.DonationReceived();
      expect(logs.length).to.be.greaterThan(0);
      expect(logs[0].args.amount).to.equal(donationAmount);
    });
  });

  describe("Fund Deployment", function () {
    it("Should deploy funds to suppliers", async function () {
      const { aidRoute, mockPYUSD, donor1, supplier, publicClient } =
        await loadFixture(deployAidRouteFixture);

      // Create and fund a mission
      const fundingGoal = parseUnits("1000", 6);
      await aidRoute.write.createMission([
        "Location",
        "Description",
        ["Item"],
        fundingGoal,
      ]);

      await mockPYUSD.write.mint([donor1.account.address, fundingGoal]);

      const mockPYUSDAsDonor = await hre.viem.getContractAt(
        "MockPYUSD",
        mockPYUSD.address,
        { client: { wallet: donor1 } }
      );

      await mockPYUSDAsDonor.write.approve([aidRoute.address, fundingGoal]);

      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      await aidRouteAsDonor.write.donate([fundingGoal, 1n]);

      // Deploy funds
      const deployAmount = parseUnits("500", 6);
      const hash = await aidRoute.write.deployFunds([
        1n,
        deployAmount,
        supplier.account.address,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      // Check supplier received funds
      const supplierBalance = await mockPYUSD.read.balanceOf([
        supplier.account.address,
      ]);
      expect(supplierBalance).to.equal(deployAmount);

      // Check mission funds deployed
      const mission = await aidRoute.read.getMission([1n]);
      expect(mission.fundsDeployed).to.equal(deployAmount);
      expect(mission.status).to.equal(2); // InProgress status
    });

    it("Should emit FundsDeployed event", async function () {
      const { aidRoute, mockPYUSD, donor1, supplier, publicClient } =
        await loadFixture(deployAidRouteFixture);

      const fundingGoal = parseUnits("1000", 6);
      await aidRoute.write.createMission([
        "Location",
        "Description",
        ["Item"],
        fundingGoal,
      ]);

      await mockPYUSD.write.mint([donor1.account.address, fundingGoal]);

      const mockPYUSDAsDonor = await hre.viem.getContractAt(
        "MockPYUSD",
        mockPYUSD.address,
        { client: { wallet: donor1 } }
      );

      await mockPYUSDAsDonor.write.approve([aidRoute.address, fundingGoal]);

      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      await aidRouteAsDonor.write.donate([fundingGoal, 1n]);

      const deployAmount = parseUnits("500", 6);
      const hash = await aidRoute.write.deployFunds([
        1n,
        deployAmount,
        supplier.account.address,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const logs = await aidRoute.getEvents.FundsDeployed();
      expect(logs.length).to.be.greaterThan(0);
      expect(logs[0].args.amount).to.equal(deployAmount);
    });
  });

  describe("Mission Status Updates", function () {
    it("Should update mission status", async function () {
      const { aidRoute, mockPYUSD, donor1, publicClient } = await loadFixture(
        deployAidRouteFixture
      );

      const fundingGoal = parseUnits("1000", 6);
      await aidRoute.write.createMission([
        "Location",
        "Description",
        ["Item"],
        fundingGoal,
      ]);

      await mockPYUSD.write.mint([donor1.account.address, fundingGoal]);

      const mockPYUSDAsDonor = await hre.viem.getContractAt(
        "MockPYUSD",
        mockPYUSD.address,
        { client: { wallet: donor1 } }
      );

      await mockPYUSDAsDonor.write.approve([aidRoute.address, fundingGoal]);

      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      await aidRouteAsDonor.write.donate([fundingGoal, 1n]);

      // Update to EnRoute
      const hash = await aidRoute.write.updateMissionStatus([1n, 3]); // 3 = EnRoute
      await publicClient.waitForTransactionReceipt({ hash });

      const mission = await aidRoute.read.getMission([1n]);
      expect(mission.status).to.equal(3);
    });

    it("Should emit MissionStatusUpdated event", async function () {
      const { aidRoute, publicClient } = await loadFixture(
        deployAidRouteFixture
      );

      await aidRoute.write.createMission([
        "Location",
        "Description",
        ["Item"],
        parseUnits("1000", 6),
      ]);

      const hash = await aidRoute.write.updateMissionStatus([1n, 7]); // 7 = Cancelled
      await publicClient.waitForTransactionReceipt({ hash });

      const logs = await aidRoute.getEvents.MissionStatusUpdated();
      expect(logs.length).to.be.greaterThan(0);
    });
  });

  describe("Authorization", function () {
    it("Should authorize and deauthorize coordinators", async function () {
      const { aidRoute, coordinator, publicClient } = await loadFixture(
        deployAidRouteFixture
      );

      // Initially not authorized
      expect(
        await aidRoute.read.authorizedCoordinators([
          coordinator.account.address,
        ])
      ).to.be.false;

      // Authorize
      const hash1 = await aidRoute.write.setCoordinatorAuthorization([
        coordinator.account.address,
        true,
      ]);
      await publicClient.waitForTransactionReceipt({ hash: hash1 });

      expect(
        await aidRoute.read.authorizedCoordinators([
          coordinator.account.address,
        ])
      ).to.be.true;

      // Deauthorize
      const hash2 = await aidRoute.write.setCoordinatorAuthorization([
        coordinator.account.address,
        false,
      ]);
      await publicClient.waitForTransactionReceipt({ hash: hash2 });

      expect(
        await aidRoute.read.authorizedCoordinators([
          coordinator.account.address,
        ])
      ).to.be.false;
    });

    it("Should allow authorized coordinators to create missions", async function () {
      const { aidRoute, coordinator, publicClient } = await loadFixture(
        deployAidRouteFixture
      );

      await aidRoute.write.setCoordinatorAuthorization([
        coordinator.account.address,
        true,
      ]);

      const aidRouteAsCoordinator = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: coordinator } }
      );

      const hash = await aidRouteAsCoordinator.write.createMission([
        "Location",
        "Description",
        ["Item"],
        parseUnits("100", 6),
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const mission = await aidRoute.read.getMission([1n]);
      expect(mission.coordinator).to.equal(
        getAddress(coordinator.account.address)
      );
    });
  });

  describe("View Functions", function () {
    it("Should return correct stats", async function () {
      const { aidRoute, mockPYUSD, donor1 } = await loadFixture(
        deployAidRouteFixture
      );

      await aidRoute.write.createMission([
        "Location",
        "Description",
        ["Item"],
        parseUnits("1000", 6),
      ]);

      const donationAmount = parseUnits("500", 6);
      await mockPYUSD.write.mint([donor1.account.address, donationAmount]);

      const mockPYUSDAsDonor = await hre.viem.getContractAt(
        "MockPYUSD",
        mockPYUSD.address,
        { client: { wallet: donor1 } }
      );

      await mockPYUSDAsDonor.write.approve([aidRoute.address, donationAmount]);

      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      await aidRouteAsDonor.write.donate([donationAmount, 1n]);

      const stats = await aidRoute.read.getStats();
      expect(stats[0]).to.equal(1n); // Total missions
      expect(stats[1]).to.equal(donationAmount); // Total donations
      expect(stats[4]).to.equal(donationAmount); // Contract balance
    });

    it("Should return mission funding status", async function () {
      const { aidRoute, mockPYUSD, donor1 } = await loadFixture(
        deployAidRouteFixture
      );

      const fundingGoal = parseUnits("1000", 6);
      await aidRoute.write.createMission([
        "Location",
        "Description",
        ["Item"],
        fundingGoal,
      ]);

      const donationAmount = parseUnits("500", 6);
      await mockPYUSD.write.mint([donor1.account.address, donationAmount]);

      const mockPYUSDAsDonor = await hre.viem.getContractAt(
        "MockPYUSD",
        mockPYUSD.address,
        { client: { wallet: donor1 } }
      );

      await mockPYUSDAsDonor.write.approve([aidRoute.address, donationAmount]);

      const aidRouteAsDonor = await hre.viem.getContractAt(
        "AidRouteMissions",
        aidRoute.address,
        { client: { wallet: donor1 } }
      );

      await aidRouteAsDonor.write.donate([donationAmount, 1n]);

      const fundingStatus = await aidRoute.read.getMissionFundingStatus([1n]);
      expect(fundingStatus[0]).to.equal(donationAmount); // Allocated
      expect(fundingStatus[2]).to.equal(fundingGoal); // Goal
      expect(fundingStatus[3]).to.equal(5000n); // 50% funded (in basis points)
    });
  });
});
