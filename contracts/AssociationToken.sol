pragma solidity ^0.5.2;
import "/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract AssociationToken is ERC20 {
	constructor(string memory name, string memory symbol, uint8 decimals) ERC20() public
    	{}
}
