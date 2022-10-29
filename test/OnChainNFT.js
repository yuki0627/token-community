const { expect } = require("chai");
const { ethers } = require("hardhat");
const { json } = require("hardhat/internal/core/params/argumentTypes");

describe("OnChainNFT コントラクト", function () {
    let OnChainNFT;
    let contract;
    let owner;
    let account1;

    beforeEach(async function () {
        [owner, account1, account2] = await ethers.getSigners();
        MemberNFT = await ethers.getContractFactory("MemberNFT");
        memberNFT = await MemberNFT.deploy();
        await memberNFT.deployed();

        OnChainNFT = await ethers.getContractFactory("OnChainNFT");
        contract = await OnChainNFT.deploy(memberNFT.address);
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

    it("mint前はNFTのカウント0", async function () {
        expect(await contract.balanceOf(account1.address)).to.equal(0);
    });

    it("mint後はNFTのカウント1", async function () {
        await contract.connect(account1).nftMint();
        expect(await contract.balanceOf(account1.address)).to.equal(1);
    });

    it("mint直後は残り時間は0以上", async function () {
        await contract.connect(account1).nftMint();
        let remain = await contract.remainTime(1);
        expect(remain.toNumber()).to.greaterThan(0);
    });

    it("時間を進めると残り時間が0となる", async function () {
        await contract.connect(account1).nftMint();

        // 時間すすめる
        await ethers.provider.send("evm_increaseTime", [12000]);
        await ethers.provider.send("evm_mine", []);

        // 確認事項
        let remain = await contract.remainTime(1);
        expect(remain.toNumber()).to.equal(0);

        // 時間戻す
        await ethers.provider.send("evm_increaseTime", [-12000]);
        await ethers.provider.send("evm_mine", []);
    });

    it("寿命前のNFTが取得できる", async function () {
        await contract.connect(account1).nftMint();
        token = await contract.connect(account1).tokenURI(1);
        console.log('token:', token);
        token = token.replace(/^data:\w+\/\w+;base64,/, '')
        decoded = Buffer.from(token, 'base64').toString();

        let json = JSON.parse(decoded);
        expect(json.description).to.equal("life is short");
    });

    it("寿命後のNFTが取得できる", async function () {
        await contract.connect(account1).nftMint();
        remain = await contract.remainTime(1);
        console.log('remain:', remain);

        // 時間すすめる
        await ethers.provider.send("evm_increaseTime", [remain.toNumber()]);
        await ethers.provider.send("evm_mine", []);

        // 確認事項
        token = await contract.connect(account1).tokenURI(1);
        token = token.replace(/^data:\w+\/\w+;base64,/, '')
        decoded = Buffer.from(token, 'base64').toString();
        let json = JSON.parse(decoded);
        expect(json.description).to.equal("goodbye");

        // 時間戻す
        await ethers.provider.send("evm_increaseTime", [remain.toNumber()]);
        await ethers.provider.send("evm_mine", []);
    });

    it("寿命後のNFTにmemberNFTの数が入っている", async function () {
        await contract.connect(account1).nftMint();
        await memberNFT.connect(owner).nftMint(owner.address, "hoge");
        
        // 時間すすめる (今は時間が過ぎたときのreturnでしかmetadataを変えていない)
        await ethers.provider.send("evm_increaseTime", [remain.toNumber()]);
        await ethers.provider.send("evm_mine", []);

        // 確認事項
        // ID:1 は account1 が所有
        // account1 は memberNFT の所有数 0
        token = await contract.connect(account2).tokenURI(1);
        token = token.replace(/^data:\w+\/\w+;base64,/, '')
        decoded = Buffer.from(token, 'base64').toString();
        let json = JSON.parse(decoded);
        expect(Number(json.count)).to.equal(0);

        // ID:1 は account1 が所有
        // account1 に memberNFT を送り所有数 1
        memberNFT.connect(owner).transferFrom(owner.address, account1.address, 1);

        token = await contract.connect(account2).tokenURI(1);
        token = token.replace(/^data:\w+\/\w+;base64,/, '')
        decoded = Buffer.from(token, 'base64').toString();
        json = JSON.parse(decoded);
        expect(Number(json.count)).to.equal(1);

        // 時間戻す
        await ethers.provider.send("evm_increaseTime", [remain.toNumber()]);
        await ethers.provider.send("evm_mine", []);
    });
});
