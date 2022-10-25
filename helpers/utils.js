var createJsonforData = async (indexOfNFTToMint, objectToMint, ipfsHash) => {
  var jsonBody = {
    name: `Encode Certificate #${indexOfNFTToMint}`,
    description:
      "This NFT represents your participation and achievement in an Encode Club programme. Encode Club is a web3 education community helping you learn, build and take your next career step. Congratulations on your efforts, this NFT is a testament to you and your contribution to the community.",
    image: `https://encode.mypinata.cloud/ipfs/${ipfsHash}`,
    attributes: [
      {
        trait_type: "Programme Type",
        value: objectToMint.programmeType,
      },
      {
        trait_type: "Programme Name",
        value: objectToMint.programmeName,
      },
      {
        trait_type: "Accreditation Level",
        value: objectToMint.achievementLevel,
      },
    ],
  };

  return jsonBody;
};

var utils = {
  createJsonforData: createJsonforData,
};

export default utils;
