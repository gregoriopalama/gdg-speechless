import React, { useState } from 'react';
import { useSpeechless } from '../context/SpeechlessContext';
import { useTranslation } from 'react-i18next';

export const AdminPanel: React.FC = () => {
  const { gameState, loading, error, updateHostConfig, resetGame } = useSpeechless();
  const { i18n } = useTranslation();
  const [seedInput, setSeedInput] = useState<string>(gameState?.seed || '');
  const [slidesCountInput, setSlidesCountInput] = useState<number>(gameState?.slidesCount || 5);
  const [visualStyleInput, setVisualStyleInput] = useState<string>(gameState?.visualStyle || '');
  const [saving, setSaving] = useState<boolean>(false);

  if (loading) return <div style={{ padding: '2rem', color: '#1a1a1a', fontFamily: 'sans-serif' }}>Caricamento sessione...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#d32f2f', fontFamily: 'sans-serif' }}>Errore: {error.message}</div>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHostConfig({
        seed: seedInput,
        slidesCount: Number(slidesCountInput),
        visualStyle: visualStyleInput || null,
        language: i18n.language as 'it' | 'en',
      });
    } catch (err) {
      console.error("Errore durante il salvataggio:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (lang: 'it' | 'en') => {
    i18n.changeLanguage(lang);
    updateHostConfig({ language: lang });
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2.5rem',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      color: '#212529',
      fontFamily: '"Outfit", "Inter", sans-serif',
      boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
      border: '1px solid #dee2e6'
    }}>
      <h1 style={{ borderBottom: '1px solid #e9ecef', paddingBottom: '1rem', color: '#1a1a1a', fontWeight: '900', margin: 0 }}>
        Speechless - Admin Panel
      </h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        {/* Lingua Applicazione */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 'bold', color: '#495057' }}>Lingua Evento</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => handleLanguageChange('it')}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: i18n.language === 'it' ? '#1a1a1a' : '#f1f3f5',
                color: i18n.language === 'it' ? '#fff' : '#495057',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.15s'
              }}
            >
              Italiano (IT)
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: i18n.language === 'en' ? '#1a1a1a' : '#f1f3f5',
                color: i18n.language === 'en' ? '#fff' : '#495057',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.15s'
              }}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Seed Evento */}
        <div>
          <label htmlFor="seed" style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 'bold', color: '#495057' }}>
            Seed Evento (Parole/Frasi chiave)
          </label>
          <input
            id="seed"
            type="text"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            placeholder="es. GDG Pescara, intelligenza artificiale"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              backgroundColor: '#f8f9fa',
              color: '#212529',
              boxSizing: 'border-box',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Numero di Slide */}
        <div>
          <label htmlFor="slidesCount" style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 'bold', color: '#495057' }}>
            Numero di Slide per Round
          </label>
          <input
            id="slidesCount"
            type="number"
            min={3}
            max={15}
            value={slidesCountInput}
            onChange={(e) => setSlidesCountInput(Number(e.target.value))}
            style={{
              width: '120px',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              backgroundColor: '#f8f9fa',
              color: '#212529',
              boxSizing: 'border-box',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Stile Visivo */}
        <div>
          <label htmlFor="visualStyle" style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 'bold', color: '#495057' }}>
            Stile Visivo Slide (opzionale)
          </label>
          <select
            id="visualStyle"
            value={visualStyleInput}
            onChange={(e) => setVisualStyleInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #ced4da',
              backgroundColor: '#f8f9fa',
              color: '#212529',
              boxSizing: 'border-box',
              outline: 'none',
              fontSize: '1rem'
            }}
          >
            <option value="">Nessuno Stile (Default)</option>
            <option value="Cyberpunk">Cyberpunk</option>
            <option value="Pixel Art">Pixel Art</option>
            <option value="Watercolor">Acquerello</option>
            <option value="Vector Art">Vettoriale 3D</option>
            <option value="Photorealistic">Fotorealistico</option>
          </select>
        </div>

        {/* Pulsante Salva */}
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '1rem',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginTop: '1rem',
            transition: 'background-color 0.15s'
          }}
        >
          {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
        </button>
      </form>

      {/* Sezione Controlli Rapidi */}
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e9ecef' }}>
        <h3 style={{ color: '#dc3545', margin: '0 0 1rem 0', fontWeight: 'bold' }}>Controlli Rapidi</h3>
        <button
          onClick={() => resetGame()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.15s'
          }}
        >
          Forza Reset Gioco (SETUP)
        </button>
      </div>
    </div>
  );
};
export default AdminPanel;
