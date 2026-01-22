const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');
const {interface, object:bytecode} = require('./compile');
const fs = require ("fs-extra");
require('dotenv').config();

const seed = process.env.MNEMONIC;
const providerUrl = process.env.PROVIDER_URL;

if (!seed || !providerUrl) {
  console.error("ERROR: MNEMONIC and PROVIDER_URL must be set in .env file");
  process.exit(1);
}

const provider = new HDWalletProvider({
  mnemonic: { phrase: seed },
  providerOrUrl: providerUrl
});
const web3 = new Web3(provider);

const deploy = async() => {
  try {
    const accounts = await web3.eth.getAccounts();
    console.log("Attempting to deploy from account", accounts[0]);

    const contract = new web3.eth.Contract(interface);

    const deployedContract = await contract.deploy({
      data: '0x' + bytecode,
      arguments: []
    }).send({
      from: accounts[0],
      gas: '5000000'
    });

    console.log("Contract deployed to", deployedContract.options.address);

    // Cleanup provider
    provider.engine.stop();

  } catch (error) {
    console.error("Deploy failed:", error.message);
    provider.engine.stop();
    process.exit(1);
  }
}

deploy();
