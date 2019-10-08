const { expect } = require('chai');
const { genAddrs, singletons, BN } = require('../../utils');

exports.test = function(f) {
  const context = f;

  before(async () => {
    context.ERC1820Registry = await singletons.ERC1820Registry();
    context.call = await context.CALL.deployed();
  });

  it('should register the "ERC20Token" interface', async () => {
    const erc20Hash = await context.ERC1820Registry.interfaceHash('ERC20Token');
    expect(await context.ERC1820Registry.getInterfaceImplementer(
      context.CALL.address, erc20Hash))
      .to.be.equal(context.CALL.address);
  });

  it('should return 18 for decimals', async () => {
    expect(await context.call.decimals()).to.be.bignumber.equal('18');
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 transfer 1.5 ${context.TOKEN_NAME} to random address`, async () => {
    const oldBalOne = new BN(await context.call.balanceOf(context.accounts[0]));
    const randomAddr = await genAddrs(1);
    const value = new BN(web3.utils.toWei('1.5'));

    expect(await context.call.transfer(
      randomAddr[0], value,
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    expect(await context.call.balanceOf(context.accounts[0]))
      .to.be.bignumber.equal(oldBalOne.sub(value));
    expect(await context.call.balanceOf(randomAddr[0]))
      .to.be.bignumber.equal(value);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 transfer 1.5 ${context.TOKEN_NAME} to contract address`, async () => {
    const oldBalOne = new BN(await context.call.balanceOf(context.accounts[0]));
    const value = new BN(web3.utils.toWei('1.5'));
    const oldBalTwo = new BN(await context.call.balanceOf(
      context.Test.address));
    const recipientHash = await context.ERC1820Registry
      .interfaceHash('ERC777TokensRecipient');

    expect(await context.ERC1820Registry.getInterfaceImplementer(
      context.Test.address, recipientHash,
      { gas: 300000, from: context.accounts[0] }))
      .to.be.equal('0x0000000000000000000000000000000000000000');

    expect(await context.call.transfer(
      context.Test.address, value,
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    expect(await context.call.balanceOf(context.accounts[0]))
      .to.be.bignumber.equal(oldBalOne.sub(value));
    expect(await context.call.balanceOf(context.Test.address))
      .to.be.bignumber.equal(oldBalTwo.add(value));
  });

  // eslint-disable-next-line max-len
  it(`should approve addr 2 to send 3.5 ${context.TOKEN_NAME} from addr 1`, async () => {
    const value = new BN(web3.utils.toWei('3.5'));

    expect(await context.call.approve(
      context.accounts[1],
      value,
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    expect(await context.call.allowance(
      context.accounts[0], context.accounts[1]
    )).to.be.bignumber.equal(value);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 2 transfer 3 ${context.TOKEN_NAME} from addr 1 to random address`, async () => {
    const oldBalOne = new BN(await context.call.balanceOf(context.accounts[0]));
    const randAddr = await genAddrs(1);
    const value = new BN(web3.utils.toWei('3'));

    expect(await context.call.approve(
      context.accounts[1],
      value,
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    expect(await context.call.transferFrom(
      context.accounts[0],
      randAddr[0],
      value,
      { gas: 300000, from: context.accounts[1] }
    )).to.have.nested.property('receipt.status', true);

    expect(await context.call.allowance(
      context.accounts[0], context.accounts[1]))
      .to.be.bignumber.equal('0');

    expect(await context.call.balanceOf(context.accounts[0]))
      .to.be.bignumber.equal(oldBalOne.sub(value));

    expect(await context.call.balanceOf(randAddr[0]))
      .to.be.bignumber.equal(value);
  });

  it('should disable erc20 using account 1', async () => {
    expect(await context.call.disableERC20(
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);
  });

  it('should enable erc20 using account 1', async () => {
    expect(await context.call.enableERC20(
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);
  });
};
