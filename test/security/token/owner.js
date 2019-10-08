const { expectRevert } = require('../../utils');

exports.test = function(f) {
  const context = f;

  before(async () => {
    context.call = await context.CALL.deployed();
    // Workaround for truffle send bug
    context.callW = new web3.eth.Contract(
      context.CALL.abi, context.CALL.address);
    context.eip20 = new web3.eth.Contract(
      context.EIP20.abi, context.EIP20.address);
  });

  // eslint-disable-next-line max-len
  it('should not be able to change ownership from addr 2', async () => {
    await expectRevert(context.call.transferOwnership(context.accounts[2],
      { gas: 900000, from: context.accounts[1] }),
    'Ownable: caller is not the owner');
  });

  // eslint-disable-next-line max-len
  it('should not be able to remove ownership from addr 2', async () => {
    await expectRevert(context.call.renounceOwnership(
      { gas: 900000, from: context.accounts[1] }),
    'Ownable: caller is not the owner');
  });
};
