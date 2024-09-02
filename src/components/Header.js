import React from 'react';
import logo from '../Assets/stellar-defi.png';
import sLogo from '../Assets/stellar-defi2.png';

function Header(){
    return( 
        <header>
            <div className='leftH'>
                <img src={logo} alt='Logo' className='logo'/>
                <div className='headerItem'>Swap</div>
                <div className='headerItem'>Tokens</div>
            </div>
            <div className='rightH'>
                <div className='headerItem'>
                    <img src={sLogo} alt='Secondlogo' className='eth'/>
                    Stellar
                </div>
                <div className='connectButton'>
                    Create Stellar Account
                </div>
            </div>
        </header>
    )
}

export default Header