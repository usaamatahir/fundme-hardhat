// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// ADDRESS FOR ETH/USD CONVERSION FOR GOERLI NETWORK  0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e

library PriceConverter {
    function getUSDPricePerEth() internal view returns (uint256) {
        // ABI
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        );
        return priceFeed.version();
    }

    function getConversionRate(
        uint256 ethAmount
    ) internal view returns (uint256) {
        uint256 usdPrice = getUSDPricePerEth();
        uint256 ethAmountInUSD = (usdPrice * ethAmount) / 1e18;
        return ethAmountInUSD;
    }
}
