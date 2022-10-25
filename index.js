import "dotenv/config";
import cron from "node-cron";
import ethers, { BigNumber } from "ethers";
import nodeFetch from "node-fetch";
import pinataSDK from "@pinata/sdk";

import fs from "fs";

import table from "./helpers/table.js";
import print from "./helpers/print.js";
import utils from "./helpers/utils.js";
import mailer from "./helpers/mailer.js";

const provider = new ethers.providers.InfuraProvider(
  process.env.NETWORK,
  process.env.INFURA_PROJECT_ID
);
const wallet = new ethers.Wallet(process.env.DEPLOYER_KEY, provider);
const signer = wallet.connect(provider);

const etherscanUrl = `${process.env.ETHERSCAN_ENDPOINT}/api?module=contract&action=getabi&address=${process.env.NFT_CONTRACT_ADDRESS}&apikey=${process.env.ETHERSCAN_KEY}`;
const etherscanResponse = await nodeFetch(etherscanUrl);

const abiForContract = (await etherscanResponse.json()).result;

const nftContract = new ethers.Contract(
  process.env.NFT_CONTRACT_ADDRESS,
  abiForContract,
  signer
);

const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);

var isRunning = false;

cron.schedule("*/1 * * * * *", async () => {
  console.log("Running a task every X seconds");

  if (isRunning === false) {
    isRunning = true;

    var mintableObjects = await table.fetchFromBase();

    for (let index = 0; index < mintableObjects.length; index++) {
      console.log("Start minting process");

      const objectToMint = mintableObjects[index];

      await mintNFT(objectToMint);

      console.log("Done with minting process");
    }

    isRunning = false;
  }
});

async function mintNFT(objectToMint) {
  await table.writeToBase(objectToMint, "Pending");

  var indexOfNFTToMint = (await nftContract.totalSupply()).toNumber();

  var fileNameOfNFTImage = await print.createImageForData(
    indexOfNFTToMint,
    objectToMint
  );

  const readableStreamForFile = fs.createReadStream(fileNameOfNFTImage);
  var ipfsHashImage = (await pinata.pinFileToIPFS(readableStreamForFile))
    .IpfsHash;
  fs.unlinkSync(fileNameOfNFTImage);

  var jsonBody = await utils.createJsonforData(
    indexOfNFTToMint,
    objectToMint,
    ipfsHashImage
  );
  const options = {
    pinataMetadata: { name: `Encode Certificate #${indexOfNFTToMint}` },
  };
  var ipfsHashJson = (await pinata.pinJSONToIPFS(jsonBody, options)).IpfsHash;

  const gasResponse = await nodeFetch(
    "https://gasstation-mainnet.matic.network/v2"
  );

  var maxFee = (await gasResponse.json()).fast.maxFee;
  var maxFeeBigNumber = ethers.utils.parseUnits(Math.ceil(maxFee) + "", "gwei");

  let transactionResponse = await nftContract.safeMint(
    objectToMint.ethAddress,
    `https://encode.mypinata.cloud/ipfs/${ipfsHashJson}`,
    { gasPrice: maxFeeBigNumber }
  );

  var transcationReceipt = await transactionResponse.wait();

  var indexOfNFT = parseInt(transcationReceipt.logs[0].topics[3], 16);
  var transactionHash = transcationReceipt.logs[0].transactionHash;

  var newStatus = "Success";
  var etherscanLinkToTx = `${process.env.ETHERSCAN_DOMAIN}/tx/${transactionHash}`;

  if (indexOfNFT != indexOfNFTToMint) {
    newStatus = "Error";
  }

  await table.writeToBase(
    objectToMint,
    newStatus,
    indexOfNFT,
    etherscanLinkToTx
  );

  if (newStatus == "Success") {
    //Send email after delay so Opensea metadata has time to refresh
    //Email is fire and forget (you don't need to wait for the task to finish)

    setTimeout(() => {
      mailer.emailUserAfterMint(
        objectToMint.email,
        objectToMint.programmeName,
        objectToMint.name,
        objectToMint.programmeType,
        indexOfNFT,
        etherscanLinkToTx,
        objectToMint.ethAddress
      );
    }, 1000 * 60);
  }
}
