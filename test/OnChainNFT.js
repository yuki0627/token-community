const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OnChainNFT コントラクト", function () {
    let OnChainNFT;
    let contract;
    let owner;
    let addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        OnChainNFT = await ethers.getContractFactory("OnChainNFT");
        contract = await OnChainNFT.deploy();
        await contract.deployed();
    });

    it("トークンの名前とシンボルがセットされている", async function () {
        console.log('await contract.name():', await contract.name());
        expect(await contract.name()).to.equal("OnChainNFT");
        expect(await contract.symbol()).to.equal("OCN");

    });
    
    it("デプロイアドレスがownerに設定されている", async function () {
        expect(await contract.owner()).to.equal(owner.address);
    });

    it("ownerはNFT作成できる", async function() {
        await contract.nftMint();
        expect(await contract.ownerOf(1)).to.equal(owner.address);
        let uri = await contract.tokenURI(1);
        console.log('uri:', uri);

    });

});
