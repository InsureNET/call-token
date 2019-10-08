const expect = require('chai').expect;
require('../../utils');

exports.test = (f) => {
  const context = f;

  before(async () => {
    context.call = await context.CALL.deployed();
  });

  it(`should have the name ${context.TOKEN_NAME}`, async () => {
    expect(await context.call.name()).to.be.equal(context.TOKEN_NAME);
  });

  it(`should have the symbol "${context.TOKEN_SYM}"`, async () => {
    expect(await context.call.symbol()).to.be.equal(context.TOKEN_SYM);
  });

  it('should have a granularity of 0.01', async () => {
    const granularity = await context.call.granularity();
    expect(web3.utils.fromWei(granularity)).to.be.equal('0.01');
  });

  // eslint-disable-next-line max-len
  it(`should have a total supply of ${context.TOTAL_SUPPLY.toFullString()}`, async () => {
    expect(await context.call.totalSupply())
      .to.be.bignumber.equal(context.TOTAL_SUPPLY.toFullString());
  });

  // eslint-disable-next-line max-len
  it(`should have balances of "0" for all accounts except 1 with ${context.TOTAL_SUPPLY.toFullString()}`, async () => {
    for (let account of context.accounts) {
      if (context.accounts[0] === account) continue;
      expect(await context.call.balanceOf(account)).to.be.bignumber.equal('0');
    }
    expect(await context.call.balanceOf(context.accounts[0]))
      .to.be.bignumber.equal(context.TOTAL_SUPPLY.toFullString());
  });
};
