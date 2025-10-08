import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import DischargeSummaryGenerator from './components/DischargeSummaryGenerator';
import './index.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="fixed top-4 right-4 z-50 no-print">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-700" />}
        </button>
      </div>
      
      <DischargeSummaryGenerator />
    </div>
  );
}

export default App;