const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, object:bytecode} = require('./compile');
const fs = require ("fs-extra");
require('dotenv').config();

const seed = process.env.MNEMONIC;
const providerUrl = process.env.PROVIDER_URL;
const provider = new HDWalletProvider(seed,providerUrl);
const web3 = new Web3(provider);
let littleTraveler;
let accounts;

const deploy = async() => {

  accounts = await web3.eth.getAccounts();
  console.log("Attempting to deploy from account", accounts[0]);

  littleTraveler = await new web3.eth.Contract(interface)
  .deploy({data:'0x'+bytecode, arguments: ["testname","testsymbol","testinitbaseuri","testnotrevealeduri","1000000000000000000","0","0x5685a60183DB6FF97dF2E289Cad2ed71EE0D6BfB","0x5685a60183DB6FF97dF2E289Cad2ed71EE0D6BfB","0x5685a60183DB6FF97dF2E289Cad2ed71EE0D6BfB"],})
  .send ({from: accounts[0]});

  console.log("Contract deployed to", littleTraveler.options.address);
  fs.writeFileSync('../.env.local', '#THIS IS AN AUTO-GENERATED FILE. DO NOT ADD ELEMENT HERE OR THEY WILL BE CANCELED AT YOUR NEXT DEPLOY\r\nNEXT_PUBLIC_CONTRACT_ADDRESS = "'
  + littleTraveler.options.address+'"');
}

deploy();
