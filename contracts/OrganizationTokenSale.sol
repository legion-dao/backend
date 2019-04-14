pragma solidity ^0.5.2;

import './OrganizationToken.sol';
import "/openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol";

contract OrganizationTokenSale is Crowdsale {
  constructor(OrganizationToken _token) Crowdsale(1, 0xAB0b6e4eBA3985b31E826202FE0Dd9688620427e, _token) public {}
}
