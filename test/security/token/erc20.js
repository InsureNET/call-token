const { expect } = require('chai');
const { expectRevert, BN } = require('../../utils');

exports.test = function(f) {
  const context = f;

  before(async () => {
    context.call = await context.CALL.deployed();
    context.test = await context.Test.deployed();
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 2 transfer 1 ${context.TOKEN_NAME} from addr 1 (not enough allowance)`, async () => {
    const value = new BN(web3.utils.toWei('1'));

    expect(await context.call.approve(
      context.accounts[2],
      value.sub(new BN('100')),
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    await expectRevert(context.call.transferFrom(
      context.accounts[0],
      context.accounts[2],
      value,
      { gas: 300000, from: context.accounts[2] }
    ), 'Not enough allowance.');
  });

  it('should not disable erc20 from account 2', async () => {
    await expectRevert(context.call.disableERC20(
      { gas: 300000, from: context.accounts[1] }
    ), 'Ownable: caller is not the owner');
  });

  it('should not enable erc20 from account 2', async () => {
    await expectRevert(context.call.enableERC20(
      { gas: 300000, from: context.accounts[1] }
    ), 'Ownable: caller is not the owner');
  });

  it('should not call erc20 functions when disabled', async () => {
    const tranfFromVal = new BN(web3.utils.toWei('0.5'));

    expect(await context.call.approve(
      context.accounts[2],
      tranfFromVal,
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    expect(await context.call.allowance(
      context.accounts[0], context.accounts[2]
    )).to.be.bignumber.equal(tranfFromVal);

    expect(await context.call.disableERC20(
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    await expectRevert(context.call.decimals(
      { from: context.accounts[0] }
    ), 'ERC20 is disabled');
    await expectRevert(context.call.transfer(
      context.accounts[1], web3.utils.toWei('1.5'),
      { gas: 300000, from: context.accounts[0] }
    ), 'ERC20 is disabled');
    await expectRevert(context.call.transferFrom(
      context.accounts[0],
      context.accounts[2],
      tranfFromVal,
      { gas: 300000, from: context.accounts[2] }
    ), 'ERC20 is disabled');
    await expectRevert(context.call.approve(
      context.accounts[2],
      web3.utils.toWei('3.5'),
      { gas: 300000, from: context.accounts[0] }
    ), 'ERC20 is disabled');
    await expectRevert(context.call.allowance(
      context.accounts[0], context.accounts[2]
    ), 'ERC20 is disabled');

    expect(await context.call.enableERC20(
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);
  });

  // eslint-disable-next-line max-len
  it('should not allow more than allowance using re-entrance vulnerability', async () => {
    const oldBalOne = new BN(await context.call.balanceOf(context.accounts[0]));
    const value = new BN(web3.utils.toWei('3'));

    expect(await context.call.approve(
      context.Test.address,
      value,
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    await expectRevert(context.test.checkReentrancyTransferFrom(
      context.CALL.address,
      context.accounts[0],
      context.Test.address,
      value,
      { gas: 600000, from: context.accounts[1] }
    ), 'Not enough allowance.');

    expect(await context.call.allowance(
      context.accounts[0], context.Test.address))
      .to.be.bignumber.equal(value);

    expect(await context.call.balanceOf(context.accounts[0]))
      .to.be.bignumber.equal(oldBalOne);
  });
};
