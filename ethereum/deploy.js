const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
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
let contract;
let accounts;

const deploy = async() => {

  accounts = await web3.eth.getAccounts();
  console.log("Attempting to deploy from account", accounts[0]);

  contract = await new web3.eth.Contract(interface)
  .deploy({data:'0x'+bytecode, arguments: [],})
  .send ({from: accounts[0]});

  console.log("Contract deployed to", contract.options.address);
  //fs.writeFileSync('../.env.local', '#THIS IS AN AUTO-GENERATED FILE. DO NOT ADD ELEMENT HERE OR THEY WILL BE CANCELED AT YOUR NEXT DEPLOY\r\nNEXT_PUBLIC_CONTRACT_ADDRESS = "'+ contract.options.address+'"');
}

deploy();
