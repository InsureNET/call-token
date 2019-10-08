const { BN } = require('../../utils');
const { expectRevert } = require('../../utils');

exports.test = (f) => {
  const context = f;

  before(async () => {
    context.call = await context.CALL.deployed();
    const callAddr = await context.call.balancesDB();
    context.cstore = new web3.eth.Contract(
      context.CSTORE.abi, callAddr);
  });

  it('should not be able to increase total supply from addr 2', async () => {
    const oldTotSup = new BN(await context.cstore.methods.totalSupply().call());

    await expectRevert(context.cstore.methods.incTotalSupply(
      oldTotSup.add(new BN('1')).toString())
      .send({ from: context.accounts[1] }),
    'ERC644Balances: caller is not a module');

    expect(await context.cstore.methods.totalSupply().call())
      .to.be.equal(oldTotSup.toString());
  });

  it('should not be able to decrease total supply from addr 2', async () => {
    const oldTotSup = new BN(await context.cstore.methods.totalSupply().call());

    await expectRevert(context.cstore.methods.decTotalSupply(
      oldTotSup.sub(new BN('1')).toString())
      .send({ from: context.accounts[1] }),
    'ERC644Balances: caller is not a module');

    expect(await context.cstore.methods.totalSupply().call())
      .to.be.equal(oldTotSup.toString());
  });

  it('should not be for addr 1 to be a module', async () => {
    expect(await context.cstore.methods.getModule(context.accounts[0]).call())
      .to.be.equal(false);
  });
};
