import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { GameProvider } from './context/GameContext.jsx';
import './index.css';

class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('⚔️ [The Wayward Flagon] Uncaught error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0704] text-[#ede0c8] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-[#1a0f0a] border border-[#d4a574]/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-[#f0c987] font-serif">⚔️ A Disturbance in the Tavern</h2>
            <p className="text-sm text-[#ede0c8]/80 leading-relaxed">
              An unexpected disturbance interrupted the chronicler. You can refresh or return to the taproom.
            </p>
            <div className="bg-[#0e0704] p-3 rounded border border-red-900/50 text-xs text-red-300 font-mono overflow-auto max-h-40">
              {this.state.error?.message || String(this.state.error)}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-[#8a4b1e] hover:bg-[#a65b25] text-white font-medium text-xs transition-colors"
              >
                Reload Game
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('wayward_flagon_save_v2');
                  } catch {}
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-lg bg-[#2b1810] hover:bg-[#3d2317] border border-[#d4a574]/30 text-[#ede0c8] text-xs transition-colors"
              >
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameErrorBoundary>
      <GameProvider>
        <App />
      </GameProvider>
    </GameErrorBoundary>
  </React.StrictMode>,
);

