// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract GovChain {
    error Unauthorized();
    error InvalidAddress();
    error InvalidDocumentHash();
    error EmptyMetadataURI();
    error UserAlreadyRegistered();
    error UserNotRegistered();
    error DocumentAlreadyExists();
    error DocumentNotFound();
    error RiskScoreOutOfRange();
    error ContractPaused();
    error EmptyRecordData();
    error RecordDataTooLarge();
    error RecordNotFound();

    enum ReviewStatus {
        Pending,
        Accepted,
        Rejected
    }

    struct DocumentRecord {
        address submitter;
        uint40 createdAt;
        uint16 riskScoreBps;
        ReviewStatus status;
        string metadataURI;
        bytes32 aiReportHash;
    }

    struct ChainRecord {
        uint40 createdAt;
        address submitter;
        string data;
    }

    address public owner;
    bool public paused;

    mapping(address => bool) private registeredUsers;
    mapping(address => bool) public reviewers;
    mapping(bytes32 => DocumentRecord) private documents;
    ChainRecord[] private records;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event PauseStateUpdated(bool paused);
    event ReviewerUpdated(address indexed reviewer, bool enabled);
    event UserRegistrationUpdated(address indexed user, bool registered, address indexed updatedBy);
    event DocumentSubmitted(
        bytes32 indexed documentHash,
        address indexed submitter,
        uint16 riskScoreBps,
        string metadataURI,
        bytes32 aiReportHash
    );
    event DocumentStatusUpdated(bytes32 indexed documentHash, ReviewStatus status, address indexed reviewer);
    event RecordStored(uint256 indexed recordId, address indexed submitter, bytes32 indexed dataHash, string data);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyReviewer() {
        if (msg.sender != owner && !reviewers[msg.sender]) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert InvalidAddress();

        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();

        address previousOwner = owner;
        owner = newOwner;

        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function setPaused(bool isPaused) external onlyOwner {
        if (paused == isPaused) {
            return;
        }

        paused = isPaused;
        emit PauseStateUpdated(isPaused);
    }

    function setReviewer(address reviewer, bool enabled) external onlyOwner {
        if (reviewer == address(0)) revert InvalidAddress();

        reviewers[reviewer] = enabled;
        emit ReviewerUpdated(reviewer, enabled);
    }

    function registerSelf() external whenNotPaused {
        if (registeredUsers[msg.sender]) revert UserAlreadyRegistered();

        registeredUsers[msg.sender] = true;
        emit UserRegistrationUpdated(msg.sender, true, msg.sender);
    }

    function setUserRegistration(address user, bool registered) external onlyOwner {
        if (user == address(0)) revert InvalidAddress();

        if (registeredUsers[user] == registered) {
            return;
        }

        registeredUsers[user] = registered;
        emit UserRegistrationUpdated(user, registered, msg.sender);
    }

    function isUserRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }

    function submitDocument(
        bytes32 documentHash,
        string calldata metadataURI,
        bytes32 aiReportHash,
        uint16 riskScoreBps
    ) external whenNotPaused {
        if (!registeredUsers[msg.sender]) revert UserNotRegistered();
        if (documentHash == bytes32(0)) revert InvalidDocumentHash();
        if (bytes(metadataURI).length == 0) revert EmptyMetadataURI();
        if (riskScoreBps > 10_000) revert RiskScoreOutOfRange();
        if (documents[documentHash].submitter != address(0)) revert DocumentAlreadyExists();

        documents[documentHash] = DocumentRecord({
            submitter: msg.sender,
            createdAt: uint40(block.timestamp),
            riskScoreBps: riskScoreBps,
            status: ReviewStatus.Pending,
            metadataURI: metadataURI,
            aiReportHash: aiReportHash
        });

        emit DocumentSubmitted(documentHash, msg.sender, riskScoreBps, metadataURI, aiReportHash);
    }

    function updateDocumentStatus(bytes32 documentHash, ReviewStatus status) external onlyReviewer whenNotPaused {
        DocumentRecord storage documentRecord = documents[documentHash];

        if (documentRecord.submitter == address(0)) revert DocumentNotFound();

        documentRecord.status = status;
        emit DocumentStatusUpdated(documentHash, status, msg.sender);
    }

    function documentExists(bytes32 documentHash) external view returns (bool) {
        return documents[documentHash].submitter != address(0);
    }

    function getDocument(bytes32 documentHash) external view returns (DocumentRecord memory) {
        DocumentRecord memory documentRecord = documents[documentHash];

        if (documentRecord.submitter == address(0)) revert DocumentNotFound();

        return documentRecord;
    }

    function storeRecord(string calldata data) external onlyOwner whenNotPaused returns (uint256 recordId) {
        uint256 dataLength = bytes(data).length;

        if (dataLength == 0) revert EmptyRecordData();
        if (dataLength > 2048) revert RecordDataTooLarge();

        recordId = records.length;
        records.push(ChainRecord({createdAt: uint40(block.timestamp), submitter: msg.sender, data: data}));

        emit RecordStored(recordId, msg.sender, keccak256(bytes(data)), data);
    }

    function getRecord(uint256 recordId) external view returns (ChainRecord memory) {
        if (recordId >= records.length) revert RecordNotFound();

        return records[recordId];
    }

    function getRecordCount() external view returns (uint256) {
        return records.length;
    }

    function getRecords() external view returns (ChainRecord[] memory) {
        return records;
    }
}
