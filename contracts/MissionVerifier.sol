// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title MissionVerifier
 * @notice Handles cryptographic verification of mission deliveries for AidRoute
 * @dev Supports multi-signature verification and proof validation
 */
contract MissionVerifier is AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant AI_AGENT_ROLE = keccak256("AI_AGENT_ROLE");

    enum ProofType {
        PhotoHash,
        GPSCoordinates,
        RecipientSignature,
        ThirdPartyAttestation,
        IoTSensorData
    }

    struct DeliveryProof {
        uint256 missionId;
        address submitter;
        bytes32 proofHash; // Main proof hash
        ProofType[] proofTypes;
        bytes32[] proofHashes; // Individual proof hashes
        string[] proofURIs; // IPFS or other URIs for off-chain data
        uint256 timestamp;
        uint256 gpsLatitude; // Scaled by 1e6 for precision
        uint256 gpsLongitude; // Scaled by 1e6 for precision
        address[] witnesses; // Addresses of witnesses who verified
        mapping(address => bool) hasWitnessed;
        uint256 witnessCount;
        bool isVerified;
        string metadata; // Additional metadata as JSON or IPFS hash
    }

    struct VerificationRequirement {
        uint256 minWitnesses;
        bool requireGPS;
        bool requirePhoto;
        bool requireRecipientSignature;
        ProofType[] requiredProofTypes;
    }

    // State
    mapping(uint256 => DeliveryProof) public deliveryProofs;
    mapping(uint256 => bool) public hasProof;
    mapping(uint256 => VerificationRequirement) public missionRequirements;
    
    uint256 public defaultMinWitnesses = 2;
    
    // Events
    event ProofSubmitted(
        uint256 indexed missionId,
        address indexed submitter,
        bytes32 proofHash,
        uint256 timestamp
    );
    
    event WitnessAdded(
        uint256 indexed missionId,
        address indexed witness,
        uint256 witnessCount
    );
    
    event ProofVerified(
        uint256 indexed missionId,
        uint256 witnessCount,
        bytes32 proofHash
    );
    
    event RequirementsSet(
        uint256 indexed missionId,
        uint256 minWitnesses,
        uint256 requiredProofTypesCount
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @notice Set verification requirements for a mission
     * @param missionId The mission ID
     * @param minWitnesses Minimum number of witnesses required
     * @param requireGPS Whether GPS coordinates are required
     * @param requirePhoto Whether photo evidence is required
     * @param requireRecipientSig Whether recipient signature is required
     * @param requiredProofTypes Array of required proof types
     */
    function setVerificationRequirements(
        uint256 missionId,
        uint256 minWitnesses,
        bool requireGPS,
        bool requirePhoto,
        bool requireRecipientSig,
        ProofType[] memory requiredProofTypes
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        VerificationRequirement storage req = missionRequirements[missionId];
        req.minWitnesses = minWitnesses;
        req.requireGPS = requireGPS;
        req.requirePhoto = requirePhoto;
        req.requireRecipientSignature = requireRecipientSig;
        req.requiredProofTypes = requiredProofTypes;
        
        emit RequirementsSet(
            missionId,
            minWitnesses,
            requiredProofTypes.length
        );
    }

    /**
     * @notice Submit delivery proof for a mission
     * @param missionId The mission ID
     * @param proofTypes Types of proof being submitted
     * @param proofHashes Hashes of individual proofs
     * @param proofURIs URIs (IPFS, etc.) for off-chain proof data
     * @param gpsLatitude GPS latitude (scaled by 1e6)
     * @param gpsLongitude GPS longitude (scaled by 1e6)
     * @param metadata Additional metadata
     */
    function submitDeliveryProof(
        uint256 missionId,
        ProofType[] memory proofTypes,
        bytes32[] memory proofHashes,
        string[] memory proofURIs,
        uint256 gpsLatitude,
        uint256 gpsLongitude,
        string memory metadata
    ) external returns (bytes32) {
        require(
            proofTypes.length == proofHashes.length,
            "Proof arrays length mismatch"
        );
        require(
            proofHashes.length == proofURIs.length,
            "Proof arrays length mismatch"
        );
        require(!hasProof[missionId], "Proof already submitted");
        
        // Generate composite proof hash
        bytes32 compositeHash = keccak256(
            abi.encodePacked(
                missionId,
                msg.sender,
                proofHashes,
                gpsLatitude,
                gpsLongitude,
                block.timestamp
            )
        );
        
        DeliveryProof storage proof = deliveryProofs[missionId];
        proof.missionId = missionId;
        proof.submitter = msg.sender;
        proof.proofHash = compositeHash;
        proof.proofTypes = proofTypes;
        proof.proofHashes = proofHashes;
        proof.proofURIs = proofURIs;
        proof.timestamp = block.timestamp;
        proof.gpsLatitude = gpsLatitude;
        proof.gpsLongitude = gpsLongitude;
        proof.witnessCount = 0;
        proof.isVerified = false;
        proof.metadata = metadata;
        
        hasProof[missionId] = true;
        
        emit ProofSubmitted(missionId, msg.sender, compositeHash, block.timestamp);
        
        return compositeHash;
    }

    /**
     * @notice Add a witness verification to a delivery proof
     * @param missionId The mission ID
     */
    function addWitness(uint256 missionId) external onlyRole(VERIFIER_ROLE) {
        require(hasProof[missionId], "No proof submitted");
        
        DeliveryProof storage proof = deliveryProofs[missionId];
        require(!proof.hasWitnessed[msg.sender], "Already witnessed");
        require(!proof.isVerified, "Already verified");
        
        proof.witnesses.push(msg.sender);
        proof.hasWitnessed[msg.sender] = true;
        proof.witnessCount++;
        
        emit WitnessAdded(missionId, msg.sender, proof.witnessCount);
        
        // Check if we have enough witnesses to auto-verify
        uint256 requiredWitnesses = missionRequirements[missionId].minWitnesses;
        if (requiredWitnesses == 0) {
            requiredWitnesses = defaultMinWitnesses;
        }
        
        if (proof.witnessCount >= requiredWitnesses) {
            _verifyProof(missionId);
        }
    }

    /**
     * @notice Manually verify a proof (admin override)
     * @param missionId The mission ID
     */
    function verifyProof(uint256 missionId)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _verifyProof(missionId);
    }

    /**
     * @notice Internal function to mark a proof as verified
     * @param missionId The mission ID
     */
    function _verifyProof(uint256 missionId) internal {
        require(hasProof[missionId], "No proof submitted");
        
        DeliveryProof storage proof = deliveryProofs[missionId];
        require(!proof.isVerified, "Already verified");
        
        // Check requirements if they exist
        VerificationRequirement storage req = missionRequirements[missionId];
        
        if (req.minWitnesses > 0) {
            require(
                proof.witnessCount >= req.minWitnesses,
                "Insufficient witnesses"
            );
        }
        
        if (req.requireGPS) {
            require(
                proof.gpsLatitude > 0 && proof.gpsLongitude > 0,
                "GPS coordinates required"
            );
        }
        
        proof.isVerified = true;
        
        emit ProofVerified(missionId, proof.witnessCount, proof.proofHash);
    }

    /**
     * @notice Verify a signature for recipient confirmation
     * @param messageHash Hash of the message that was signed
     * @param signature The signature bytes
     * @param expectedSigner The expected signer address
     * @return isValid True if signature is valid
     */
    function verifyRecipientSignature(
        uint256 /* missionId */,
        bytes32 messageHash,
        bytes memory signature,
        address expectedSigner
    ) public pure returns (bool isValid) {
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address recoveredSigner = ECDSA.recover(ethSignedHash, signature);
        return recoveredSigner == expectedSigner;
    }

    /**
     * @notice Get delivery proof details
     * @param missionId The mission ID
     * @return submitter The address that submitted the proof
     * @return proofHash The composite proof hash
     * @return timestamp When the proof was submitted
     * @return gpsLat GPS latitude coordinate
     * @return gpsLong GPS longitude coordinate
     * @return witnessCount Number of witnesses
     * @return isVerified Whether the proof is verified
     */
    function getDeliveryProof(uint256 missionId)
        external
        view
        returns (
            address submitter,
            bytes32 proofHash,
            uint256 timestamp,
            uint256 gpsLat,
            uint256 gpsLong,
            uint256 witnessCount,
            bool isVerified
        )
    {
        require(hasProof[missionId], "No proof submitted");
        
        DeliveryProof storage proof = deliveryProofs[missionId];
        return (
            proof.submitter,
            proof.proofHash,
            proof.timestamp,
            proof.gpsLatitude,
            proof.gpsLongitude,
            proof.witnessCount,
            proof.isVerified
        );
    }

    /**
     * @notice Get proof types and hashes for a mission
     * @param missionId The mission ID
     * @return proofTypes array, proofHashes array, proofURIs array
     */
    function getProofDetails(uint256 missionId)
        external
        view
        returns (
            ProofType[] memory proofTypes,
            bytes32[] memory proofHashes,
            string[] memory proofURIs
        )
    {
        require(hasProof[missionId], "No proof submitted");
        
        DeliveryProof storage proof = deliveryProofs[missionId];
        return (proof.proofTypes, proof.proofHashes, proof.proofURIs);
    }

    /**
     * @notice Get witnesses for a mission proof
     * @param missionId The mission ID
     * @return Array of witness addresses
     */
    function getWitnesses(uint256 missionId)
        external
        view
        returns (address[] memory)
    {
        require(hasProof[missionId], "No proof submitted");
        return deliveryProofs[missionId].witnesses;
    }

    /**
     * @notice Check if proof is verified
     * @param missionId The mission ID
     * @return True if verified
     */
    function isProofVerified(uint256 missionId) external view returns (bool) {
        if (!hasProof[missionId]) {
            return false;
        }
        return deliveryProofs[missionId].isVerified;
    }

    /**
     * @notice Get verification requirements for a mission
     * @param missionId The mission ID
     * @return minWitnesses Minimum number of witnesses required
     * @return requireGPS Whether GPS is required
     * @return requirePhoto Whether photo proof is required
     * @return requireRecipientSig Whether recipient signature is required
     */
    function getVerificationRequirements(uint256 missionId)
        external
        view
        returns (
            uint256 minWitnesses,
            bool requireGPS,
            bool requirePhoto,
            bool requireRecipientSig
        )
    {
        VerificationRequirement storage req = missionRequirements[missionId];
        
        uint256 minWit = req.minWitnesses == 0
            ? defaultMinWitnesses
            : req.minWitnesses;
        
        return (
            minWit,
            req.requireGPS,
            req.requirePhoto,
            req.requireRecipientSignature
        );
    }

    /**
     * @notice Set default minimum witnesses
     * @param minWitnesses New default
     */
    function setDefaultMinWitnesses(uint256 minWitnesses)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        defaultMinWitnesses = minWitnesses;
    }
}

