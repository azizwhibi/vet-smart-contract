import "dotenv/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";

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

export default {
  solidity: "0.8.20",
  networks,
};
