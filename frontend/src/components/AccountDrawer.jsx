import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { logout } from '../firebase';

const AccountDrawer = ({ isOpen, onClose, user }) => {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, display: 'block' });
      gsap.to(drawerRef.current, { x: 0, duration: 0.6, ease: 'power4.out' });
      
      gsap.fromTo(contentRef.current.children, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.3, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = 'auto';
      gsap.to(drawerRef.current, { x: '100%', duration: 0.5, ease: 'power4.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, display: 'none' });
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!user) return null;

  const memberSince = user.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).getFullYear() 
    : new Date().getFullYear();

  const sections = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Full Name', value: user.displayName || 'Not Set' },
        { label: 'Email Address', value: user.email },
        { label: 'Phone Number', value: user.phoneNumber || 'Not provided' },
      ]
    },
    {
      title: 'Shipping Address',
      items: [
        { label: 'Default Address', value: 'No address on file' },
      ]
    },
    {
      title: 'Order History',
      items: [
        { label: 'Recent Orders', value: 'No orders yet' },
      ]
    }
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(31, 26, 23, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          opacity: 0,
          display: 'none',
        }}
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(500px, 100vw)',
          background: '#fdfcfb', // Lighter cream for a clean profile feel
          zIndex: 10001,
          transform: 'translateX(100%)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 50px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          color: '#2a2420'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '40px 40px 30px', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: '500' }}>Account</h2>
            <p style={{ margin: '5px 0 0', opacity: 0.5, fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Brewing Since {memberSince}</p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              opacity: 0.3,
              transition: 'opacity 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = 1}
            onMouseLeave={(e) => e.target.style.opacity = 0.3}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '20px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '40px'
          }}
        >
          {/* User Profile Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              border: '3px solid #f1f0e5',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
              <img src={user.photoURL} alt={user.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>{user.displayName}</h3>
              <p style={{ margin: '3px 0 0', opacity: 0.6, fontSize: '0.9rem' }}>{user.email}</p>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section, idx) => (
            <div key={idx}>
              <h4 style={{ 
                fontSize: '0.7rem', 
                textTransform: 'uppercase', 
                letterSpacing: '2px', 
                color: 'var(--accent)',
                marginBottom: '20px',
                opacity: 0.8
              }}>
                {section.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {section.items.map((item, iIdx) => (
                  <div key={iIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <p style={{ margin: 0, opacity: 0.4, marginBottom: '4px' }}>{item.label}</p>
                      <p style={{ margin: 0, fontWeight: '500' }}>{item.value}</p>
                    </div>
                    <button style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--accent)', 
                      fontSize: '0.75rem', 
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      opacity: 0.6
                    }}>
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '30px 40px', 
          borderTop: '1px solid rgba(0,0,0,0.05)',
          background: '#f9f8f6'
        }}>
          <button 
            onClick={() => {
              logout();
              onClose();
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid #e0ddd7',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: '#665c54'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2a2420';
              e.target.style.color = 'white';
              e.target.style.borderColor = '#2a2420';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#665c54';
              e.target.style.borderColor = '#e0ddd7';
            }}
          >
            Log Out of Artisan Account
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', opacity: 0.4, marginTop: '15px' }}>
            Version 2.4.0 • Secured by Beige & Beans Cloud
          </p>
        </div>
      </div>
    </>
  );
};

export default AccountDrawer;
