import 'dotenv/config'
import cron from 'node-cron';
import fetch from './fetch.js';
import airtable from 'airtable';
import ethers from 'ethers';
import nodeFetch from 'node-fetch';

const base = new airtable({apiKey: process.env.AIRTABLE_KEY}).base('appMxsw3zihH6FLoi');

const provider = new ethers.providers.InfuraProvider(process.env.NETWORK, process.env.PROJECT_ID);
const wallet = new ethers.Wallet(process.env.DEPLOYER_KEY, provider);
const signer = wallet.connect(provider);

let etherscanUrl = 'https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=0x82c51047e293aF3242863aA9D5678731370A10b7&apikey=Z4MUF2AW7HZ8Z144R8T7FBEJ9BR9QM47KV';

var response = await nodeFetch(etherscanUrl);
var abiForContract = (await response.json()).result;

const nftContract = new ethers.Contract('0x82c51047e293aF3242863aA9D5678731370A10b7', abiForContract, signer);

let tx = await nftContract.tokenURI(0);
console.log(tx);

let isRunning = false;

var task = cron.schedule('*/5 * * * * *', async () => {

    console.log('Running a task every X seconds');

    if (isRunning === false) {
        isRunning = true;

        var mintableObjects = await fetch.fetchFromBase(base);
        console.log(mintableObjects);

        mintableObjects.forEach(objectToMint => {

            console.log('hola');
                
        });
        
        //Loop-aj kroz mintable object i za svaki:
        //Pročitaj zadnji broj minta-a sa blockchain-a (da znaš koji će biti ID)
        //Napravi sliku (Dolje lijev ime programa, Sredina level, dolje desno id) - Matko da napravi sliku
        //Uploadaj sliku na pinatu
        //Napravi json file
        //Uploadaj json file na pinatu
        //Mintaj NFT
        //Zapiši nazad u airtable da je mintano (Status + id)
        //Pošalji mail (OAUTH za gmail) - Napravi template mail-a (pogledaj buildspace)
        //Kad gotov loop namjests isRunning na false da cron radi dalje

        //Paziti gdje bi moglo doći do greške?!? - Error handling svuda dobar. Ako greška na status stavi greška za taj item

        //Tetiraj. Prvi test sa Ropstenom. Onda test na ropsten ali na digital ocean

        //Prije nego ide live uploadaj novi contract na polygon i testiraj s njim. (tek onda pravi). Prvi test sa Ropstenom
        //Napravi novu development adresu za polygon
        //Napravi nove apikey za sve (plati)

        console.log('should only run once until full mint process is done');

    }

});



