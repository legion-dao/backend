pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import './PlayerToken.sol';
//import './OrganizationToken.sol';

contract OrganizationToken {
  function balanceOf(address owner) public view returns (uint256);
}
/* A new version of this contract will be deployed by 
the web3 frontend with every new proposition that comes in */

contract ProposalContract {
  /* The creator of the contract. He staked his tokens.  */
  address creator;
  /* the teams who own the players in this contract */
  address[] teamsConcerned;

  PlayerToken players;
  /* These players will go FROM a TO b */
  uint256[] tradeAtoB;  
  /* These players will go FROM b TO a */
  uint256[] tradeBtoA; 

  /* the actual account that hold the erc721 player token */ 
  address teamAholder;
  address teamBholder;

  /* ADDRESS of the tokens of the dao that are involved with this transaction  */ 
  //teamsConcerned[i].call.value(keccak(asdl;fkja;sd))
  //OrganizationToken(teamsConcerned[i]).getBalanceOf()
  string description;
  // uint minExecutionDate; <- used in template
  bool executed;
  bool public proposalPassed;
  uint numberOfVotes;

  address public teamA;
  address public teamB;

  Vote[] votes;

  /* this mapping tells us if they have already voted */ 
  mapping (address => bool) public voted;

  struct Vote {
    bool inSupport;
    address voter;
  }

  event Voted (
    address voter,
    bool inSupport
  );

  constructor (
    address _creator,
    address[] memory _teamsConcerned,
    string memory _description,
    uint256[] memory _tradeAtoB,
    uint256[] memory _tradeBtoA,
    address _players,
    address _teamAholder,
    address _teamBholder
  ) payable public {
    players = PlayerToken(_players);
    creator = _creator;
    teamsConcerned = _teamsConcerned;
    description = _description;
    tradeAtoB = _tradeAtoB;
    tradeBtoA = _tradeBtoA;
    teamA = _teamsConcerned[0];
    teamB = _teamsConcerned[1];
    teamAholder = _teamAholder;
    teamBholder = _teamBholder;
  }

  function vote(bool supportsProposal) public {

    /* check to which team they belong to */ 
    OrganizationToken teamAOrg = OrganizationToken(teamA);
    OrganizationToken teamBOrg = OrganizationToken(teamB);
    // TODO: These requires break the thing
    require(teamAOrg.balanceOf(address(tx.origin)) > 0 || teamBOrg.balanceOf(address(tx.origin)) > 0);
    require(!voted[tx.origin]);
    votes.push(Vote( supportsProposal, tx.origin));
    voted[tx.origin] = true;
    emit Voted(tx.origin, supportsProposal);

  }

  function finalizeVoting () public {
    executed = true;
    bool passed = true;
    OrganizationToken teamAOrg = OrganizationToken(teamA);
    OrganizationToken teamBOrg = OrganizationToken(teamB);

    /* TODO: insert minimum quorum, uint quorum = 0; */
    uint yea = 0;
    uint nay = 0;

    for (uint j=0; j <votes.length; j++) {

         uint voteWeight = 0;
         voteWeight += teamAOrg.balanceOf(votes[j].voter);
         voteWeight += teamBOrg.balanceOf(votes[j].voter);

         if (votes[j].inSupport) {
            yea += voteWeight;
         } else {
            nay += voteWeight;
        }
    }
    
    if (nay > yea) {
        passed = false;
    }

<<<<<<< Updated upstream
    proposalPassed = passed;
=======
    if (passed) {
      /* Transfer ownership of the Player Tokens */
      for (uint i=0; i<tradeAtoB.length; i++) {
        players.safeTransferFrom(teamAholder, teamBholder, tradeAtoB[i]);
      }

      for (uint i=0; i<tradeBtoA.length; i++) {
        players.safeTransferFrom(teamBholder, teamAholder, tradeBtoA[i]);
      }
    }
  }

  function getVotes () public returns(Vote[] memory) {
    return votes;
>>>>>>> Stashed changes
  }

  function() payable external {}
}
