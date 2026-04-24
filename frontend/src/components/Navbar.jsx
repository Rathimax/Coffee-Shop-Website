import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const Navbar = () => {
  const navRef = useRef(null);

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  }, { scope: navRef });

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      const offset = 80; // Offset for the fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      gsap.to(window, {
        duration: 1.2,
        scrollTo: { y: offsetPosition, autoKill: true },
        ease: "power4.inOut"
      });
    }
  };

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
      <li onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <a 
          href={href} 
          onClick={onClick} 
          style={{ 
            position: 'relative', 
            padding: '5px 0',
            transition: 'color 0.3s ease',
            display: 'inline-block'
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

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: '10px',
        left: '5%',
        right: '5%',
        width: '90%',
        maxWidth: '1200px',
        margin: '0 auto',
        height: '65px',
        background: 'linear-gradient(135deg, rgba(241, 240, 229, 0.15), rgba(163, 119, 100, 0.1))',
        WebkitBackdropFilter: 'blur(25px) saturate(180%)',
        backdropFilter: 'blur(25px) saturate(180%)',
        borderRadius: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 40px',
        zIndex: 9999,
        boxShadow: `
          0 8px 32px 0 rgba(0, 0, 0, 0.3),
          inset 0 0 0 1px rgba(255, 255, 255, 0.15),
          inset 0 8px 32px 0 rgba(255, 255, 255, 0.05)
        `,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      }}
    >
      <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'white', fontFamily: 'var(--font-serif)', letterSpacing: '1px', justifySelf: 'start' }}>
        Beige <span style={{ color: 'var(--accent)' }}>&</span> Beans
      </div>
      <ul style={{ display: 'flex', gap: '40px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', justifySelf: 'center' }}>
        <NavLink href="#home" onClick={(e) => scrollToSection(e, '#home')}>Home</NavLink>
        <NavLink href="#menu" onClick={(e) => scrollToSection(e, '#menu')}>Menu</NavLink>
        <NavLink href="#about" onClick={(e) => scrollToSection(e, '#about')}>About</NavLink>
        <NavLink href="#contact" onClick={(e) => scrollToSection(e, '#contact')}>Contact</NavLink>
      </ul>
      <button style={{
        background: 'rgba(163, 119, 100, 0.2)',
        WebkitBackdropFilter: 'blur(10px)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '10px 24px',
        borderRadius: '20px',
        fontWeight: '600',
        justifySelf: 'end',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6V5a4 4 0 0 1 8 0v1" />
          <path d="M5 6h14l-1 14H6L5 6z" />
          <circle cx="10" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="14" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
        Cart
      </button>
    </nav>
  );
};

export default Navbar;
