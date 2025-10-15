// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AidRouteCore
 * @notice Main contract for AidRoute - Autonomous Humanitarian Logistics Platform
 * @dev Manages missions, PYUSD funds, and delivery verification
 */
contract AidRouteCore is AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant COORDINATOR_ROLE = keccak256("COORDINATOR_ROLE");
    bytes32 public constant AI_AGENT_ROLE = keccak256("AI_AGENT_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // PYUSD token address
    IERC20 public immutable pyusdToken;

    // Mission states
    enum MissionStatus {
        Proposed,
        Approved,
        FundsLocked,
        InTransit,
        Delivering,
        Completed,
        Verified,
        Failed,
        Cancelled
    }

    enum UrgencyLevel {
        Low,
        Medium,
        High,
        Critical
    }

    // Mission structure
    struct Mission {
        uint256 id;
        string needId; // Reference to off-chain need ID
        address coordinator; // Who created the mission
        address supplier; // Supplier providing resources
        address beneficiary; // Recipient of aid
        string location; // Origin location
        string destination; // Delivery destination
        string[] items; // List of items being delivered
        uint256[] quantities; // Quantities for each item
        uint256 fundsRequired; // PYUSD amount required
        uint256 fundsLocked; // Actual PYUSD locked
        MissionStatus status;
        UrgencyLevel urgency;
        uint256 createdAt;
        uint256 approvedAt;
        uint256 completedAt;
        bytes32 proofHash; // Hash of delivery proof
        string metadata; // IPFS hash or JSON string with additional data
    }

    // Need structure (lightweight on-chain representation)
    struct Need {
        string id;
        string location;
        UrgencyLevel urgency;
        uint256 estimatedFunds;
        bool fulfilled;
        uint256 timestamp;
    }

    // State variables
    uint256 public missionCounter;
    uint256 public needCounter;
    
    mapping(uint256 => Mission) public missions;
    mapping(string => Need) public needs; // needId => Need
    mapping(address => uint256[]) public coordinatorMissions;
    mapping(address => uint256[]) public supplierMissions;
    mapping(address => uint256[]) public beneficiaryMissions;
    
    uint256 public totalFundsDeployed;
    uint256 public totalMissionsCompleted;
    
    // Events
    event NeedRegistered(
        string indexed needId,
        string location,
        UrgencyLevel urgency,
        uint256 estimatedFunds
    );
    
    event MissionCreated(
        uint256 indexed missionId,
        string needId,
        address indexed coordinator,
        address indexed supplier,
        uint256 fundsRequired
    );
    
    event MissionApproved(uint256 indexed missionId, address approver);
    
    event FundsLocked(
        uint256 indexed missionId,
        uint256 amount,
        address from
    );
    
    event MissionStatusChanged(
        uint256 indexed missionId,
        MissionStatus oldStatus,
        MissionStatus newStatus
    );
    
    event MissionCompleted(
        uint256 indexed missionId,
        bytes32 proofHash,
        uint256 fundsReleased
    );
    
    event MissionVerified(
        uint256 indexed missionId,
        address verifier,
        bytes32 proofHash
    );
    
    event FundsReleased(
        uint256 indexed missionId,
        address to,
        uint256 amount
    );

    event EmergencyWithdrawal(
        uint256 indexed missionId,
        address to,
        uint256 amount,
        string reason
    );

    /**
     * @notice Constructor
     * @param _pyusdToken Address of the PYUSD token contract
     */
    constructor(address _pyusdToken) {
        require(_pyusdToken != address(0), "Invalid PYUSD address");
        pyusdToken = IERC20(_pyusdToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(COORDINATOR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @notice Register a new humanitarian need
     * @param needId Unique identifier for the need
     * @param location Location requiring aid
     * @param urgency Urgency level of the need
     * @param estimatedFunds Estimated PYUSD required
     */
    function registerNeed(
        string memory needId,
        string memory location,
        UrgencyLevel urgency,
        uint256 estimatedFunds
    ) external onlyRole(COORDINATOR_ROLE) {
        require(bytes(needs[needId].id).length == 0, "Need already registered");
        
        needs[needId] = Need({
            id: needId,
            location: location,
            urgency: urgency,
            estimatedFunds: estimatedFunds,
            fulfilled: false,
            timestamp: block.timestamp
        });
        
        needCounter++;
        
        emit NeedRegistered(needId, location, urgency, estimatedFunds);
    }

    /**
     * @notice Create a new mission for a registered need
     * @param needId Reference to the need being addressed
     * @param supplier Address of the supplier
     * @param beneficiary Address of the beneficiary
     * @param location Origin location
     * @param destination Delivery destination
     * @param items Array of item descriptions
     * @param quantities Array of quantities
     * @param fundsRequired PYUSD amount required
     * @param urgency Mission urgency level
     * @param metadata Additional metadata (IPFS hash or JSON)
     * @return missionId The created mission ID
     */
    function createMission(
        string memory needId,
        address supplier,
        address beneficiary,
        string memory location,
        string memory destination,
        string[] memory items,
        uint256[] memory quantities,
        uint256 fundsRequired,
        UrgencyLevel urgency,
        string memory metadata
    ) external onlyRole(COORDINATOR_ROLE) returns (uint256) {
        require(supplier != address(0), "Invalid supplier");
        require(beneficiary != address(0), "Invalid beneficiary");
        require(items.length == quantities.length, "Items/quantities mismatch");
        require(fundsRequired > 0, "Funds must be positive");
        
        uint256 missionId = missionCounter++;
        
        Mission storage mission = missions[missionId];
        mission.id = missionId;
        mission.needId = needId;
        mission.coordinator = msg.sender;
        mission.supplier = supplier;
        mission.beneficiary = beneficiary;
        mission.location = location;
        mission.destination = destination;
        mission.items = items;
        mission.quantities = quantities;
        mission.fundsRequired = fundsRequired;
        mission.status = MissionStatus.Proposed;
        mission.urgency = urgency;
        mission.createdAt = block.timestamp;
        mission.metadata = metadata;
        
        coordinatorMissions[msg.sender].push(missionId);
        supplierMissions[supplier].push(missionId);
        beneficiaryMissions[beneficiary].push(missionId);
        
        emit MissionCreated(
            missionId,
            needId,
            msg.sender,
            supplier,
            fundsRequired
        );
        
        return missionId;
    }

    /**
     * @notice Approve a proposed mission (can be done by coordinator or AI agent)
     * @param missionId The mission to approve
     */
    function approveMission(uint256 missionId) 
        external 
        onlyRole(COORDINATOR_ROLE) 
    {
        Mission storage mission = missions[missionId];
        require(
            mission.status == MissionStatus.Proposed,
            "Mission not in Proposed state"
        );
        
        MissionStatus oldStatus = mission.status;
        mission.status = MissionStatus.Approved;
        mission.approvedAt = block.timestamp;
        
        emit MissionApproved(missionId, msg.sender);
        emit MissionStatusChanged(missionId, oldStatus, MissionStatus.Approved);
    }

    /**
     * @notice Lock PYUSD funds for an approved mission
     * @param missionId The mission to fund
     * @param amount Amount of PYUSD to lock
     */
    function lockFunds(uint256 missionId, uint256 amount) 
        external 
        nonReentrant 
    {
        Mission storage mission = missions[missionId];
        require(
            mission.status == MissionStatus.Approved,
            "Mission not approved"
        );
        require(amount >= mission.fundsRequired, "Insufficient funds");
        
        // Transfer PYUSD from sender to this contract
        require(
            pyusdToken.transferFrom(msg.sender, address(this), amount),
            "PYUSD transfer failed"
        );
        
        mission.fundsLocked = amount;
        MissionStatus oldStatus = mission.status;
        mission.status = MissionStatus.FundsLocked;
        
        emit FundsLocked(missionId, amount, msg.sender);
        emit MissionStatusChanged(missionId, oldStatus, MissionStatus.FundsLocked);
    }

    /**
     * @notice Update mission status (for tracking progress)
     * @param missionId The mission to update
     * @param newStatus The new status
     */
    function updateMissionStatus(uint256 missionId, MissionStatus newStatus)
        external
        onlyRole(COORDINATOR_ROLE)
    {
        Mission storage mission = missions[missionId];
        MissionStatus oldStatus = mission.status;
        
        require(
            oldStatus != MissionStatus.Completed &&
            oldStatus != MissionStatus.Verified &&
            oldStatus != MissionStatus.Cancelled,
            "Mission is finalized"
        );
        
        mission.status = newStatus;
        
        emit MissionStatusChanged(missionId, oldStatus, newStatus);
    }

    /**
     * @notice Complete a mission and submit delivery proof
     * @param missionId The mission that was completed
     * @param proofHash Hash of the delivery proof (e.g., keccak256 of photos, signatures, etc.)
     */
    function completeMission(uint256 missionId, bytes32 proofHash)
        external
        onlyRole(COORDINATOR_ROLE)
    {
        Mission storage mission = missions[missionId];
        require(
            mission.status == MissionStatus.Delivering ||
            mission.status == MissionStatus.InTransit,
            "Mission not in delivery phase"
        );
        require(proofHash != bytes32(0), "Invalid proof hash");
        
        mission.proofHash = proofHash;
        mission.completedAt = block.timestamp;
        MissionStatus oldStatus = mission.status;
        mission.status = MissionStatus.Completed;
        
        emit MissionCompleted(missionId, proofHash, mission.fundsLocked);
        emit MissionStatusChanged(missionId, oldStatus, MissionStatus.Completed);
    }

    /**
     * @notice Verify a completed mission and release funds
     * @param missionId The mission to verify
     */
    function verifyAndReleaseFunds(uint256 missionId)
        external
        onlyRole(VERIFIER_ROLE)
        nonReentrant
    {
        Mission storage mission = missions[missionId];
        require(
            mission.status == MissionStatus.Completed,
            "Mission not completed"
        );
        require(mission.fundsLocked > 0, "No funds to release");
        require(mission.proofHash != bytes32(0), "No proof submitted");
        
        uint256 fundsToRelease = mission.fundsLocked;
        mission.fundsLocked = 0;
        
        MissionStatus oldStatus = mission.status;
        mission.status = MissionStatus.Verified;
        
        // Release funds to supplier
        require(
            pyusdToken.transfer(mission.supplier, fundsToRelease),
            "PYUSD transfer failed"
        );
        
        totalFundsDeployed += fundsToRelease;
        totalMissionsCompleted++;
        
        // Mark need as fulfilled if specified
        if (bytes(mission.needId).length > 0) {
            needs[mission.needId].fulfilled = true;
        }
        
        emit MissionVerified(missionId, msg.sender, mission.proofHash);
        emit FundsReleased(missionId, mission.supplier, fundsToRelease);
        emit MissionStatusChanged(missionId, oldStatus, MissionStatus.Verified);
    }

    /**
     * @notice Cancel a mission and refund locked funds
     * @param missionId The mission to cancel
     * @param reason Reason for cancellation
     */
    function cancelMission(uint256 missionId, string memory reason)
        external
        onlyRole(COORDINATOR_ROLE)
        nonReentrant
    {
        Mission storage mission = missions[missionId];
        require(
            mission.status != MissionStatus.Verified &&
            mission.status != MissionStatus.Cancelled,
            "Cannot cancel finalized mission"
        );
        
        uint256 fundsToRefund = mission.fundsLocked;
        mission.fundsLocked = 0;
        
        MissionStatus oldStatus = mission.status;
        mission.status = MissionStatus.Cancelled;
        
        // Refund funds if any were locked
        if (fundsToRefund > 0) {
            require(
                pyusdToken.transfer(mission.coordinator, fundsToRefund),
                "PYUSD refund failed"
            );
            
            emit EmergencyWithdrawal(
                missionId,
                mission.coordinator,
                fundsToRefund,
                reason
            );
        }
        
        emit MissionStatusChanged(missionId, oldStatus, MissionStatus.Cancelled);
    }

    /**
     * @notice Get mission details
     * @param missionId The mission ID
     * @return Mission struct
     */
    function getMission(uint256 missionId)
        external
        view
        returns (Mission memory)
    {
        return missions[missionId];
    }

    /**
     * @notice Get missions for a coordinator
     * @param coordinator Address of the coordinator
     * @return Array of mission IDs
     */
    function getCoordinatorMissions(address coordinator)
        external
        view
        returns (uint256[] memory)
    {
        return coordinatorMissions[coordinator];
    }

    /**
     * @notice Get missions for a supplier
     * @param supplier Address of the supplier
     * @return Array of mission IDs
     */
    function getSupplierMissions(address supplier)
        external
        view
        returns (uint256[] memory)
    {
        return supplierMissions[supplier];
    }

    /**
     * @notice Get missions for a beneficiary
     * @param beneficiary Address of the beneficiary
     * @return Array of mission IDs
     */
    function getBeneficiaryMissions(address beneficiary)
        external
        view
        returns (uint256[] memory)
    {
        return beneficiaryMissions[beneficiary];
    }

    /**
     * @notice Get platform statistics
     * @return totalMissions Total missions created
     * @return completedMissions Total missions completed and verified
     * @return totalDeployed Total PYUSD deployed
     * @return activeMissions Count of active missions
     */
    function getStats()
        external
        view
        returns (
            uint256 totalMissions,
            uint256 completedMissions,
            uint256 totalDeployed,
            uint256 activeMissions
        )
    {
        uint256 active = 0;
        for (uint256 i = 0; i < missionCounter; i++) {
            if (
                missions[i].status == MissionStatus.Approved ||
                missions[i].status == MissionStatus.FundsLocked ||
                missions[i].status == MissionStatus.InTransit ||
                missions[i].status == MissionStatus.Delivering
            ) {
                active++;
            }
        }
        
        return (
            missionCounter,
            totalMissionsCompleted,
            totalFundsDeployed,
            active
        );
    }
}

