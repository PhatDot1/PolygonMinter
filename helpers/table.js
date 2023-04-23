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
  } else if (newStatus == "Email Success" || newStatus == "Email Error") {
    updateArray = [
      {
        id: objectToMint.recordId,
        fields: {
          "Email Status": newStatus,
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
    "AND(({Certificate Status} = 'Ready'), ({Certificate ID} = ''), ({Link to NFT} = ''))";

  await base("📜 Certificates")
    .select({
      view: "Grid view",
      pageSize: 50,
      maxRecords: 100,
      filterByFormula: filterFormula,
    })
    .eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(function (record) {
        if (
          record.get("Email (from ☃️ People)") == null ||
          record.get("ETH address (from ☃️ People)") == null
        ) {
          console.log("One of the values is null or undefined");

          base("📜 Certificates")
            .update([
              {
                id: record.id,
                fields: {
                  "Certificate Status": "Incomplete",
                },
              },
            ])
            .catch(console.error);
        } else {
          var emails = record.get("Email (from ☃️ People)")[0];
          var emailArray = emails.split(",");

          var objectToMint = {
            recordId: record.id,
            name: record.get("Name (from ☃️ People)")[0],
            email: emailArray[0],
            ethAddress: record.get("ETH address (from ☃️ People)"),
            programmeName: record.get("Programme name (from 📺 Programmes)")[0],
            programmeType: record.get("Type (from 📺 Programmes)")[0],
            certImage: record.get("Certificate image (from 📺 Programmes)")[0]
              .url,
            achievementLevel: record.get("Achievement level"),
          };

          mintableObjects.push(objectToMint);
        }
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
