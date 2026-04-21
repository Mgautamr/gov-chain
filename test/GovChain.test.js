const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovChain", function () {
  async function deployGovChainFixture() {
    const [owner, user, reviewer, outsider] = await ethers.getSigners();
    const GovChain = await ethers.getContractFactory("GovChain");
    const govChain = await GovChain.deploy(owner.address);

    await govChain.waitForDeployment();

    return { govChain, owner, user, reviewer, outsider };
  }

  function buildHash(input) {
    return ethers.keccak256(ethers.toUtf8Bytes(input));
  }

  it("sets the deployer as owner", async function () {
    const { govChain, owner } = await deployGovChainFixture();

    expect(await govChain.owner()).to.equal(owner.address);
  });

  it("allows self registration once", async function () {
    const { govChain, user } = await deployGovChainFixture();

    await expect(govChain.connect(user).registerSelf())
      .to.emit(govChain, "UserRegistrationUpdated")
      .withArgs(user.address, true, user.address);

    await expect(govChain.connect(user).registerSelf()).to.be.revertedWithCustomError(
      govChain,
      "UserAlreadyRegistered"
    );
  });

  it("blocks document submission for unregistered users", async function () {
    const { govChain, outsider } = await deployGovChainFixture();

    await expect(
      govChain.connect(outsider).submitDocument(buildHash("doc"), "ipfs://doc", buildHash("ai"), 4200)
    ).to.be.revertedWithCustomError(govChain, "UserNotRegistered");
  });

  it("stores a submitted document and returns it", async function () {
    const { govChain, user } = await deployGovChainFixture();
    const documentHash = buildHash("doc-1");
    const reportHash = buildHash("ai-report-1");

    await govChain.connect(user).registerSelf();

    await expect(govChain.connect(user).submitDocument(documentHash, "ipfs://doc-1", reportHash, 1800))
      .to.emit(govChain, "DocumentSubmitted")
      .withArgs(documentHash, user.address, 1800, "ipfs://doc-1", reportHash);

    const document = await govChain.getDocument(documentHash);

    expect(document.submitter).to.equal(user.address);
    expect(document.riskScoreBps).to.equal(1800);
    expect(document.status).to.equal(0);
    expect(document.metadataURI).to.equal("ipfs://doc-1");
    expect(document.aiReportHash).to.equal(reportHash);
  });

  it("prevents duplicate document hashes", async function () {
    const { govChain, user } = await deployGovChainFixture();
    const documentHash = buildHash("doc-2");

    await govChain.connect(user).registerSelf();
    await govChain.connect(user).submitDocument(documentHash, "ipfs://doc-2", buildHash("ai-2"), 2400);

    await expect(
      govChain.connect(user).submitDocument(documentHash, "ipfs://doc-2", buildHash("ai-2b"), 2300)
    ).to.be.revertedWithCustomError(govChain, "DocumentAlreadyExists");
  });

  it("allows owner reviewers to update document status", async function () {
    const { govChain, owner, user, reviewer } = await deployGovChainFixture();
    const documentHash = buildHash("doc-3");

    await govChain.connect(user).registerSelf();
    await govChain.connect(user).submitDocument(documentHash, "ipfs://doc-3", buildHash("ai-3"), 5200);
    await govChain.connect(owner).setReviewer(reviewer.address, true);

    await expect(govChain.connect(reviewer).updateDocumentStatus(documentHash, 1))
      .to.emit(govChain, "DocumentStatusUpdated")
      .withArgs(documentHash, 1, reviewer.address);

    const document = await govChain.getDocument(documentHash);
    expect(document.status).to.equal(1);
  });

  it("pauses state-changing actions", async function () {
    const { govChain, owner, user } = await deployGovChainFixture();

    await govChain.connect(owner).setPaused(true);

    await expect(govChain.connect(user).registerSelf()).to.be.revertedWithCustomError(
      govChain,
      "ContractPaused"
    );
  });

  it("stores backend-managed records on-chain", async function () {
    const { govChain, owner } = await deployGovChainFixture();

    await expect(govChain.connect(owner).storeRecord("backend-record-1"))
      .to.emit(govChain, "RecordStored")
      .withArgs(0, owner.address, buildHash("backend-record-1"), "backend-record-1");

    expect(await govChain.getRecordCount()).to.equal(1);

    const record = await govChain.getRecord(0);
    expect(record.submitter).to.equal(owner.address);
    expect(record.data).to.equal("backend-record-1");

    const records = await govChain.getRecords();
    expect(records).to.have.length(1);
    expect(records[0].data).to.equal("backend-record-1");
  });

  it("restricts record storage to the owner signer", async function () {
    const { govChain, user } = await deployGovChainFixture();

    await expect(govChain.connect(user).storeRecord("forbidden")).to.be.revertedWithCustomError(
      govChain,
      "Unauthorized"
    );
  });
});
