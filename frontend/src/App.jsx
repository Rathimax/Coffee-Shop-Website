import React from 'react'
import Navbar from './components/Navbar'
import CoffeeHero from './components/CoffeeHero'
import MenuSection from './components/MenuSection'
import AboutSection from './components/AboutSection'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navbar />
      <CoffeeHero />
      <MenuSection />
      <AboutSection />

      {/* Footer Section */}
      <footer style={{
        padding: '30px 5%',
        background: 'var(--sidebar)',
        color: 'var(--foreground)',
        textAlign: 'center',
        borderTop: '1px solid var(--border)'
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '10px', fontSize: '1.5rem' }}>Beige & Beans</h2>
        <p style={{ opacity: 0.7, maxWidth: '400px', margin: '0 auto 15px', fontSize: '0.9rem' }}>
          Sustainable, artisan coffee delivered from our roastery to your cup.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px' }}>
          <span>Instagram</span>
          <span>Twitter</span>
          <span>Facebook</span>
        </div>
        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>
          © 2026 Beige & Beans. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default App
