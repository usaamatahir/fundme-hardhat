import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { network } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";

const deployFundMe: DeployFunction = async function ({
    deployments,
    getNamedAccounts,
}: HardhatRuntimeEnvironment) {
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId as number;

    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // Add priceFeed address here
        log: true,
        waitConfirmations: 1,
    });
    log("----------------------------");
    log("Fundme deployed successfully");
    log("----------------------------");

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }
};

export default deployFundMe;
deployFundMe.tags = ["all", "fundme"];

// module.exports.tags = ["all", "fundme"];
