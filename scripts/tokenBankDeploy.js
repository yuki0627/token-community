const fs = require("fs");
const memberNFTAddress = require("../memberNFTContract.js");

const main = async () => { 
    const account1 = "0xf5B43a6034518753a6418ffc4f497138f3E3C486";
    const account2 = "0xC5AD34429509aB75bf9cd907Bfa2cAfF0e9eeFC4";
    const account3 = "0xfb71a70b5be52DeB053223121373E1d4667b8C7a";
    const account4 = "0x8959Eac9F99c30D461aCbDd63dFE1EcaB6E89fC7";

    // デプロイ
    const TokenBank = await ethers.getContractFactory("TokenBank");
    const tokenBank = await TokenBank.deploy("TokenBank", "TKB", memberNFTAddress);
    await tokenBank.deployed();
    console.log(`contract deployed to: https://goerli.etherscan.io/address/${tokenBank.address}`);

    // トークンを移転する
    let tx = await tokenBank.transfer(account2, 300);
    await tx.wait();
    console.log("transferred to account2");

    tx = await tokenBank.transfer(account3, 200);
    await tx.wait();
    console.log("transferred to account3");

    tx = await tokenBank.transfer(account4, 100);
    await tx.wait();
    console.log("transferred to account4");

    // Verifyで読み込むargument.jsを生成
    fs.writeFileSync("./argument.js",
        `
        module.exports = [
            "TokenBank",
            "TKB",
            "${memberNFTAddress}"
        ]
        `
    );

    // フロントエンドアプリが読み込むcontracts.jsを生成
    fs.writeFileSync("./contracts.js",
        `
        export const memberNFTAddress = "${memberNFTAddress}"
        export const tokenBankNFTAddress = "${tokenBank.address}"
        `
    );
}

const tokenBankDeploy = async () => { 
    try {
        await main();
        process.exit(0);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

tokenBankDeploy();