// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeterinaryHealthEvents {
    struct HealthEvent {
        bytes32 dataHash;    // Keccak256/SHA256 hash of event data (animal_id, type, date, etc.)
        address animalOwner;
        uint256 timestamp;
        uint256 updatedAt;
        string ipfsUri;      // Optional IPFS for full JSON details
    }

    struct Permissions {
        bool canRead;
        bool canWrite;
    }

    mapping(bytes32 => HealthEvent) private events;
    mapping(address => Permissions) private permissions;
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
        uint256 updatedAt,
        string ipfsUri
    );

    event PermissionsUpdated(
        address indexed account,
        bool canRead,
        bool canWrite
    );
    
    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyReader() {
        require(hasReadAccess(msg.sender), "Read access denied");
        _;
    }

    modifier onlyWriter() {
        require(hasWriteAccess(msg.sender), "Write access denied");
        _;
    }

    function grantPermissions(address account, bool canRead, bool canWrite) external onlyOwner {
        require(account != address(0), "Invalid account");
        permissions[account] = Permissions({
            canRead: canRead,
            canWrite: canWrite
        });
        emit PermissionsUpdated(account, canRead, canWrite);
    }

    function revokePermissions(address account) external onlyOwner {
        require(account != address(0), "Invalid account");
        delete permissions[account];
        emit PermissionsUpdated(account, false, false);
    }

    function hasReadAccess(address account) public view returns (bool) {
        return account == owner || permissions[account].canRead || permissions[account].canWrite;
    }

    function hasWriteAccess(address account) public view returns (bool) {
        return account == owner || permissions[account].canWrite;
    }

    function recordEvent(bytes32 _dataHash, string calldata _ipfsUri) external onlyWriter {
        require(_dataHash != bytes32(0), "Invalid hash");
        require(events[_dataHash].dataHash == bytes32(0), "Event already recorded");
        events[_dataHash] = HealthEvent({
            dataHash: _dataHash,
            animalOwner: msg.sender,
            timestamp: block.timestamp,
            updatedAt: block.timestamp,
            ipfsUri: _ipfsUri
        });
        emit HealthEventRecorded(_dataHash, msg.sender, block.timestamp, _ipfsUri);
    }

    function updateEvent(bytes32 _dataHash, string calldata _ipfsUri) external onlyWriter {
        require(events[_dataHash].dataHash != bytes32(0), "Event not found");
        events[_dataHash].ipfsUri = _ipfsUri;
        events[_dataHash].updatedAt = block.timestamp;
        emit HealthEventUpdated(_dataHash, msg.sender, block.timestamp, _ipfsUri);
    }

    function getEvent(bytes32 _dataHash) external view onlyReader returns (HealthEvent memory) {
        return events[_dataHash];
    }

    function verifyEventExists(bytes32 _dataHash) external view onlyReader returns (bool) {
        return events[_dataHash].dataHash != bytes32(0);
    }
}
