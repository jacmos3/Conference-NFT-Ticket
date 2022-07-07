const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const contractFileName = 'Conference.sol';
const contractName = 'Web3InTravelNFTTicket';

//const contractFileName = 'DonateDirectDAO.sol';
//const contractName = 'DonateDirectDAO';

const myPath = path.resolve(__dirname, 'contracts', contractFileName);
const buildPath = path.resolve(__dirname,'build');
const source = fs.readFileSync(myPath, 'utf8');

const myContract = {
    language: 'Solidity',
    sources: {[contractFileName]: {content: source}},
    settings: {
      outputSelection: {'*': {'*': ['*']}},
    "optimizer": {
       // Disabled by default.
       // NOTE: enabled=false still leaves some optimizations on. See comments below.
       // WARNING: Before version 0.8.6 omitting the 'enabled' key was not equivalent to setting
       // it to false and would actually disable all the optimizations.
       "enabled": true,
       // Optimize for how many times you intend to run the code.
       // Lower values will optimize more for initial deployment cost, higher
       // values will optimize more for high-frequency usage.
       "runs": 200,
       // Switch optimizer components on or off in detail.
       // The "enabled" switch above provides two defaults which can be
       // tweaked here. If "details" is given, "enabled" can be omitted.
     }
   }
}
console.log(myPath);
const output = JSON.parse(solc.compile(JSON.stringify(myContract))).contracts;
console.log(output);

//set to true if you want to generate new json file while compiling. i.e.
//if you changed the .sol file and you want to update the interface
const generateFolder = true;
if (generateFolder){
  fs.removeSync(buildPath);
  fs.ensureDirSync(buildPath);

  for(let contract in output){
    //there could be more than one contract in the same file, so we cycle it
    fs.outputJsonSync(
      path.resolve(buildPath,contract.replace(':','') + '.json'),
      output[contract]
    );
    console.log(output[contract]);
  }

  console.log("exported to file system");
}

//we now export the main contract.
const {abi: interface, evm: {bytecode:{object}}} = output[contractFileName][contractName];
module.exports = {interface, object};
