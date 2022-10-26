const fs = require("fs");
const main = async () => { 

    // デプロイ
    const OnChainNFT = await ethers.getContractFactory("OnChainNFT");
    const contract = await OnChainNFT.deploy();
    await contract.deployed();

    console.log(`contract deployed to: https://goerli.etherscan.io/address/${contract.address}`);

    // NFTをmintする
    let tx = await contract.nftMint();
    await tx.wait();
    console.log("NFT#1 minted...");
    
    tx = await contract.nftMint();
    await tx.wait();
    console.log("NFT#2 minted...");
    
    tx = await contract.nftMint();
    await tx.wait();
    console.log("NFT#3 minted...");

    tx = await contract.nftMint();
    await tx.wait();
    console.log("NFT#4 minted...");

    // コントラクトアドレスの書き出し

    fs.writeFileSync("./contractContract.js",
        `
        module.exports = "${contract.address}"
        `
    );
};

const contractDeploy = async () => { 
    try {
        await main();
        process.exit(0);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

contractDeploy();