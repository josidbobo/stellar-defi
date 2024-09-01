import * as Stellar from '@stellar/wallet-sdk';
import {SorobanRPC, account, Keypair, TransactionBuilder, Asset, Operation, LiquidityPoolAsset, getLiquidityPoolId, BASE_FEE, Networks} from '@stellar/stellar-sdk';
import fetch from 'node-fetch';
 
async function mainOperations(){
    const keyPair = Keypair.random();
    console.log(keyPair.publicKey());
    const server = SorobanRPC.Server('https://soroban-testnet.stellar.org');

    await fundAccount(keyPair.publicKey());
    const accountInfo = await server.getAccount(keyPair.publicKey());
    
    const BLMToken = new Asset('BlackLivesMatter', keyPair.publicKey());
    const DRMToken = new Asset('DegenMeter', keyPair.publicKey());

    const lpAsset = new LiquidityPoolAsset(Asset.native(), BLMToken, 20);
    const liquidPoolId = getLiquidityPoolId('constant_product', lpAsset);

    const liquidPooldepoTransaction = new TransactionBuilder(
        accountInfo, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET,
        })
        .addOperation(Operation.changeTrust(lpAsset))
    .addOperation(Operation.liquidityPoolDeposit(
        liquidPoolId, '200', '200', {n:1 , d: 1}, {n:1, d:1}
    )).setTimeout(30).build();

    liquidPooldepoTransaction.sign(keyPair);

    try{
        const result = await server.sendTransaction(liquidPooldepoTransaction);
        console.log(`liquid pool created: Url -> https://stellar.expert/explorer/testnet/tx/${result.hash}`);
    }catch(error){
        console.log(error);
        return;
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

async function createLiquidity() {
    return LiquidityPoolAsset
}



