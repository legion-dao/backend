pragma solidity ^0.5.2;

import "/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract OrganizationToken is ERC20, ERC20Detailed {
	constructor(string memory name, string memory symbol, uint8 decimals, address daoCreator) ERC20Detailed(name, symbol, decimals) public
	{
		_mint(daoCreator, 21000000000000000000000000);
	}
}
