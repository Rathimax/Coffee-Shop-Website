import React, { useState } from 'react';

const CoffeeCard = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Smart Aspect Ratio Logic: Fluctuates height based on index to create Pinterest masonry effect
  const aspectRatios = ['130%', '160%', '110%', '145%'];
  const imagePaddingTop = aspectRatios[index % aspectRatios.length];

  // Deterministic height calculation for CSS Grid Masonry
  const getGridSpan = () => {
    const baseWidth = 260; // Reduced for smaller columns
    const imageRatio = parseFloat(aspectRatios[index % aspectRatios.length]) / 100;
    const padding = 26; // Reduced padding/margins
    const textHeight = 75; // Reduced approx height of text content
    const totalHeight = (baseWidth * imageRatio) + padding + textHeight;
    return Math.ceil(totalHeight);
  };

  const gridSpan = getGridSpan();

  const resolveImage = (item) => {
    return item.imageUrl || item.image_url || item.image || "/menu/classic-espresso.jpg";
  };

  const displayImage = resolveImage(item);
  const displayPrice = typeof item.price === 'number' ? item.price.toFixed(2) : (parseFloat(item.price) || 0).toFixed(2);

  const handleImageError = (e) => {
    e.target.src = "/menu/classic-espresso.jpg";
    e.target.onerror = null;
  };

  return (
    <div 
      className="coffee-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? 'rgba(186, 171, 146, 0.08)' : 'var(--card)', // Subtle tint on hover
        borderRadius: '24px',
        textAlign: 'left',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease', // Updated transition
        cursor: 'pointer',
        boxShadow: isHovered ? '0 15px 35px rgba(0,0,0,0.08)' : '0 8px 20px rgba(0,0,0,0.04)',
        border: '1px solid rgba(186, 171, 146, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        gridRowEnd: `span ${gridSpan}`,
        margin: '12px 0',
        opacity: 1,
        visibility: 'visible',
      }}
    >
      {/* Image Container with Dynamic Aspect Ratio */}
      <div style={{
        width: '100%',
        paddingTop: imagePaddingTop,
        position: 'relative',
        overflow: 'hidden',
        background: '#f5f5f5',
        borderRadius: '20px',
        margin: '8px',
        width: 'calc(100% - 16px)',
      }}>
        <img 
          src={displayImage} 
          alt={item.name} 
          onError={handleImageError}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.6s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          }}
        />
        
        {/* Pinterest-style Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isHovered ? 'rgba(0,0,0,0.2)' : 'transparent',
          transition: 'background 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          justifyContent: 'space-between',
        }}>
          {/* Category Badge */}
          <div style={{
            alignSelf: 'flex-start',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.3s ease',
          }}>
            <span style={{ 
              fontSize: '0.7rem', 
              background: 'rgba(255,255,255,0.9)', 
              backdropFilter: 'blur(5px)',
              padding: '4px 12px', 
              borderRadius: '20px',
              color: 'var(--primary)',
              fontWeight: '700',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {item.category}
            </span>
          </div>

          {/* Pinterest-style Save/Order Button */}
          <button style={{
            alignSelf: 'flex-end',
            background: 'var(--primary)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            border: 'none',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          }}>
            Order
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '0px 12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
          <h3 style={{ 
            margin: 0, 
            fontFamily: 'var(--font-serif)', 
            fontSize: '1rem', 
            color: 'var(--foreground)',
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            {item.name}
          </h3>
          <span style={{ 
            fontWeight: '800', 
            color: 'var(--primary)', 
            fontSize: '0.85rem',
            marginLeft: '6px'
          }}>${displayPrice}</span>
        </div>
        <p style={{ 
          fontSize: '0.75rem', 
          color: 'var(--muted-foreground)', 
          margin: 0, 
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.description}
        </p>
      </div>
    </div>
  );
};

export default CoffeeCard;
