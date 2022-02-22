
import config from './config/app.js';
import cron from 'node-cron';
import fetch from './fetch.js';
import airtable from 'airtable';

const base = new airtable({apiKey: config.database.airtableApiKey}).base('appMxsw3zihH6FLoi');

let isRunning = false;

cron.schedule('*/5 * * * * *', () => {

    console.log('Running a task every X seconds');

    if (isRunning === false) {
        isRunning = true;

        (async () => {

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

        })();

    }

});



