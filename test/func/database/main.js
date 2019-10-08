const { expect } = require('chai');
const { BN } = require('../../utils');

exports.test = (f) => {
  const context = f;

  before(async () => {
    context.call = await context.CALL.deployed();
    const callAddr = await context.call.balancesDB();
    context.cstore = new web3.eth.Contract(
      context.CSTORE.abi, callAddr);
  });

  // eslint-disable-next-line max-len
  it('should be able to increase total supply from addr 1 (return false)', async () => {
    const oldTotSup = new BN(await context.cstore.methods.totalSupply().call());

    expect(await context.cstore.methods.setModule(
      context.accounts[0], true)
      .send({ from: context.accounts[0] }))
      .to.have.property('status', true);

    expect(await context.cstore.methods.incTotalSupply(
      oldTotSup.add(new BN('1')).toString())
      .send({ from: context.accounts[0] }))
      .to.have.property('status', true);

    expect(await context.cstore.methods.setModule(
      context.accounts[0], false)
      .send({ from: context.accounts[0] }))
      .to.have.property('status', true);

    expect(await context.cstore.methods.totalSupply().call())
      .to.be.equal(oldTotSup.toString());
  });

  // eslint-disable-next-line max-len
  it('should be able to decrease total supply from addr 1 (return false)', async () => {
    const oldTotSup = new BN(await context.cstore.methods.totalSupply().call());

    expect(await context.cstore.methods.setModule(
      context.accounts[0], true)
      .send({ from: context.accounts[0] }))
      .to.have.property('status', true);

    expect(await context.cstore.methods.decTotalSupply(
      oldTotSup.sub(new BN('1')).toString())
      .send({ from: context.accounts[0] }))
      .to.have.property('status', true);

    expect(await context.cstore.methods.setModule(
      context.accounts[0], false)
      .send({ from: context.accounts[0] }))
      .to.have.property('status', true);

    expect(await context.cstore.methods.totalSupply().call())
      .to.be.equal(oldTotSup.toString());
  });

  it('should be for token instance to be a module', async () => {
    expect(await context.cstore.methods.getModule(context.CALL.address).call())
      .to.be.equal(true);
  });
};
