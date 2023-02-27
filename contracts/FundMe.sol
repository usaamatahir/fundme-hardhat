//SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__DidNotSendEnoughFund();
error FundMe__WithdrawFailed();

contract FundMe {
    using PriceConverter for uint256;
    AggregatorV3Interface private s_priceFeed;
    address[] private s_funders;
    mapping(address => uint256) private s_amountFundedByFunder;

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address private immutable i_owner;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner() {
        // require(
        //     msg.sender == i_owner,
        //     "Only owner is allowed to call this function"
        // );
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // function for sending funds
    function fund() public payable {
        // require(
        //     msg.value.getConversionRate(s_priceFeed) > MINIMUM_USD,
        //     "Didn't send enough!"
        // );
        if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD) {
            revert FundMe__DidNotSendEnoughFund();
        }
        s_funders.push(msg.sender);
        s_amountFundedByFunder[msg.sender] =
            s_amountFundedByFunder[msg.sender] +
            msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_amountFundedByFunder[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!success) {
            revert FundMe__WithdrawFailed();
        }
        // require(success, "Withdraw failed");
    }

    function cheapWithdraw() public onlyOwner {
        address[] memory funders = s_funders;

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_amountFundedByFunder[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!success) {
            revert FundMe__WithdrawFailed();
        }
        // require(success, "Withdraw failed");
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAmountFundedByFunder(
        address funder
    ) public view returns (uint256) {
        return s_amountFundedByFunder[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
