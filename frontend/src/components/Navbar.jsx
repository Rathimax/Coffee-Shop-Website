import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Navbar = () => {
  const navRef = useRef(null);

  useEffect(() => {
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  }, []);

  return (
    <nav 
      ref={navRef}
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1200px',
        height: '70px',
        background: 'rgba(241, 240, 229, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        zIndex: 1000,
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(186, 171, 146, 0.3)'
      }}
    >
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>
        Caffè Reale
      </div>
      <ul style={{ display: 'flex', gap: '30px', fontWeight: '500' }}>
        <li><a href="#home">Home</a></li>
        <li><a href="#menu">Menu</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <button style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '10px 25px',
        borderRadius: '25px',
        fontWeight: '600'
      }}>
        Order Now
      </button>
    </nav>
  );
};

export default Navbar;
