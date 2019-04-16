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
      '0xE9a77B7C42212c6A713ECEFc95952d6cF776cE0F',
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
    status: 'open',
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

const closeProposal = async (db, { proposal }) => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  const [aTeam, bTeam, legion] = await web3.eth.getAccounts();
  
  const { abi } = JSON.parse(fs.readFileSync('./build/contracts/ProposalContract.json', 'utf8'));
  let proposalContract = web3.eth.Contract(abi, proposal.proposalAddress);

  // This method creates a lot of console noise... ignore :)
  await proposalContract.methods.finalizeVoting()
    .send({ from: legion, gas: 4712388, gasPrice: 100000000000 }, (err, result) => {
      if (err) {
        console.log('Shit, something went wrong finalizing the proposal.', err);
      }
      console.log(err, result);
      return;
    });

  const passed = await proposalContract.methods.proposalPassed()
    .call({ from: legion, gas: 4712388, gasPrice: 100000000000 }, (err, result) => {
      if (err) {
        console.log('Shit, something went wrong finalizing the proposal.', err);
      }

      return result;
    });

  await db.collection('proposals').updateOne({ proposalAddress: proposal.proposalAddress }, { $set: { status: 'closed' } });

  if (passed) {
    console.log('The contract passed!');

    const { abi } = JSON.parse(fs.readFileSync('./build/contracts/PlayerToken.json', 'utf8'));
    let playerToken = web3.eth.Contract(abi, '0xE9a77B7C42212c6A713ECEFc95952d6cF776cE0F');

    playerToken.methods.safeTransferFrom(aTeam, bTeam, proposal.selectedATeamPlayers[0].tokenId)
      .send({ from: legion, gas: 4712388, gasPrice: 100000000000 }, (err, result) => {
        if (err) {
          console.log('Shit, something went wrong sending A Team player to B Team.', err);
        }

        console.log(err, result);
      });

    playerToken.methods.safeTransferFrom(aTeam, bTeam, proposal.selectedBTeamPlayers[0].tokenId)
      .send({ from: legion, gas: 4712388, gasPrice: 100000000000 }, (err, result) => {
        if (err) {
          console.log('Shit, something went wrong sending A Team player to B Team.', err);
        }

        console.log(err, result);
      });
  }
};

module.exports = {
  getProposal,
  getProposals,
  createProposal,
  vote,
  closeProposal,
}
