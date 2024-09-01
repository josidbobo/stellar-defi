import * as Stellar from '@stellar/stellar-sdk';
import {SorobanRpc, Keypair, TransactionBuilder, Asset, Operation, LiquidityPoolAsset, getLiquidityPoolId, BASE_FEE, Networks} from '@stellar/stellar-sdk';
import fetch from 'node-fetch';
 
async function mainOperations(){
    const keyPair = Keypair.random();
    console.log(keyPair.publicKey());
    const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
 
    await fundAccount(keyPair.publicKey());
    const accountInfo = await server.getAccount(keyPair.publicKey());
    
    const BLMToken = new Asset('BlackLivesMatter', keyPair.publicKey());

    const lpAsset = new LiquidityPoolAsset(Asset.native(), BLMToken, 20);
    const liquidPoolId = getLiquidityPoolId('constant_product', lpAsset);

    const liquidPooldepoTransaction = new TransactionBuilder(
        accountInfo, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
        .addOperation(Operation.changeTrust(lpAsset))
    .addOperation(Operation.liquidityPoolDeposit(
        {liquidityPoolId: liquidPoolId, maxAmountA: '200', maxAmountB: '200', maxPrice: {n:1 , d: 1}, minPrice: {n:1, d:1}}
    )).setTimeout(30).build();

    liquidPooldepoTransaction.sign(keyPair);

    try{
        const result = await server.sendTransaction(liquidPooldepoTransaction);
        console.log(`liquid pool created: Url -> https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    }catch(error){
        console.log(error);
        return;
    }

    const traderKeyPair = Keypair.random();
    console.log(`Trader Public key`, traderKeyPair.publicKey());

    await fundAccount(traderKeyPair.publicKey());
    const traderAccountInfo = await server.getAccount(traderKeyPair.publicKey());

    const pathPaymentTrans = new TransactionBuilder(traderAccountInfo, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
    }).addOperation(Operation.changeTrust(
        BLMToken, traderKeyPair.publicKey()
    )).addOperation(Operation.pathPaymentStrictReceive({
        sendAsset: Asset.native(),
        sendMax: '1000',
        destAmount: '50',
        source: traderKeyPair.publicKey(),
        destination: traderKeyPair.publicKey(),
        destAsset: BLMToken,
    })).setTimeout(30).build();

    pathPaymentTrans.sign(traderKeyPair);

    try{
        const result = await server.sendTransaction(pathPaymentTrans);
        console.log(`Swap performed url: https://stellar/explorer/testnet/tx/${result.hash}`);
    }catch(error){
        console.log(`Error from swapping: ${error}`);
    }

    const withdrawTransaction = new TransactionBuilder(accountInfo,{
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
    }).addOperation(Operation.liquidityPoolWithdraw({
        liquidityPoolId: liquidPoolId,
        amount: '50',
        minAmountA: '0',
        minAmountB: '0'
    })).setTimeout(30).build();

    withdrawTransaction.sign(keyPair);

    try{
        const result = await server.sendTransaction(withdrawTransaction);
        console.log(`Transaction successfully withdrawn url: https://stellar/explorer/testnet/tx/${result.hash}`);
    }catch(error){
        console.log(`Errro from withdrawing: ${error}`);
    }
}

async function fundAccount(address){
    const friendBotUrl = `http://friendbot.stellar.org?addr-${address}`
    try{
        let response = await fetch(friendBotUrl);
        if(response.ok){
            console.log(``);
            return true;
        }else{
            console.log('Something went wrong with the transaction');
            return false;
        }
    }catch(error){
        console.error(`Error funding the account ${address}`, error);
        return false;
    }
}

// async function createLiquidity() {
//     return LiquidityPoolAsset
// }

mainOperations().catch(console.error);


