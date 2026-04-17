import React from 'react';

const CoffeeCard = ({ item }) => {
  return (
    <div className="coffee-card" style={{
      background: 'var(--card)',
      borderRadius: '24px',
      padding: '24px',
      textAlign: 'left',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      border: '1px solid rgba(186, 171, 146, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ 
        width: '100%', 
        height: '200px', 
        borderRadius: '16px', 
        overflow: 'hidden',
        background: '#e0e0e0'
      }}>
        <img 
          src={item.imageUrl || "/coffee.png"} 
          alt={item.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--foreground)' }}>
            {item.name}
          </h3>
          <span style={{ fontWeight: '700', color: 'var(--primary)' }}>${item.price.toFixed(2)}</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '16px', lineHeight: '1.4' }}>
          {item.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            background: 'var(--muted)', 
            padding: '4px 12px', 
            borderRadius: '12px',
            color: 'var(--primary)',
            fontWeight: '600'
          }}>
            {item.category}
          </span>
          <button style={{
            background: 'var(--primary)',
            color: 'white',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
          }}>+</button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;
