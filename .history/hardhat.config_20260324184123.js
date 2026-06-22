import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";

const { RPC_URL, PRIVATE_KEY } = process.env;

const networks = {
  hardhat: {
    type: "edr-simulated",
    chainType: "l1",
  },
};

if (RPC_URL) {
  networks.sepolia = {
    type: "http",
    chainType: "l1",
    url: RPC_URL,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  };
}

export default defineConfig({
  plugins: [hardhatEthers, hardhatVerify],
  solidity: "0.8.20",
  networks,
});
