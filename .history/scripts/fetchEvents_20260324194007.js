import "dotenv/config";
import { ethers } from "ethers";

const { RPC_URL, CONTRACT_ADDRESS } = process.env;
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

  // Get all logs for this event from the contract
  const filter = {
    address: CONTRACT_ADDRESS,
    topics: [topic0],
    fromBlock: 0,
    toBlock: "latest"
  };
  const logs = await provider.getLogs(filter);
  if (logs.length === 0) {
    console.log("No HealthEventRecorded events found.");
    return;
  }
  for (const log of logs) {
    const evt = iface.parseLog(log);
    console.log({
      eventHash: evt.args[0],
      ownerAddr: evt.args[1],
      timestamp: evt.args[2].toString(),
      ipfsUri: evt.args[3],
      txHash: log.transactionHash
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});