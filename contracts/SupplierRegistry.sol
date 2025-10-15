// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SupplierRegistry
 * @notice Manages supplier registration, reputation, and verification for AidRoute
 */
contract SupplierRegistry is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    enum SupplierStatus {
        Pending,
        Verified,
        Suspended,
        Banned
    }

    struct Supplier {
        address supplierAddress;
        string name;
        string location;
        string[] capabilities; // Types of aid they can provide
        uint256 reputationScore; // 0-1000 scale
        uint256 totalMissionsCompleted;
        uint256 totalMissionsFailed;
        uint256 totalFundsReceived;
        SupplierStatus status;
        uint256 registeredAt;
        uint256 lastMissionAt;
        string metadata; // IPFS hash with additional info
    }

    struct Review {
        uint256 missionId;
        address reviewer;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
    }

    // State
    mapping(address => Supplier) public suppliers;
    mapping(address => Review[]) public supplierReviews;
    mapping(address => bool) public isRegistered;
    
    address[] public allSuppliers;
    
    // Events
    event SupplierRegistered(
        address indexed supplier,
        string name,
        string location
    );
    
    event SupplierVerified(address indexed supplier, address verifier);
    
    event SupplierStatusChanged(
        address indexed supplier,
        SupplierStatus oldStatus,
        SupplierStatus newStatus
    );
    
    event ReputationUpdated(
        address indexed supplier,
        uint256 oldScore,
        uint256 newScore
    );
    
    event ReviewAdded(
        address indexed supplier,
        uint256 missionId,
        address reviewer,
        uint8 rating
    );

    event MissionRecorded(
        address indexed supplier,
        uint256 missionId,
        bool successful,
        uint256 fundsAmount
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @notice Register as a new supplier
     * @param name Supplier organization name
     * @param location Primary location
     * @param capabilities Array of aid types they can provide
     * @param metadata IPFS hash with additional information
     */
    function registerSupplier(
        string memory name,
        string memory location,
        string[] memory capabilities,
        string memory metadata
    ) external {
        require(!isRegistered[msg.sender], "Already registered");
        require(bytes(name).length > 0, "Name required");
        require(capabilities.length > 0, "Capabilities required");
        
        suppliers[msg.sender] = Supplier({
            supplierAddress: msg.sender,
            name: name,
            location: location,
            capabilities: capabilities,
            reputationScore: 500, // Start at middle score
            totalMissionsCompleted: 0,
            totalMissionsFailed: 0,
            totalFundsReceived: 0,
            status: SupplierStatus.Pending,
            registeredAt: block.timestamp,
            lastMissionAt: 0,
            metadata: metadata
        });
        
        isRegistered[msg.sender] = true;
        allSuppliers.push(msg.sender);
        
        emit SupplierRegistered(msg.sender, name, location);
    }

    /**
     * @notice Verify a supplier (admin/verifier only)
     * @param supplier Address of supplier to verify
     */
    function verifySupplier(address supplier)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(isRegistered[supplier], "Supplier not registered");
        require(
            suppliers[supplier].status == SupplierStatus.Pending,
            "Supplier not pending"
        );
        
        SupplierStatus oldStatus = suppliers[supplier].status;
        suppliers[supplier].status = SupplierStatus.Verified;
        
        emit SupplierVerified(supplier, msg.sender);
        emit SupplierStatusChanged(supplier, oldStatus, SupplierStatus.Verified);
    }

    /**
     * @notice Update supplier status
     * @param supplier Address of supplier
     * @param newStatus New status to set
     */
    function updateSupplierStatus(address supplier, SupplierStatus newStatus)
        external
        onlyRole(VERIFIER_ROLE)
    {
        require(isRegistered[supplier], "Supplier not registered");
        
        SupplierStatus oldStatus = suppliers[supplier].status;
        suppliers[supplier].status = newStatus;
        
        emit SupplierStatusChanged(supplier, oldStatus, newStatus);
    }

    /**
     * @notice Record a completed mission for a supplier
     * @param supplier Address of supplier
     * @param missionId Mission identifier
     * @param successful Whether mission was successful
     * @param fundsAmount Amount of funds involved
     */
    function recordMission(
        address supplier,
        uint256 missionId,
        bool successful,
        uint256 fundsAmount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(isRegistered[supplier], "Supplier not registered");
        
        Supplier storage s = suppliers[supplier];
        
        if (successful) {
            s.totalMissionsCompleted++;
            s.totalFundsReceived += fundsAmount;
            
            // Increase reputation for successful missions
            if (s.reputationScore < 1000) {
                uint256 increase = 10; // +10 points per success
                s.reputationScore = s.reputationScore + increase > 1000
                    ? 1000
                    : s.reputationScore + increase;
            }
        } else {
            s.totalMissionsFailed++;
            
            // Decrease reputation for failed missions
            if (s.reputationScore > 0) {
                uint256 decrease = 20; // -20 points per failure
                s.reputationScore = s.reputationScore < decrease
                    ? 0
                    : s.reputationScore - decrease;
            }
        }
        
        s.lastMissionAt = block.timestamp;
        
        emit MissionRecorded(supplier, missionId, successful, fundsAmount);
        emit ReputationUpdated(supplier, s.reputationScore, s.reputationScore);
    }

    /**
     * @notice Add a review for a supplier
     * @param supplier Address of supplier being reviewed
     * @param missionId Related mission ID
     * @param rating Rating 1-5 stars
     * @param comment Review comment
     */
    function addReview(
        address supplier,
        uint256 missionId,
        uint8 rating,
        string memory comment
    ) external {
        require(isRegistered[supplier], "Supplier not registered");
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");
        
        Review memory review = Review({
            missionId: missionId,
            reviewer: msg.sender,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp
        });
        
        supplierReviews[supplier].push(review);
        
        // Adjust reputation based on rating
        Supplier storage s = suppliers[supplier];
        uint256 oldScore = s.reputationScore;
        
        if (rating >= 4) {
            // Good rating: increase reputation
            s.reputationScore = s.reputationScore + 5 > 1000
                ? 1000
                : s.reputationScore + 5;
        } else if (rating <= 2) {
            // Poor rating: decrease reputation
            s.reputationScore = s.reputationScore < 5
                ? 0
                : s.reputationScore - 5;
        }
        
        emit ReviewAdded(supplier, missionId, msg.sender, rating);
        
        if (oldScore != s.reputationScore) {
            emit ReputationUpdated(supplier, oldScore, s.reputationScore);
        }
    }

    /**
     * @notice Get supplier details
     * @param supplier Address of supplier
     * @return Supplier struct
     */
    function getSupplier(address supplier)
        external
        view
        returns (Supplier memory)
    {
        require(isRegistered[supplier], "Supplier not registered");
        return suppliers[supplier];
    }

    /**
     * @notice Get all reviews for a supplier
     * @param supplier Address of supplier
     * @return Array of reviews
     */
    function getSupplierReviews(address supplier)
        external
        view
        returns (Review[] memory)
    {
        return supplierReviews[supplier];
    }

    /**
     * @notice Get all registered suppliers
     * @return Array of supplier addresses
     */
    function getAllSuppliers() external view returns (address[] memory) {
        return allSuppliers;
    }

    /**
     * @notice Get verified suppliers only
     * @return Array of verified supplier addresses
     */
    function getVerifiedSuppliers() external view returns (address[] memory) {
        uint256 count = 0;
        
        // Count verified suppliers
        for (uint256 i = 0; i < allSuppliers.length; i++) {
            if (suppliers[allSuppliers[i]].status == SupplierStatus.Verified) {
                count++;
            }
        }
        
        // Create array of verified suppliers
        address[] memory verified = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allSuppliers.length; i++) {
            if (suppliers[allSuppliers[i]].status == SupplierStatus.Verified) {
                verified[index] = allSuppliers[i];
                index++;
            }
        }
        
        return verified;
    }

    /**
     * @notice Get supplier's success rate
     * @param supplier Address of supplier
     * @return Success rate as percentage (0-100)
     */
    function getSupplierSuccessRate(address supplier)
        external
        view
        returns (uint256)
    {
        require(isRegistered[supplier], "Supplier not registered");
        
        Supplier memory s = suppliers[supplier];
        uint256 totalMissions = s.totalMissionsCompleted + s.totalMissionsFailed;
        
        if (totalMissions == 0) {
            return 0;
        }
        
        return (s.totalMissionsCompleted * 100) / totalMissions;
    }
}

