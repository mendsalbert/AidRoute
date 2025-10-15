import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deployment module for AidRoute smart contracts
 *
 * This deploys the complete AidRoute ecosystem:
 * - AidRouteCore: Main mission and fund management
 * - SupplierRegistry: Supplier management and reputation
 * - BeneficiaryRegistry: Beneficiary/recipient tracking
 * - MissionVerifier: Delivery proof verification
 */

const AidRouteModule = buildModule("AidRouteModule", (m) => {
  // Configuration parameters
  // PYUSD addresses:
  // Sepolia Testnet: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
  // Ethereum Mainnet: 0x6c3ea9036406852006290770BEdFcAbA0e23A0e8

  const pyusdAddress = m.getParameter(
    "pyusdAddress",
    "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9" // Default to Sepolia testnet
  );

  // Deploy SupplierRegistry
  const supplierRegistry = m.contract("SupplierRegistry", []);

  // Deploy BeneficiaryRegistry
  const beneficiaryRegistry = m.contract("BeneficiaryRegistry", []);

  // Deploy MissionVerifier
  const missionVerifier = m.contract("MissionVerifier", []);

  // Deploy AidRouteCore with PYUSD address
  const aidRouteCore = m.contract("AidRouteCore", [pyusdAddress]);

  return {
    aidRouteCore,
    supplierRegistry,
    beneficiaryRegistry,
    missionVerifier,
  };
});

export default AidRouteModule;
