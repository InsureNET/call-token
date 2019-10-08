const randomBytes = require('random-bytes');
const eip55 = require('eip55');
const { BN, constants, expectEvent, expectRevert, singletons } = require(
  'openzeppelin-test-helpers');

const genAddrs = (num) => {
  let randBytes = [];

  for (let i = 0; i < num; i++) {
    randBytes.push((async () => {
      return eip55.encode(`0x${
        Buffer.from(
          await randomBytes(20)
        ).toString('hex')
      }`);
    })());
  }
  return Promise.all(randBytes);
};

const getAddrTokBals = (contract, addrs) => {
  let bals = [];

  for (let addr of addrs) {
    bals.push(contract.balanceOf(addr));
  }
  return Promise.all(bals);
};

// eslint-disable-next-line no-extend-native
Number.prototype.toFullString = function() {
  return this.toLocaleString('fullwide', { useGrouping: false });
};

module.exports = {
  getAddrTokBals,
  genAddrs,
  BN,
  constants,
  expectEvent,
  expectRevert,
  singletons,
};
