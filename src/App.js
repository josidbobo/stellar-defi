import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import {Route, Routes} from 'react-router-dom';
import {useState} from 'react';
import Swap from './components/Swap';
import Withdraw from './components/Withdraw';
import * as StellarSdk from '@stellar/stellar-sdk';
import {Server} from '@stellar/stellar-sdk'

function App() {
  
  const [secretPair, setSecretPair] = useState(null);
  const [liquidity, setLiquidityId] = useState(null);
  const [asset, setAsset] = useState(null);

  
  const createAccount = async () => {   
    try{
      const server = new StellarSdk.SorobanRpc.Server("https://soroban-testnet.stellar.org");
      const sourceKeyPair = StellarSdk.Keypair.random();

      setSecretPair(sourceKeyPair.publicKey());

      console.log(`This is the source keyPair: ${sourceKeyPair.publicKey()}`);
      alert("KeyPair created successfully");
      await fundAccount(sourceKeyPair.publicKey());
      const sourceAccount = await server.getAccount(sourceKeyPair.publicKey());

      //Token to swap
      const BLMToken = new StellarSdk.Asset('BLMToken', sourceKeyPair.publicKey());
      setAsset(BLMToken);

      // New Liquidity asset
      const lpAsset = new StellarSdk.LiquidityPoolAsset(
        StellarSdk.Asset.native(),
        BLMToken,
        StellarSdk.LiquidityPoolFeeV18
      );

      const liquidityId = StellarSdk.getLiquidityPoolId('constant_product', lpAsset);
      setLiquidityId(liquidityId)

      const transaction = new StellarSdk.TransactionBuilder(sourceAccount,{
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: lpAsset,
      }))
      .addOperation(
        StellarSdk.Operation.liquidityPoolDeposit({
          liquidityPoolId: liquidityId,
          maxAmountA: '200',
          maxAmountB: '200',
          minPrice: {n: 1, d: 1},
          maxPrice: {n: 1, d: 1}
        })
      ).setTimeout(30).build();

      transaction.sign(sourceKeyPair);

      const result = await server.sendTransaction(transaction);
      console.log(result);
      alert(`Successfully created Liquidity Pool`);
    }catch(error){
      console.error('Error', error);
      alert('Error adding liquidity');
    }
  };

  const swap = async (amount1, amount2) => {
    try{
    const server = new StellarSdk.SorobanRpc.Server("https://soroban-testnet.stellar.org");
    const traderKeyPair = StellarSdk.Keypair.random();
    console.log(`Trader Public key`, traderKeyPair.publicKey());

    await fundAccount(traderKeyPair.publicKey());
    const traderAccountInfo = await server.getAccount(traderKeyPair.publicKey());

    const pathPaymentTrans = new StellarSdk.TransactionBuilder(traderAccountInfo, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    }).addOperation(StellarSdk.Operation.changeTrust(
        {asset: asset, source: traderKeyPair.publicKey()}
    )).addOperation(StellarSdk.Operation.pathPaymentStrictReceive({
        sendAsset: StellarSdk.Asset.native(),
        sendMax: amount1,
        destAmount: amount2,
        source: traderKeyPair.publicKey(),
        destination: traderKeyPair.publicKey(),
        destAsset: asset,
    })).setTimeout(30).build();

    pathPaymentTrans.sign(traderKeyPair);
    const result = await server.sendTransaction(pathPaymentTrans);
    console.log(result);
    alert('Swap successful');
  }catch(error){
    console.log(error);
    alert('Error making swap - something went wrong')
    }    
  };

  const withdraw = async (amount) => {
    try{
      const server = new StellarSdk.SorobanRpc.Server("https://soroban-testnet.stellar.org"); 
      const accountInfo = await server.getAccount(secretPair.publicKey()); 
      const withdrawTransaction = new StellarSdk.TransactionBuilder(accountInfo,{
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
  }).addOperation(StellarSdk.Operation.liquidityPoolWithdraw({
      liquidityPoolId: liquidity,
      amount: `${amount}`,
      minAmountA: '0',
      minAmountB: '0'
  })).setTimeout(30).build();

  withdrawTransaction.sign(secretPair);
  const result = await server.sendTransaction(withdrawTransaction);
  console.log('Successful', result);
  alert('Withdraw successful!');
  }catch(error){
    console.error('Error withdrawing', error);
    alert('Error Withdrawing');
  } 
  };


  async function fundAccount(address){
   const friendBotUrl = `http://friendbot.stellar.org?addr=${address}`;
    try{
        let response = await fetch(friendBotUrl);
        if(response.ok){
            alert('From funding Operation - Success!');
        }else{
            console.log('Something went wrong with the transaction');
            alert('From funding operation - Error');
        }
    }catch(error){
        alert(`Error funding the account ${address}`, error);

    }
}


  return (
    <div className="App">
      <Header account={secretPair} createAccount={createAccount}/>
      <div className="mainWindow">
        <Routes>
          <Route path="/" element={<Swap account={secretPair} swap={swap}/>}/>
          <Route path="/withdraw" element={<Withdraw withdraw={withdraw}/>}/>
        </Routes>
      </div>
    </div>
  );
}

export default App;
