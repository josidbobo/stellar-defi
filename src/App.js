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
  const [publicK, setPublicK] = useState(null);
  const [liquidity, setLiquidityId] = useState(null);
  const [l, setL] = useState("");
  const [p, setP] = useState("");

  const createAccount = async () => {   
      const server = new StellarSdk.SorobanRpc.Server("https://soroban-testnet.stellar.org");
      const sourceKeyPair = StellarSdk.Keypair.random();
      alert('Processing...')
      await fundAccount(sourceKeyPair.publicKey());

      setSecretPair(sourceKeyPair.secret());
      setPublicK(sourceKeyPair.publicKey());

      console.log(`This is the source keyPair: ${sourceKeyPair.publicKey()}`);
      alert("KeyPair created successfully");
      
  };

  const swap = async (amount1, amount2) => {
    console.log(amount1);
    setL(amount1); setP(amount2.toString());
    const sourceKeyPair = StellarSdk.Keypair.fromSecret(secretPair);
    const server = new StellarSdk.SorobanRpc.Server("https://soroban-testnet.stellar.org");
    const BLMToken = new StellarSdk.Asset('BLMToken', sourceKeyPair.publicKey());
    try{
      alert('Processing...');
      await fundAccount(sourceKeyPair.publicKey());
      const sourceAccount = await server.getAccount(sourceKeyPair.publicKey());

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
      alert('Created Liquidity');
    }catch(error){
      console.error('Error', error);
      alert('Error adding liquidity');
    }
    try{
    const traderKeyPair = StellarSdk.Keypair.random();
    console.log(`Trader Public key`, traderKeyPair.publicKey());

    await fundAccount(traderKeyPair.publicKey());
    const traderAccountInfo = await server.getAccount(traderKeyPair.publicKey());

    const pathPaymentTrans = new StellarSdk.TransactionBuilder(traderAccountInfo, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    }).addOperation(StellarSdk.Operation.changeTrust(
        {asset: BLMToken, source: traderKeyPair.publicKey()}
    )).addOperation(StellarSdk.Operation.pathPaymentStrictReceive({
        sendAsset: StellarSdk.Asset.native(),
        sendMax: "1000",
        destAmount: "50",
        source: traderKeyPair.publicKey(),
        destination: traderKeyPair.publicKey(),
        destAsset: BLMToken,
    })).setTimeout(30).build();

    pathPaymentTrans.sign(traderKeyPair);
    const result = await server.sendTransaction(pathPaymentTrans);
    console.log(result);
    alert(`Swap successful! Hash: ${result.hash}`);
  }catch(error){
    console.log(error);
    alert('Error making swap - something went wrong')
    }    
  };

  const withdraw = async (amount) => {
    const sourceKeyPair = StellarSdk.Keypair.fromSecret(secretPair);
    const server = new StellarSdk.SorobanRpc.Server("https://soroban-testnet.stellar.org");
    const BLMToken = new StellarSdk.Asset('BLMToken', sourceKeyPair.publicKey());
    alert('Processing...');
    await fundAccount(sourceKeyPair.publicKey());
    const sourceAccount = await server.getAccount(sourceKeyPair.publicKey());
    try{
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
    }catch(error){
      console.error('Error', error);
    }
    try{
    const traderKeyPair = StellarSdk.Keypair.random();
    console.log(`Trader Public key`, traderKeyPair.publicKey());

    await fundAccount(traderKeyPair.publicKey());
    const traderAccountInfo = await server.getAccount(traderKeyPair.publicKey());


    const pathPaymentTrans = new StellarSdk.TransactionBuilder(traderAccountInfo, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    }).addOperation(StellarSdk.Operation.changeTrust(
        {asset: BLMToken, source: traderKeyPair.publicKey()}
    )).addOperation(StellarSdk.Operation.pathPaymentStrictReceive({
        sendAsset: StellarSdk.Asset.native(),
        sendMax: "1000",
        destAmount: "50",
        source: traderKeyPair.publicKey(),
        destination: traderKeyPair.publicKey(),
        destAsset: BLMToken,
    })).setTimeout(30).build();

    pathPaymentTrans.sign(traderKeyPair);
    alert('Processing...');
    const result = await server.sendTransaction(pathPaymentTrans);
  }catch(error){
    console.log(error);
    }
    try{ 
      const withdrawTransaction = new StellarSdk.TransactionBuilder(sourceAccount,{
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
  }).addOperation(StellarSdk.Operation.liquidityPoolWithdraw({
      liquidityPoolId: liquidity,
      amount: `${amount}`,
      minAmountA: '0',
      minAmountB: '0'
  })).setTimeout(30).build();

  withdrawTransaction.sign(sourceKeyPair);
  const result = await server.sendTransaction(withdrawTransaction);
  console.log('Successful', result);
  alert(`Withdraw successful! Hash: ${result.hash}`);
  }catch(error){
    console.error('Error withdrawing', error);
    alert('Error Withdrawing');
  } 
  };


  async function fundAccount(address){
   const friendBotUrl = `https://friendbot.stellar.org?addr=${address}`;
    try{
        let response = await fetch(friendBotUrl);
        if(response.ok){
            //alert('From funding Operation - Success!');
        }else{
            console.log('Something went wrong with the transaction');
            //alert('From funding operation - Error');
        }
    }catch(error){
        alert(`Error funding the account ${address}`, error);

    }
}


  return (
    <div className="App">
      <Header account={publicK} createAccount={createAccount}/>
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
