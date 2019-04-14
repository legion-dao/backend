pragma solidity ^0.5.2;

import './PlayerToken.sol';
import './OrganizationToken.sol';

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

    /* ADDRESS of the tokens of the dao that are involved with this transaction  */ 
    //teamsConcerned[i].call.value(keccak(asdl;fkja;sd))
    //OrganizationToken(teamsConcerned[i]).getBalanceOf()
    string description;
    // uint minExecutionDate; <- used in template
    bool executed;
    bool proposalPassed;
    uint numberOfVotes;

    address teamA;
    address teamB;
 
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

    constructor (address _creator, address[] _teamsConcerned, string _description, Player[] _tradeAtoB, Player[] _tradeBtoA, address _players, address _org) payable public {

        players = PlayerToken(_players);
        creator = _creator;
        teamsConcerned = _teamsConcerned;
        description = _description;
        teamA = _teamsConcerned[0];
        teamB = _teamsConcerned[1];

    }

   function vote( bool supportsProposal) public{
       /* check to which team they belong to */ 
       for ( uint i=0; i<teamsConcerned.length; i++) {
           orgToken currOrg = OrganizationToken(teamsConcerned[i]);
           require(currOrg.balanceOf(address(tx.origin) > 0));
           require(!voted[tx.origin]);
           votes.length++;
           votes[i].inSupport = supportsProposal;
           votes[i].voter = tx.origin;
           voted[tx.origin] = true;
           emit Voted(tx.origin, supportsProposal);
       }
   }

   function finalizeVoting () public {
       executed = true;
       bool passed = true;

       for (uint i=0; i<teamsConcerned.length; i++){
           /* TODO: insert minimum quorum, uint quorum = 0; */
           uint yea = 0;
           uint nay = 0;

           for (uint j=0; j <votes.length; j++){

               OrganizationToken currOrg = OrganizationToken(teamsConcerned[i]);
               uint voteWeight = currOrg.balanceOf(votes[j].voter);

               if(votes[j].inSupport){
                   yea += voteWeight;
               } else {
                   nay += voteWeight;
               }
           }
           if (nay > yea) {
               passed = false;
           }
       }

       if (passed){
           /* Transfer ownership of the Player Tokens */
           for(uint i=0; i<tradeAtoB.length; i++){
               players.safeTransferFrom(teamA, teamB, tradeAtoB[i]);
           }
           for(uint i=0; i<tradeBtoA.length; i++){
               players.safeTransferFrom(teamB, teamA, tradeBtoA[i]);
           }
       }
   }
}
