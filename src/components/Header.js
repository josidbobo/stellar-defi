import React, {useState, useEffect} from 'react';
import logo from '../Assets/stellar-defi.png';
import sLogo from '../Assets/stellar-defi2.png';
import {Link} from 'react-router-dom';


function Header(props){
    const {account, createAccount} = props;
    return( 
        <header>
            <div className="leftH">
                <img src={logo} alt='Logo' className='logo'/>
                <Link to="/" className="link">
                <div className="headerItem">Swap</div>
                </Link>
                <Link to={"/withdraw"} className="link">
                <div className="headerItem">Withdraw</div>
                </Link>
            </div>
            <div className='rightH'>
                <div className='headerItem'>
                    <img src={sLogo} alt='Secondlogo' className='eth'/>
                    {account !== null ? account : "Stellar"}
                </div>
                <div className="connectButton" onClick={createAccount}>
                    Create Stellar Account
                </div>
            </div>
        </header>
    )
}

export default Header