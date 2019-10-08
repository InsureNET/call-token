const { expect } = require('chai');
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
  it('should not be able to accept ether', async () => {
    await expectRevert(context.call.sendTransaction(
      { value: '1000000000000000000', from: context.accounts[0] }),
    'VM Exception');

    expect(await web3.eth.getBalance(context.CALL.address))
      .to.be.equal('0');
  });

  // eslint-disable-next-line max-len
  it('should not be able to unlock mistakenly sent tokens to the contract from addr 2', async () => {
    const addrBal = '100000000';

    expect(await context.eip20.methods.transfer(
      context.CALL.address, addrBal
    ).send({ gas: 900000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect(await context.eip20.methods.balanceOf(context.CALL.address).call())
      .to.be.equal(addrBal);

    await expectRevert(context.callW.methods.executeTransaction(
      context.EIP20.address, 0
      , context.eip20.methods.transfer(context.accounts[1]
        , addrBal).encodeABI()
    ).send({ gas: 900000, from: context.accounts[1] }
    ), 'Ownable: caller is not the owner');

    expect(await context.eip20.methods.balanceOf(context.CALL.address).call())
      .to.be.equal(addrBal);
  });
};
