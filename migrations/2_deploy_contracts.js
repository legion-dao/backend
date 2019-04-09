const PlayerToken = artifacts.require('PlayerToken');

module.exports = function(deployer) {
  deployer.deploy(PlayerToken);
};
