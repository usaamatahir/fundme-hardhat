const { assert } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", async function () {
    let fundMe;
    let deployer;
    let MockV3Aggregator;
    beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });
    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed();
            assert.equal(response, MockV3Aggregator.address);
        });
    });

    // describe("fund", async function () {
    //     it("fails if don't send enough eth", async function () {
    //         await expect(fundMe.fund()).to.be.revertedWith(
    //             "Didn't send enough"
    //         );
    //     });

    //     it("updated the amount funded", async function () {
    //         await fundMe.fund({ value: sendValue });
    //         const response = await fundMe.amountFundedByFunder[deployer];
    //         assert.equal(response.toString(), sendValue.toString());
    //     });
    // });
});
