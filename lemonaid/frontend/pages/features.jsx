import React from 'react'
import Header from '../components/Header'
function Features() {
  return (
    <div>

        <Header />
        <main style={{padding: '2rem', maxWidth: '800px', margin: '0 auto'}}>
            <h1 id="get-started">Features</h1>
            <ul>
                <li><strong>Comprehensive Lemon Score:</strong> Our proprietary algorithm evaluates multiple facets of a product listing, including review authenticity, seller reliability, pricing anomalies, listing quality, and product age to generate an overall Lemon Score.</li>
                <li><strong>Detailed Breakdown:</strong> Understand the components that contribute to the Lemon Score with a detailed breakdown of each factor assessed.</li>
                <li><strong>Actionable Insights:</strong> Receive clear reasons behind the score, helping you make informed purchasing decisions.</li>
                <li><strong>User-Friendly Interface:</strong> Easily input Amazon product URLs and receive instant analysis results in a clean and intuitive layout.</li>
                <li><strong>Regular Updates:</strong> Our analysis algorithms are continuously refined to adapt to changing market trends and tactics used by sellers.</li>
            </ul>
        </main>


      
    </div>
  )
}

export default Features
