const fs = require('fs');
const Web3 = require('web3');

const mintPlayerToken = async (db, { name, height, number }) => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  const accounts = await web3.eth.getAccounts();
  const playerAccounts = accounts.filter((acc, index) => index !== 0);

  const playerOwner = playerAccounts[Math.floor(Math.random() * playerAccounts.length)];

  const { abi } = JSON.parse(fs.readFileSync('./build/contracts/PlayerToken.json', 'utf8'));
  let playerToken = web3.eth.Contract(abi, '0x30a6439c1e5dD953b15C2f833A4A6a8720B96F0d');

  const tokenId = web3.utils.soliditySha3(name, height, number);

  // This method creates a lot of console noise... ignore :)
  console.log(`Minting player token to ${playerOwner}`);
  await playerToken.methods.createPlayerToken(name, height, number, `http://localhost:8080/players/${tokenId}`)
    .send({ from: playerOwner, gas: 400000 }, (err, result) => {
      if (err) {
        console.log('Shit, something went wrong minting the player token.', err);
      }

      const transaction = result.transactionHash || result;

      db.collection('players').updateOne({ name }, { $set: { transaction, tokenId, playerOwner } });
    });
};

const createPlayers = async (db, { dao, players}) => {
  players.forEach(async ({ name, height, number }) => {
    await db.collection('players').insertOne({
      name,
      height,
      number,
      dao,
      trades: [],
    });

    await mintPlayerToken(db, { name, height, number });
  });
};

module.exports = {
  createPlayers,
};
