import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useTranslation } from 'react-i18next';

export const AdminPanel: React.FC = () => {
  const { gameState, loading, error, updateHostConfig, resetGame } = useGame();
  const { i18n } = useTranslation();
  const [seedInput, setSeedInput] = useState<string>(gameState?.seed || '');
  const [slidesCountInput, setSlidesCountInput] = useState<number>(gameState?.slidesCount || 5);
  const [visualStyleInput, setVisualStyleInput] = useState<string>(gameState?.visualStyle || '');
  const [saving, setSaving] = useState<boolean>(false);

  if (loading) return <div style={{ padding: '2rem', color: '#fff' }}>Caricamento sessione...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#ff4444' }}>Errore: {error.message}</div>;

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
      padding: '2rem',
      backgroundColor: '#1e1e2f',
      borderRadius: '12px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <h1 style={{ borderBottom: '1px solid #3d3d5c', paddingBottom: '1rem', color: '#ffd700' }}>
        Speechless - Admin Panel
      </h1>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        {/* Lingua Applicazione */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Lingua Evento</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => handleLanguageChange('it')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: i18n.language === 'it' ? '#ffd700' : '#3d3d5c',
                color: i18n.language === 'it' ? '#000' : '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Italiano (IT)
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: i18n.language === 'en' ? '#ffd700' : '#3d3d5c',
                color: i18n.language === 'en' ? '#000' : '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Seed Evento */}
        <div>
          <label htmlFor="seed" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
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
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #3d3d5c',
              backgroundColor: '#0f0f1a',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Numero di Slide */}
        <div>
          <label htmlFor="slidesCount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
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
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #3d3d5c',
              backgroundColor: '#0f0f1a',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Stile Visivo */}
        <div>
          <label htmlFor="visualStyle" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Stile Visivo Slide (opzionale)
          </label>
          <select
            id="visualStyle"
            value={visualStyleInput}
            onChange={(e) => setVisualStyleInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #3d3d5c',
              backgroundColor: '#0f0f1a',
              color: '#fff',
              boxSizing: 'border-box'
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
            backgroundColor: '#00c853',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            marginTop: '1rem'
          }}
        >
          {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
        </button>
      </form>

      {/* Sezione Controlli Rapidi */}
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #3d3d5c' }}>
        <h3 style={{ color: '#ff4444', margin: '0 0 1rem 0' }}>Controlli Rapidi</h3>
        <button
          onClick={() => resetGame()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#d50000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Forza Reset Gioco (SETUP)
        </button>
      </div>
    </div>
  );
};
export default AdminPanel;
