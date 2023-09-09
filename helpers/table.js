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
  } else if (newStatus == "Email Success" || newStatus == "Email Error" || newStatus == "Sending Email") {
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
  var resendEmailObjects = [];

  var filterFormula =
    "AND(({Certificate Status} = 'Ready'), ({Certificate ID} = ''), ({Link to NFT} = ''))";

  await base("📜 Certificates")
    .select({
      view: "Grid view",
      pageSize: 25,
      maxRecords: 50,
      filterByFormula: filterFormula,
    })
    .eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach((record) => processRecord(record, mintableObjects));

      fetchNextPage();
    })
    .then((result) => {});

    var filterFormula2 = 
      "AND(({Email Status} = 'Resend Email'), NOT({Certificate ID} = ''), NOT({Link to NFT} = ''))";

    await base("📜 Certificates")
    .select({
      view: "Grid view",
      pageSize: 25,
      maxRecords: 50,
      filterByFormula: filterFormula2,
    })
    .eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach((record) => processRecord(record, resendEmailObjects));

      fetchNextPage();
    })
    .then((result) => {});

    return { mintable: mintableObjects, emailResend: resendEmailObjects };
};

function processRecord(record, filteredObjects) {
  if (
    record.get("Email (from ☃️ People)") == null ||
    record.get("ETH address (from ☃️ People)") == null ||
    record.get("Programme name (from 📺 Programmes)") == null ||
    record.get("Type (from 📺 Programmes)") == null ||
    record.get("Certificate image (from 📺 Programmes)") == null ||
    record.get("Achievement level") == null
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
    var name = record.get("Name (from ☃️ People)");
    Array.isArray(name) ? name = name[0] : null;

    var emails = record.get("Email (from ☃️ People)");
    Array.isArray(emails) ? emails = emails[0] : null;
    var emailArray = emails.split(",");

    var indexOfNFT = record.get("Certificate ID") ?? "";
    var etherscanLinkToTx = record.get("Link to NFT") ?? "";

    var recordObject = {
      recordId: record.id,
      name: name,
      email: emailArray[0],
      ethAddress: record.get("ETH address (from ☃️ People)"),
      programmeName: record.get("Programme name (from 📺 Programmes)")[0],
      programmeType: record.get("Type (from 📺 Programmes)")[0],
      certImage: record.get("Certificate image (from 📺 Programmes)")[0].url,
      achievementLevel: record.get("Achievement level"),
      indexOfNFT: indexOfNFT,
      etherscanLinkToTx: etherscanLinkToTx,
    };

    filteredObjects.push(recordObject);
  }
}

table = {
  fetchFromBase: fetchFromBase,
  writeToBase: writeToBase,
};

export default table;