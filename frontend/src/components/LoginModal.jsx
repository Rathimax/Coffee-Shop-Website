import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { loginWithGoogle } from '../firebase';

const LoginModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.3 });
      gsap.fromTo(modalRef.current, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    } else {
      gsap.to(overlayRef.current, { opacity: 0, visibility: 'hidden', duration: 0.3 });
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        visibility: 'hidden',
        opacity: 0
      }}
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--background)',
          padding: '40px',
          borderRadius: '30px',
          width: '90%',
          maxWidth: '450px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border)',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '1.2rem',
            color: 'var(--primary)',
            opacity: 0.5,
            cursor: 'pointer'
          }}
        >✕</button>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary)', marginBottom: '10px' }}>
          Welcome Back
        </h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '30px' }}>
          Log in with Google to start ordering your favorite beans.
        </p>

        <button 
          onClick={handleGoogleLogin}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '14px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '15px',
            fontSize: '1rem',
            fontWeight: '600',
            color: '#333',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
          Continue with Google
        </button>

        <p style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.6 }}>
          By continuing, you agree to our Terms and Conditions.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
