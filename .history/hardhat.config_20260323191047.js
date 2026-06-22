import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    sepolia: {
      url: import.meta.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",  // Temp
      accounts: import.meta.env.PRIVATE_KEY ? [import.meta.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: import.meta.env.ETHERSCAN_API_KEY,
  },
} satisfies HardhatUserConfig;

export default config;
