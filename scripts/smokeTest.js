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
    // Use the getEvent function to fetch the struct, then print the result
    const storedEvent = await contract.getEvent(dataHash);
    // Ethers v6 may return an array or object depending on ABI decoding
    if (Array.isArray(storedEvent)) {
      // [dataHash, animalOwner, timestamp, ipfsUri]
      console.log("Exists after:", existsAfter);
      console.log("Stored event (array):", {
        dataHash: storedEvent[0],
        animalOwner: storedEvent[1],
        timestamp: storedEvent[2]?.toString?.() || storedEvent[2],
        ipfsUri: storedEvent[3],
      });
    } else if (storedEvent && typeof storedEvent === 'object') {
      console.log("Exists after:", existsAfter);
      console.log("Stored event (object):", {
        dataHash: storedEvent.dataHash,
        animalOwner: storedEvent.animalOwner,
        timestamp: storedEvent.timestamp?.toString?.() || storedEvent.timestamp,
        ipfsUri: storedEvent.ipfsUri,
      });
    } else {
      console.log("Exists after:", existsAfter);
      console.log("Stored event (raw):", storedEvent);
    }
  } catch (err) {
    console.error("Error fetching stored event struct:", err.message || err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
