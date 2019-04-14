pragma solidity ^0.5.2;

import './PlayerToken.sol';
import './AssociationToken.sol';

/* A new version of this contract will be deployed by 
the web3 frontend with every new proposition that comes in */

contract ProposalContract {
     /* The creator of the contract. He staked his tokens.  */
    address creator;
    /* the teams who own the players in this contract */
    address[] teamsConcerned;

    PlayerToken players = PlayerToken(/*hardcoded player address*/);
    /* These players will go FROM a TO b */
    PlayerToken[] tradeAtoB;  
    /* These players will go FROM b TO a */
    PlayerToken[] tradeBtoA; 
    /* ADDRESS of the tokens of the dao that are involved with this transaction  */ 
    AssociationToken[] teamsConcernedTokens;
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

    constructor (address creator, address[] teamsConcerned, string description, Player[] tradeAtoB, Player[] tradeBtoA) payable public {
        this.creator = creator;
        this.teamsConcerned = teamsConcerned;
        this.description = description;
        this.teamA = teamsConcerned[0];
        this.teamB = teamsConcerned[1];
    }

   function vote( uint proposalNumber, bool supportsProposal) public{
       /* check to which team they belong to */ 
       for ( uint i=0; i<teamsConcerned.length; i++) {
           if ( teamsConcernedToken[i].balanceOf(address(tx.origin)) > 0 
                && !voted[tx.origin]) {
               votes.length++;
               votes[i].inSupport = supportsProposal;
               votes[i].voter = tx.origin;
               voted[tx.origin] = true;
               emit Voted(tx.origin, supportsProposal);
           }
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
               uint voteWeight = teamsConcernedToken[i].balanceOf(votes[j].voter);

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
