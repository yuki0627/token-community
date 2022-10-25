const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MemberNFTコントラクト", function () {
    let MemberNFT;
    let memberNFT;
    const name = "MemberNFT";
    const symbol = "MEM";
    const tokenURI1 = "hoge1";
    const tokenURI2 = "hoge2";
    let owner;
    let addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        MemberNFT = await ethers.getContractFactory("MemberNFT");
        memberNFT = await MemberNFT.deploy();
        await memberNFT.deployed();
    });
    
    it("burn出来る", async function () {
        await memberNFT.nftMint(addr1.address, tokenURI1);
        expect(await memberNFT.ownerOf(1)).to.equal(addr1.address);
        let totalSupply = await memberNFT.totalSupply();
        let totalSupply_number = totalSupply.toNumber();
        console.log('totalSupply_number:', totalSupply_number);

        await memberNFT.burn(1);
        totalSupply = await memberNFT.totalSupply();
        totalSupply_number = totalSupply.toNumber();
        console.log('totalSupply_number:', totalSupply_number);
    });


    it("トークンの名前とシンボルがセットされている", async function () {
        expect(await memberNFT.name()).to.equal(name);
        expect(await memberNFT.symbol()).to.equal(symbol);

    });
    
    it("デプロイアドレスがownerに設定されている", async function () {
        expect(await memberNFT.owner()).to.equal(owner.address);
    });

    it("ownerはNFT作成できる", async function() {
        await memberNFT.nftMint(addr1.address, tokenURI1);
        expect(await memberNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it("NFT作成のたびにtokenIDがインクリメントされる", async function () {
        await memberNFT.nftMint(addr1.address, tokenURI1);
        await memberNFT.nftMint(addr1.address, tokenURI2);
        expect(await memberNFT.tokenURI(1)).to.equal(tokenURI1)
        expect(await memberNFT.tokenURI(2)).to.equal(tokenURI2)
    });

    it("Owner以外はNFTの作成はできない", async function () {
        await expect(memberNFT.connect(addr1).nftMint(addr1.address, tokenURI1))
            .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("NFT作成後に'TokenURIChanged'イベントが発行される", async function () {
        await expect(memberNFT.nftMint(addr1.address, tokenURI1)).
            to.emit(memberNFT, "TokenURIChanged").withArgs(addr1.address, 1, tokenURI1);
    });

});
