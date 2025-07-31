import React, {useState} from 'react'
import './Coin.css';
import  {useParams} from "react-router-dom"; //import useParams to get coinId from URL parameters
import {useContext, useEffect} from 'react';
import {CoinContext} from '../../context/Coin-Context'; //import context to use currency
import LineChart from '../../components/LineChart/LineChart.jsx'; //import LineChart component

const Coin = () => {

  const {coinId} = useParams(); //get coinId from URL parameters
  const [coinData, setCoinData] = useState();
  const [historicalData, setHistoricalData] = useState(); // state to hold historical data for chart
  const {currency} =useContext(CoinContext); //import currency from context to use in coin data fetching
  const API_KEY = import.meta.env.VITE_APP_COINGECKO_API_KEY; //get API key from environment variables
  
  const fetchCoinData = async () => {
    const options = {
      method: 'GET', 
      headers: {accept: 'application/json', 'x-cg-demo-api-key':  API_KEY}};

    fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, options)
      .then(res => res.json())
      .then(response => setCoinData(response))
      .catch(err => console.error(err)); //fetch coin data based on coinId
  }


  const fetchHistoricalData = async () => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-cg-demo-api-key': API_KEY }
    };

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency.name}&days=10&interval=daily`,
        options
      );
      const data = await response.json();
      setHistoricalData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCoinData();
    fetchHistoricalData();
  }, [currency, coinId]); // Add coinId as dependency

  if(coinData && historicalData) { //check if coinData and historicalData are available
    return (
    <div className = "coin">
      <div className = "coin-name">
        <img src = {coinData.image.large} alt = {coinData.name}></img>
        <p><b>{coinData.name} ({coinData.symbol.toUpperCase()})</b></p> 
      </div>

      <div className = 'coin-chart'>
      <LineChart historicalData = {historicalData}/>
    </div>

    <div className = "coin-info">
      <ul>
        <li>Crypto Market Rnk</li>
        <li>{coinData.market_cap_rank}</li>
      </ul>
      <ul>
        <li>Current Price</li>
        <li>{currency.symbol} {coinData.market_data.current_price[currency.name].toLocaleString()}</li>
      </ul>
      <ul>
        <li>Market Cap</li>
        <li>{currency.symbol} {coinData.market_data.market_cap[currency.name].toLocaleString()}</li>
      </ul>
      <ul>
        <li>24 Hour High</li>
        <li>{currency.symbol} {coinData.market_data.high_24h[currency.name].toLocaleString()}</li>
      </ul>
      <ul>
        <li>24 Hour Low</li>
        <li>{currency.symbol} {coinData.market_data.low_24h[currency.name].toLocaleString()}</li>
      </ul>
    </div>

   </div>
  )

  }
  else {
    return (
      <div className = "spinner">
        <div className = "spin"></div>
      </div>
    );
  }
  
}

export default Coin
