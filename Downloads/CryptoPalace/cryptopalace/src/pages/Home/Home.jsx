import React, {useContext, useState, useEffect} from 'react';
import './Home.css'; 
import {CoinContext} from '../../context/Coin-Context'; //import context
import {Link} from "react-router-dom"; //import Link for coin details page

const Home = () => {
  const {allCoin, currency} = useContext(CoinContext);//now allCoin and currency can be used in this page
  const [displayCoin, setDisplayCoin] = useState([]);
  const [searchTerm, setSearchTerm]= useState(""); // state to hold the search term

  
  const handleInput = (event) => {
    setSearchTerm(event.target.value); // update search term based on user input
    if(event.target.value === "") {
      setDisplayCoin(allCoin); // if search term is empty, show all coins
    }
  }

  const handleSearch = async (event) => {
    event.preventDefault();
    const coins = await allCoin.filter((item) => {
      return (item.name.toLowerCase().includes(searchTerm.toLowerCase()) )// filter coins based on search term
    })

    setDisplayCoin(coins); // update displayCoin with filtered coins


  }
  
  useEffect (()=> {
    setDisplayCoin(allCoin);
  }, [allCoin]); //when allCoin changes, the display coin is also updated
  
  
  return (
    <div className = "home">
      <div className = "hero">
        <h1>World's Finest <br /> Crypto Marketplace</h1>
        <p>View your favorite cryptocurrencies with ease.</p>
        <form onSubmit = {handleSearch}><input onChange = {handleInput} list = "coinlist" value ={searchTerm} type = "text" placeholder = "Search Crypto..." required></input>
        <datalist id = 'coinlist'>{allCoin.map((item,index) => {
          return <option key = {index} value ={item.name} ></option>

        })}</datalist>
        
        <button type ="submit">Go</button>
        </form>
      </div> 

      <div className = "crypto-table">
        <div className = "table-design">
          <p>#</p>
          <p>Coins</p>
          <p>Price</p>
          <p style = {{textAlign:"center"}}>24h Change</p>
          <p className = "market-cap">Market Cap</p>
          <p className = "ath-change">ATH change percentage</p>
        </div>
        {
        displayCoin.slice(0,10).map((item, index) => {
          return (
          <Link to ={`/coin/${item.id}`}className = "table-design" key ={index}>
            <p>{item.market_cap_rank}</p>
            <div className = "coin-name">
              <img src = {item.image} alt = {item.name} /> 
            <p>{item.name + " - "+ item.symbol}</p>
            </div>
            <p>{currency.symbol} {item.current_price}</p>
      
            <p className = {item.price_change_percentage_24h > 0 ? "t24hr-pos": "t24hr-neg"}>{Math.floor(item.price_change_percentage_24h * 100) / 100}</p>
            <p className = "market-cap">{currency.symbol} {item.market_cap.toLocaleString()}</p>
            <p className = "ath-change">{item.ath_change_percentage}%</p>
          </Link>)
        })}
      </div> 


    </div> //end home
  )
}

export default Home
