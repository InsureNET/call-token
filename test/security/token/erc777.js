const { expect } = require('chai');
const { BN, genAddrs, singletons, expectRevert } = require('../../utils');

exports.test = function(f) {
  const context = f;

  before(async () => {
    context.ERC1820Registry = await singletons.ERC1820Registry();
    // Workaround for truffle send bug
    context.call = new web3.eth.Contract(
      context.CALL.abi, context.CALL.address);
    expect(await context.call.methods.disableERC20().send(
      { gas: 300000, from: context.accounts[0] }
    )).to.have.property('status', true);
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1.511 ${context.TOKEN_NAME} without data to random address (granularity error)`, async () => {
    const randomAddr = await genAddrs(1);
    const value = new BN(web3.utils.toWei('1.511'));

    await expectRevert(context.call.methods.send(
      randomAddr[0], value.toString(), '0x0'
    ).send({ gas: 300000, from: context.accounts[0] }
    ), 'Amount is not a multiple of granularity');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 3 send 1.5 ${context.TOKEN_NAME} without data to random address (out of funds)`, async () => {
    expect(await context.call.methods.balanceOf(
      context.accounts[3]).call()).to.be.equal('0');
    const randomAddr = await genAddrs(1);
    const value = new BN(web3.utils.toWei('1.5'));

    await expectRevert(context.call.methods.send(
      randomAddr[0], value.toString(), '0x0'
    ).send({ gas: 300000, from: context.accounts[3] }),
    'SafeMath: subtraction overflow');

    expect(await context.call.methods.balanceOf(context.accounts[3]).call())
      .to.be.equal('0');
    expect(await context.call.methods.balanceOf(randomAddr[0]).call())
      .to.be.equal('0');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1.5 ${context.TOKEN_NAME} without data to 0 address`, async () => {
    const oldBalOne = new BN(await context.call.methods.balanceOf(
      context.accounts[0]).call());
    const zeroAddr = `0x${Array(40).fill('0')
      .reduce((prev, next) => `${prev}${next}`)}`;
    const value = new BN(web3.utils.toWei('1.5'));

    await expectRevert(context.call.methods.send(
      zeroAddr, value.toString(), '0x0'
    ).send({ gas: 300000, from: context.accounts[0] }
    ), 'Cannot send to 0x0');

    expect(await context.call.methods.balanceOf(context.accounts[0]).call())
      .to.be.equal(oldBalOne.toString());
    expect(await context.call.methods.balanceOf(zeroAddr).call())
      .to.be.equal('0');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1.5 ${context.TOKEN_NAME} without data to unregistered contracts`, async () => {
    const oldBal = new BN(await context.call.methods.balanceOf(
      context.Test.address).call());
    const value = new BN(web3.utils.toWei('1.5'));
    const recipientHash = await context.ERC1820Registry
      .interfaceHash('ERC777TokensRecipient');

    expect(await context.ERC1820Registry.getInterfaceImplementer(
      context.Test.address, recipientHash,
      { gas: 300000, from: context.accounts[1] }))
      .to.be.equal('0x0000000000000000000000000000000000000000');

    await expectRevert(context.call.methods.send(
      context.Test.address, value.toString(), '0x0'
    ).send({ gas: 300000, from: context.accounts[0] }
    ), 'Cannot send to contract without ERC777TokensRecipient');

    expect(await context.call.methods.balanceOf(context.Test.address).call())
      .to.be.equal(oldBal.toString());
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 3 send 1.5 ${context.TOKEN_NAME} with data to random address (out of funds)`, async () => {
    expect(await context.call.methods.balanceOf(
      context.accounts[2]).call()).to.be.equal('0');
    const randomAddr = await genAddrs(1);
    const value = new BN(web3.utils.toWei('1.5'));

    await expectRevert(context.call.methods.send(
      randomAddr[0], value.toString(), '0xAAAAAA'
    ).send({ gas: 300000, from: context.accounts[2] }
    ), 'SafeMath: subtraction overflow');

    expect(await context.call.methods.balanceOf(context.accounts[2]).call())
      .to.be.equal('0');
    expect(await context.call.methods.balanceOf(randomAddr[0]).call())
      .to.be.equal('0');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1.5 ${context.TOKEN_NAME} with data to 0 address`, async () => {
    const oldBalOne = new BN(await context.call.methods.balanceOf(
      context.accounts[0]).call());
    const zeroAddr = `0x${Array(40).fill('0')
      .reduce((prev, next) => `${prev}${next}`)}`;
    const value = new BN(web3.utils.toWei('1.5'));

    await expectRevert(context.call.methods.send(
      zeroAddr, value.toString(), '0xAAAAAA'
    ).send({ gas: 300000, from: context.accounts[0] }
    ), 'Cannot send to 0x0');

    expect(await context.call.methods.balanceOf(context.accounts[0]).call())
      .to.be.equal(oldBalOne.toString());
    expect(await context.call.methods.balanceOf(zeroAddr).call())
      .to.be.equal('0');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1.5 ${context.TOKEN_NAME} with data to addr 2 using throwing sender callback`, async () => {
    const oldBalOne = new BN(await context.call.methods.balanceOf(
      context.accounts[0]).call());
    const oldBalOTwo = new BN(await context.call.methods.balanceOf(
      context.accounts[1]).call());
    const value = new BN(web3.utils.toWei('1.5'));
    const senderHash = await context.ERC1820Registry
      .interfaceHash('ERC777TokensSender');
    expect(await context.ERC1820Registry.setInterfaceImplementer(
      context.accounts[0], senderHash, context.TestTokensSender.address,
      { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);

    await expectRevert(context.call.methods.send(
      context.accounts[1], value.toString(), '0x01'
    ).send({ gas: 400000, from: context.accounts[0] }),
    'tokensToSend reverted');

    expect(await context.call.methods.balanceOf(context.accounts[0]).call())
      .to.be.equal(oldBalOne.toString());
    expect(await context.call.methods.balanceOf(context.accounts[1]).call())
      .to.be.equal(oldBalOTwo.toString());
    expect(await context.ERC1820Registry.setInterfaceImplementer(
      context.accounts[0], senderHash,
      '0x0000000000000000000000000000000000000000',
      { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1.5 ${context.TOKEN_NAME} with data to addr 2 using throwing receiver callback`, async () => {
    const oldBalOne = new BN(await context.call.methods.balanceOf(
      context.accounts[0]).call());
    const oldBalOTwo = new BN(await context.call.methods.balanceOf(
      context.accounts[1]).call());
    const value = new BN(web3.utils.toWei('1.5'));
    const recipientHash = await context.ERC1820Registry
      .interfaceHash('ERC777TokensRecipient');
    expect(await context.ERC1820Registry.setInterfaceImplementer(
      context.accounts[1], recipientHash, context.TestTokensRecipient.address,
      { gas: 300000, from: context.accounts[1] }))
      .to.have.nested.property('receipt.status', true);

    await expectRevert(context.call.methods.send(
      context.accounts[1], value.toString(), '0x01'
    ).send({ gas: 400000, from: context.accounts[0] }),
    'tokensReceived reverted');

    expect(await context.call.methods.balanceOf(context.accounts[0]).call())
      .to.be.equal(oldBalOne.toString());
    expect(await context.call.methods.balanceOf(context.accounts[1]).call())
      .to.be.equal(oldBalOTwo.toString());
    expect(await context.ERC1820Registry.setInterfaceImplementer(
      context.accounts[1], recipientHash,
      '0x0000000000000000000000000000000000000000',
      { gas: 300000, from: context.accounts[1] }))
      .to.have.nested.property('receipt.status', true);
  });
};
