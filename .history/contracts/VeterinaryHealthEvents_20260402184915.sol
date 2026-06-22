// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeterinaryHealthEvents {
    struct HealthEvent {
        bytes32 dataHash;    // Keccak256/SHA256 hash of event data (animal_id, type, date, etc.)
        address animalOwner;
        uint256 timestamp;
        uint256 lastUpdated;
        string ipfsUri;      // Optional IPFS for full JSON details
    }
    
    mapping(bytes32 => HealthEvent) public events;
    mapping(address => bool) public authorizedReaders;
    mapping(address => bool) public authorizedWriters;
    address public owner;
    
    event HealthEventRecorded(
        bytes32 indexed eventHash, 
        address indexed ownerAddr, 
        uint256 timestamp, 
        string ipfsUri
    );
    
    event HealthEventUpdated(
        bytes32 indexed eventHash,
        address indexed updatedBy,
        uint256 timestamp,
        string newIpfsUri
    );
    
    event AuthorizationGranted(
        address indexed account,
        string role,
        uint256 timestamp
    );
    
    event AuthorizationRevoked(
        address indexed account,
        string role,
        uint256 timestamp
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedWriter() {
        require(
            msg.sender == owner || authorizedWriters[msg.sender],
            "Not authorized to write events"
        );
        _;
    }
    
    modifier onlyAuthorizedReader() {
        require(
            msg.sender == owner || authorizedReaders[msg.sender],
            "Not authorized to read events"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function grantReaderAccess(address _address) external onlyOwner {
        require(_address != address(0), "Invalid address");
        require(!authorizedReaders[_address], "Already a reader");
        authorizedReaders[_address] = true;
        emit AuthorizationGranted(_address, "READER", block.timestamp);
    }
    
    function grantWriterAccess(address _address) external onlyOwner {
        require(_address != address(0), "Invalid address");
        require(!authorizedWriters[_address], "Already a writer");
        authorizedWriters[_address] = true;
        emit AuthorizationGranted(_address, "WRITER", block.timestamp);
    }
    
    function revokeReaderAccess(address _address) external onlyOwner {
        require(authorizedReaders[_address], "Not a reader");
        authorizedReaders[_address] = false;
        emit AuthorizationRevoked(_address, "READER", block.timestamp);
    }
    
    function revokeWriterAccess(address _address) external onlyOwner {
        require(authorizedWriters[_address], "Not a writer");
        authorizedWriters[_address] = false;
        emit AuthorizationRevoked(_address, "WRITER", block.timestamp);
    }
    
    function recordEvent(bytes32 _dataHash, string calldata _ipfsUri) external onlyAuthorizedWriter {
        require(events[_dataHash].dataHash == bytes32(0), "Event already recorded");
        events[_dataHash] = HealthEvent({
            dataHash: _dataHash,
            animalOwner: msg.sender,
            timestamp: block.timestamp,
            lastUpdated: block.timestamp,
            ipfsUri: _ipfsUri
        });
        emit HealthEventRecorded(_dataHash, msg.sender, block.timestamp, _ipfsUri);
    }
    
    function updateEvent(bytes32 _dataHash, string calldata _newIpfsUri) external onlyAuthorizedWriter {
        require(events[_dataHash].dataHash != bytes32(0), "Event does not exist");
        require(
            msg.sender == events[_dataHash].animalOwner || msg.sender == owner,
            "Only owner or event creator can update"
        );
        
        events[_dataHash].ipfsUri = _newIpfsUri;
        events[_dataHash].lastUpdated = block.timestamp;
        
        emit HealthEventUpdated(_dataHash, msg.sender, block.timestamp, _newIpfsUri);
    }
    
    function getEvent(bytes32 _dataHash) external view onlyAuthorizedReader returns (HealthEvent memory) {
        require(events[_dataHash].dataHash != bytes32(0), "Event does not exist");
        return events[_dataHash];
    }
    
    function verifyEventExists(bytes32 _dataHash) external view onlyAuthorizedReader returns (bool) {
        return events[_dataHash].dataHash != bytes32(0);
    }
    
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
