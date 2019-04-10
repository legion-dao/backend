pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Metadata.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Enumerable.sol';

contract PlayerToken is ERC721Metadata, ERC721Mintable, ERC721Enumerable {
  constructor() ERC721Metadata("LegionPlayer", "PLYR") public {}

  function createPlayerToken(string memory playerName, string memory playerHeight, uint playerNumber, string memory tokenURI) public returns(bool) {
    uint playerTokenId = uint(keccak256(abi.encode(playerName, playerHeight, playerNumber)));
    _mint(msg.sender, playerTokenId);
    _setTokenURI(playerTokenId, tokenURI);
    return true;
  }
}