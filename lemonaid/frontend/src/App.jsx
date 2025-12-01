import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    // Basic URL validation
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    // Simple URL format check
    if (!url.includes('ebay.com')) {
      setError('Please enter a valid eBay listing URL')
      return
    }

    setError('')
    setResult(null)
    setLoading(true)

    try {
      // Call api/analyze endpoint on the backend
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze listing')
      }

      const data = await response.json()
      console.log('Analysis result:', data)
      
      // Display the results/analysis here
      if (data.success && data.data) {
        setResult(data.data)
      }
      
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the listing')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  const getRisk = (score) => {
    if (score >= 80) {
      return {
        label: "High Risk",
        color: "#DC2626"
      }
    }
    if (score >= 50) {
      return {
        label: "Moderate Risk",
        color: "#F97316"
      }
    }
    if (score >= 20) {
      return {
        label: "Low Risk",
        color: "#16A34A"
      }
    }
    else {
      return {
        label: "Undefined",
        color: "#4F007CFF"
      }
    }
  }

  return (
    <div className="app-container">
      <div className="content">
        <h1 className="project-title">🍋 LemonAid</h1>
        <p className="subtitle">Transparency for Online Products</p>
        
        <div className="input-container">
          <input
            type="text"
            className="url-input"
            placeholder="Paste eBay listing URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button 
            className="run-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Run'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {result && (
          <div className="result-container">
            <h2 className="result-title">Analysis Complete</h2>
            <div className="lemon-score">
              <div className="score-label">Lemon Score</div>
              <div className="score-value">{result.lemonScore}</div>
              <div
                className="risk-tag"
                style={{backgroundColor: getRisk(result.lemonScore).color}}
              >
                {getRisk(result.lemonScore).label}
              </div>
            </div>
            <div className="listing-overview">
              <h3>Listing Overview</h3>
              <p><strong>Title:</strong> {result?.title || 'N/A'}</p>
              <p><strong>Price:</strong> {result?.price || 'N/A'}</p>
              <p><strong>Median Price:</strong> ${result?.medianPrice || 'N/A'}</p>
              <p><strong>Z-Score:</strong> {result?.zScore || 'N/A'}</p>
            </div>
            <div className="reasons">
              <h3>Key Factors:</h3>
              <ul>
                {result.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App