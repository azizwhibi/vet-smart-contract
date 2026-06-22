import "dotenv/config";
import { ethers } from "ethers";


const { RPC_URL, CONTRACT_ADDRESS, FROM_BLOCK } = process.env;
if (!RPC_URL) throw new Error("Missing RPC_URL in .env");
if (!CONTRACT_ADDRESS) throw new Error("Missing CONTRACT_ADDRESS in .env");


// HealthEventRecorded(bytes32 indexed eventHash, address indexed ownerAddr, uint256 timestamp, string ipfsUri)
const eventAbi = [
  "event HealthEventRecorded(bytes32 indexed eventHash, address indexed ownerAddr, uint256 timestamp, string ipfsUri)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const iface = new ethers.Interface(eventAbi);

  // ethers v6: get topic hash using ethers.id
  const eventSignature = "HealthEventRecorded(bytes32,address,uint256,string)";
  const topic0 = ethers.id(eventSignature);

  // Alchemy free tier: only 10-block range allowed for getLogs
  const latestBlock = await provider.getBlockNumber();
  // Use FROM_BLOCK from .env or default to latestBlock-1000 (or 0 if chain is new)
  let startBlock = 0;
  if (FROM_BLOCK) {
    startBlock = parseInt(FROM_BLOCK, 10);
    if (isNaN(startBlock) || startBlock < 0) startBlock = 0;
  } else {
    startBlock = Math.max(0, latestBlock - 1000);
  }
  const batchSize = 10;
  let found = 0;
  for (let fromBlock = startBlock; fromBlock <= latestBlock; fromBlock += batchSize) {
    const toBlock = Math.min(fromBlock + batchSize - 1, latestBlock);
    const filter = {
      address: CONTRACT_ADDRESS,
      topics: [topic0],
      fromBlock,
      toBlock
    };
    const logs = await provider.getLogs(filter);
    for (const log of logs) {
      const evt = iface.parseLog(log);
      console.log({
        eventHash: evt.args[0],
        ownerAddr: evt.args[1],
        timestamp: evt.args[2].toString(),
        ipfsUri: evt.args[3],
        txHash: log.transactionHash,
        blockNumber: log.blockNumber
      });
      found++;
    }
  }
  if (found === 0) {
    console.log("No HealthEventRecorded events found in blocks", startBlock, "to", latestBlock);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});