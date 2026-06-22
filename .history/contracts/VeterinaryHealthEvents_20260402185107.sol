// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeterinaryHealthEvents {
    struct HealthEvent {
        bytes32 dataHash;    // Keccak256/SHA256 hash of event data (animal_id, type, date, etc.)
        address animalOwner;  // Remove 'indexed'

        uint256 timestamp;
        string ipfsUri;      // Optional IPFS for full JSON details
    }
    
    mapping(bytes32 => HealthEvent) public events;
    address public owner;
    
    event HealthEventRecorded(
        bytes32 indexed eventHash, 
        address indexed ownerAddr, 
        uint256 timestamp, 
        string ipfsUri
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    function recordEvent(bytes32 _dataHash, string calldata _ipfsUri) external {
        require(events[_dataHash].dataHash == bytes32(0), "Event already recorded");
        events[_dataHash] = HealthEvent({
            dataHash: _dataHash,
            animalOwner: msg.sender,
            timestamp: block.timestamp,
            ipfsUri: _ipfsUri
        });
        emit HealthEventRecorded(_dataHash, msg.sender, block.timestamp, _ipfsUri);
    }
    
    function getEvent(bytes32 _dataHash) external view returns (HealthEvent memory) {
        return events[_dataHash];
    }
    
    function verifyEventExists(bytes32 _dataHash) external view returns (bool) {
        return events[_dataHash].dataHash != bytes32(0);
    }
}
