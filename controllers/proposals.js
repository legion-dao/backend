const fs = require('fs');
const Web3 = require('web3');

const getProposals = async db => await db.collection('proposals').find().toArray();

const getProposal = async (db, proposalAddress) => await db.collection('proposals').findOne({ proposalAddress });

const deployProposalContract = async (db, proposal) => {
  // TODO: Hookup the team contracts...
  const { _id, creator, aTeam, bTeam, selectedATeamPlayers, selectedBTeamPlayers } = proposal;

  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  const [account] = await web3.eth.getAccounts();

  const { abi, bytecode } = JSON.parse(fs.readFileSync('./build/contracts/ProposalContract.json', 'utf8'));
  let proposalContract = web3.eth.Contract(abi);

  const aTeamTokenIds = selectedATeamPlayers.map(player => player.tokenId);
  const bTeamTokenIds = selectedBTeamPlayers.map(player => player.tokenId);

  // Deploys proposal contract
  const { address: proposalAddress } = await proposalContract.deploy({
    data: bytecode,
    arguments: [
      creator,
      [account, account],
      'trade proposal',
      aTeamTokenIds,
      bTeamTokenIds,
      '0x30a6439c1e5dD953b15C2f833A4A6a8720B96F0d',
    ],
  })
    .send({ from: account, gas: 4712388, gasPrice: 100000000000, value: 1 })
    .catch(err => console.log('Shit, something went wrong deploying the proposal contract.', err));

  await db.collection('proposals').updateOne({ _id }, { $set: { proposalAddress } });

  return await db.collection('proposals').findOne({ _id });
};

const createProposal = async (db, { creator, aTeam, bTeam, selectedATeamPlayers, selectedBTeamPlayers }) => {
  const { ops } = await db.collection('proposals').insertOne({
    creator,
    aTeam,
    bTeam,
    selectedATeamPlayers,
    selectedBTeamPlayers,
    positiveVotes: 0,
    negativeVotes: 0,
    status: 'Open',
  });

  let proposal = ops[0];

  proposal = await deployProposalContract(db, proposal);

  return proposal;
};

const vote = async (db, { proposal, vote }) => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  const [account] = await web3.eth.getAccounts();
  
  const { abi } = JSON.parse(fs.readFileSync('./build/contracts/ProposalContract.json', 'utf8'));
  let proposalContract = web3.eth.Contract(abi, proposal.proposalAddress);

  // This method creates a lot of console noise... ignore :)
  await proposalContract.methods.vote(vote)
    .send({ from: account, gas: 4712388, gasPrice: 100000000000 }, (err, result) => {
      if (err) {
        console.log('Shit, something went wrong voting on the proposal.', err);
      }

      return;
    });
    
  // Manually count votes because I am bad at web3 and have no time left
  if (vote) {
    await db.collection('proposals').updateOne({ proposalAddress: proposal.proposalAddress }, { $inc: { positiveVotes: 1 } });
  } else {
    await db.collection('proposals').updateOne({ proposalAddress: proposal.proposalAddress }, { $inc: { negativeVotes: 1 } });
  }
};

const transferPlayer = async (db, { playerToken, toPlayer, toTeam, fromPlayer, fromTeam }) => {
  console.log(`Transferring ${fromPlayer.tokenId} from ${fromTeam}`);
  await playerToken.methods.transferFrom(fromPlayer.playerOwner, toPlayer.playerOwner, fromPlayer.tokenId)
    .send({ from: fromPlayer.playerOwner, gas: 4712388, gasPrice: 100000000000 }, async (err, result) => {
      if (err) {
        console.log('Shit, something went wrong sending A Team player to B Team.', err);
        return;
      }

      const newTrades = fromPlayer.trades || [];
      newTrades.push({
        from: fromTeam,
        to: toTeam,
        transaction: result,
      });

      await db.collection('players').updateOne({ tokenId: fromPlayer.tokenId }, { $set: { playerOwner: toPlayer.playerOwner, dao: toTeam, trades: newTrades } });

      console.log(`Transferring ${fromPlayer.tokenId} from ${fromTeam} COMPLETE`, result);

      return result;
    });
};

const closeProposal = async (db, { proposal }) => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  const [account] = await web3.eth.getAccounts();
  
  const { abi } = JSON.parse(fs.readFileSync('./build/contracts/ProposalContract.json', 'utf8'));
  let proposalContract = web3.eth.Contract(abi, proposal.proposalAddress);

  // This method creates a lot of console noise... ignore :)
  await proposalContract.methods.finalizeVoting()
    .send({ from: account, gas: 4712388, gasPrice: 100000000000 }, (err, result) => {
      if (err) {
        console.log('Shit, something went wrong finalizing the proposal.', err);
      }

      return result;
    });

  const passed = await proposalContract.methods.proposalPassed()
    .call({ from: account, gas: 4712388, gasPrice: 100000000000 }, (err, result) => {
      if (err) {
        console.log('Shit, something went wrong finalizing the proposal.', err);
      }

      return result;
    });

  const completedStatus = passed ? 'Passed' : 'Failed';
  await db.collection('proposals').updateOne({ proposalAddress: proposal.proposalAddress }, { $set: { status: completedStatus } });

  if (passed) {
    console.log('The contract passed!');

    const { abi } = JSON.parse(fs.readFileSync('./build/contracts/PlayerToken.json', 'utf8'));
    let playerToken = web3.eth.Contract(abi, '0x30a6439c1e5dD953b15C2f833A4A6a8720B96F0d');

    const aTeamPlayer = proposal.selectedATeamPlayers[0];
    const bTeamPlayer = proposal.selectedBTeamPlayers[0];

    // A TEAM --> B TEAM
    transferPlayer(db, { playerToken, toPlayer: bTeamPlayer, toTeam: proposal.bTeam, fromPlayer: aTeamPlayer, fromTeam: proposal.aTeam });

    // B TEAM --> A TEAM
    transferPlayer(db, { playerToken, toPlayer: aTeamPlayer, toTeam: proposal.aTeam, fromPlayer: bTeamPlayer, fromTeam: proposal.bTeam });
  }
};

module.exports = {
  getProposal,
  getProposals,
  createProposal,
  vote,
  closeProposal,
}
