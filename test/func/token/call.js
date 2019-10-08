const { expect } = require('chai');
const { getAddrTokBals, genAddrs, expectEvent } = require('../../utils');

exports.test = function(f) {
  const context = f;

  before(async () => {
    context.call = await context.CALL.deployed();
    // Workaround for truffle send bug
    context.callW = new web3.eth.Contract(
      context.CALL.abi, context.CALL.address);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 transfer 1 ${context.TOKEN_NAME} to 5 random addresses (ERC20)`, async () => {
    const addrs = await genAddrs(5);
    const addrBals = Array(5).fill(web3.utils.toWei('1'));
    expect(await context.call.multiPartyTransfer(addrs, addrBals
      , { gas: 3000000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
    expect((await getAddrTokBals(context.call, addrs))
      .map((bal) => bal.toString())
    ).to.be.deep.equal(addrBals);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 2 transfer 1 ${context.TOKEN_NAME} in behalf of addr 1 to 5 random addresses (ERC20)`, async () => {
    const addrs = await genAddrs(5);
    const addrBals = Array(5).fill(web3.utils.toWei('1'));
    const totalAppr = addrBals
      .reduce((fir, sec) => parseInt(fir) + parseInt(sec))
      .toFullString();

    await expectEvent.inLogs((await context.call.approve(
      context.accounts[1],
      totalAppr,
      { gas: 300000, from: context.accounts[0] }
    )).logs, 'Approval', {
      owner: context.accounts[0],
      spender: context.accounts[1],
      value: totalAppr,
    });
    expect(await context.call.multiPartyTransferFrom(
      context.accounts[0], addrs, addrBals,
      { gas: 3000000, from: context.accounts[1] }))
      .to.have.nested.property('receipt.status', true);

    expect(await context.call.allowance(
      context.accounts[0], context.accounts[1]
    )).to.be.bignumber.equal('0');

    expect((await getAddrTokBals(context.call, addrs))
      .map((bal) => bal.toString())
    ).to.be.deep.equal(addrBals);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 transfer 1 ${context.TOKEN_NAME} to 5 random addresses without data (ERC777)`, async () => {
    const addrs = await genAddrs(5);
    const addrBals = Array(5).fill(web3.utils.toWei('1'));

    expect(await context.callW.methods.multiPartySend(
      addrs, addrBals, '0x0',
    ).send({ gas: 900000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect((await getAddrTokBals(context.call, addrs))
      .map((bal) => bal.toString())
    ).to.be.deep.equal(addrBals);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 1 transfer 1 ${context.TOKEN_NAME} to 5 random addresses with data (ERC777)`, async () => {
    const addrs = await genAddrs(5);
    const addrBals = Array(5).fill(web3.utils.toWei('1'));

    expect(await context.callW.methods.multiPartySend(
      addrs, addrBals, '0xAAAAAA'
    ).send({ gas: 900000, from: context.accounts[0] }
    )).to.have.property('status', true);

    expect((await getAddrTokBals(context.call, addrs))
      .map((bal) => bal.toString())
    ).to.be.deep.equal(addrBals);
  });

  // eslint-disable-next-line max-len
  it('should able for address 1 to change balances db address with random', async () => {
    const oldBalDB = await context.call.balancesDB();
    const randAddr = await genAddrs(1);

    expect(await context.call.changeBalancesDB(randAddr[0]
      , { gas: 50000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
    expect(await context.call.balancesDB()).to.not.be.equal(oldBalDB);
    expect(await context.call.changeBalancesDB(oldBalDB
      , { gas: 50000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
    expect(await context.call.balancesDB()).to.be.equal(oldBalDB);
  });

  // eslint-disable-next-line max-len
  it('should able for address 1 to to authorize address 2 as operator', async () => {
    expect(await context.call.authorizeOperator(context.accounts[1]
      , { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
  });

  // eslint-disable-next-line max-len
  it('should able for address 1 to to revoke authorization of address 2 as operator', async () => {
    expect(await context.call.revokeOperator(context.accounts[1]
      , { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 2 transfer 1 ${context.TOKEN_NAME} in behalf of addr 1 to 1 random address with data (ERC777)`, async () => {
    const addr = await genAddrs(1);
    const addrBal = web3.utils.toWei('1');

    expect(await context.call.authorizeOperator(context.accounts[1]
      , { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);

    expect(await context.callW.methods.operatorSend(
      context.accounts[0], addr[0], addrBal, '0xAAAAAA', '0xAAAAAA'
    ).send({ gas: 900000, from: context.accounts[1] }
    )).to.have.property('status', true);

    expect(await context.call.revokeOperator(context.accounts[1]
      , { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
  });

  // eslint-disable-next-line max-len
  it(`should let addr 2 transfer 1 ${context.TOKEN_NAME} in behalf of addr 1 to 5 random address with data (ERC777)`, async () => {
    const addr = await genAddrs(5);
    const addrBal = Array(5).fill(web3.utils.toWei('1'));

    expect(await context.call.authorizeOperator(context.accounts[1]
      , { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);

    expect(await context.callW.methods.multiOperatorSend(
      context.accounts[0], addr, addrBal, '0xAAAAAA', '0xAAAAAA'
    ).send({ gas: 3000000, from: context.accounts[1] }
    )).to.have.property('status', true);

    expect(await context.call.revokeOperator(context.accounts[1]
      , { gas: 300000, from: context.accounts[0] }))
      .to.have.nested.property('receipt.status', true);
  });
};
