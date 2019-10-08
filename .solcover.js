module.exports = {
    compileCommand: 'node ../node_modules/truffle/build/cli.bundled.js compile',
    testCommand: 'node ../node_modules/truffle/build/cli.bundled.js test --network coverage',
    skipFiles: ['test'],
    copyPackages: ['openzeppelin-solidity', 'erc1820']
};
