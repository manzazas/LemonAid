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

    // Check for Amazon URL
    if (!url.includes('amazon.')) {
      setError('Please enter a valid Amazon listing URL')
      return
    }

    setError('')
    setResult(null)
    setLoading(true)

    try {
      // Call the backend endpoint
      const response = await fetch('/api/url-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to analyze listing')
      }

      const data = await response.json()
      console.log('Analysis result:', data)
      
      // Map the response to our frontend format
      const analysis = data.analysis || {}
      const product = data.rainforestData?.product || {}
      const lemon = analysis.lemon || {}
      
      setResult({
        lemonScore: analysis.score ?? null,
        title: product.title || 'N/A',
        price: product.buybox_winner?.price?.value 
          ? `$${product.buybox_winner.price.value}` 
          : product.price?.value 
            ? `$${product.price.value}` 
            : 'N/A',
        asin: data.itemId || product.asin || 'N/A',
        rating: product.rating,
        ratingsTotal: product.ratings_total,
        label: lemon.label || 'Unknown',
        breakdown: lemon.breakdown || {},
        reasons: lemon.reasons || analysis.reasons || [],
        cached: data.cached || false,
      })
      
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
    if (score == null) {
      return { label: "Unknown", color: "#64748b" }
    }
    if (score >= 50) {
      return { label: "High Risk", color: "#DC2626" }
    }
    if (score >= 20) {
      return { label: "Medium Risk", color: "#F97316" }
    }
    return { label: "Low Risk", color: "#16A34A" }
  }

  // Get theme colors based on score (lemon -> peach transition)
  const getThemeColors = (score) => {
    if (score == null) {
      return {
        primary: '#fbbf24', // default lemon
        secondary: '#f59e0b',
        accent: '#fbbf24',
        emoji: '🍋'
      }
    }
    
    // Low risk (0-19) = Peach theme 🍑
    if (score < 20) {
      return {
        primary: '#fda4af', // peach pink
        secondary: '#fb923c', // peach orange
        accent: '#fda4af',
        emoji: '🍑'
      }
    }
    
    // Medium risk (20-49) = Transitioning (peachy-lemon)
    if (score < 50) {
      return {
        primary: '#fb923c', // peachy orange
        secondary: '#fbbf24', // lemon yellow
        accent: '#fb923c',
        emoji: '🍊'
      }
    }
    
    // High risk (50+) = Lemon theme 🍋
    return {
      primary: '#fbbf24', // lemon yellow
      secondary: '#f59e0b',
      accent: '#fbbf24',
      emoji: '🍋'
    }
  }

  const theme = result ? getThemeColors(result.lemonScore) : getThemeColors(null)

  return (
    <div className="app-container">
      <div className="content">
        <h1 className="project-title">{theme.emoji} LemonAid</h1>
        <p className="subtitle">Transparency for Online Products</p>
        
        <div className="input-container">
          <input
            type="text"
            className="url-input"
            placeholder="Paste Amazon listing URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            style={{
              borderColor: result ? `${theme.primary}33` : 'rgba(255, 255, 255, 0.06)',
              transition: 'border-color 0.8s ease'
            }}
          />
          <button 
            className="run-button"
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
              transition: 'background 0.8s ease'
            }}
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
          <div className="result-container" style={{
            borderColor: `${theme.primary}33`,
            transition: 'border-color 0.8s ease'
          }}>
            <h2 className="result-title" style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              transition: 'background 0.8s ease'
            }}>
              Analysis Complete
            </h2>
            
            <div className="lemon-score" style={{
              background: `linear-gradient(135deg, ${theme.primary}0d 0%, ${theme.secondary}0d 100%)`,
              borderColor: `${theme.primary}33`,
              transition: 'all 0.8s ease'
            }}>
              <div className="score-label">Lemon Score</div>
              <div className="score-value" style={{
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transition: 'background 0.8s ease'
              }}>
                {result.lemonScore != null ? result.lemonScore : '—'}
              </div>
              <div
                className="risk-tag"
                style={{backgroundColor: getRisk(result.lemonScore).color}}
              >
                {result.label || getRisk(result.lemonScore).label}
              </div>
            </div>

            <div className="listing-overview" style={{
              borderColor: `${theme.primary}33`,
              transition: 'border-color 0.8s ease'
            }}>
              <h3 style={{
                color: theme.primary,
                transition: 'color 0.8s ease'
              }}>Product Details</h3>
              <p><strong style={{
                color: theme.secondary,
                transition: 'color 0.8s ease'
              }}>Title:</strong> {result.title}</p>
              <p><strong style={{
                color: theme.secondary,
                transition: 'color 0.8s ease'
              }}>ASIN:</strong> {result.asin}</p>
              <p><strong style={{
                color: theme.secondary,
                transition: 'color 0.8s ease'
              }}>Price:</strong> {result.price}</p>
              {result.rating && (
                <p>
                  <strong style={{
                    color: theme.secondary,
                    transition: 'color 0.8s ease'
                  }}>Rating:</strong> {result.rating} ⭐ 
                  ({result.ratingsTotal || 0} reviews)
                </p>
              )}
            </div>

            {/* Breakdown Section with Visual Bars */}
            {result.breakdown && Object.keys(result.breakdown).length > 0 && (
              <div className="breakdown-section" style={{
                borderColor: `${theme.primary}33`,
                transition: 'border-color 0.8s ease'
              }}>
                <h3 style={{
                  color: theme.primary,
                  transition: 'color 0.8s ease'
                }}>Score Breakdown</h3>
                <div className="breakdown-list">
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key} className="breakdown-item-bar">
                      <div className="breakdown-header">
                        <span className="breakdown-label">{key}</span>
                        <span className="breakdown-value" style={{
                          color: theme.primary,
                          transition: 'color 0.8s ease'
                        }}>{value}</span>
                      </div>
                      <div className="breakdown-bar-container">
                        <div 
                          className="breakdown-bar-fill"
                          style={{
                            width: `${value}%`,
                            backgroundColor: value >= 40 ? '#DC2626' : value >= 20 ? '#F97316' : '#16A34A',
                            transition: 'width 0.6s ease, background-color 0.3s ease'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reasons Section */}
            <div className="reasons" style={{
              background: `linear-gradient(135deg, ${theme.primary}08 0%, ${theme.secondary}08 100%)`,
              borderColor: `${theme.primary}26`,
              transition: 'all 0.8s ease'
            }}>
              <h3 style={{
                color: theme.primary,
                transition: 'color 0.8s ease'
              }}>Key Factors:</h3>
              {result.reasons && result.reasons.length > 0 ? (
                <ul>
                  {result.reasons.map((reason, index) => (
                    <li key={index}>
                      <span style={{ fontSize: '1.2rem' }}>{theme.emoji}</span> {reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-flags">No specific flags detected</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App