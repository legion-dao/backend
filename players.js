const fs = require('fs');
const Web3 = require('web3');

const mintPlayerToken = async (db, { name, height, number }) => {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  
  const { abi } = JSON.parse(fs.readFileSync('./build/contracts/PlayerToken.json', 'utf8'));
  let playerToken = web3.eth.Contract(abi, '0x0c842539c0Fa1dD1287EE51f96724b98f09C5fa2');

  playerToken.methods.createPlayerToken(name, height, number, 'http://whatever.com')
    .send({ from: '0xAB0b6e4eBA3985b31E826202FE0Dd9688620427e', gas: 400000 }, (err, transaction) => {
      if (err) {
        console.log('Shit, something went wrong minting the player token.', err);
      }

      const tokenId = web3.utils.soliditySha3(name, height, number);

      db.collection('players').updateOne({ name }, { $set: { transaction, tokenId } });
    });
};

module.exports = {
  mintPlayerToken,
};
