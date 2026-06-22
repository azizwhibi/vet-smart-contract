# 🐾 Veterinary Health Events Contract

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-0.8.20-%23878787" alt="Solidity Version">
  <a href="https://hardhat.org/"><img src="https://img.shields.io/badge/Build-Hardhat-ff69b4?logo=hardhat" alt="Hardhat Build"></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"/></a>
</p>

A permissioned Ethereum smart contract for recording, managing, and verifying veterinary health events on-chain. Health event data is stored as cryptographic hashes with optional IPFS metadata references, enabling tamper-proof audit trails for animal medical records.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
  - [Compile](#compile)
  - [Deploy](#deploy)
  - [Smoke Test](#smoke-test)
  - [Fetch Events](#fetch-events)
  - [Check Wallet](#check-wallet)
- [Environment Variables](#environment-variables)
- [Smart Contract API](#smart-contract-api)
  - [Events](#events)
  - [Structs](#structs)
  - [Functions](#functions)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [License](#license)

---

## 🎯 Overview

The `VeterinaryHealthEvents` contract provides a decentralized system for managing veterinary health records. Key design principles include:

- **Permission-based Access Control** — Only the contract owner or authorized addresses can record and update health events. Read access is granted to designated readers (e.g., auditors, veterinarians).
- **Data Integrity via Hashing** — Health event payloads are stored as `bytes32` hashes (`Keccak256`), ensuring data integrity while keeping the actual data off-chain.
- **IPFS Metadata Support** — Full JSON metadata for each event can be referenced via an IPFS URI, enabling on-chain/off-chain hybrid storage.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Role-Based Access | Granular `canRead` and `canWrite` permissions per address |
| 📦 Hash-Based Storage | Health events identified by data hashes for integrity verification |
| 🌐 IPFS Integration | Optional URI references to full event metadata on IPFS |
| ⏱ Timestamp Tracking | Records both creation (`timestamp`) and last update (`updatedAt`) times |
| 🔍 Event Verification | Verify existence of health events without fetching full struct data |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Contract Owner                     │
│         (Full admin: grant/revoke perms)             │
└──────────────────┬──────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
┌───────────────┐     ┌───────────────┐
│   Writers     │     │    Readers    │
│ (Read/Write)  │     │   (Read Only) │
└───────┬───────┘     └───────┬───────┘
        │                     │
        ▼                     ▼
┌─────────────────────────────────────────────────────┐
│         VeterinaryHealthEvents Contract             │
│  ┌───────────────────────────────────────────────┐  │
│  │  Events Store (mapping bytes32 => HealthEvent)│  │
│  │  Permissions Store (mapping addr => Perms)    │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/azizwhibi/vet-smart-contract.git
   cd vet-smart-contract
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:

   ```env
   RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
   PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
   CONTRACT_ADDRESS=0xYourDeployedContractAddress  # Optional, for fetchEvents & smokeTest
   ETHERSCAN_API_KEY=your_etherscan_api_key         # Optional, for verification
   ```

---

## 🚀 Usage

### Compile

Compile the smart contracts:

```bash
npm run compile
```

This produces artifacts in the `artifacts/` directory.

### Deploy

**Local deployment (Hardhat network):**

```bash
npm run deploy:local
```

**Deploy to Sepolia testnet:**

```bash
npm run deploy:sepolia
```

### Smoke Test

Run a smoke test after deploying to verify the contract works correctly on-chain. This script records an event, then verifies its existence and retrieval:

```bash
# Set CONTRACT_ADDRESS in .env first
npm run smoke:sepolia
```

### Fetch Events

Query `HealthEventRecorded` events from the deployed contract:

```bash
# Set CONTRACT_ADDRESS in .env first
node scripts/fetchEvents.js
```

### Check Wallet

Verify Sepolia wallet balance and network configuration:

```bash
npm run check:sepolia
```

---

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RPC_URL` | ✅ Yes | Ethereum RPC endpoint (e.g., Alchemy, Infura) |
| `PRIVATE_KEY` | ✅ Yes | Wallet private key for deployment/signing |
| `CONTRACT_ADDRESS` | ⚠️  Optional | Deployed contract address (used by scripts/fetchEvents.js, scripts/smokeTest.js) |
| `ETHERSCAN_API_KEY` | 🔒 Rarely needed | Etherscan API key for contract verification |

> **⚠️ Security Warning:** Never commit your `.env` file to version control. The file is already included in `.gitignore`.

---

## 📘 Smart Contract API

### Events

| Event | Signature | Description |
|-------|-----------|-------------|
| `HealthEventRecorded` | `(bytes32 indexed eventHash, address indexed ownerAddr, uint256 timestamp, string ipfsUri)` | Emitted when a new health event is recorded |
| `HealthEventUpdated` | `(bytes32 indexed eventHash, address updatedBy, uint256 updatedAt, string ipfsUri)` | Emitted when an existing event's metadata is updated |
| `PermissionsUpdated` | `(address indexed account, bool canRead, bool canWrite)` | Emitted when permissions are granted or revoked |

### Structs

```solidity
struct HealthEvent {
    bytes32 dataHash;        // Keccak256/SHA256 hash of event payload
    address animalOwner;     // Address that originally recorded the event
    uint256 timestamp;       // Block timestamp of recording
    uint256 updatedAt;       // Block timestamp of last update
    string ipfsUri;          // Optional IPFS full JSON metadata reference
}

struct Permissions {
    bool canRead;
    bool canWrite;
}
```

### Functions

#### Owner Functions

| Function | Access | Parameters | Description |
|----------|--------|------------|-------------|
| `grantPermissions(address, bool, bool)` | `onlyOwner` | `account`, `canRead`, `canWrite` | Grant permissions to an address |
| `revokePermissions(address)` | `onlyOwner` | `account` | Revoke all read/write access |

#### Public View Functions

| Function | Access | Parameters | Returns | Description |
|----------|--------|------------|---------|-------------|
| `hasReadAccess(address)` | public view | `account` | `bool` | Check if address has read permission |
| `hasWriteAccess(address)` | public view | `account` | `bool` | Check if address has write permission |
| `owner()` | external pure | — | `address` | Returns the contract owner |

#### Data Management (Writer Only)

| Function | Access | Parameters | Description |
|----------|--------|------------|-------------|
| `recordEvent(bytes32, string)` | `onlyWriter` | `_dataHash`, `_ipfsUri` | Record a new health event |
| `updateEvent(bytes32, string)` | `onlyWriter` | `_dataHash`, `_ipfsUri` | Update an existing event's metadata |

#### Query Functions (Reader Only)

| Function | Access | Parameters | Returns | Description |
|----------|--------|------------|---------|-------------|
| `getEvent(bytes32)` | `onlyReader` view | `_dataHash` | `HealthEvent` | Fetch full health event struct |
| `verifyEventExists(bytes32)` | `onlyReader` view | `_dataHash` | `bool` | Verify if an event exists by hash |

---

## 📁 Project Structure

```
vet-health-contract/
├── contracts/
│   └── VeterinaryHealthEvents.sol      # Main smart contract
├── scripts/
│   ├── deploy.js                        # Deployment script
│   ├── smokeTest.js                     # On-chain smoke test
│   ├── fetchEvents.js                   # Event query script
│   └── checkSepoliaWallet.js            # Wallet balance checker
├── artifacts/                           # Compiled contract outputs
├── cache/                               # Hardhat compilation cache
├── .env.example                         # Environment variables template
├── .gitignore                          # Git ignore rules
├── hardhat.config.js                   # Hardhat configuration
├── package.json                        # Project dependencies & scripts
└── README.md                           # This file
```

---

## 🔒 Security Considerations

1. **Private Key Management** — The `PRIVATE_KEY` in `.env` controls the deploying wallet. Keep it secret and never expose it publicly.
2. **Permission Model** — Only the contract owner can manage permissions. Ensure privileged accounts (EOA private keys or multisig wallets) are secured appropriately.
3. **Immutable Hashes** — Events are identified by `bytes32` data hashes. The hash is irrevocably linked to a single event record; colliding hashes for different events should be impossible under Keccak256 assumptions.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️  by the Animalia Team**

[🐛 Report Bug](https://github.com/azizwhibi/vet-smart-contract/issues) · [💡 Request Feature](https://github.com/azizwhibi/vet-smart-contract/issues)

</div>