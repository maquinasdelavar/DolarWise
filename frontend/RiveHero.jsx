import React from 'react';

export const RiveHero = () => {
  return (
    <div style={{ 
      width: '100%', 
      height: '400px', 
      borderRadius: '16px', 
      overflow: 'hidden',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#059669',
      position: 'relative'
    }}>
      <img src="as.jpg" alt="Destaque DollarWise" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};

export default RiveHero;
