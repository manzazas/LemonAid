import React from 'react'
import './Features.css'

export default function Features() {
  return (
    <section className="features-page">
      <div className="features-inner">
        <h1 className="features-title">Features</h1>
        <p className="features-lead">What LemonAid gives you at a glance</p>

        <div className="features-grid">
          <article className="feature-card">
            <h3>Product Analysis</h3>
            <p>Fetch product data from the Rainforest API and parse listing details, price, seller and reviews.</p>
          </article>

          <article className="feature-card">
            <h3>Lemon Score</h3>
            <p>Rule-based scoring combines review, seller, price, listing and age signals into a 0–100 score.</p>
          </article>

          <article className="feature-card">
            <h3>Caching</h3>
            <p>Analyze once and cache results in MongoDB; cached entries are returned to save API calls.</p>
          </article>

          <article className="feature-card">
            <h3>Raw JSON</h3>
            <p>Inspect the full Rainforest response for debugging or advanced use-cases.</p>
          </article>
        </div>

        <div className="features-footer">
          <p>Use the search box on the home page to paste an Amazon listing URL and generate a Lemon Score.</p>
        </div>
      </div>
    </section>
  )
}

