import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { logout } from '../firebase';

gsap.registerPlugin(ScrollToPlugin);

const NavLink = ({ href, children, onClick }) => {
  const lineRef = useRef(null);

  const onMouseEnter = () => {
    gsap.to(lineRef.current, {
      width: '100%',
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const onMouseLeave = () => {
    gsap.to(lineRef.current, {
      width: '0%',
      duration: 0.3,
      ease: 'power2.in',
      overwrite: 'auto'
    });
  };

  return (
    <li>
      <a 
        href={href} 
        onClick={onClick} 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ 
          position: 'relative', 
          padding: '5px 0',
          transition: 'color 0.3s ease',
          display: 'inline-block',
          color: 'inherit',
          textDecoration: 'none'
        }}
      >
        {children}
        <span 
          ref={lineRef}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0%',
            height: '1.5px',
            background: 'var(--accent)',
            opacity: 0.6,
            borderRadius: '2px'
          }}
        />
      </a>
    </li>
  );
};

const NavIcon = ({ children, onClick, style }) => (
  <button 
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      color: 'rgba(255, 255, 255, 0.8)',
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      borderRadius: '50%',
      position: 'relative',
      ...style
    }}
    onMouseEnter={(e) => {
      gsap.to(e.currentTarget, { color: 'white', scale: 1.1, duration: 0.3 });
    }}
    onMouseLeave={(e) => {
      gsap.to(e.currentTarget, { color: 'rgba(255, 255, 255, 0.8)', scale: 1, duration: 0.3 });
    }}
  >
    {children}
  </button>
);

const Navbar = ({ searchQuery, setSearchQuery, user, onLoginClick }) => {
  const navRef = useRef(null);
  const actionIconsRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);

  useGSAP(() => {
    // Initial entrance
    gsap.from(navRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });

    if (actionIconsRef.current) {
        gsap.from(actionIconsRef.current.children, {
          x: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 0.4,
          clearProps: "opacity,x"
        });
    }
  }, { scope: navRef });

  // Handle search expansion animation
  useGSAP(() => {
    if (isSearching) {
      // Hide other icons and expand search
      gsap.to('.profile-icon, .bag-icon', {
        width: 0,
        opacity: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        duration: 0.4,
        ease: 'power2.inOut'
      });
      gsap.to('.search-container', {
        width: '250px',
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => searchInputRef.current?.focus()
      });
    } else {
      // Show icons and collapse search
      gsap.to('.profile-icon, .bag-icon', {
        width: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power2.inOut',
        clearProps: 'all'
      });
      gsap.to('.search-container', {
        width: '40px',
        duration: 0.4,
        ease: 'power3.inOut'
      });
    }
  }, { dependencies: [isSearching], scope: navRef });

  const scrollToSection = (e, targetId, onComplete) => {
    if (e) e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: offsetPosition, autoKill: true },
        ease: "power4.inOut",
        onComplete: onComplete
      });
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      scrollToSection(null, '#menu');
      setIsSearching(false);
    }
    if (e.key === 'Escape') {
      setIsSearching(false);
    }
  };

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '1200px',
        height: '65px',
        background: 'linear-gradient(135deg, rgba(241, 240, 229, 0.15), rgba(163, 119, 100, 0.1))',
        WebkitBackdropFilter: 'blur(25px) saturate(180%)',
        backdropFilter: 'blur(25px) saturate(180%)',
        borderRadius: '20px',
        display: 'grid',
        gridTemplateColumns: 'minmax(120px, 1fr) auto minmax(120px, 1fr)',
        alignItems: 'center',
        padding: '0 30px',
        zIndex: 9999,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Brand Logo */}
      <div style={{ 
        fontSize: '1.4rem', 
        fontWeight: 'bold', 
        color: 'white', 
        fontFamily: 'var(--font-serif)', 
        letterSpacing: '1px', 
        justifySelf: 'start',
        whiteSpace: 'nowrap'
      }}>
        Beige <span style={{ color: 'var(--accent)' }}>&</span> Beans
      </div>

      {/* Nav Links */}
      <ul className="nav-links" style={{ 
        display: 'flex', 
        gap: 'clamp(15px, 3vw, 40px)', 
        fontWeight: '500', 
        color: 'rgba(255,255,255,0.8)', 
        justifySelf: 'center',
        listStyle: 'none',
        margin: 0,
        padding: 0
      }}>
        <NavLink href="#home" onClick={(e) => scrollToSection(e, '#home')}>Home</NavLink>
        <NavLink href="#menu" onClick={(e) => scrollToSection(e, '#menu')}>Menu</NavLink>
        <NavLink href="#about" onClick={(e) => scrollToSection(e, '#about')}>About</NavLink>
        <NavLink href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>Contact</NavLink>
      </ul>

      {/* Action Icons */}
      <div 
        ref={actionIconsRef}
        className="action-icons" 
        style={{ display: 'flex', gap: '8px', justifySelf: 'end', alignItems: 'center' }}
      >
        {/* Expanding Search Container */}
        <div 
          className="search-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: isSearching ? 'rgba(255,255,255,0.1)' : 'transparent',
            borderRadius: '30px',
            width: '40px',
            overflow: 'hidden',
            transition: 'background 0.3s'
          }}
        >
          <NavIcon onClick={() => setIsSearching(!isSearching)} style={{ flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </NavIcon>
          <input 
            ref={searchInputRef}
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '0.9rem',
              width: '100%',
              paddingRight: isSearching ? '5px' : '0',
              visibility: isSearching ? 'visible' : 'hidden'
            }}
          />
          {isSearching && (
            <button 
              onClick={() => setIsSearching(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '0 12px 0 5px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.5)'}
            >
              ✕
            </button>
          )}
        </div>

        <div className="profile-icon">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                    onClick={() => logout()}
                    style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--accent)',
                        cursor: 'pointer',
                        padding: 0
                    }}
                    title="Logout"
                >
                    <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
            </div>
          ) : (
            <NavIcon onClick={onLoginClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </NavIcon>
          )}
        </div>

        <div className="bag-icon">
          <NavIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6V5a4 4 0 0 1 8 0v1" />
              <path d="M5 6h14l-1 14H6L5 6z" />
              <circle cx="10" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="14" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </NavIcon>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
