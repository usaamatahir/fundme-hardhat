//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./PriceConverter.sol";

contract FundMe {
    using PriceConverter for uint256;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only owner is allowed to call this function"
        );
        _;
    }

    uint256 public minimumUsd = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public amountFundedByFunder;

    // function for sending funds
    function fund() public payable {
        require(
            msg.value.getConversionRate() > minimumUsd,
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
}
