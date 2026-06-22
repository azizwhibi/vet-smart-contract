import "dotenv/config";
import { ethers } from "ethers";

async function main() {
  const { RPC_URL, PRIVATE_KEY } = process.env;

  if (!RPC_URL) {
    throw new Error("Missing RPC_URL in .env");
  }

  if (!PRIVATE_KEY) {
    throw new Error("Missing PRIVATE_KEY in .env");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const network = await provider.getNetwork();
  const balanceWei = await provider.getBalance(wallet.address);

  console.log("Wallet:", wallet.address);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Network name:", network.name);
  console.log("Balance (ETH):", ethers.formatEther(balanceWei));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
