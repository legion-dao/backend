const fs = require('fs');
const Web3 = require('web3');

const getProposals = async (db) => {
  return await db.collection('proposals').find().toArray();
};

const deployProposalContract = async (db, proposal) => {
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
      '0x0c842539c0Fa1dD1287EE51f96724b98f09C5fa2',
    ],
  })
    .send({ from: account, gas: 4712388, gasPrice: 100000000000, value: 1 })
    .catch(err => console.log('Shit, something went wrong deploying the proposal contract.', err));

  db.collection('proposals').updateOne({ _id }, { $set: { proposalAddress } });
};

const createProposal = async (db, { creator, aTeam, bTeam, selectedATeamPlayers, selectedBTeamPlayers }) => {
  const { ops } = await db.collection('proposals').insertOne({
    creator,
    aTeam,
    bTeam,
    selectedATeamPlayers,
    selectedBTeamPlayers,
  });

  const proposal = ops[0];

  await deployProposalContract(db, proposal);

  return proposal;
};

module.exports = {
  getProposals,
  createProposal,
}
