import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import DischargeSummaryGenerator from './components/DischargeSummaryGenerator';
import './index.css';

/**
 * App - Root component of the Discharge Summary Generator application
 * 
 * This is the main entry point component that provides the overall application structure.
 * It manages the application-wide dark mode theme and renders the main discharge summary
 * generator functionality.
 * 
 * Key Features:
 * - Dark mode toggle: Allows users to switch between light and dark themes for better
 *   viewing comfort during extended use
 * - Responsive layout: Provides a full-screen container that adapts to different screen sizes
 * - Theme persistence: Dark mode state persists across component re-renders
 * - Accessibility: Includes proper ARIA labels for screen readers
 * 
 * Component Structure:
 * - Fixed dark mode toggle button (top-right corner)
 * - Full-screen container with theme-aware background colors
 * - Main DischargeSummaryGenerator component for core functionality
 * 
 * @returns {JSX.Element} The root application component with dark mode support
 */
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