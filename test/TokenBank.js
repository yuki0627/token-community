const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenBank コントラクト", function () {
    let TokenBank;
    let tokenBank;
    const name = "TokenBank";
    const symbol = "TBK";
    let owner;
    let account1;
    let account2;
    let account3;
    const zeroAccountess = "0x0000000000000000000000000000000000000000";

    beforeEach(async function () {
        [owner, account1, account2, account3] = await ethers.getSigners();
        TokenBank = await ethers.getContractFactory("TokenBank");
        tokenBank = await TokenBank.deploy(name, symbol);
        await tokenBank.deployed();
    });

    describe("デプロイ", function () {
        it("トークンの名前とシンボルがセットされる", async function () {
            expect(await tokenBank.name()).to.equal(name);
            expect(await tokenBank.symbol()).to.equal(symbol);
        });
        it("デプロイアドレスがownerになっている", async function () {
            expect(await tokenBank.owner()).to.equal(owner.address);
        });
        it("ownerに総額が割り当てられている", async function () {
            const ownerBalance = await tokenBank.balanceOf(owner.address);
            expect(await tokenBank.totalSupply()).to.equal(ownerBalance);
        });
        it("預かっているTokenの総額が0であるべき", async function () {
            expect(await tokenBank.bankTotalDeposit()).to.equal(0);
        });
    });
    describe("アドレス間トランザクション", function () {
        beforeEach(async function () {
            await tokenBank.transfer(account1.address, 500);
        });
        it("トークン移転がされるべき", async function () {
            const startAccount1Balance = await tokenBank.balanceOf(account1.address);
            const startAccount2Balance = await tokenBank.balanceOf(account2.address);
            
            await tokenBank.connect(account1).transfer(account2.address, 100);

            const endAccount1Balance = await tokenBank.balanceOf(account1.address);
            const endAccount2Balance = await tokenBank.balanceOf(account2.address);

            expect(endAccount1Balance).to.equal(startAccount1Balance.sub(100));
            expect(endAccount2Balance).to.equal(startAccount2Balance.add(100));
        });
        it("ゼロアドレス宛の移転は失敗すべき", async function () {
            await expect(tokenBank.transfer(zeroAccountess, 100))
                .to.be.revertedWith("Zero address cannot be specified for 'to' !");
        });
        it("残高不足の場合は移転に失敗すべき", async function () {
            await expect(tokenBank.connect(account1).transfer(account2.address, 510))
                .to.be.revertedWith("Insufficient balance!");
        });
        it("移転後には'TokenTransfer'イベントが発行されるべき", async function () {
            expect(tokenBank.connect(account1).transfer(account2.address, 100))
                .emit(tokenBank, "TokenTransfer").withArgs(account1.address, account2.address, 100);
        });
    });
    describe("Bankトランザクション", function () {
        beforeEach(async function () {
            await tokenBank.transfer(account1.address, 500);
            await tokenBank.transfer(account2.address, 200);
            await tokenBank.transfer(account3.address, 100);
            await tokenBank.connect(account1).deposit(100);
            await tokenBank.connect(account2).deposit(200);
        });
        it("トークン預け入れが実行されるべき", async function () {
            const account1Balance = await tokenBank.balanceOf(account1.address);
            expect(account1Balance).to.equal(400);
            
            const account1bankBalance = await tokenBank.bankBalanceOf(account1.address);
            expect(account1bankBalance).to.equal(100);
        });
        it("預け入れ後もトークンを移転できるべき", async function () {
            const startAccount1Balance = await tokenBank.balanceOf(account1.address);
            const startAccount2Balance = await tokenBank.balanceOf(account2.address);
            
            await tokenBank.connect(account1).transfer(account2.address, 100);

            const endAccount1Balance = await tokenBank.balanceOf(account1.address);
            const endAccount2Balance = await tokenBank.balanceOf(account2.address);

            expect(endAccount1Balance).to.equal(startAccount1Balance.sub(100));
            expect(endAccount2Balance).to.equal(startAccount2Balance.add(100));
        });
        it("預け入れ後はTokenDepositイベントが発行される", async function () {
            expect(tokenBank.connect(account1).deposit(100))
                .emit(tokenBank, "TokenDeposit").withArgs(account1.address, 100);
        });
        it("トークン引き出しが実行できるべき", async function () {
            const startAccount1BankBalance = await tokenBank.connect(account1).bankBalanceOf(account1.address);
            const startBankBalance = await tokenBank.connect(account1).bankTotalDeposit();

            await tokenBank.connect(account1).withdraw(100);

            const endAccount1BankBalance = await tokenBank.connect(account1).bankBalanceOf(account1.address);
            const endBankBalance = await tokenBank.connect(account1).bankTotalDeposit();

            expect(endAccount1BankBalance).to.equal(startAccount1BankBalance.sub(100));
            expect(endBankBalance).to.equal(startBankBalance.sub(100));
        });
        it("預入トークンが不足している場合は失敗する", async function () {
            await expect(tokenBank.connect(account1).withdraw(101))
                .to.be.revertedWith("The amount grater than your tokenBank balance!");
        });
        it("預入後はTokenWithdrawイベントが発行される", async function () {
            expect(tokenBank.connect(account1).withdraw(100))
                .emit(tokenBank, "TokenWithdraw").withArgs(account1.address, 100);
        });
    });
});