const { expect } = require('chai');
const { BN, genAddrs, singletons } = require('../../utils');

exports.test = function(f) {
  const context = f;

  before(async () => {
    context.ERC1820Registry = await singletons.ERC1820Registry();
    context.test = await context.Test.deployed();
    // Workaround for truffle send bug
    context.callW = new web3.eth.Contract(
      context.CALL.abi, context.CALL.address);
    expect(await context.callW.methods.disableERC20().send(
      { gas: 300000, from: context.accounts[0] }
    )).to.have.property('status', true);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 send 1.5 ${context.TOKEN_NAME} without data to random address`, async () => {
    const oldBalOne = new BN(await context.callW.methods.balanceOf(
      context.accounts[0]).call());
    const randomAddr = await genAddrs(1);
    const value = new BN(web3.utils.toWei('1.5'));

    expect(await context.callW.methods.send(
      randomAddr[0], value.toString(), '0x0'
    ).send({ gas: 300000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect(await context.callW.methods.balanceOf(context.accounts[0]).call())
      .to.satisfy(
        (newBal) => (new BN(newBal))
          .add(value).eq(oldBalOne));
    expect(await context.callW.methods.balanceOf(randomAddr[0]).call())
      .to.be.equal(value.toString());
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 send 1.5 ${context.TOKEN_NAME} with data to registered contract`, async () => {
    const oldBal = new BN(await context.callW.methods.balanceOf(
      context.Test.address).call());
    const value = new BN(web3.utils.toWei('1.5'));
    expect(await context.test.setInterface(
      'ERC777TokensRecipient', context.TestTokensRecipient.address,
      { gas: 600000, from: context.accounts[0] })
    ).to.have.nested.property('receipt.status', true);

    expect(await context.callW.methods.send(
      context.Test.address, value.toString(), '0x00'
    ).send({ gas: 400000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect(await context.test.setInterface(
      'ERC777TokensRecipient', '0x0000000000000000000000000000000000000000',
      { gas: 300000, from: context.accounts[0] })
    ).to.have.nested.property('receipt.status', true);

    expect(await context.callW.methods.balanceOf(context.Test.address).call())
      .to.satisfy(
        (newBal) => (new BN(newBal))
          .sub(value).eq(oldBal));
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 send 1.5 ${context.TOKEN_NAME} with data to random address`, async () => {
    const oldBalOne = new BN(await context.callW.methods.balanceOf(
      context.accounts[0]).call());
    const randomAddr = await genAddrs(1);
    const value = new BN(web3.utils.toWei('1.5'));

    expect(await context.callW.methods.send(
      randomAddr[0], value.toString(), '0xAAAAAA'
    ).send({ gas: 300000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect(await context.callW.methods.balanceOf(context.accounts[0]).call())
      .to.satisfy(
        (newBal) => (new BN(newBal))
          .add(value).eq(oldBalOne));
    expect(await context.callW.methods.balanceOf(randomAddr[0]).call())
      .to.be.equal(value.toString());
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 send 1.5 ${context.TOKEN_NAME} with data to addr 2 using sender callback`, async () => {
    const oldBalOne = new BN(await context.callW.methods.balanceOf(
      context.accounts[0]).call());
    const oldBalOTwo = new BN(await context.callW.methods.balanceOf(
      context.accounts[1]).call());
    const value = new BN(web3.utils.toWei('1.5'));
    expect(await context.test.setInterface(
      'ERC777TokensSender', context.TestTokensSender.address,
      { gas: 600000, from: context.accounts[0] })
    ).to.have.nested.property('receipt.status', true);

    expect(await context.callW.methods.send(
      context.accounts[1], value.toString(), '0x00'
    ).send({ gas: 400000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect(await context.callW.methods.balanceOf(context.accounts[0]).call())
      .to.satisfy(
        (newBal) => (new BN(newBal)).add(value).eq(oldBalOne));
    expect(await context.callW.methods.balanceOf(context.accounts[1]).call())
      .to.satisfy(
        (newBal) => (new BN(newBal))
          .sub(value).eq(oldBalOTwo));
    expect(await context.test.setInterface(
      'ERC777TokensSender', '0x0000000000000000000000000000000000000000',
      { gas: 600000, from: context.accounts[0] })
    ).to.have.nested.property('receipt.status', true);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 send 1.5 ${context.TOKEN_NAME} with data to addr 2 using receiver callback`, async () => {
    const oldBalOne = new BN(await context.callW.methods.balanceOf(
      context.accounts[0]).call());
    const oldBalOTwo = new BN(await context.callW.methods.balanceOf(
      context.accounts[1]).call());
    const value = new BN(web3.utils.toWei('1.5'));
    expect(await context.test.setInterface(
      'ERC777TokensRecipient', context.TestTokensRecipient.address,
      { gas: 600000, from: context.accounts[1] })
    ).to.have.nested.property('receipt.status', true);

    expect(await context.callW.methods.send(
      context.accounts[1], value.toString(), '0x00'
    ).send({ gas: 400000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect(await context.callW.methods.balanceOf(context.accounts[0]).call())
      .to.satisfy(
        (newBal) => (new BN(newBal)).add(value).eq(oldBalOne));
    expect(await context.callW.methods.balanceOf(context.accounts[1]).call())
      .to.satisfy(
        (newBal) => (new BN(newBal))
          .sub(value).eq(oldBalOTwo));
    expect(await context.test.setInterface(
      'ERC777TokensRecipient', '0x0000000000000000000000000000000000000000',
      { gas: 600000, from: context.accounts[1] })
    ).to.have.nested.property('receipt.status', true);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 send 1.5 ${context.TOKEN_NAME} with data to addr 2 using sender/reciver callbacks`, async () => {
    const oldBalOne = new BN(await context.callW.methods.balanceOf(
      context.accounts[0]).call());
    const oldBalOTwo = new BN(await context.callW.methods.balanceOf(
      context.accounts[1]).call());
    const value = new BN(web3.utils.toWei('1.5'));
    const senderHash = await context.ERC1820Registry
      .interfaceHash('ERC777TokensSender');
    const recipientHash = await context.ERC1820Registry
      .interfaceHash('ERC777TokensRecipient');
    expect(await context.ERC1820Registry.setInterfaceImplementer(
      context.accounts[0], senderHash, context.TestTokensSender.address,
      { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
    expect(await context.ERC1820Registry.setInterfaceImplementer(
      context.accounts[1], recipientHash, context.TestTokensRecipient.address,
      { gas: 300000, from: context.accounts[1] }))
      .to.have.nested.property('receipt.status', true);

    expect(await context.callW.methods.send(
      context.accounts[1], value.toString(), '0x00'
    ).send({ gas: 400000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect(await context.callW.methods.balanceOf(context.accounts[0]).call())
      .to.satisfy(
        (newBal) => (new BN(newBal)).add(value).eq(oldBalOne));
    expect(await context.callW.methods.balanceOf(context.accounts[1]).call())
      .to.satisfy(
        (newBal) => (new BN(newBal))
          .sub(value).eq(oldBalOTwo));
    expect(await context.ERC1820Registry.setInterfaceImplementer(
      context.accounts[0], senderHash, '0x0000000000000000000000000000000000000000',
      { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
    expect(await context.ERC1820Registry.setInterfaceImplementer(
      context.accounts[1], recipientHash, '0x0000000000000000000000000000000000000000',
      { gas: 300000, from: context.accounts[1] }))
      .to.have.nested.property('receipt.status', true);
  });
};
