import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const CartDrawer = ({ isOpen, onClose, cart, updateQuantity, removeFromCart }) => {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      
      // Open animation
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, display: 'block' });
      gsap.to(drawerRef.current, { x: 0, duration: 0.6, ease: 'power4.out' });
      
      // Stagger items
      const validItems = itemsRef.current.filter(el => el !== null);
      if (validItems.length > 0) {
        gsap.fromTo(validItems, 
          { opacity: 0, x: 20 }, 
          { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, delay: 0.3 }
        );
      }
    } else {
      // Re-enable scrolling
      document.body.style.overflow = 'auto';
      
      // Close animation
      gsap.to(drawerRef.current, { x: '100%', duration: 0.5, ease: 'power4.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, display: 'none' });
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const subtotal = (cart || []).reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0) || 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <>
      {/* SVG Grain Filter */}
      <svg style={{ position: 'fixed', width: 0, height: 0 }}>
        <filter id="grainy">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {/* Overlay */}
      <div 
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(31, 26, 23, 0.4)',
          backdropFilter: 'blur(4px)',
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
          width: 'min(450px, 100vw)',
          background: 'var(--background)',
          zIndex: 10001,
          transform: 'translateX(100%)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Grain Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          filter: 'url(#grainy)',
          opacity: 0.04,
          pointerEvents: 'none',
          zIndex: 1,
        }} />

        {/* Header */}
        <div style={{ 
          padding: '40px 30px 20px', 
          borderBottom: '1px solid rgba(186, 171, 146, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.6rem', 
              color: 'var(--primary)',
              fontWeight: '900'
            }}>Your Bag</h2>
            <p style={{ 
              margin: '5px 0 0', 
              fontSize: '0.65rem', 
              opacity: 0.5, 
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-mono)'
            }}>{cart.reduce((acc, item) => acc + item.quantity, 0)} ITEMS SELECTED</p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(186, 171, 146, 0.1)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--primary)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(186, 171, 146, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(186, 171, 146, 0.1)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          position: 'relative',
          zIndex: 2
        }}>
          {cart.length === 0 ? (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: 0.5,
              textAlign: 'center'
            }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '20px' }}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                <path d="M3 6h18"></path>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '8px' }}>Your bag is empty.</h3>
              <p style={{ fontSize: '0.85rem' }}>Let's fill it with some artisan beans.</p>
              <button 
                onClick={onClose}
                style={{
                  marginTop: '25px',
                  padding: '12px 25px',
                  border: '1px solid var(--primary)',
                  borderRadius: '25px',
                  background: 'transparent',
                  color: 'var(--primary)',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Start Browsing
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div 
                key={item.id || `cart-item-${index}`}
                ref={el => {
                  if (el) itemsRef.current[index] = el;
                  else itemsRef.current[index] = null;
                }}
                style={{
                  display: 'flex',
                  gap: '15px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid rgba(186, 171, 146, 0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#f9f9f9',
                  flexShrink: 0
                }}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => e.target.src = "/menu/classic-espresso.jpg"}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: 'var(--foreground)' }}>{item.name}</h4>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.9rem' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      background: 'rgba(186, 171, 146, 0.05)',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 12h14"></path>
                        </svg>
                      </button>
                      <span style={{ width: '18px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M12 5v14M5 12h14"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    color: '#ff4444'
                  }}
                  className="remove-btn"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
                <style>{`
                  div:hover > .remove-btn { opacity: 1; transform: translateY(0); }
                  .remove-btn:hover { background: #ff4444 !important; color: white !important; }
                `}</style>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div style={{ 
            padding: '40px 30px', 
            background: 'white', 
            borderTop: '1px solid rgba(186, 171, 146, 0.2)',
            position: 'relative',
            zIndex: 2,
            boxShadow: '0 -20px 40px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5, fontSize: '0.6rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>SUBTOTAL</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5, fontSize: '0.6rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>TAX (EST.)</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${tax.toFixed(2)}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '5px', 
                paddingTop: '8px',
                borderTop: '1px dashed rgba(186, 171, 146, 0.1)',
                color: 'var(--foreground)' 
              }}>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-serif)', fontWeight: '900' }}>Bag Total</span>
                <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: '900' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            <button style={{
              width: '100%',
              padding: '10px',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: '900',
              fontFamily: 'var(--font-serif)',
              boxShadow: '0 4px 12px rgba(163, 119, 100, 0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 15px rgba(163, 119, 100, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(163, 119, 100, 0.2)';
            }}
            >
              Begin Checkout
            </button>
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              marginTop: '8px',
              opacity: 0.3
            }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span style={{ 
                fontSize: '0.5rem', 
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: 'var(--font-mono)',
                fontWeight: '700'
              }}>Encrypted Checkout</span>
            </div>
            
            <p style={{ 
              textAlign: 'center', 
              fontSize: '0.5rem', 
              opacity: 0.25, 
              marginTop: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-mono)',
              borderTop: '1px solid rgba(186, 171, 146, 0.05)',
              paddingTop: '8px'
            }}>
              Complimentary shipping on orders over $50
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
