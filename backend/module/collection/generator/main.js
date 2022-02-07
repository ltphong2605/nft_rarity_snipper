const Moralis = require("moralis/node");
const { timer, async } = require("rxjs");
var config = require('../../../helper/config')

const serverUrl = config.moralis_server_url; //Moralis Server Url here
const appId = config.moralis_app_id; //Moralis Server App ID here

//Moralis.start({ serverUrl, appId });

exports.generateRarity = async function (collectionAddress) {
  const NFTs = await Moralis.Web3API.token.getAllTokenIds({
    address: collectionAddress,
  });

  const totalNum = NFTs.total;
  const pageSize = NFTs.page_size;
  let allNFTs = NFTs.result;

  const timer = (ms) => new Promise((res) => setTimeout(res, ms));
  
  for (let i = pageSize; i < totalNum; i = i + pageSize) {
    const NFTs = await Moralis.Web3API.token.getAllTokenIds({
      address: collectionAddress,
      offset: i,
    });
    allNFTs = allNFTs.concat(NFTs.result);
    await timer(6000);
  }

  let metadata = allNFTs.map((e) => {
    if(e.metadata == null)
      return [];
    let metaObj = JSON.parse(e.metadata);
    if(metaObj.hasOwnProperty('attributes'))
      return metaObj.attributes;

    return;
  });

  let tally = { TraitCount: {} };

  for (let j = 0; j < metadata.length; j++) {
    let nftTraits = metadata[j].map((e) => e.trait_type);
    let nftValues = metadata[j].map((e) => e.value);

    let numOfTraits = nftTraits.length;

    if (tally.TraitCount[numOfTraits]) {
      tally.TraitCount[numOfTraits]++;
    } else {
      tally.TraitCount[numOfTraits] = 1;
    }
    
    for (let i = 0; i < nftTraits.length; i++) {
      let current = nftTraits[i];
      if (tally[current]) {
        tally[current].occurences++;
      } else {
        tally[current] = { occurences: 1 };
      }

      let currentValue = nftValues[i];
      if (tally[current][currentValue]) {
        tally[current][currentValue]++;
      } else {
        tally[current][currentValue] = 1;
      }
    }
  }

  const collectionAttributes = Object.keys(tally);
  let nftArr = [];
  for (let j = 0; j < metadata.length; j++) {
    let current = metadata[j];
    let totalRarity = 0;
    for (let i = 0; i < current.length; i++) {
      let rarityScore =
        1 / (tally[current[i].trait_type][current[i].value] / totalNum);
      current[i].rarityScore = rarityScore;
      totalRarity += rarityScore;
    }

    let rarityScoreNumTraits =
      8 * (1 / (tally.TraitCount[Object.keys(current).length] / totalNum));
    current.push({
      trait_type: "TraitCount",
      value: Object.keys(current).length,
      rarityScore: rarityScoreNumTraits,
    });
    totalRarity += rarityScoreNumTraits;

    if (current.length < collectionAttributes.length) {
      let nftAttributes = current.map((e) => e.trait_type);
      let absent = collectionAttributes.filter(
        (e) => !nftAttributes.includes(e)
      );

      absent.forEach((type) => {
        let rarityScoreNull =
          1 / ((totalNum - tally[type].occurences) / totalNum);
        current.push({
          trait_type: type,
          value: null,
          rarityScore: rarityScoreNull,
        });
        totalRarity += rarityScoreNull;
      });
    }

    if (allNFTs[j]?.metadata) {
      allNFTs[j].metadata = JSON.parse(allNFTs[j].metadata);
    }

    nftArr.push({
      attr: current,
      rarity: totalRarity,
      token_id: allNFTs[j].token_id
    });
  }

  nftArr.sort((a, b) => a.Rarity - b.Rarity);

  return nftArr;
}
