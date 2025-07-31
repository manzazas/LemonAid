import React, {useState, useEffect, useContext} from 'react'
import Chart from "react-google-charts";
import './LineChart.css';
import {CoinContext} from '../../context/Coin-Context'; //import context to use currency
const LineChart = ({historicalData}) => {

    const [data, setData] = useState([ ["Date", "Price"]]) // state to hold chart data
    const {currency} =useContext(CoinContext); //import currency from context to use in chart data fetching
    useEffect(() => {
        let dataCopy = [["Date", "Price"]];
        if (historicalData.prices) {
            historicalData.prices.map((item) => {
                dataCopy.push([`${new Date(item[0]).toLocaleDateString().slice(0,-5)}`, item[1]]);// Convert timestamp to date and push price])
             // Convert timestamp to date and push price
            });
            setData(dataCopy); // set data for chart
        }

    }, [historicalData])
  
  
  
    return (
        <div className = "line-chart">
    <Chart 
  chartType="LineChart"
  data={data}
  width="100%"
  height="400px"
  options={{
    title: "Price History (Last 10 Days)",
    backgroundColor: "transparent",
    legend: {
      position: "bottom", 
      textStyle: { color: "#fff" }
    },
    chartArea: { width: "80%", height: "80%" },
    hAxis: {
      title: "Date",
      textStyle: { color: "#fff" },
      titleTextStyle: { color: "#fff" },
      gridlines: { color: "#333" }
    },
    vAxis: {
      title: `Price (${currency.symbol})`,
      textStyle: { color: "#fff" },
      titleTextStyle: { color: "#fff" },
      gridlines: { color: "#333" }
    },
    titleTextStyle: {
      color: "#fff",
      fontSize: 18,
      bold: true
    },
    
    colors: ["#00ffae"] }}
/>
</div>

  )
}

export default LineChart
