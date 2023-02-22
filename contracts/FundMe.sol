//SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;
    address public immutable i_owner;
    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
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

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public amountFundedByFunder;

    // function for sending funds
    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) > MINIMUM_USD,
            "Didn't send enough!"
        );
        funders.push(msg.sender);
        amountFundedByFunder[msg.sender] =
            amountFundedByFunder[msg.sender] +
            msg.value;
    }

    function withdraw() public onlyOwner {
        funders = new address[](0);

        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "Withdraw failed");
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
