const context = {};
context.CALL = artifacts.require('./CALL.sol');
context.TOTAL_SUPPLY = 777000000e18;
context.TOKEN_NAME = 'CALL';
context.TOKEN_SYM = 'CALL';
context.TestTokensRecipient = artifacts.require('./test/TestTokensRecipient');
context.TestTokensSender = artifacts.require('./test/TestTokensSender');
context.Test = artifacts.require('./test/Test.sol');
context.EIP20 = artifacts.require('./test/EIP20.sol');
context.CSTORE = artifacts.require('./CStore.sol');

contract('CALL', (accounts) => {
  context.accounts = accounts;

  describe('Attributes', () => {
    require('./func/token/attributes').test(context);
  });
  describe('New', () => {
    require('./func/token/call').test(context);
    require('./security/token/call').test(context);
  });
  describe('ERC20', () => {
    require('./func/token/erc20').test(context);
    require('./security/token/erc20').test(context);
  });
  describe('ERC777', () => {
    require('./func/token/erc777').test(context);
    require('./security/token/erc777').test(context);
  });
  describe('SafeGuard', () => {
    require('./func/token/safe-guard').test(context);
    require('./security/token/safe-guard').test(context);
  });
  describe('Ownership', () => {
    require('./security/token/owner').test(context);
    require('./func/token/owner').test(context);
  });
  describe('CStore', () => {
    require('./func/database/main').test(context);
    require('./security/database/main').test(context);
  });
});
