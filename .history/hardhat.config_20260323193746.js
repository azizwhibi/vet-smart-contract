import "dotenv/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";

const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

export default {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: INFURA_API_KEY ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}` : "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
