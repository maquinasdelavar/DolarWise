import React from 'react';

export const RiveLoading = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <div className="spinner" style={{
        width: '50px',
        height: '50px',
        border: '5px solid #e2e8f0',
        borderTop: '5px solid #059669',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <p style={{ marginTop: '20px', color: '#64748b', fontWeight: 500 }}>Atualizando valores...</p>
    </div>
  );
};

export default RiveLoading;
