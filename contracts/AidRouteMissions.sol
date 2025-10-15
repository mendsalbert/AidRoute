// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IERC20
 * @notice ERC-20 token interface for PYUSD interaction
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title AidRouteMissions
 * @notice Main smart contract for AidRoute - AI-powered humanitarian logistics platform
 * @dev Manages missions, donations, and fund deployment using PYUSD stablecoin
 */
contract AidRouteMissions {

    // Structs
    struct Mission {
        uint256 id;
        string location;
        string description;
        string[] items;
        uint256 fundingGoal;
        uint256 fundsAllocated;
        uint256 fundsDeployed;
        address coordinator;
        MissionStatus status;
        uint256 createdAt;
        uint256 completedAt;
        string deliveryProof; // IPFS hash or data URI for delivery verification
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 missionId; // 0 for general fund, specific ID for mission-specific
        uint256 timestamp;
    }

    enum MissionStatus {
        Pending,      // Mission created, awaiting funding
        Funded,       // Fully funded, ready for execution
        InProgress,   // Actively being executed
        EnRoute,      // Resources en route to destination
        Delivered,    // Resources delivered, awaiting verification
        Verified,     // Delivery verified and confirmed
        Completed,    // Mission fully completed
        Cancelled     // Mission cancelled
    }

    // State variables
    IERC20 public immutable pyusd;
    address public owner;
    uint256 public nextMissionId;
    uint256 public totalDonations;
    uint256 public totalFundsDeployed;
    uint256 public generalFund; // Pool for non-mission-specific donations

    // Mappings
    mapping(uint256 => Mission) public missions;
    mapping(address => bool) public authorizedCoordinators;
    mapping(uint256 => Donation[]) public missionDonations;
    Donation[] public allDonations;

    // Events
    event MissionCreated(
        uint256 indexed missionId,
        string location,
        uint256 fundingGoal,
        address coordinator
    );
    
    event DonationReceived(
        address indexed donor,
        uint256 amount,
        uint256 indexed missionId,
        uint256 timestamp
    );
    
    event MissionStatusUpdated(
        uint256 indexed missionId,
        MissionStatus oldStatus,
        MissionStatus newStatus
    );
    
    event FundsAllocated(
        uint256 indexed missionId,
        uint256 amount,
        uint256 totalAllocated
    );
    
    event FundsDeployed(
        uint256 indexed missionId,
        uint256 amount,
        address recipient
    );
    
    event DeliveryVerified(
        uint256 indexed missionId,
        string deliveryProof,
        uint256 timestamp
    );
    
    event CoordinatorAuthorized(address indexed coordinator, bool authorized);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedCoordinators[msg.sender],
            "Not authorized"
        );
        _;
    }

    modifier validMission(uint256 missionId) {
        require(missionId > 0 && missionId < nextMissionId, "Invalid mission ID");
        _;
    }

    /**
     * @notice Initialize the AidRoute contract
     * @param _pyusdAddress Address of PYUSD token contract on the network
     */
    constructor(address _pyusdAddress) {
        require(_pyusdAddress != address(0), "Invalid PYUSD address");
        pyusd = IERC20(_pyusdAddress);
        owner = msg.sender;
        nextMissionId = 1;
        authorizedCoordinators[msg.sender] = true;
    }

    /**
     * @notice Create a new humanitarian mission
     * @param location Geographic location of the mission
     * @param description Detailed description of the humanitarian need
     * @param items Array of items/resources needed
     * @param fundingGoal Target funding amount in PYUSD (with 6 decimals)
     * @return missionId The ID of the newly created mission
     */
    function createMission(
        string memory location,
        string memory description,
        string[] memory items,
        uint256 fundingGoal
    ) external onlyAuthorized returns (uint256) {
        require(fundingGoal > 0, "Funding goal must be greater than 0");
        require(bytes(location).length > 0, "Location cannot be empty");

        uint256 missionId = nextMissionId++;

        Mission storage mission = missions[missionId];
        mission.id = missionId;
        mission.location = location;
        mission.description = description;
        mission.items = items;
        mission.fundingGoal = fundingGoal;
        mission.coordinator = msg.sender;
        mission.status = MissionStatus.Pending;
        mission.createdAt = block.timestamp;

        emit MissionCreated(missionId, location, fundingGoal, msg.sender);

        return missionId;
    }

    /**
     * @notice Donate PYUSD to a specific mission or general fund
     * @param amount Amount of PYUSD to donate (with 6 decimals)
     * @param missionId ID of mission to support (0 for general fund)
     */
    function donate(uint256 amount, uint256 missionId) external {
        require(amount > 0, "Donation amount must be greater than 0");
        
        if (missionId > 0) {
            require(missionId < nextMissionId, "Mission does not exist");
            Mission storage mission = missions[missionId];
            require(
                mission.status != MissionStatus.Completed &&
                mission.status != MissionStatus.Cancelled,
                "Cannot donate to completed or cancelled mission"
            );
        }

        // Transfer PYUSD from donor to this contract
        require(
            pyusd.transferFrom(msg.sender, address(this), amount),
            "PYUSD transfer failed"
        );

        // Record donation
        Donation memory donation = Donation({
            donor: msg.sender,
            amount: amount,
            missionId: missionId,
            timestamp: block.timestamp
        });

        allDonations.push(donation);
        
        if (missionId > 0) {
            missionDonations[missionId].push(donation);
            missions[missionId].fundsAllocated += amount;
            
            // Auto-update mission status if fully funded
            if (missions[missionId].fundsAllocated >= missions[missionId].fundingGoal &&
                missions[missionId].status == MissionStatus.Pending) {
                _updateMissionStatus(missionId, MissionStatus.Funded);
            }
        } else {
            generalFund += amount;
        }

        totalDonations += amount;

        emit DonationReceived(msg.sender, amount, missionId, block.timestamp);
        if (missionId > 0) {
            emit FundsAllocated(missionId, amount, missions[missionId].fundsAllocated);
        }
    }

    /**
     * @notice Allocate funds from general fund to a specific mission
     * @param missionId Mission to allocate funds to
     * @param amount Amount to allocate
     */
    function allocateFromGeneralFund(uint256 missionId, uint256 amount) 
        external 
        onlyAuthorized 
        validMission(missionId) 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(generalFund >= amount, "Insufficient general fund balance");
        
        Mission storage mission = missions[missionId];
        require(
            mission.status != MissionStatus.Completed &&
            mission.status != MissionStatus.Cancelled,
            "Cannot allocate to completed or cancelled mission"
        );

        generalFund -= amount;
        mission.fundsAllocated += amount;

        // Auto-update mission status if now fully funded
        if (mission.fundsAllocated >= mission.fundingGoal &&
            mission.status == MissionStatus.Pending) {
            _updateMissionStatus(missionId, MissionStatus.Funded);
        }

        emit FundsAllocated(missionId, amount, mission.fundsAllocated);
    }

    /**
     * @notice Deploy funds for mission execution
     * @param missionId Mission to deploy funds for
     * @param amount Amount to deploy
     * @param recipient Address to receive the funds (supplier, logistics partner, etc.)
     */
    function deployFunds(
        uint256 missionId,
        uint256 amount,
        address recipient
    ) external onlyAuthorized validMission(missionId) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");

        Mission storage mission = missions[missionId];
        require(
            mission.status == MissionStatus.Funded ||
            mission.status == MissionStatus.InProgress ||
            mission.status == MissionStatus.EnRoute,
            "Mission not ready for fund deployment"
        );
        
        uint256 availableFunds = mission.fundsAllocated - mission.fundsDeployed;
        require(availableFunds >= amount, "Insufficient allocated funds");

        mission.fundsDeployed += amount;
        totalFundsDeployed += amount;

        require(pyusd.transfer(recipient, amount), "PYUSD transfer failed");

        // Auto-update status to InProgress if first deployment
        if (mission.status == MissionStatus.Funded) {
            _updateMissionStatus(missionId, MissionStatus.InProgress);
        }

        emit FundsDeployed(missionId, amount, recipient);
    }

    /**
     * @notice Update mission status
     * @param missionId Mission to update
     * @param newStatus New status for the mission
     */
    function updateMissionStatus(uint256 missionId, MissionStatus newStatus)
        external
        onlyAuthorized
        validMission(missionId)
    {
        _updateMissionStatus(missionId, newStatus);
    }

    /**
     * @notice Verify mission delivery with proof
     * @param missionId Mission to verify
     * @param deliveryProof IPFS hash or data URI containing delivery verification
     */
    function verifyDelivery(uint256 missionId, string memory deliveryProof)
        external
        onlyAuthorized
        validMission(missionId)
    {
        Mission storage mission = missions[missionId];
        require(
            mission.status == MissionStatus.Delivered,
            "Mission must be in Delivered status"
        );
        require(bytes(deliveryProof).length > 0, "Delivery proof cannot be empty");

        mission.deliveryProof = deliveryProof;
        _updateMissionStatus(missionId, MissionStatus.Verified);

        emit DeliveryVerified(missionId, deliveryProof, block.timestamp);
    }

    /**
     * @notice Complete a mission
     * @param missionId Mission to complete
     */
    function completeMission(uint256 missionId)
        external
        onlyAuthorized
        validMission(missionId)
    {
        Mission storage mission = missions[missionId];
        require(
            mission.status == MissionStatus.Verified,
            "Mission must be verified before completion"
        );

        mission.completedAt = block.timestamp;
        _updateMissionStatus(missionId, MissionStatus.Completed);
    }

    /**
     * @notice Authorize or deauthorize a coordinator
     * @param coordinator Address of the coordinator
     * @param authorized Whether to authorize or deauthorize
     */
    function setCoordinatorAuthorization(address coordinator, bool authorized)
        external
        onlyOwner
    {
        require(coordinator != address(0), "Invalid coordinator address");
        authorizedCoordinators[coordinator] = authorized;
        emit CoordinatorAuthorized(coordinator, authorized);
    }

    /**
     * @notice Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
        authorizedCoordinators[newOwner] = true;
    }

    /**
     * @notice Emergency withdraw function (only owner)
     * @param amount Amount to withdraw
     * @param recipient Address to receive the funds
     */
    function emergencyWithdraw(uint256 amount, address recipient)
        external
        onlyOwner
    {
        require(recipient != address(0), "Invalid recipient");
        require(pyusd.transfer(recipient, amount), "Transfer failed");
    }

    // Internal functions
    function _updateMissionStatus(uint256 missionId, MissionStatus newStatus) internal {
        Mission storage mission = missions[missionId];
        MissionStatus oldStatus = mission.status;
        mission.status = newStatus;
        emit MissionStatusUpdated(missionId, oldStatus, newStatus);
    }

    // View functions
    /**
     * @notice Get mission details
     * @param missionId Mission ID
     * @return Mission struct data
     */
    function getMission(uint256 missionId)
        external
        view
        validMission(missionId)
        returns (Mission memory)
    {
        return missions[missionId];
    }

    /**
     * @notice Get mission items
     * @param missionId Mission ID
     * @return Array of items needed for the mission
     */
    function getMissionItems(uint256 missionId)
        external
        view
        validMission(missionId)
        returns (string[] memory)
    {
        return missions[missionId].items;
    }

    /**
     * @notice Get donations for a specific mission
     * @param missionId Mission ID (0 for all donations)
     * @return Array of donations
     */
    function getMissionDonations(uint256 missionId)
        external
        view
        returns (Donation[] memory)
    {
        if (missionId == 0) {
            return allDonations;
        }
        return missionDonations[missionId];
    }

    /**
     * @notice Get contract statistics
     * @return _totalMissions Total number of missions created
     * @return _totalDonations Total PYUSD donated
     * @return _totalDeployed Total PYUSD deployed to missions
     * @return _generalFund Available general fund balance
     * @return _contractBalance Total PYUSD held by contract
     */
    function getStats()
        external
        view
        returns (
            uint256 _totalMissions,
            uint256 _totalDonations,
            uint256 _totalDeployed,
            uint256 _generalFund,
            uint256 _contractBalance
        )
    {
        return (
            nextMissionId - 1,
            totalDonations,
            totalFundsDeployed,
            generalFund,
            pyusd.balanceOf(address(this))
        );
    }

    /**
     * @notice Check if an address is authorized
     * @param account Address to check
     * @return Whether the address is authorized
     */
    function isAuthorized(address account) external view returns (bool) {
        return account == owner || authorizedCoordinators[account];
    }

    /**
     * @notice Get mission funding progress
     * @param missionId Mission ID
     * @return allocated Funds allocated to mission
     * @return deployed Funds deployed from mission
     * @return goal Funding goal
     * @return percentFunded Percentage funded (scaled by 100)
     */
    function getMissionFundingStatus(uint256 missionId)
        external
        view
        validMission(missionId)
        returns (
            uint256 allocated,
            uint256 deployed,
            uint256 goal,
            uint256 percentFunded
        )
    {
        Mission storage mission = missions[missionId];
        allocated = mission.fundsAllocated;
        deployed = mission.fundsDeployed;
        goal = mission.fundingGoal;
        percentFunded = goal > 0 ? (allocated * 10000) / goal : 0; // Basis points (100 = 1%)
    }
}

