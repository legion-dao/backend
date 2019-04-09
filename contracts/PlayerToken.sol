pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721MetaData.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Mintable.sol';

contract PlayerToken is ERC721MetaData, ERC721Mintable {
  constructor() ERC721MetaData("LegionPlayer", "PLYR") public {}

  function createPlayerToken(string, playerName, string playerHeight, uint playerNumber, string tokenURI) public returns(bool) {
    uint playerTokenId = keccak256(playerName, playerHeight, playerNumber);
    _mint(msg.sender, playerTokenId);
    _setTokenURI(tokenURI);
    return true;
  }
}