import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "hardhat-deploy";
import "solidity-coverage";

dotenv.config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const PRIVATE_KEY =
    process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];
const COIN_MARKEYCAP_APIKEY = process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// Deployed and verified Contract address
// https://goerli.etherscan.io/address/0xF1715372e631644A9183d237804c856cA70e7504#code

const config: HardhatUserConfig = {
    // solidity: "0.8.5",
    defaultNetwork: "hardhat",
    solidity: {
        compilers: [{ version: "0.8.5" }, { version: "0.6.6" }],
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: PRIVATE_KEY,
            chainId: 5,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COIN_MARKEYCAP_APIKEY,
        token: "MATIC",
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
};

export default config;
