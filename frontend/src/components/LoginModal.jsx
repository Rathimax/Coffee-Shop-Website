import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { loginWithGoogle, loginWithEmail, signUpWithEmail, resetPassword } from '../firebase';

const LoginModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.4, ease: 'power2.out' });
      gsap.fromTo(modalRef.current, 
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' }
      );
    } else {
      gsap.to(overlayRef.current, { opacity: 0, visibility: 'hidden', duration: 0.3, ease: 'power2.in' });
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (error) {
      setError(error.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    try {
      await resetPassword(email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (error) {
      setError(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28, 25, 23, 0.4)',
        backdropFilter: 'blur(12px)',
        zIndex: 20000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        visibility: 'hidden',
        opacity: 0,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(241, 240, 229, 0.9)',
          backdropFilter: 'blur(20px)',
          padding: '40px',
          borderRadius: '32px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255,255,255,0.4)',
          border: '1px solid rgba(163, 119, 100, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(163, 119, 100, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(163, 119, 100, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(163, 119, 100, 0.1)'}
        >✕</button>

        <div ref={contentRef}>
          <h2 style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '2.4rem', 
            color: 'var(--foreground)', 
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            {isSignUp ? 'Join Us' : 'Welcome back'}
          </h2>
          <p style={{ 
            color: 'var(--muted-foreground)', 
            marginBottom: '32px',
            textAlign: 'center',
            fontSize: '0.95rem'
          }}>
            {isSignUp ? 'Create an account to start your coffee journey.' : 'Login to order your favorite beans.'}
          </p>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', marginLeft: '4px' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: '14px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(163, 119, 100, 0.2)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(163, 119, 100, 0.2)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', marginLeft: '4px' }}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: '14px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(163, 119, 100, 0.2)',
                  background: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(163, 119, 100, 0.2)'}
              />
              {!isSignUp && (
                <button 
                  type="button"
                  onClick={handlePasswordReset}
                  style={{ 
                    alignSelf: 'flex-end', 
                    fontSize: '0.8rem', 
                    color: 'var(--primary)', 
                    marginTop: '4px',
                    opacity: 0.8
                  }}
                >
                  Forgot Password?
                </button>
              )}
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
            {resetSent && <p style={{ color: '#22c55e', fontSize: '0.85rem', textAlign: 'center' }}>Password reset email sent!</p>}

            <button 
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '16px',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: '600',
                marginTop: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 15px -3px rgba(163, 119, 100, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div style={{ 
            margin: '24px 0', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            opacity: 0.3
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--primary)' }}></div>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--primary)' }}></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '14px',
              background: 'white',
              border: '1px solid rgba(163, 119, 100, 0.1)',
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#333',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9f9f9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
            Continue with Google
          </button>

          <p style={{ 
            marginTop: '32px', 
            fontSize: '0.9rem', 
            textAlign: 'center',
            color: 'var(--muted-foreground)' 
          }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              style={{ 
                color: 'var(--primary)', 
                fontWeight: '700',
                textDecoration: 'underline'
              }}
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>

          <p style={{ 
            marginTop: '24px', 
            fontSize: '0.75rem', 
            textAlign: 'center',
            opacity: 0.5,
            lineHeight: '1.4'
          }}>
            By continuing, you agree to Beige & Beans' <br/>
            <span style={{ textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
