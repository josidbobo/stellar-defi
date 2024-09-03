import React, {useState, useEffect} from 'react';
import {Input, Popover, Radio, Modal, message} from "antd";
import {ArrowDownOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons";

function Swap(props){
    const {account, swap} = props;

    const [slippage, setSlippage] = useState(2.5);
    const [tokenOneAmount, setTokenOneAmount] = useState('');
    const [tokenTwoAmount, setTokenTwoAmount] = useState('');
    const [tokenOne, setTokenOne] = useState('XLM');
    const [tokenTwo, setTokenTwo] = useState('BLMToken');

    function handleSlippage(e){
        setSlippage(e.target.value);
    }

    function changeAmount(e){
        e.preventDefault();
        setTokenOneAmount(e.target.value);
    }

    function switchToken(){
        const one = tokenOne;
        const two = tokenTwo;
        setTokenOne(two);
        setTokenTwo(one)
    }

    function changeAmount2(e){
        e.preventDefault();
        setTokenTwoAmount(e.target.value);
    }

    async function fetchDexSwap(){
        await swap(tokenOne.toString(), tokenTwo.toString());
    }

    const settings = (
        <>
        <div>Slippage Tolerance</div>
        <div>
            <Radio.Group value={slippage} onChange={handleSlippage} >
                <Radio.Button value={0.5}>0.5%</Radio.Button>
                <Radio.Button value={2.5}>2.5%</Radio.Button>
                <Radio.Button value={5}>5.0%</Radio.Button>
            </Radio.Group>
        </div>
        </>
    )
    return( 
    <div className="tradeBox">
        <div className="tradeBoxHeader">
            <h4>Swap</h4>
            <Popover 
            title="Settings"
            trigger="click" 
            placement="bottomRight"
            content={settings}>
            <SettingOutlined className="cog"/> 
            </Popover>
        </div>
        <div className="inputs">
            <Input about="Max amount to send" placeholder="0.0" value={tokenOneAmount} onChange={changeAmount}/> 
            <Input about="Amount to receive" placeholder="0.0" value={tokenTwoAmount} onChange={changeAmount2}/>
            <div className="switchButton" onClick={switchToken}>
                <ArrowDownOutlined className="switchArrow"/>
            </div>
            <div className="assetOne">{tokenOne}</div>
            <div className="assetTwo">{tokenTwo}</div>
        </div>
        <div className="swapButton" onClick={fetchDexSwap} disabled={!(tokenOneAmount !== "") || !(tokenTwoAmount !== "") || (account == null)}> Swap </div>
    </div>
    )
}

export default Swap