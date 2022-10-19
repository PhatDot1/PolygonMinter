import airtable from "airtable";

const base = new airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  "appMxsw3zihH6FLoi"
);

var table;

var writeToBase = async (
  objectToMint,
  newStatus,
  indexOfNFT,
  etherscanLinkToTx
) => {
  var updateArray;

  if (newStatus == "Success") {
    updateArray = [
      {
        id: objectToMint.recordId,
        fields: {
          "Certificate Status": newStatus,
          "Certificate ID": `${indexOfNFT}`,
          "Link to NFT": etherscanLinkToTx,
          "Link to Opensea": `${process.env.OPENSEA_DOMAIN}/${process.env.NFT_CONTRACT_ADDRESS}/${indexOfNFT}`,
        },
      },
    ];
  } else {
    updateArray = [
      {
        id: objectToMint.recordId,
        fields: {
          "Certificate Status": newStatus,
        },
      },
    ];
  }

  base("📜 Certificates").update(updateArray).catch(console.error);
};

var fetchFromBase = async () => {
  var mintableObjects = [];

  var filterFormula =
    "AND(({Certificate Status} = 'Ready'), ({Certificate ID} = ''), ({Link to NFT} = ''), (NOT({ETH address (from ☃️ People)}) = ''))";

  await base("📜 Certificates")
    .select({
      view: "Grid view",
      filterByFormula: filterFormula,
    })
    .eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(function (record) {
        var objectToMint = {
          recordId: record.id,
          name: record.get("Name (from ☃️ People)")[0],
          email: record.get("Email (from ☃️ People)")[0],
          ethAddress: record.get("ETH address (from ☃️ People)")[0],
          programmeName: record.get("Programme name (from 📺 Programmes)")[0],
          programmeType: record.get("Type (from 📺 Programmes)")[0],
          certImage: record.get("Certificate image (from 📺 Programmes)")[0]
            .url,
          achievementLevel: record.get("Achievement level"),
        };

        mintableObjects.push(objectToMint);
      });

      fetchNextPage();
    })
    .then((result) => {});

  return mintableObjects;
};

table = {
  fetchFromBase: fetchFromBase,
  writeToBase: writeToBase,
};

export default table;
