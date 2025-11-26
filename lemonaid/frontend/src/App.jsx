import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import Features from './pages/Features'

function App() {
	const [url, setUrl] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [result, setResult] = useState(null)
	const [showRaw, setShowRaw] = useState(false)

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
			const response = await fetch('/api/url-post', {
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
			const mapped = {
				lemonScore: analysis.score ?? null,
				label: lemon.label || null,
				breakdown: lemon.breakdown || {},
				reasons: lemon.reasons || (analysis.reasons || []),
				productSummary: analysis.productSummary || (data.rainforestData && (data.rainforestData.product || null)) || null,
				raw: data || analysis || null,
				saved: data.saved || false,
			}

			setResult(mapped)
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

	function HomeContent() {
		return (
			<div className="main-content">
				<div className="content">
					<h1 className="project-title">🍋 LemonAid</h1>
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

					{result && (
						<div className="result-container">
							<h2 className="result-title">Analysis Complete</h2>

							<div className="lemon-score">
								<div className="score-label">Lemon Score</div>
								<div className="score-value">{result.lemonScore ?? '—'}</div>
								<div className="score-badge">{result.label ?? ''}</div>
							</div>

							{result.productSummary && (
								<div className="product-summary">
									<h3>Product</h3>
									<div className="product-title">{result.productSummary.title}</div>
									<div className="product-meta">
										<span>ASIN: {result.productSummary.asin}</span>
										{result.productSummary.rating != null && (
											<span>
												{' '}
												| Rating: {result.productSummary.rating} ({result.productSummary.ratings_total || 0})
											</span>
										)}
										{result.productSummary.price && (
											<span> | Price: {result.productSummary.price.value} {result.productSummary.price.currency}</span>
										)}
									</div>
								</div>
							)}

							<div className="breakdown">
								<h3>Breakdown</h3>
								<ul>
									{Object.entries(result.breakdown || {}).map(([k, v]) => (
										<li key={k}><strong>{k}:</strong> {v}</li>
									))}
								</ul>
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
