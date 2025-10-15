// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BeneficiaryRegistry
 * @notice Manages beneficiary registration and aid distribution tracking for AidRoute
 */
contract BeneficiaryRegistry is AccessControl {
    bytes32 public constant COORDINATOR_ROLE = keccak256("COORDINATOR_ROLE");

    enum BeneficiaryType {
        Individual,
        Community,
        Organization,
        Camp
    }

    struct Beneficiary {
        address beneficiaryAddress;
        string name;
        string location;
        BeneficiaryType beneficiaryType;
        uint256 totalAidReceived; // Total PYUSD value received
        uint256 missionCount; // Number of aid missions received
        uint256 registeredAt;
        uint256 lastAidReceivedAt;
        bool isVerified;
        string metadata; // IPFS hash with additional info
    }

    struct AidRecord {
        uint256 missionId;
        uint256 timestamp;
        uint256 fundsValue;
        string[] items;
        uint256[] quantities;
    }

    // State
    mapping(address => Beneficiary) public beneficiaries;
    mapping(address => AidRecord[]) public aidHistory;
    mapping(address => bool) public isRegistered;
    
    address[] public allBeneficiaries;
    
    uint256 public totalBeneficiaries;
    uint256 public totalAidDistributed;
    
    // Events
    event BeneficiaryRegistered(
        address indexed beneficiary,
        string name,
        string location,
        BeneficiaryType beneficiaryType
    );
    
    event BeneficiaryVerified(address indexed beneficiary, address verifier);
    
    event AidRecorded(
        address indexed beneficiary,
        uint256 missionId,
        uint256 fundsValue,
        uint256 timestamp
    );

    event BeneficiaryUpdated(
        address indexed beneficiary,
        string name,
        string location
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COORDINATOR_ROLE, msg.sender);
    }

    /**
     * @notice Register a new beneficiary
     * @param beneficiaryAddress Address of the beneficiary (can be self or on behalf)
     * @param name Name of beneficiary
     * @param location Location
     * @param beneficiaryType Type of beneficiary
     * @param metadata IPFS hash with additional information
     */
    function registerBeneficiary(
        address beneficiaryAddress,
        string memory name,
        string memory location,
        BeneficiaryType beneficiaryType,
        string memory metadata
    ) external onlyRole(COORDINATOR_ROLE) {
        require(
            beneficiaryAddress != address(0),
            "Invalid beneficiary address"
        );
        require(!isRegistered[beneficiaryAddress], "Already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(location).length > 0, "Location required");
        
        beneficiaries[beneficiaryAddress] = Beneficiary({
            beneficiaryAddress: beneficiaryAddress,
            name: name,
            location: location,
            beneficiaryType: beneficiaryType,
            totalAidReceived: 0,
            missionCount: 0,
            registeredAt: block.timestamp,
            lastAidReceivedAt: 0,
            isVerified: false,
            metadata: metadata
        });
        
        isRegistered[beneficiaryAddress] = true;
        allBeneficiaries.push(beneficiaryAddress);
        totalBeneficiaries++;
        
        emit BeneficiaryRegistered(
            beneficiaryAddress,
            name,
            location,
            beneficiaryType
        );
    }

    /**
     * @notice Verify a beneficiary
     * @param beneficiary Address to verify
     */
    function verifyBeneficiary(address beneficiary)
        external
        onlyRole(COORDINATOR_ROLE)
    {
        require(isRegistered[beneficiary], "Beneficiary not registered");
        require(!beneficiaries[beneficiary].isVerified, "Already verified");
        
        beneficiaries[beneficiary].isVerified = true;
        
        emit BeneficiaryVerified(beneficiary, msg.sender);
    }

    /**
     * @notice Record aid delivery to a beneficiary
     * @param beneficiary Address of beneficiary
     * @param missionId Mission identifier
     * @param fundsValue PYUSD value of aid
     * @param items Items delivered
     * @param quantities Quantities of items
     */
    function recordAidDelivery(
        address beneficiary,
        uint256 missionId,
        uint256 fundsValue,
        string[] memory items,
        uint256[] memory quantities
    ) external onlyRole(COORDINATOR_ROLE) {
        require(isRegistered[beneficiary], "Beneficiary not registered");
        require(items.length == quantities.length, "Items/quantities mismatch");
        
        Beneficiary storage b = beneficiaries[beneficiary];
        b.totalAidReceived += fundsValue;
        b.missionCount++;
        b.lastAidReceivedAt = block.timestamp;
        
        AidRecord memory record = AidRecord({
            missionId: missionId,
            timestamp: block.timestamp,
            fundsValue: fundsValue,
            items: items,
            quantities: quantities
        });
        
        aidHistory[beneficiary].push(record);
        totalAidDistributed += fundsValue;
        
        emit AidRecorded(beneficiary, missionId, fundsValue, block.timestamp);
    }

    /**
     * @notice Update beneficiary information
     * @param beneficiary Address of beneficiary
     * @param name Updated name
     * @param location Updated location
     * @param metadata Updated metadata
     */
    function updateBeneficiary(
        address beneficiary,
        string memory name,
        string memory location,
        string memory metadata
    ) external onlyRole(COORDINATOR_ROLE) {
        require(isRegistered[beneficiary], "Beneficiary not registered");
        
        Beneficiary storage b = beneficiaries[beneficiary];
        b.name = name;
        b.location = location;
        b.metadata = metadata;
        
        emit BeneficiaryUpdated(beneficiary, name, location);
    }

    /**
     * @notice Get beneficiary details
     * @param beneficiary Address of beneficiary
     * @return Beneficiary struct
     */
    function getBeneficiary(address beneficiary)
        external
        view
        returns (Beneficiary memory)
    {
        require(isRegistered[beneficiary], "Beneficiary not registered");
        return beneficiaries[beneficiary];
    }

    /**
     * @notice Get aid history for a beneficiary
     * @param beneficiary Address of beneficiary
     * @return Array of aid records
     */
    function getAidHistory(address beneficiary)
        external
        view
        returns (AidRecord[] memory)
    {
        require(isRegistered[beneficiary], "Beneficiary not registered");
        return aidHistory[beneficiary];
    }

    /**
     * @notice Get all registered beneficiaries
     * @return Array of beneficiary addresses
     */
    function getAllBeneficiaries() external view returns (address[] memory) {
        return allBeneficiaries;
    }

    /**
     * @notice Get beneficiaries by location
     * @param location Location to filter by
     * @return Array of beneficiary addresses in that location
     */
    function getBeneficiariesByLocation(string memory location)
        external
        view
        returns (address[] memory)
    {
        uint256 count = 0;
        
        // Count matching beneficiaries
        for (uint256 i = 0; i < allBeneficiaries.length; i++) {
            if (
                keccak256(bytes(beneficiaries[allBeneficiaries[i]].location)) ==
                keccak256(bytes(location))
            ) {
                count++;
            }
        }
        
        // Create array of matching beneficiaries
        address[] memory matches = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allBeneficiaries.length; i++) {
            if (
                keccak256(bytes(beneficiaries[allBeneficiaries[i]].location)) ==
                keccak256(bytes(location))
            ) {
                matches[index] = allBeneficiaries[i];
                index++;
            }
        }
        
        return matches;
    }

    /**
     * @notice Get verified beneficiaries only
     * @return Array of verified beneficiary addresses
     */
    function getVerifiedBeneficiaries()
        external
        view
        returns (address[] memory)
    {
        uint256 count = 0;
        
        // Count verified beneficiaries
        for (uint256 i = 0; i < allBeneficiaries.length; i++) {
            if (beneficiaries[allBeneficiaries[i]].isVerified) {
                count++;
            }
        }
        
        // Create array of verified beneficiaries
        address[] memory verified = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allBeneficiaries.length; i++) {
            if (beneficiaries[allBeneficiaries[i]].isVerified) {
                verified[index] = allBeneficiaries[i];
                index++;
            }
        }
        
        return verified;
    }

    /**
     * @notice Get platform statistics
     * @return totalBenefs Total number of beneficiaries
     * @return totalAid Total aid distributed in PYUSD
     * @return verifiedCount Number of verified beneficiaries
     */
    function getStats()
        external
        view
        returns (
            uint256 totalBenefs,
            uint256 totalAid,
            uint256 verifiedCount
        )
    {
        uint256 verified = 0;
        for (uint256 i = 0; i < allBeneficiaries.length; i++) {
            if (beneficiaries[allBeneficiaries[i]].isVerified) {
                verified++;
            }
        }
        
        return (totalBeneficiaries, totalAidDistributed, verified);
    }
}

