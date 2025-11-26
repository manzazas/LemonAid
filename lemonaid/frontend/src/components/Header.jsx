import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Header.module.css'
import logo from '../assets/lemonaid logo.png'

export default function Header({ onHome }) {
  const handleHome = (e) => {
    e.preventDefault()
    if (typeof onHome === 'function') onHome()
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} onClick={handleHome}>
          <img src={logo} alt="LemonAid logo" className={styles.logo} />
          <span className={styles.siteName}>LemonAid</span>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/features">Features</Link>
          <a href="#contact" onClick={(e)=>{e.preventDefault(); document.getElementById('contact')?.scrollIntoView({behavior:'smooth'})}}>Contact</a>
        </nav>
      </div>
    </header>
  )
}
