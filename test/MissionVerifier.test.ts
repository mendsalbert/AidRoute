import { expect } from "chai";
import hre from "hardhat";
import { keccak256, toBytes } from "viem";

describe("MissionVerifier", function () {
  async function deployFixture() {
    const [owner, submitter, verifier1, verifier2, verifier3] =
      await hre.viem.getWalletClients();

    const missionVerifier = await hre.viem.deployContract(
      "MissionVerifier",
      []
    );

    const publicClient = await hre.viem.getPublicClient();

    // Grant verifier roles
    const VERIFIER_ROLE = await missionVerifier.read.VERIFIER_ROLE();
    await missionVerifier.write.grantRole([
      VERIFIER_ROLE,
      verifier1.account.address,
    ]);
    await missionVerifier.write.grantRole([
      VERIFIER_ROLE,
      verifier2.account.address,
    ]);
    await missionVerifier.write.grantRole([
      VERIFIER_ROLE,
      verifier3.account.address,
    ]);

    return {
      missionVerifier,
      owner,
      submitter,
      verifier1,
      verifier2,
      verifier3,
      publicClient,
    };
  }

  describe("Verification Requirements", function () {
    it("Should set verification requirements", async function () {
      const { missionVerifier, owner } = await deployFixture();

      const missionId = 1n;
      const minWitnesses = 3n;
      const requireGPS = true;
      const requirePhoto = true;
      const requireRecipientSig = true;
      const requiredProofTypes = [0, 2]; // PhotoHash, RecipientSignature

      await missionVerifier.write.setVerificationRequirements(
        [
          missionId,
          minWitnesses,
          requireGPS,
          requirePhoto,
          requireRecipientSig,
          requiredProofTypes,
        ],
        { account: owner.account }
      );

      const requirements =
        await missionVerifier.read.getVerificationRequirements([missionId]);
      expect(requirements[0]).to.equal(minWitnesses);
      expect(requirements[1]).to.equal(requireGPS);
      expect(requirements[2]).to.equal(requirePhoto);
      expect(requirements[3]).to.equal(requireRecipientSig);
    });

    it("Should use default min witnesses if not set", async function () {
      const { missionVerifier } = await deployFixture();

      const missionId = 1n;
      const requirements =
        await missionVerifier.read.getVerificationRequirements([missionId]);

      // Should return default (2) if no custom requirement set
      expect(requirements[0]).to.equal(2n);
    });
  });

  describe("Proof Submission", function () {
    it("Should submit delivery proof", async function () {
      const { missionVerifier, submitter } = await deployFixture();

      const missionId = 1n;
      const proofTypes = [0, 1, 2]; // PhotoHash, GPSCoordinates, RecipientSignature
      const proofHashes = [
        keccak256(toBytes("photo1")),
        keccak256(toBytes("gps1")),
        keccak256(toBytes("signature1")),
      ];
      const proofURIs = [
        "ipfs://QmPhoto123",
        "ipfs://QmGPS456",
        "ipfs://QmSig789",
      ];
      const gpsLatitude = 1234567n; // 1.234567 * 1e6
      const gpsLongitude = 36789012n; // 36.789012 * 1e6
      const metadata = "ipfs://QmMetadata";

      await missionVerifier.write.submitDeliveryProof(
        [
          missionId,
          proofTypes,
          proofHashes,
          proofURIs,
          gpsLatitude,
          gpsLongitude,
          metadata,
        ],
        { account: submitter.account }
      );

      const proof = await missionVerifier.read.getDeliveryProof([missionId]);
      expect(proof[2]).to.be.greaterThan(0n); // timestamp should be set
      expect(proof[3]).to.equal(gpsLatitude);
      expect(proof[4]).to.equal(gpsLongitude);
      expect(proof[5]).to.equal(0n); // witnessCount should be 0 initially
      expect(proof[6]).to.be.false; // isVerified should be false
    });

    it("Should not allow duplicate proof submission", async function () {
      const { missionVerifier, submitter } = await deployFixture();

      const missionId = 1n;
      const proofTypes = [0];
      const proofHashes = [keccak256(toBytes("photo1"))];
      const proofURIs = ["ipfs://QmPhoto123"];

      await missionVerifier.write.submitDeliveryProof(
        [missionId, proofTypes, proofHashes, proofURIs, 0n, 0n, ""],
        { account: submitter.account }
      );

      await expect(
        missionVerifier.write.submitDeliveryProof(
          [missionId, proofTypes, proofHashes, proofURIs, 0n, 0n, ""],
          { account: submitter.account }
        )
      ).to.be.rejected;
    });

    it("Should validate proof arrays length", async function () {
      const { missionVerifier, submitter } = await deployFixture();

      const missionId = 1n;
      const proofTypes = [0, 1];
      const proofHashes = [keccak256(toBytes("photo1"))]; // Mismatch: 2 types, 1 hash
      const proofURIs = ["ipfs://QmPhoto123"];

      await expect(
        missionVerifier.write.submitDeliveryProof(
          [missionId, proofTypes, proofHashes, proofURIs, 0n, 0n, ""],
          { account: submitter.account }
        )
      ).to.be.rejected;
    });
  });

  describe("Witness Verification", function () {
    it("Should add witnesses to proof", async function () {
      const { missionVerifier, submitter, verifier1 } = await deployFixture();

      const missionId = 1n;
      await missionVerifier.write.submitDeliveryProof(
        [
          missionId,
          [0],
          [keccak256(toBytes("photo1"))],
          ["ipfs://QmPhoto123"],
          0n,
          0n,
          "",
        ],
        { account: submitter.account }
      );

      await missionVerifier.write.addWitness([missionId], {
        account: verifier1.account,
      });

      const proof = await missionVerifier.read.getDeliveryProof([missionId]);
      expect(proof[5]).to.equal(1n); // witnessCount should be 1
    });

    it("Should not allow duplicate witness", async function () {
      const { missionVerifier, submitter, verifier1 } = await deployFixture();

      const missionId = 1n;
      await missionVerifier.write.submitDeliveryProof(
        [
          missionId,
          [0],
          [keccak256(toBytes("photo1"))],
          ["ipfs://QmPhoto123"],
          0n,
          0n,
          "",
        ],
        { account: submitter.account }
      );

      await missionVerifier.write.addWitness([missionId], {
        account: verifier1.account,
      });

      await expect(
        missionVerifier.write.addWitness([missionId], {
          account: verifier1.account,
        })
      ).to.be.rejected;
    });

    it("Should auto-verify when minimum witnesses reached", async function () {
      const { missionVerifier, submitter, verifier1, verifier2 } =
        await deployFixture();

      const missionId = 1n;

      // Default minWitnesses is 2
      await missionVerifier.write.submitDeliveryProof(
        [
          missionId,
          [0],
          [keccak256(toBytes("photo1"))],
          ["ipfs://QmPhoto123"],
          0n,
          0n,
          "",
        ],
        { account: submitter.account }
      );

      await missionVerifier.write.addWitness([missionId], {
        account: verifier1.account,
      });

      // Adding second witness should auto-verify
      await missionVerifier.write.addWitness([missionId], {
        account: verifier2.account,
      });

      const proof = await missionVerifier.read.getDeliveryProof([missionId]);
      expect(proof[6]).to.be.true; // isVerified should be true
    });
  });

  describe("Manual Verification", function () {
    it("Should allow admin to manually verify proof", async function () {
      const { missionVerifier, submitter, owner } = await deployFixture();

      const missionId = 1n;
      await missionVerifier.write.submitDeliveryProof(
        [
          missionId,
          [0],
          [keccak256(toBytes("photo1"))],
          ["ipfs://QmPhoto123"],
          0n,
          0n,
          "",
        ],
        { account: submitter.account }
      );

      await missionVerifier.write.verifyProof([missionId], {
        account: owner.account,
      });

      const proof = await missionVerifier.read.getDeliveryProof([missionId]);
      expect(proof[6]).to.be.true; // isVerified should be true
    });

    it("Should not allow double verification", async function () {
      const { missionVerifier, submitter, owner } = await deployFixture();

      const missionId = 1n;
      await missionVerifier.write.submitDeliveryProof(
        [
          missionId,
          [0],
          [keccak256(toBytes("photo1"))],
          ["ipfs://QmPhoto123"],
          0n,
          0n,
          "",
        ],
        { account: submitter.account }
      );

      await missionVerifier.write.verifyProof([missionId], {
        account: owner.account,
      });

      await expect(
        missionVerifier.write.verifyProof([missionId], {
          account: owner.account,
        })
      ).to.be.rejected;
    });
  });

  describe("Proof Details Retrieval", function () {
    it("Should get proof details", async function () {
      const { missionVerifier, submitter } = await deployFixture();

      const missionId = 1n;
      const proofTypes = [0, 2]; // PhotoHash, RecipientSignature
      const proofHashes = [
        keccak256(toBytes("photo1")),
        keccak256(toBytes("signature1")),
      ];
      const proofURIs = ["ipfs://QmPhoto123", "ipfs://QmSig456"];

      await missionVerifier.write.submitDeliveryProof(
        [missionId, proofTypes, proofHashes, proofURIs, 0n, 0n, ""],
        { account: submitter.account }
      );

      const details = await missionVerifier.read.getProofDetails([missionId]);
      expect(details[0].length).to.equal(2); // proofTypes
      expect(details[1].length).to.equal(2); // proofHashes
      expect(details[2].length).to.equal(2); // proofURIs
    });

    it("Should get witnesses list", async function () {
      const { missionVerifier, submitter, verifier1, verifier2 } =
        await deployFixture();

      const missionId = 1n;
      await missionVerifier.write.submitDeliveryProof(
        [
          missionId,
          [0],
          [keccak256(toBytes("photo1"))],
          ["ipfs://QmPhoto123"],
          0n,
          0n,
          "",
        ],
        { account: submitter.account }
      );

      await missionVerifier.write.addWitness([missionId], {
        account: verifier1.account,
      });
      await missionVerifier.write.addWitness([missionId], {
        account: verifier2.account,
      });

      const witnesses = await missionVerifier.read.getWitnesses([missionId]);
      expect(witnesses.length).to.equal(2);
    });

    it("Should check if proof is verified", async function () {
      const { missionVerifier, submitter, owner } = await deployFixture();

      const missionId = 1n;
      await missionVerifier.write.submitDeliveryProof(
        [
          missionId,
          [0],
          [keccak256(toBytes("photo1"))],
          ["ipfs://QmPhoto123"],
          0n,
          0n,
          "",
        ],
        { account: submitter.account }
      );

      let isVerified = await missionVerifier.read.isProofVerified([missionId]);
      expect(isVerified).to.be.false;

      await missionVerifier.write.verifyProof([missionId], {
        account: owner.account,
      });

      isVerified = await missionVerifier.read.isProofVerified([missionId]);
      expect(isVerified).to.be.true;
    });
  });

  describe("Configuration", function () {
    it("Should update default minimum witnesses", async function () {
      const { missionVerifier, owner } = await deployFixture();

      await missionVerifier.write.setDefaultMinWitnesses([5n], {
        account: owner.account,
      });

      const defaultMinWitnesses =
        await missionVerifier.read.defaultMinWitnesses();
      expect(defaultMinWitnesses).to.equal(5n);
    });

    it("Should only allow admin to change default", async function () {
      const { missionVerifier, verifier1 } = await deployFixture();

      await expect(
        missionVerifier.write.setDefaultMinWitnesses([5n], {
          account: verifier1.account,
        })
      ).to.be.rejected;
    });
  });
});
