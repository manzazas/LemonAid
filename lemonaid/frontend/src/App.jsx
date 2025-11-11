import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    setLoading(true)

    try {
      // TODO: Replace with your actual backend endpoint
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
      
      // TODO: Display the Lemon Score results here later
      
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
      </div>
    </div>
  )
}

export default App