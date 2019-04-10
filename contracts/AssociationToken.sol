pragma solidity ^0.5.2;
import "/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract AssociationToken is ERC20{
	constructor(string memory name, string memory symbol, uint8 decimals) ERC20() public
    	{
		_mint(address(0x6744c0f9bA13A1F8a8046E80fe9e437c9a0BA8F6), 21000000000000000000000000);
	}
}
