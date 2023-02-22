// SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// ADDRESS FOR ETH/USD CONVERSION FOR GOERLI NETWORK  0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e

library PriceConverter {
    function getUSDPricePerEth(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // ABI

        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 usdPrice = getUSDPricePerEth(priceFeed);
        uint256 ethAmountInUSD = (usdPrice * ethAmount) / 1e18;
        return ethAmountInUSD;
    }
}
