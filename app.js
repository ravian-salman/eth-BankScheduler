const express = require("express");
const path = require("path");
const cron = require("node-cron");
const fs = require("fs");
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx').Transaction;
var contractInfo = require('./contractABI');

const app = express();
const port = process.env.PORT || "8000";

const infura = "https://rinkeby.infura.io/v3/49909763e62f4e1f947ea70b2c343db2"
const web3 = new Web3(new Web3.providers.HttpProvider(infura));

var startBlock = 8625308;



app.listen(port, () => {
    cron.schedule("*/3 * * * * *", async function(){

        currentBlockNum = await web3.eth.getBlockNumber();
        diff = currentBlockNum - startBlock;

        console.log(currentBlockNum, startBlock);

        if (diff < 1){
            return;
        }

        startBlock = currentBlockNum;

        var abi = contractInfo.abi;
        var address = contractInfo.contractAddress;
        var toadd = address;
        var pk = "742e9a1647c8dc3a10898f9ec894557d8ef7f3756ae307d63135ba98cd7fdabf";
        web3.eth.defaultAccount = "0xC18DfE2c00aF4E328fe17687748823B516590Fb1";


        web3.eth.getTransactionCount(web3.eth.defaultAccount, function (err, nonce) {
            console.log("nonce value is ", nonce);
            const contract = new web3.eth.Contract(abi, address, {
            from: web3.eth.defaultAccount ,
            gas: 3000000,
            })
            const functionAbi = contract.methods.returnEth().encodeABI();
            var details = {
            "nonce": nonce,
            "gasPrice": web3.utils.toHex(web3.utils.toWei('47', 'gwei')),
            "gas": 300000,
            "to": address,
            "value": 0,
            "data": functionAbi,
            };
            const transaction = new EthereumTx(details, {chain: 'rinkeby'});
            transaction.sign(Buffer.from(pk, 'hex') );
            var rawData = '0x' + transaction.serialize().toString('hex');
            web3.eth.sendSignedTransaction(rawData)
            .on('transactionHash', function(hash){
            console.log(['transferToStaging Trx Hash:' + hash]);
            })
            .on('receipt', function(receipt){
            console.log(['transferToStaging Receipt:', receipt]);
            })
            .on('error', console.error);
            });        

        console.log("");
    } );

    console.log(`scheduler server start on port :${port}`);
  });



// 31 days = "0 */744 * * *""


