const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", function () {
    let fundMe;
    let mockV3Aggregator;
    let deployer;
    const sendValue = ethers.utils.parseEther("1");

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });
    describe("constructor", function () {
        it("sets the aggregator addresses correctly", async () => {
            const priceFeedAddress = await fundMe.priceFeed();
            // const mockV3AggregatorAddress = await mockV3Aggregator.getAddress()
            assert.equal(priceFeedAddress, mockV3Aggregator.getAddress());
        });
    });

    describe("fund", async function () {
        it("fails if don't send enough eth", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "Didn't send enough"
            );
        });

        it("updated the amount funded", async function () {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.amountFundedByFunder[deployer];
            assert.equal(response.toString(), sendValue.toString());
        });
    });
});
