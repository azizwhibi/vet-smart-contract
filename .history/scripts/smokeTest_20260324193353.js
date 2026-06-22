import "dotenv/config";
import { network } from "hardhat";

async function main() {
  const { CONTRACT_ADDRESS, EVENT_TEXT, IPFS_URI } = process.env;

  if (!CONTRACT_ADDRESS) {
    throw new Error("Missing CONTRACT_ADDRESS in .env");
  }

  const eventText = EVENT_TEXT || `animal-123|vaccination|${new Date().toISOString().slice(0, 10)}`;
  const ipfsUri = IPFS_URI || "ipfs://example-metadata";

  const { ethers } = await network.connect();
  const contract = await ethers.getContractAt("VeterinaryHealthEvents", CONTRACT_ADDRESS);

  const dataHash = ethers.id(eventText);

  console.log("Network:", network.name);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("Event text:", eventText);
  console.log("Data hash:", dataHash);

  const existsBefore = await contract.verifyEventExists(dataHash);
  console.log("Exists before:", existsBefore);

  if (!existsBefore) {
    const tx = await contract.recordEvent(dataHash, ipfsUri);
    console.log("recordEvent tx:", tx.hash);
    await tx.wait();
    console.log("recordEvent confirmed");
  } else {
    console.log("Skipping recordEvent because hash already exists");
  }

  const existsAfter = await contract.verifyEventExists(dataHash);
  try {
    // ethers v6 may not decode struct return, so fetch fields individually
    const dataHashField = await contract.events[dataHash].dataHash;
    const animalOwner = await contract.events[dataHash].animalOwner;
    const timestamp = await contract.events[dataHash].timestamp;
    const ipfsUri = await contract.events[dataHash].ipfsUri;
    console.log("Exists after:", existsAfter);
    console.log("Stored event (raw mapping):", {
      dataHash: dataHashField,
      animalOwner,
      timestamp: timestamp?.toString?.() || timestamp,
      ipfsUri,
    });
  } catch (err) {
    console.error("Error fetching stored event fields:", err.message || err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
