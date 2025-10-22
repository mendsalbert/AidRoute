// Contract integration for AidRouteMissions
import { ethers } from "ethers";

// AidRouteMissions contract ABI (essential functions)
export const AID_ROUTE_ABI = [
  // Constructor
  "constructor(address _pyusdAddress)",

  // Main functions
  "function createMission(string memory location, string memory description, string[] memory items, uint256 fundingGoal) external returns (uint256)",
  "function donate(uint256 amount, uint256 missionId) external",
  "function deployFunds(uint256 missionId, uint256 amount, address recipient) external",
  "function updateMissionStatus(uint256 missionId, uint8 newStatus) external",
  "function allocateFromGeneralFund(uint256 missionId, uint256 amount) external",

  // View functions
  "function getMission(uint256 missionId) external view returns (tuple(uint256 id, string location, string description, string[] items, uint256 fundingGoal, uint256 fundsAllocated, uint256 fundsDeployed, address coordinator, uint8 status, uint256 createdAt, uint256 completedAt, string deliveryProof))",
  "function getStats() external view returns (uint256 _totalMissions, uint256 _totalDonations, uint256 _totalDeployed, uint256 _generalFund, uint256 _contractBalance)",
  "function isAuthorized(address account) external view returns (bool)",
  "function owner() external view returns (address)",

  // Events
  "event MissionCreated(uint256 indexed missionId, string location, uint256 fundingGoal, address coordinator)",
  "event DonationReceived(address indexed donor, uint256 amount, uint256 indexed missionId, uint256 timestamp)",
  "event FundsDeployed(uint256 indexed missionId, uint256 amount, address recipient)",
  "event MissionStatusUpdated(uint256 indexed missionId, uint8 oldStatus, uint8 newStatus)",
];

// Contract addresses (update these after deployment)
export const CONTRACT_ADDRESSES = {
  sepolia: "0xc461df0d6615c138c36b085c6b8206e0214f41c8", // Update after deployment
  localhost: "0x0000000000000000000000000000000000000000", // Update after local deployment
};

// Mock contract address for testing (when contract is not deployed)
export const MOCK_CONTRACT_ADDRESS =
  "0x1234567890123456789012345678901234567890";

// PYUSD addresses
export const PYUSD_ADDRESSES = {
  sepolia: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
  localhost: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9", // Mock address for local testing
};

// Mission status enum
export enum MissionStatus {
  Pending = 0,
  Funded = 1,
  InProgress = 2,
  EnRoute = 3,
  Delivered = 4,
  Verified = 5,
  Completed = 6,
  Cancelled = 7,
}

// Helper function to get contract instance
export function getAidRouteContract(
  signerOrProvider: ethers.Signer | ethers.Provider,
  network: "sepolia" | "localhost" = "sepolia"
) {
  const contractAddress = CONTRACT_ADDRESSES[network];
  if (contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Contract not deployed on ${network}. Please deploy first using: npx tsx scripts/test-deployment.ts`
    );
  }

  return new ethers.Contract(contractAddress, AID_ROUTE_ABI, signerOrProvider);
}

// Helper function to check if contract is deployed
export function isContractDeployed(
  network: "sepolia" | "localhost" = "sepolia"
): boolean {
  return (
    CONTRACT_ADDRESSES[network] !== "0x0000000000000000000000000000000000000000"
  );
}

// Helper function to format PYUSD amounts (6 decimals)
export function formatPYUSD(amount: bigint): string {
  return ethers.formatUnits(amount, 6);
}

export function parsePYUSD(amount: string): bigint {
  return ethers.parseUnits(amount, 6);
}

// Contract interaction helpers
export class AidRouteContractHelper {
  private contract: ethers.Contract;

  constructor(
    signerOrProvider: ethers.Signer | ethers.Provider,
    network: "sepolia" | "localhost" = "sepolia"
  ) {
    this.contract = getAidRouteContract(signerOrProvider, network);
  }

  // Create a new mission
  async createMission(
    location: string,
    description: string,
    items: string[],
    fundingGoalUSD: number
  ) {
    const fundingGoal = parsePYUSD(fundingGoalUSD.toString());
    const tx = await this.contract.createMission(
      location,
      description,
      items,
      fundingGoal
    );
    return await tx.wait();
  }

  // Donate to a mission
  async donate(amountUSD: number, missionId: number = 0) {
    const amount = parsePYUSD(amountUSD.toString());
    const tx = await this.contract.donate(amount, missionId);
    return await tx.wait();
  }

  // Deploy funds for a mission
  async deployFunds(missionId: number, amountUSD: number, recipient: string) {
    const amount = parsePYUSD(amountUSD.toString());
    const tx = await this.contract.deployFunds(missionId, amount, recipient);
    return await tx.wait();
  }

  // Get mission details
  async getMission(missionId: number) {
    try {
      return await this.contract.getMission(missionId);
    } catch (error: any) {
      if (
        error.code === "BAD_DATA" ||
        error.message?.includes("could not decode result data")
      ) {
        throw new Error(
          "Contract not deployed or not accessible. Please deploy the contract first."
        );
      }
      throw error;
    }
  }

  // Get contract statistics
  async getStats() {
    try {
      const stats = await this.contract.getStats();
      return {
        totalMissions: Number(stats[0]),
        totalDonations: formatPYUSD(stats[1]),
        totalDeployed: formatPYUSD(stats[2]),
        generalFund: formatPYUSD(stats[3]),
        contractBalance: formatPYUSD(stats[4]),
      };
    } catch (error: any) {
      // Handle case where contract doesn't exist or returns empty data
      if (
        error.code === "BAD_DATA" ||
        error.message?.includes("could not decode result data")
      ) {
        throw new Error(
          "Contract not deployed or not accessible. Please deploy the contract first."
        );
      }
      throw error;
    }
  }

  // Check if address is authorized
  async isAuthorized(address: string) {
    try {
      return await this.contract.isAuthorized(address);
    } catch (error: any) {
      if (
        error.code === "BAD_DATA" ||
        error.message?.includes("could not decode result data")
      ) {
        throw new Error(
          "Contract not deployed or not accessible. Please deploy the contract first."
        );
      }
      throw error;
    }
  }

  // Get contract address
  getAddress() {
    return this.contract.target;
  }
}

export default AidRouteContractHelper;
