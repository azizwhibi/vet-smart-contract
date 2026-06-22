import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";

const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

const networks = {
  hardhat: {
    type: "edr-simulated",
    chainType: "l1",
  },
};

if (INFURA_API_KEY) {
  networks.sepolia = {
    type: "http",
    chainType: "l1",
    url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  };
}

export default defineConfig({
  plugins: [hardhatEthers, hardhatVerify],
  solidity: "0.8.20",
  networks,
});
