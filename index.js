// Import necessary modules
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

// Set up provider, wallet, and signer using Infura
const provider = new ethers.providers.InfuraProvider(
  process.env.NETWORK,
  process.env.INFURA_PROJECT_ID
);
const wallet = new ethers.Wallet(process.env.DEPLOYER_KEY, provider);
const signer = wallet.connect(provider);

// Fetch the ABI for the NFT contract
const etherscanUrl = `${process.env.ETHERSCAN_ENDPOINT}/api?module=contract&action=getabi&address=${process.env.NFT_CONTRACT_ADDRESS}&apikey=${process.env.ETHERSCAN_KEY}`;
const etherscanResponse = await nodeFetch(etherscanUrl);
const abiForContract = (await etherscanResponse.json()).result;

// Create an instance of the NFT contract
const nftContract = new ethers.Contract(
  process.env.NFT_CONTRACT_ADDRESS,
  abiForContract,
  signer
);

// Create an instance of the Pinata SDK
const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);

// Set a flag to track whether the minting process is already running
var isRunning = false;

// Define a function to pause execution for a given number of milliseconds
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Schedule a cron job to run every 10 seconds
cron.schedule("*/10 * * * * *", async () => {
  //console.log("Running a task every 10 seconds");

  if (isRunning === false) {
    isRunning = true;

    var mintableObjects = await table.fetchFromBase();

    for (let index = 0; index < mintableObjects.length; index++) {
      console.log("Start minting process");

      const objectToMint = mintableObjects[index];

      await table.writeToBase(objectToMint, "Pending");

      //await sleep(1000 * 30);

      await mintNFT(objectToMint);

      console.log("Done with minting process");
    }

    isRunning = false;
  }
});

async function mintNFT(objectToMint) {
  console.log("objectToMint: ", objectToMint);
  var indexOfNFTToMint = (await nftContract.totalSupply()).toNumber();

  console.log("indexOfNFTToMint: ", indexOfNFTToMint);

  let fileNameOfNFTImage;

  try {
    fileNameOfNFTImage = await print.createImageForData(
      indexOfNFTToMint,
      objectToMint
    );
  } catch (error) {
    console.error("Error while creating image:", error);

    await table.writeToBase(objectToMint, "Error");
    return;
  }

  console.log("fileNameOfNFTImage: ", fileNameOfNFTImage);

  const readableStreamForFile = fs.createReadStream(fileNameOfNFTImage);

  let ipfsHashImage;

  try {
    ipfsHashImage = (await pinata.pinFileToIPFS(readableStreamForFile))
      .IpfsHash;
  } catch (error) {
    console.error("Error while pinning image to IPFS:", error);

    await table.writeToBase(objectToMint, "Error");
    return;
  }

  console.log("ipfsHashImage: ", ipfsHashImage);

  fs.unlinkSync(fileNameOfNFTImage);

  var jsonBody = await utils.createJsonforData(
    indexOfNFTToMint,
    objectToMint,
    ipfsHashImage
  );

  console.log("jsonBody: ", jsonBody);

  const options = {
    pinataMetadata: { name: `Encode Certificate #${indexOfNFTToMint}` },
  };

  let ipfsHashJson;

  try {
    ipfsHashJson = (await pinata.pinJSONToIPFS(jsonBody, options)).IpfsHash;
  } catch (error) {
    console.error("Error while pinning JSON to IPFS:", error);

    await table.writeToBase(objectToMint, "Error");
    return;
  }

  console.log("ipfsHashJson: ", ipfsHashJson);

  const gasResponse = await nodeFetch(
    "https://gasstation-mainnet.matic.network/v2"
  );

  console.log("gasResponse: ", gasResponse);

  var maxFee = (await gasResponse.json()).fast.maxFee;
  var maxFeeBigNumber = ethers.utils.parseUnits(
    Math.ceil(maxFee + 50) + "",
    "gwei"
  );

  console.log("maxFee: ", maxFee);
  console.log("maxFeeBigNumber: ", maxFeeBigNumber);

  let transactionResponse;

  try {
    transactionResponse = await nftContract.safeMint(
      objectToMint.ethAddress,
      `https://gateway.pinata.cloud/ipfs/${ipfsHashJson}`,
      { gasPrice: maxFeeBigNumber }
    );
  } catch (error) {
    console.error("An error occurred during the safeMint process:", error);

    if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
      // Leave the status to Ready so it will try again once it is done with the rest of the list.
      await table.writeToBase(objectToMint, "Ready");
    } else {
      await table.writeToBase(objectToMint, "Error");
    }

    return;
  }

  console.log("transactionResponse: ", transactionResponse);

  var transcationReceipt = await transactionResponse.wait();

  var indexOfNFT = parseInt(transcationReceipt.logs[0].topics[3], 16);
  var transactionHash = transcationReceipt.logs[0].transactionHash;

  console.log("transactionHash", transactionHash);

  var newStatus = "Success";
  var etherscanLinkToTx = `${process.env.ETHERSCAN_DOMAIN}/tx/${transactionHash}`;

  console.log("etherscanLinkToTx: ", etherscanLinkToTx);

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
    //Send email after delay so Opensea metadata has time to refresh - 5mins

    setTimeout(() => {
      console.log("Send Email");

      mailer
        .emailUserAfterMint(
          objectToMint.email,
          objectToMint.programmeName,
          objectToMint.name,
          objectToMint.programmeType,
          indexOfNFT,
          etherscanLinkToTx,
          objectToMint.ethAddress
        )
        .then(function (result) {
          console.log("Update Email Status: ", result);

          table.writeToBase(
            objectToMint,
            result,
            indexOfNFT,
            etherscanLinkToTx
          );
        });
    }, 1000 * 60 * 5);
  }
}
