import React, {useContext} from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png'; //import logo
import arrow_icon from '../../assets/arrow_icon.png';//import icon
import {CoinContext} from '../../context/Coin-Context'; //import context
import {Link} from 'react-router-dom'; //import Link for navigation
const Navbar = () => {

    const {setCurrency} = useContext(CoinContext);//import context for updating currency type
    
    const currencyHandler = (event) => { //triggered when currency is changed
        switch (event.target.value) {//switch the previous currency based on the current event value that was triggered
            case "usd":{
                setCurrency({
                    name: "usd",
                    symbol: "$"
                });
                break }
            case "eur": {
                setCurrency({
                    name: "eur",
                    symbol: "€"
                });
                break }
            default: {
                setCurrency({
                    name: "usd",
                    symbol: "$"
                })
                break} //default to usd if no match
        }
    }
  
    return (
    <div className = "navbar">
        <Link to = "/">
        <img className = "logo" src = {logo} alt = "CryptoPalace logo"></img>
        </Link>
        <ul>
             <Link to = "/"><li>Home</li></Link>
            <li>Features </li>
            <li>Pricing</li>
            <li>Blog</li>
        </ul>
        <div className = "nav-right">
            <select onChange = {currencyHandler}> //calls currencyHandler when changed
                <option value = "usd">USD</option>
                 <option value = "eur">EUR</option>
            </select>
            <button>Sign Up <img src = {arrow_icon} alt = "arrow icon"></img></button>
        </div>





    </div>


   )
}// end Navbar function




export default Navbar;