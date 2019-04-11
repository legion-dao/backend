# Solidity and backend

Here we have four different contracts to create the functionality of the legion dao

 - `AssociationToken.sol` 
 - `LegionDAO.sol`
 - `PlayerToken.sol`
 - `ProposalContract.sol`

 Briefly, this is how it __should__ work: 

 PlayerToken are ERC 721 nonfungible tokens representing players of a game.

 AssociationTokens are ERC 20 tokens which give _ownership_ and _voting rights_ to holders of that token.

 Different ERC 20 contract addresses are associated with different teams. These contracts are spun up by the frontend.

 ProposalContract.sol defines the contract that shall be created after a new proposal is made.

 LegionDAO defines the legion actions, for example creating a new ProposalContract.
