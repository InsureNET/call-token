const Migrations = artifacts.require('./Migrations.sol');

module.exports = async function(deployer) {
  return deployer.deploy(Migrations);
};
