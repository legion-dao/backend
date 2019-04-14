const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));

const PlayerToken = artifacts.require('PlayerToken');
const OrganizationToken = artifacts.require('OrganizationToken');

module.exports = async (deployer) => {
  deployer.deploy(PlayerToken);
  deployer.deploy(OrganizationToken, "knicks_token", "NICK", 18, await web3.eth.accounts[0]);
};
