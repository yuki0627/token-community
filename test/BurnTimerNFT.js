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
        let totalSupply = await memberNFT.totalSupply();
        let totalSupply_number = totalSupply.toNumber();
        expect(totalSupply_number).to.equal(1);
        
        let uri = await memberNFT.tokenURI(1);
        console.log('uri:', uri);
        
        await memberNFT.burn(1);
        totalSupply = await memberNFT.totalSupply();
        totalSupply_number = totalSupply.toNumber();
        expect(totalSupply_number).to.equal(0);
    });

    it("時間をすすめる", async function () {
        await memberNFT.start();
        let gt = await memberNFT.getTimeLeft();
        expect(gt.toNumber()).to.eq(10);

        await network.provider.send("evm_increaseTime", [1]);
        await network.provider.send("evm_mine")
        gt = await memberNFT.getTimeLeft();
        expect(gt.toNumber()).to.eq(9);

        await network.provider.send("evm_increaseTime", [20]);
        await network.provider.send("evm_mine")
        await expect(memberNFT.getTimeLeft()).to.be.revertedWith("The timer is over");
    });


});
