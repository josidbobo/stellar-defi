import React, {useState, useEffect} from 'react';
import {Input, Popover, Radio, Modal, message} from "antd";
import {ArrowDownOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons";

function Withdraw(props){
    const {withdraw, account} = props;
    const [tokenOneAmount, setTokenOneAmount] = useState(null);

    function changeAmount(e){
        setTokenOneAmount(e.target.value);
    }

    async function withdrawFromDex(){
        await withdraw(tokenOneAmount);
    } 
    return( 
        <div className="tradeBox">
        <div className="tradeBoxHeader">
            <h4>Withdraw</h4>
        </div>
        <div className="inputs">
            <Input about="Max amount to send" placeholder="0.0" value={tokenOneAmount} onChange={changeAmount}/> 
        </div>
        <div className="swapButton" onClick={withdrawFromDex} disabled={!tokenOneAmount || (account === null)}> Withdraw </div>
    </div>
    )
}

export default Withdraw