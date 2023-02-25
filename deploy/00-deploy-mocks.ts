import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { network } from "hardhat";
import {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} from "../helper-hardhat-config";

const deployMocks: DeployFunction = async function ({
    deployments,
    getNamedAccounts,
}: HardhatRuntimeEnvironment) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("----------------------------");
        log("Mocks deployed successfully");
        log("----------------------------");
    }
};
export default deployMocks;
deployMocks.tags = ["all", "mocks"];

// module.exports.tags = ["all", "mocks"];
