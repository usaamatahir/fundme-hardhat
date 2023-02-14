//SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;
import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;
    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        // require(
        //     msg.sender == i_owner,
        //     "Only owner is allowed to call this function"
        // );
        if (msg.sender != i_owner) {
            revert NotOwner();
        }
        _;
    }

    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public amountFundedByFunder;

    // function for sending funds
    function fund() public payable {
        require(
            msg.value.getConversionRate() > MINIMUM_USD,
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
