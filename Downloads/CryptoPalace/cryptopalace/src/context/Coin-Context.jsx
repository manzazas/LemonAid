import {createContext,useState, useEffect} from  "react";


export const CoinContext = createContext();
const API_KEY = import.meta.env.VITE_APP_COINGECKO_API_KEY;
const CoinContextProvider = (props) => {
    const [allCoin, setAllCoin] = useState([]);
    const [currency, setCurrency] = useState({
        name: "usd",
        symbol: "$"
    })

    const fetchAllCoin = async () => {
        try { //fetch coins when currency changes
            const options = {
                method: 'GET',
                headers: { accept: 'application/json', 'x-cg-demo-api-key': API_KEY }
            };// Fetch coins from CoinGecko API
            // Use the currency name from the context to fetch coins in the selected currency
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}`, options);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }// If the response is ok, parse the JSON data
            const data = await response.json(); 
            setAllCoin(data); // Update the state with the fetched coins
        } catch (error) { // Handle any errors that occur during the fetch
            console.error('Error fetching coins:', error);
        }
    }

    
useEffect(() => {
    
    fetchAllCoin();},[currency])//update currency wehn allcoin is updated or changed




    const contextValue = {
        allCoin, currency, setCurrency
    }
    return (
        <CoinContext.Provider value = {contextValue}>
            {props.children}
        </CoinContext.Provider>

    );
}
export default CoinContextProvider;