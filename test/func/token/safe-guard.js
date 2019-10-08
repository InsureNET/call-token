const { expect } = require('chai');
const { BN } = require('../../utils');

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
  it('should be able to unlock mistakenly sent tokens to the contract', async () => {
    const addrBal = new BN(100000000);

    expect(await context.eip20.methods.transfer(
      context.CALL.address, addrBal.toString()
    ).send({ gas: 900000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect(await context.eip20.methods.balanceOf(context.CALL.address).call())
      .to.be.equal(addrBal.toString());

    expect(await context.callW.methods.executeTransaction(
      context.EIP20.address, '0'
      , context.eip20.methods.transfer(context.accounts[0], addrBal.toString())
        .encodeABI()).send({ gas: 900000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect(await context.eip20.methods.balanceOf(context.CALL.address).call())
      .to.be.equal('0');
  });
};
