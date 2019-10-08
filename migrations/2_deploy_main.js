const SafeMath = artifacts.require('SafeMath');
const CALL = artifacts.require('./CALL.sol');
const Test = artifacts.require('./test/Test.sol');
const TestTokensRecipient = artifacts.require('./test/TestTokensRecipient.sol');
const TestTokensSender = artifacts.require('./test/TestTokensSender.sol');
const Web3 = require('web3');
const web3 = new Web3(CALL.web3.currentProvider);
const EIP20 = artifacts.require('./test/EIP20.sol');

require('openzeppelin-test-helpers/configure')({ web3: web3 });
const { singletons } = require('openzeppelin-test-helpers');

const tokenTotalSupply = web3.utils.toBN('777000000000000000000000000');
const tokenName = 'CALL';
const tokenSymbol = 'CALL';
const tokenGran = web3.utils.toBN('10000000000000000'); // 0.01

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(SafeMath);
  await deployer.link(SafeMath, [CALL]);
  if (network !== 'live') {
    const deployed = await web3.eth
      .getCode('0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24');
    console.info('Non-Mainnet deployment detected.');
    if (deployed === '0x') {
      await singletons.ERC1820Registry(accounts[0]);
      console.info('Successfully deployed the ERC1820 registry');
    }
    await deployer.deploy(Test);
    await deployer.deploy(TestTokensSender);
    await deployer.deploy(TestTokensRecipient);
    await deployer.deploy(EIP20);
  }
  await deployer.deploy(CALL, tokenName, tokenSymbol, tokenGran,
    tokenTotalSupply, accounts[0], []);
};
