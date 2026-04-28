import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { updateUserProfile } from '../firebase';

const AuthDetailsForm = ({ isOpen, user, onComplete }) => {
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.4 });
      gsap.fromTo(modalRef.current, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }
      );
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // In a real app, you'd probably save the phone number to Firestore
      // For now, we'll just update the display name and call onComplete
      await updateUserProfile(user, { displayName });
      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28, 25, 23, 0.6)',
        backdropFilter: 'blur(16px)',
        zIndex: 30000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        visibility: 'hidden',
        opacity: 0,
        padding: '20px'
      }}
    >
      <div 
        ref={modalRef}
        style={{
          background: 'var(--background)',
          padding: '48px',
          borderRadius: '32px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(163, 119, 100, 0.2)',
          textAlign: 'center'
        }}
      >
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'rgba(163, 119, 100, 0.1)', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '1.5rem'
        }}>☕</div>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--foreground)', marginBottom: '12px' }}>
          Final Touches
        </h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '32px', fontSize: '1rem', lineHeight: '1.5' }}>
          To give you the best experience, we just need a few more details for your profile.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', marginLeft: '4px' }}>Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              style={{
                padding: '16px 20px',
                borderRadius: '18px',
                border: '1px solid rgba(163, 119, 100, 0.2)',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)', marginLeft: '4px' }}>Phone Number</label>
            <input 
              type="tel" 
              placeholder="+91 00000 00000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              style={{
                padding: '16px 20px',
                borderRadius: '18px',
                border: '1px solid rgba(163, 119, 100, 0.2)',
                background: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '18px',
              borderRadius: '18px',
              fontSize: '1.1rem',
              fontWeight: '700',
              marginTop: '12px',
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 20px -5px rgba(163, 119, 100, 0.4)'
            }}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '0.8rem', opacity: 0.4 }}>
          Your data is secure and will only be used for order notifications.
        </p>
      </div>
    </div>
  );
};

export default AuthDetailsForm;
