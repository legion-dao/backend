const PlayerToken = artifacts.require('PlayerToken');
const OrganizationToken = artifacts.require('OrganizationToken');

module.exports = function(deployer) {
  deployer.deploy(PlayerToken);
  deployer.deploy(OrganizationToken, "knicks_token", "NICK", 18, '0x9693cEc5C937ba1Ba93e5e0ab1d83329C1EC1466');
};
