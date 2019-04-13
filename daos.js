const fs = require('fs');
const Web3 = require('web3');

const mintOrganizationToken = async (db, { name, symbol }) => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  
  const { abi, bytecode } = JSON.parse(fs.readFileSync('./build/contracts/OrganizationToken.json', 'utf8'));
  let organizationToken = web3.eth.Contract(abi);

  // Mints tokens to Legion which need to be transfered later
  const { address: tokenAddress } = await organizationToken.deploy({
    data: bytecode,
    arguments: [name, symbol, 18, '0xAB0b6e4eBA3985b31E826202FE0Dd9688620427e'],
  })
    .send({ from: '0xAB0b6e4eBA3985b31E826202FE0Dd9688620427e', gas: 4712388, gasPrice: 100000000000 })
    .catch(err => console.log('Shit, something went wrong deploying the org token.', err));

  db.collection('daos').updateOne({ name }, { $set: { tokenAddress } });
};

const createDao = async (db, { name, symbol }) => {
  await db.collection('daos').insertOne({
    name,
    symbol,
  });

  mintOrganizationToken(db, { name, symbol });

  return;
}

module.exports = { 
  createDao,
}