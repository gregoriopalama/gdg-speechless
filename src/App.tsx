import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SpeechlessProvider } from './context/SpeechlessContext';
import { useSpeechless } from './context/SpeechlessContext';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import SpeechlessView from './pages/SpeechlessView';

const MainNavigator: React.FC = () => {
  const { gameState, loading } = useSpeechless();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        color: '#1a1a1a',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold'
      }}>
        Inizializzazione Speechless...
      </div>
    );
  }

  const isPlaying = gameState?.currentRound && 
    ['INTRO', 'PLAYING', 'FINISHED'].includes(gameState.currentRound.status);

  if (isPlaying) {
    return <SpeechlessView />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <SpeechlessProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainNavigator />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </SpeechlessProvider>
  );
}

export default App;
