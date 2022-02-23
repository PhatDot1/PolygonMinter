
var createJsonforData = async (indexOfNFTToMint, objectToMint, ipfsHash) =>  {

    var jsonBody = {
        name: `Encode Certificate #${indexOfNFTToMint}`,
        description: 'This NFT represents your participation in an Encode Club programme. Encode is a web3 education community helping you achieve your personal and professional goals in crypto alongside like-minded peers. Congratulations for your efforts, this NFT is a testament to your hard work and investment into your web3 future!',
        image: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
        attributes: [
            {
                trait_type: "Programme Type",
                value: objectToMint.programmeType
            },
            {
                trait_type: "Programme Name",
                value: objectToMint.programmeName
            },
            {
                trait_type: "Accreditation Level",
                value: objectToMint.achievementLevel
            }
        ]
    };

    return jsonBody;

}


var utils = {
    createJsonforData: createJsonforData
}

export default utils;