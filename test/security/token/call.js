const { expect } = require('chai');
const { expectRevert, genAddrs } = require('../../utils');

exports.test = function(f) {
  const context = f;

  before(async () => {
    context.call = await context.CALL.deployed();
    // Workaround for truffle send bug
    context.callW = new web3.eth.Contract(
      context.CALL.abi, context.CALL.address);
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 transfer 1 ${context.TOKEN_NAME} to addresses with unequal address -> balance arrays (ERC20)`, async () => {
    const addrs = await genAddrs(5);
    const addrBals = Array(4).fill(web3.utils.toWei('1'));
    await expectRevert(context.call.multiPartyTransfer(addrs, addrBals,
      { gas: 3000000, from: context.accounts[0] }),
    'Provided addresses does not equal to provided sums.');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 transfer 1 ${context.TOKEN_NAME} to 256 addresses (ERC20)`, async () => {
    const addrs = await genAddrs(256);
    const addrBals = Array(256).fill(web3.utils.toWei('1'));

    await expectRevert(context.call.multiPartyTransfer(addrs, addrBals,
      { gas: 3000000, from: context.accounts[0] }),
    'Unsupported number of addresses.');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 2 transfer 1 ${context.TOKEN_NAME} in behalf of addr 1 to addresses with unequal address -> balance arrays`, async () => {
    const addrs = await genAddrs(5);
    const addrBals = Array(4).fill(web3.utils.toWei('1'));

    expect(await context.call.approve(
      context.accounts[1],
      addrBals.reduce((fir, sec) => fir + sec),
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    await expectRevert(context.call.multiPartyTransferFrom(context.accounts[0],
      addrs, addrBals, { gas: 3000000, from: context.accounts[1] }),
    'Provided addresses does not equal to provided sums.');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 2 transfer 1 ${context.TOKEN_NAME} in behalf of addr 1 to 256 addresses (ERC20)`, async () => {
    const addrs = await genAddrs(256);
    const addrBals = Array(256).fill(web3.utils.toWei('1'));

    expect(await context.call.approve(
      context.accounts[1],
      addrBals.reduce((fir, sec) => fir + sec),
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    await expectRevert(context.call.multiPartyTransferFrom(context.accounts[0],
      addrs, addrBals, { gas: 3000000, from: context.accounts[1] }),
    'Unsupported number of addresses.');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1 ${context.TOKEN_NAME} without data to addresses with unequal address -> balance arrays (ERC777)`, async () => {
    const addrs = await genAddrs(5);
    const addrBals = Array(4).fill(web3.utils.toWei('1'));

    await expectRevert(context.call.multiPartySend(addrs, addrBals, '0x0'
      , { gas: 3000000, from: context.accounts[0] }),
    'Provided addresses does not equal to provided sums.');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1 ${context.TOKEN_NAME} without data to 256 addresses (ERC777)`, async () => {
    const addrs = await genAddrs(256);
    const addrBals = Array(256).fill(web3.utils.toWei('1'));

    await expectRevert(context.call.multiPartySend(addrs, addrBals, '0x0'
      , { gas: 3000000, from: context.accounts[0] }),
    'Unsupported number of addresses.');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1 ${context.TOKEN_NAME} with data to addresses with unequal address -> balance arrays (ERC777)`, async () => {
    const addrs = await genAddrs(5);
    const addrBals = Array(4).fill(web3.utils.toWei('1'));

    await expectRevert(context.callW.methods.multiPartySend(
      addrs, addrBals, '0x01'
    ).send({ gas: 400000, from: context.accounts[0] }),
    'Provided addresses does not equal to provided sums.');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 1 send 1 ${context.TOKEN_NAME} with data to 256 addresses (ERC777)`, async () => {
    const addrs = await genAddrs(256);
    const addrBals = Array(256).fill(web3.utils.toWei('1'));

    await expectRevert(context.callW.methods.multiPartySend(
      addrs, addrBals, '0x01'
    ).send({ gas: 900000, from: context.accounts[0] }),
    'Unsupported number of addresses.');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 2 in behalf of addr 1 send 1 ${context.TOKEN_NAME} with data to addresses with unequal address -> balance arrays (ERC777)`, async () => {
    const addrs = await genAddrs(5);
    const addrBals = Array(4).fill(web3.utils.toWei('1'));

    await expectRevert(context.callW.methods.multiOperatorSend(
      context.accounts[0], addrs, addrBals, '0xAAAAAA', '0xAAAAAA'
    ).send({ gas: 1000000, from: context.accounts[1] }),
    'Provided addresses does not equal to provided sums.');
  });

  // eslint-disable-next-line max-len
  it(`should not let addr 2 in behalf of addr 1 send 1 ${context.TOKEN_NAME} with data to 256 addresses (ERC777)`, async () => {
    const addrs = await genAddrs(256);
    const addrBals = Array(256).fill(web3.utils.toWei('1'));

    await expectRevert(context.callW.methods.multiOperatorSend(
      context.accounts[0], addrs, addrBals, '0xAAAAAA', '0xAAAAAA'
    ).send({ gas: 1000000, from: context.accounts[0] }),
    'Unsupported number of addresses.');
  });

  it('should not call ERC20 multi functions when disabled', async () => {
    const addrs = await genAddrs(1);
    const addrBals = Array(1).fill(web3.utils.toWei('1'));
    const addrSum = addrBals
      .reduce((fir, sec) => parseInt(fir) + parseInt(sec));

    expect(await context.call.approve(
      context.accounts[1],
      addrSum,
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    expect(await context.call.allowance(
      context.accounts[0], context.accounts[1]
    )).to.be.bignumber.equal(addrSum);

    expect(await context.call.disableERC20(
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);

    await expectRevert(context.call.multiPartyTransfer(addrs, addrBals
      , { gas: 3000000, from: context.accounts[0] }),
    'ERC20 is disabled');

    await expectRevert(context.call.multiPartyTransferFrom(context.accounts[0],
      addrs, addrBals, { gas: 3000000, from: context.accounts[1] }),
    'ERC20 is disabled');

    expect(await context.call.enableERC20(
      { gas: 300000, from: context.accounts[0] }
    )).to.have.nested.property('receipt.status', true);
  });

  // eslint-disable-next-line max-len
  it('should not able for address 2 to change balances db address with random', async () => {
    const oldBalDB = await context.call.balancesDB();
    const randAddr = await genAddrs(1);

    await expectRevert(context.call.changeBalancesDB(randAddr[0]
      , { gas: 50000, from: context.accounts[1] }),
    'Ownable: caller is not the owner');
    expect(await context.call.balancesDB()).to.be.equal(oldBalDB);
  });

  // eslint-disable-next-line max-len
  it('should not able for address 1 to to authorize address 1 as operator', async () => {
    await expectRevert(context.call.authorizeOperator(context.accounts[0]
      , { gas: 300000, from: context.accounts[0] }),
    'Cannot authorize yourself as an operator');
  });

  // eslint-disable-next-line max-len
  it('should not able for address 1 to to revoke authorization of address 1 as operator', async () => {
    await expectRevert(context.call.revokeOperator(context.accounts[0]
      , { gas: 300000, from: context.accounts[0] }),
    'Cannot revoke yourself as an operator');
  });

  // eslint-disable-next-line max-len
  it(`should not let unauthorized addr 2 transfer 1 ${context.TOKEN_NAME} in behalf of addr 1 to 1 random address with data (ERC777)`, async () => {
    const addr = await genAddrs(1);
    const addrBal = web3.utils.toWei('1');

    expect(await context.call.revokeOperator(context.accounts[1]
      , { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);

    await expectRevert(context.callW.methods.operatorSend(
      context.accounts[0], addr[0], addrBal, '0xAAAAAA', '0xAAAAAA'
    ).send({ gas: 900000, from: context.accounts[1] }
    ), 'Not an operator.');
  });
};
