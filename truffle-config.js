module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: 999,
      gas: 7996000,
      gasPrice: 2000000000,
    },
    live: {
      host: 'infura.io',
      port: 80,
      network_id: 1,
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x01,
    },
  },
  compilers: {
    solc: {
      version: "0.5.8",
    },
  },
};
