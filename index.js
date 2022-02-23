
import 'dotenv/config'
import cron from 'node-cron';
import ethers from 'ethers';
import nodeFetch from 'node-fetch';
import pinataSDK from '@pinata/sdk';

import fs from 'fs';

import table from './table.js';
import print from './print.js';
import utils from './utils.js';
import mailer from './mailer.js'

const provider = new ethers.providers.InfuraProvider(process.env.NETWORK, process.env.INFURA_PROJECT_ID);
const wallet = new ethers.Wallet(process.env.DEPLOYER_KEY, provider);
const signer = wallet.connect(provider);

const etherscanUrl = `${process.env.ETHERSCAN_ENDPOINT}/api?module=contract&action=getabi&address=${process.env.NFT_CONTRACT_ADDRESS}&apikey=${process.env.ETHERSCAN_KEY}`;

const etherscanResponse = await nodeFetch(etherscanUrl);
const abiForContract = (await etherscanResponse.json()).result;

const nftContract = new ethers.Contract(process.env.NFT_CONTRACT_ADDRESS, abiForContract, signer);

const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);

var isRunning = false;

cron.schedule('*/30 * * * * *', async () => {

    console.log('Running a task every X seconds');

    if (isRunning === false) {
        isRunning = true;

        var mintableObjects = await table.fetchFromBase();

        for (let index = 0; index < mintableObjects.length; index++) {
            console.log('start');
            const objectToMint = mintableObjects[index];

            await table.writeToBase(objectToMint, "Pending");

            var indexOfNFTToMint = (await nftContract.totalSupply()).toNumber();

            var fileNameOfNFTImage = await print.createImageForData(indexOfNFTToMint, objectToMint);

            const readableStreamForFile = fs.createReadStream(fileNameOfNFTImage);
            var ipfsHashImage = (await pinata.pinFileToIPFS(readableStreamForFile)).IpfsHash;

            fs.unlinkSync(fileNameOfNFTImage);

            var jsonBody = await utils.createJsonforData(indexOfNFTToMint, objectToMint, ipfsHashImage);
            const options = {pinataMetadata: {name: `Encode Certificate #${indexOfNFTToMint}`}};
            var ipfsHashJson = (await pinata.pinJSONToIPFS(jsonBody, options)).IpfsHash;

            let transactionResponse = await nftContract.safeMint(objectToMint.ethAddress, `https://gateway.pinata.cloud/ipfs/${ipfsHashJson}`);
            var transcationReceipt = await transactionResponse.wait();

            var indexOfNFT = parseInt(transcationReceipt.logs[0].topics[3], 16);
            var transactionHash = transcationReceipt.logs[0].transactionHash;

            var newStatus = "Success";
            var etherscanLinkToTx = `${process.env.ETHERSCAN_DOMAIN}/tx/${transactionHash}`;

            if (indexOfNFT != indexOfNFTToMint) {
                newStatus = "Error";
            }

            await table.writeToBase(objectToMint, newStatus, indexOfNFT, etherscanLinkToTx);

            //Email is fire and forget (you don't need to wait for the task to finish);
            mailer.emailUserAfterMint(objectToMint.email, etherscanLinkToTx);
                
        }

        console.log("Done");
        isRunning = false;
    }

});

// Napravi template mail-a (pogledaj buildspace)
//Napravi Opeansea link - probably need to create a collection
//Napravi open tracking za email
//Napravi link tracking za email - awstrack.me

//Clean up import to module files + put them in the helpers directory (including enums.js)

//Tetiraj. Prvi test sa Ropstenom. Onda test na ropsten ali na digital ocean

//Prije nego ide live uploadaj novi contract na polygon i testiraj s njim. (tek onda pravi).
//Napravi novu development adresu za polygon
//Napravi nove apikey za sve (plati novom revolut)

//ERROR HANDLING. Ggdje god je upload or download ili neki internet kontakt pretpostavi da može fail-ati. Testiraj sve. Npr airtable, etherscan, infura, pinata, file write and read, MINTING the NFT
//Paziti gdje bi moglo doći do greške?!? - Error handling svuda dobar. Ako greška na status stavi greška za taj item

//Achievement level - HARDCODE values which are acceptable
// Ipmplement dynamic description per programme

//Za email staviti sliku za anthony.beaumont - drugi info da super izgleda u inbox.u
//namijestiti oauth permission per account (da manji security risk)

//Comment code verbosely 

