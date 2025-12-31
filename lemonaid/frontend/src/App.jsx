import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import Features from './pages/Features'

// API base URL - use environment variable or default to relative path for dev
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

function App() {
	const [url, setUrl] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [result, setResult] = useState(null)
	const [showRaw, setShowRaw] = useState(false)
	const [copied, setCopied] = useState(false)

	const handleAnalyze = async () => {
		if (!url.trim()) {
			setError('Please enter a URL')
			return
		}

		if (!url.includes('amazon.') ) {
			setError('Please enter a valid Amazon listing URL')
			return
		}

		setError('')
		setResult(null)
		setLoading(true)

		try {
			const response = await fetch(`${API_BASE_URL}/api/url-post`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url }),
			})

			if (!response.ok) {
				const body = await response.text().catch(() => '')
				throw new Error(`Failed to analyze listing (${response.status}) ${body}`)
			}

			const data = await response.json()
			const analysis = data.analysis || {}
			const lemon = analysis.lemon || {}
			const product = data.rainforestData?.product || data.product || null;
			const productImage = product?.main_image?.link || product?.images?.[0]?.link || null;
			const productUrl = product?.link || url;
			
			const mapped = {
				lemonScore: analysis.score ?? null,
				label: lemon.label || null,
				breakdown: lemon.breakdown || {},
				reasons: lemon.reasons || (analysis.reasons || []),
				productSummary: analysis.productSummary || product || null,
				productImage: productImage,
				productUrl: productUrl,
				raw: data || analysis || null,
				saved: data.saved || false,
			}

			setResult(mapped)
			setTimeout(() => {
				const resultElement = document.querySelector('.result-container')
				if (resultElement) {
					resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
				}
			}, 100)
		} catch (err) {
			setError(err.message || 'An error occurred while analyzing the listing')
			console.error('Error:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') handleAnalyze()
	}

	const handleCopyUrl = async () => {
		if (result?.productUrl || url) {
			const urlToCopy = result?.productUrl || url
			try {
				await navigator.clipboard.writeText(urlToCopy)
				setCopied(true)
				setTimeout(() => setCopied(false), 2000)
			} catch (err) {
				console.error('Failed to copy:', err)
			}
		}
	}

	const handleShare = async () => {
		if (navigator.share && result) {
			try {
				await navigator.share({
					title: `LemonAid Analysis: ${result.productSummary?.title || 'Product'}`,
					text: `Lemon Score: ${result.lemonScore} (${result.label})`,
					url: window.location.href
				})
			} catch (err) {
				if (err.name !== 'AbortError') {
					console.error('Share failed:', err)
				}
			}
		} else {
			// Fallback: copy to clipboard
			handleCopyUrl()
		}
	}

	function HomeContent() {
		return (
			<div className="main-content">
				<div className="content">
					<h1 className="project-title">LemonAid</h1>
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
						/>
						<button className="run-button" onClick={handleAnalyze} disabled={loading}>
							{loading ? 'Analyzing...' : 'Run'}
						</button>
					</div>

					{error && <div className="error-message">{error}</div>}

					{loading && (
						<div className="loading-container">
							<div className="loading-spinner"></div>
							<p className="loading-text">Analyzing product... This may take a few seconds.</p>
						</div>
					)}

					{result && (
						<div className="result-container fade-in">
							<h2 className="result-title">Analysis Complete</h2>

							{/* Enhanced Score Display with Gauge */}
							<div className={`lemon-score score-${result.lemonScore < 15 ? 'low' : result.lemonScore < 35 ? 'low-medium' : result.lemonScore < 55 ? 'medium' : result.lemonScore < 75 ? 'medium-high' : 'high'}`}>
								<div className="score-gauge-container">
									<div className="score-gauge">
										<svg className="score-gauge-svg" viewBox="0 0 120 120">
											<circle
												className="score-gauge-background"
												cx="60"
												cy="60"
												r="50"
												fill="none"
												stroke="rgba(255,255,255,0.1)"
												strokeWidth="8"
											/>
											<circle
												className="score-gauge-fill"
												cx="60"
												cy="60"
												r="50"
												fill="none"
												strokeWidth="8"
												strokeLinecap="round"
												strokeDasharray={`${2 * Math.PI * 50}`}
												strokeDashoffset={`${2 * Math.PI * 50 * (1 - (result.lemonScore || 0) / 100)}`}
												transform="rotate(-90 60 60)"
											/>
										</svg>
										<div className="score-gauge-value">
											<div className="score-value">{result.lemonScore ?? '—'}</div>
											<div className="score-max">/ 100</div>
										</div>
									</div>
								</div>
								<div className="score-label">Lemon Score</div>
								<div className="score-badge">{result.label ?? ''}</div>
								{result.raw?.lemon?.confidence && (
									<div className={`confidence-badge confidence-${result.raw.lemon.confidence}`}>
										<span className="confidence-text">
											{result.raw.lemon.confidence === 'high' ? 'High Confidence' : result.raw.lemon.confidence === 'medium' ? 'Medium Confidence' : 'Low Confidence'}
										</span>
									</div>
								)}
							</div>

							{result.productSummary && (
								<div className="product-summary">
									<div className="product-summary-header">
										<h3>Product Information</h3>
										<div className="product-actions">
											<button 
												onClick={handleCopyUrl} 
												className="action-button copy-button"
												title="Copy product URL"
											>
												{copied ? 'Copied!' : 'Copy URL'}
											</button>
											{navigator.share && (
												<button 
													onClick={handleShare} 
													className="action-button share-button"
													title="Share results"
												>
													Share
												</button>
											)}
										</div>
									</div>
									<div className="product-content">
										{result.productImage && (
											<div className="product-image-container">
												<img src={result.productImage} alt={result.productSummary.title} className="product-image" />
												{result.saved && (
													<div className="cached-badge" title="This analysis was cached">
														Cached
													</div>
												)}
											</div>
										)}
										<div className="product-details">
											<div className="product-title">{result.productSummary.title}</div>
											<div className="product-meta">
												<div className="meta-item">
													<span className="meta-label">ASIN:</span>
													<span className="meta-value">{result.productSummary.asin}</span>
												</div>
												{result.productSummary.rating != null && (
													<div className="meta-item">
														<span className="meta-label">Rating:</span>
														<span className="meta-value">
															{result.productSummary.rating} ({result.productSummary.ratings_total || 0} reviews)
														</span>
													</div>
												)}
												{result.productSummary.price && (
													<div className="meta-item">
														<span className="meta-label">Price:</span>
														<span className="meta-value">
															{result.productSummary.price.value} {result.productSummary.price.currency}
														</span>
													</div>
												)}
											</div>
											{result.productUrl && (
												<a href={result.productUrl} target="_blank" rel="noopener noreferrer" className="amazon-link">
													View on Amazon →
												</a>
											)}
										</div>
									</div>
								</div>
							)}

							<div className="breakdown">
								<h3>Risk Breakdown</h3>
								<p className="breakdown-note">Lower scores = Better (Low = Good, High = Bad)</p>
								<div className="breakdown-grid">
									{Object.entries(result.breakdown || {}).map(([k, v]) => {
										const score = Number(v) || 0;
										const maxScores = { reviews: 60, seller: 30, price: 50, listing: 25, age: 30 };
										const maxScore = maxScores[k] || 100;
										const percentage = (score / maxScore) * 100;
										const isGood = score === 0;
										const isMedium = score > 0 && score < 20;
										const isBad = score >= 20;
										const tooltips = {
											reviews: 'Review quality and quantity. Low score = good reviews, high score = suspicious or poor reviews.',
											seller: 'Seller reliability. Low score = Amazon fulfilled, high score = third-party seller risks.',
											price: 'Price comparison with similar products. Low score = normal pricing, high score = unusually high/low prices.',
											listing: 'Listing quality (images, descriptions). Low score = professional listing, high score = spammy or low-quality.',
											age: 'Product age vs review count. Low score = normal, high score = new product with suspiciously many reviews.'
										};
										const weights = result.raw?.lemon?.weights || {};
										const normalized = result.raw?.lemon?.normalizedBreakdown?.[k];
										
										return (
											<div key={k} className={`breakdown-card ${isGood ? 'score-good' : isBad ? 'score-bad' : 'score-medium'}`}>
												<div className="breakdown-card-header">
													<div className="breakdown-card-title">
														<strong>{k.charAt(0).toUpperCase() + k.slice(1)}</strong>
														{weights[k] && (
															<span className="breakdown-weight" title="Weight in final score">
																({Math.round(weights[k] * 100)}%)
															</span>
														)}
													</div>
													<div className="breakdown-card-score">
														<span className="score-number">{score}</span>
														<span className="score-max">/{maxScore}</span>
													</div>
												</div>
												<div className="breakdown-progress-container">
													<div 
														className={`breakdown-progress-bar ${isGood ? 'progress-good' : isBad ? 'progress-bad' : 'progress-medium'}`}
														style={{ width: `${percentage}%` }}
													/>
												</div>
												{normalized !== undefined && (
													<div className="breakdown-normalized">
														Normalized: {normalized}% (weighted: {Math.round(normalized * (weights[k] || 0) * 100) / 100}%)
													</div>
												)}
												<div className="breakdown-status">
													{isGood && <span className="status-indicator status-good">Good</span>}
													{isMedium && <span className="status-indicator status-medium">Moderate</span>}
													{isBad && <span className="status-indicator status-bad">Risk</span>}
												</div>
												<div className="breakdown-tooltip" title={tooltips[k] || ''}>
													i
												</div>
											</div>
										);
									})}
								</div>
							</div>

							<div className="reasons">
								<h3>Reasons</h3>
								{(result.reasons || []).length === 0 ? (
									<div>No specific flags detected.</div>
								) : (
									<ul>
										{(result.reasons || []).map((reason, index) => (
											<li key={index}>{reason}</li>
										))}
									</ul>
								)}
							</div>

							<div className="result-actions">
								<button onClick={() => setShowRaw(s => !s)} className="raw-toggle">
									{showRaw ? 'Hide' : 'Show'} Raw JSON
								</button>
							</div>

							{showRaw && (
								<pre className="raw-json">{JSON.stringify(result.raw, null, 2)}</pre>
							)}
						</div>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="app-container">
			<Header
				onHome={() => {
					setUrl('')
					setResult(null)
					setShowRaw(false)
					window.scrollTo({ top: 0, behavior: 'smooth' })
				}}
			/>

			<Routes>
				<Route path="/" element={<HomeContent />} />
				<Route path="/features" element={<Features />} />
			</Routes>
		</div>
	)
}

export default App
