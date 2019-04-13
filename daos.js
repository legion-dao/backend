const fs = require('fs');
const Web3 = require('web3');

const mintOrganizationToken = async (db, { name, symbol }) => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  
  const { abi } = JSON.parse(fs.readFileSync('./build/contracts/OrganizationToken.json', 'utf8'));
  let organizationToken = web3.eth.Contract(abi);
};

const createDao = async (db, { name, symbol }) => {
  await db.collection('daos').insertOne({
    name,
    symbol,
  });

  return;
}

module.exports = { 
  createDao,
}