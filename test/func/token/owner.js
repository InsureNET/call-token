const { expect } = require('chai');

exports.test = function(f) {
  const context = f;

  before(async () => {
    context.call = await context.CALL.deployed();
    // Workaround for truffle send bug
    context.callW = new web3.eth.Contract(
      context.CALL.abi, context.CALL.address);
  });

  // eslint-disable-next-line max-len
  it('should be able to change new owner addr 2 from addr 1', async () => {
    expect(await context.call.transferOwnership(context.accounts[1]
      , { gas: 900000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
  });

  // eslint-disable-next-line max-len
  it('should be able to remove ownership from addr 2', async () => {
    expect(await context.call.renounceOwnership(
      { gas: 900000, from: context.accounts[1] }))
      .to.have.nested.property('receipt.status', true);
  });
};
