const PlayerToken = artifacts.require('PlayerToken');
const AssociationToken = artifacts.require('AssociationToken');


module.exports = function(deployer) {
  deployer.deploy(PlayerToken);
  deployer.deploy(AssociationToken, "knicks_token", "NICK", 18, '0x9693cEc5C937ba1Ba93e5e0ab1d83329C1EC1466');
};
