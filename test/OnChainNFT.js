const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OnChainNFT コントラクト", function () {
    let OnChainNFT;
    let contract;
    let owner;
    let account1;

    beforeEach(async function () {
        [owner, account1] = await ethers.getSigners();
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

    it("ownerはNFT作成できる", async function () {
        await contract.nftMint();
        expect(await contract.ownerOf(1)).to.equal(owner.address);
    });

    it("test1", async function () {
        expect(await contract.balanceOf(account1.address)).to.equal(0);
    });

    it("test2", async function () {
        await contract.connect(account1).nftMint();
        expect(await contract.balanceOf(account1.address)).to.equal(1);
    });

    it("test3", async function () {
        await contract.connect(account1).nftMint();

        const birthday = await contract.birthdays(1);
        console.log('birthday:', birthday);

        // 時間すすめる
        await ethers.provider.send("evm_increaseTime", [12000]);
        await ethers.provider.send("evm_mine", []);

        // 確認事項
        const remain = await contract.remainTime(1);
        console.log('remain:', remain);

        // 時間戻す
        await ethers.provider.send("evm_increaseTime", [-12000]);
        await ethers.provider.send("evm_mine", []);
    });

    it("test4", async function () {
        await contract.connect(account1).nftMint();
        token = await contract.connect(account1).tokenURI(1);
        token = token.replace(/^data:\w+\/\w+;base64,/, '')
        decoded = Buffer.from(token, 'base64').toString();

        console.log('decoded:', decoded);

        json = JSON.parse(decoded);
        console.log('json:', json);
    });
});
