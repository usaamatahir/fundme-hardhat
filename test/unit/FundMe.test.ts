import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";

describe("FundMe", async function () {
    let fundMe: any;
    let deployer: any;
    let MockV3Aggregator: any;
    const sendValue = ethers.utils.parseEther("1");

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
            const response = await fundMe.priceFeed();
            assert.equal(response, MockV3Aggregator.address);
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
            const response = await fundMe.amountFundedByFunder(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to list of funders", async function () {
            await fundMe.fund({ value: sendValue });
            const funder = await fundMe.funders(0);
            assert.equal(funder, deployer);
        });
    });

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH from a single balance", async function () {
            const startingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            // Action

            const transaction = await fundMe.withdraw();
            const { effectiveGasPrice, gasUsed } = await transaction.wait(1);

            const gasCost = effectiveGasPrice.mul(gasUsed);

            // Assert
            const endingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            assert.equal(endingFundmeBalance, 0);
            assert.equal(
                startingDeployerBalance.add(startingFundmeBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            );
        });

        it("allow withdraw with multiple funder", async () => {
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                );

                await fundMeConnectedContract.fund({ value: sendValue });
            }
            const startingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            // Action

            const transaction = await fundMe.withdraw();
            const { effectiveGasPrice, gasUsed } = await transaction.wait(1);

            const gasCost = effectiveGasPrice.mul(gasUsed);

            // Assert
            const endingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            );

            assert.equal(endingFundmeBalance, 0);
            assert.equal(
                startingDeployerBalance.add(startingFundmeBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            );

            await expect(fundMe.funders(0)).to.be.reverted;

            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.amountFundedByFunder(accounts[i].address),
                    0
                );
            }
        });

        it("only owner can withdraw funds", async () => {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const attackerConnectedContract = await fundMe.connect(attacker);
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner");
        });
    });
});
