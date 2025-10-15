import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deployment module for AidRouteMissions contract
 * This deploys the main contract to Sepolia testnet with PYUSD integration
 */
const AidRouteModule = buildModule("AidRouteModule", (m) => {
  // PYUSD address on Sepolia testnet
  const pyusdAddress = m.getParameter(
    "pyusdAddress",
    "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"
  );

  // Deploy AidRouteMissions contract
  const aidRouteMissions = m.contract("AidRouteMissions", [pyusdAddress]);

  return { aidRouteMissions };
});

export default AidRouteModule;
