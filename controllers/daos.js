const fs = require('fs');
const Web3 = require('web3');

const getDaos = async (db) => {
  let daos = await db.collection('daos').find().toArray();

  daos = Promise.all(daos.map(async dao => {
    const players = await db.collection('players').find({
      dao: dao.name,
    }).toArray();

    dao.players = players;

    return dao;
  }));

  return daos;
};

const getDao = async (db, id) => {
  const dao = await db.collection('daos').findOne({
    $or: [
      { name: id },
      { tokenAddress: id }
    ]
  });

  if (dao) {
    const players = await db.collection('players').find({
      dao: dao.name,
    }).toArray();

    dao.players = players;
  }

  return dao || {};
};

const mintOrganizationToken = async (db, { name, symbol }) => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  const [account] = await web3.eth.getAccounts();
  
  const { abi, bytecode } = JSON.parse(fs.readFileSync('./build/contracts/OrganizationToken.json', 'utf8'));
  let organizationToken = web3.eth.Contract(abi);

  // Mints tokens to Legion which need to be transfered later
  const { address: tokenAddress } = await organizationToken.deploy({
    data: bytecode,
    arguments: [name, symbol, 18, account],
  })
    .send({ from: account, gas: 4712388, gasPrice: 100000000000 })
    .on('transactionHash', transactionHash => {
      db.collection('daos').updateOne({ name }, { $set: { transaction: transactionHash } });
    })
    .catch(err => console.log('Shit, something went wrong deploying the org token.', err));

  await db.collection('daos').updateOne({ name }, { $set: { tokenAddress } });
};

const createTokenSaleContract = async (db, { name }) => {
  const dao = await db.collection('daos').findOne({ name });

  if (!dao) {
    return;
  }

  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  const [account] = await web3.eth.getAccounts();
  
  const { abi, bytecode } = JSON.parse(fs.readFileSync('./build/contracts/OrganizationTokenSale.json', 'utf8'));
  let organizationTokenSale = web3.eth.Contract(abi);

  // Deploys token sale contract
  const { address: saleAddress } = await organizationTokenSale.deploy({
    data: bytecode,
    arguments: [dao.tokenAddress],
  })
    .send({ from: account, gas: 4712388, gasPrice: 100000000000 })
    .catch(err => console.log('Shit, something went wrong deploying the token sale contract.', err));

  db.collection('daos').updateOne({ name }, { $set: { saleAddress } });
};

const createDao = async (db, { name, symbol }) => {
  await db.collection('daos').insertOne({
    name,
    symbol,
  });

  await mintOrganizationToken(db, { name, symbol });

  createTokenSaleContract(db, { name });

  return;
}

module.exports = { 
  getDaos,
  getDao,
  createDao,
}