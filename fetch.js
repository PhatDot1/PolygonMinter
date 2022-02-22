let fetch;

let fetchFromBase = async (base) => {

    var mintableObjects = [];
    var filterFormula = "AND(({Certificate Status} = 'Ready'), ({Certificate ID} = ''),(NOT({ETH address (from ☃️ People)}) = ''))";

    await base('📜 Certificates').select({
        view: "Grid view",
        filterByFormula: filterFormula
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function(record) {

            var objectToMint = {
                recordId: record.id,
                name: record.get('Name (from ☃️ People)')[0],
                email: record.get('Email (from ☃️ People)')[0],
                ethAddress: record.get('ETH address (from ☃️ People)')[0],
                programmeName: record.get('Programme name (from 📺 Programmes)')[0],
                programmeType: record.get('Type (from 📺 Programmes)')[0],
                certImage: record.get('Certificate image (from 📺 Programmes)')[0].url,
                achievementLevel: record.get('Achievement level')
            };

            mintableObjects.push(objectToMint);

        });

        fetchNextPage();
    
    }).then(result => { 

    });

    return mintableObjects;

};


fetch = {
    fetchFromBase: fetchFromBase
}

module.exports = fetch;