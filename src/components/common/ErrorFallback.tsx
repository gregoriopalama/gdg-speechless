import React from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorFallbackProps {
  error: Error | string;
  onReset: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const { t } = useTranslation();

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconContainerStyle}>
          <span style={{ fontSize: '3rem' }}>🐵</span>
        </div>
        <h1 style={titleStyle}>{t('gameplay.error.title')}</h1>
        <p style={messageStyle}>{t('gameplay.error.message')}</p>
        
        {errorMessage && (
          <div style={debugContainerStyle}>
            <strong>Dettagli tecnici:</strong>
            <pre style={preStyle}>{errorMessage}</pre>
          </div>
        )}

        <button onClick={onReset} style={buttonStyle}>
          {t('gameplay.error.back')}
        </button>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100vw',
  backgroundColor: '#f8f9fa',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  boxSizing: 'border-box',
  fontFamily: '"Outfit", "Inter", sans-serif',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #dee2e6',
  borderRadius: '20px',
  padding: '3rem',
  textAlign: 'center',
  maxWidth: '550px',
  width: '100%',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
};

const iconContainerStyle: React.CSSProperties = {
  marginBottom: '1.5rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: '800',
  color: '#dc3545',
  margin: '0 0 1rem 0',
};

const messageStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: '#495057',
  lineHeight: '1.5',
  margin: '0 0 2rem 0',
};

const debugContainerStyle: React.CSSProperties = {
  backgroundColor: '#f1f3f5',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '1rem',
  textAlign: 'left',
  marginBottom: '2rem',
};

const preStyle: React.CSSProperties = {
  margin: '0.5rem 0 0 0',
  fontSize: '0.85rem',
  color: '#868e96',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  border: 'none',
  padding: '0.8rem 2rem',
  borderRadius: '8px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
};

export default ErrorFallback;
