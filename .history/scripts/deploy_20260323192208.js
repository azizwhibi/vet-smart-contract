import { ethers } from "hardhat";

async function main() {
  const VeterinaryHealthEvents = await ethers.getContractFactory("VeterinaryHealthEvents");
  const contract = await VeterinaryHealthEvents.deploy();
  await contract.waitForDeployment();
  console.log("Deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
