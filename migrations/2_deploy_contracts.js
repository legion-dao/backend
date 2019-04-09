const PlayerToken = artifacts.require('PlayerToken');
const AssociationToken = artifacts.require('AssociationToken');


module.exports = function(deployer) {
  deployer.deploy(PlayerToken);
  deployer.deploy(AssociationToken, "knicks_token", "NICK", 18);
};
