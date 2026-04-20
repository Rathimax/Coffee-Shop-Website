import React from 'react'
import Navbar from './components/Navbar'
import CoffeeHero from './components/CoffeeHero'
import MenuSection from './components/MenuSection'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navbar />
      <CoffeeHero />
      <MenuSection />

      {/* Footer Section */}
      <footer style={{
        padding: '60px 5%',
        background: 'var(--sidebar)',
        color: 'var(--foreground)',
        textAlign: 'center',
        borderTop: '1px solid var(--border)'
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '20px' }}>Caffè Reale</h2>
        <p style={{ opacity: 0.7, maxWidth: '400px', margin: '0 auto 30px' }}>
          Sustainable, artisan coffee delivered from our roastery to your cup.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
          <span>Instagram</span>
          <span>Twitter</span>
          <span>Facebook</span>
        </div>
        <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
          © 2026 Caffè Reale. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default App
