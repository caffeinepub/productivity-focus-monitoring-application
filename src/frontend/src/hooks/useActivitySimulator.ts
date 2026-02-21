import { useState, useEffect } from 'react';
import { useApplications } from './useApplications';

const STORAGE_KEY = 'focus-guardian-activity-state';

interface ActivityState {
  currentApp: string;
  category: 'productive' | 'distracting' | 'neutral';
  switchHistory: Array<{ app: string; timestamp: number }>;
}

export function useActivitySimulator() {
  const { applications } = useApplications();
  
  // Initialize state from localStorage if available
  const [currentApp, setCurrentApp] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: ActivityState = JSON.parse(stored);
        return state.currentApp;
      }
    } catch (error) {
      console.error('Failed to restore activity state:', error);
    }
    return 'Visual Studio Code';
  });
  
  const [category, setCategory] = useState<'productive' | 'distracting' | 'neutral'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: ActivityState = JSON.parse(stored);
        return state.category;
      }
    } catch (error) {
      console.error('Failed to restore activity state:', error);
    }
    return 'productive';
  });
  
  const [switchHistory, setSwitchHistory] = useState<Array<{ app: string; timestamp: number }>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: ActivityState = JSON.parse(stored);
        return state.switchHistory || [];
      }
    } catch (error) {
      console.error('Failed to restore activity state:', error);
    }
    return [];
  });
  
  const [switchCount, setSwitchCount] = useState(0);
  const [switchesPerMinute, setSwitchesPerMinute] = useState(0);
  const [switchesPerHour, setSwitchesPerHour] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [lastSwitchTime, setLastSwitchTime] = useState(Date.now());

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    try {
      const state: ActivityState = {
        currentApp,
        category,
        switchHistory,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save activity state:', error);
    }
  }, [currentApp, category, switchHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && applications.length > 0) {
        const randomApp = applications[Math.floor(Math.random() * applications.length)];

        setCurrentApp(randomApp.name);
        setCategory(randomApp.category);
        setSwitchCount((prev) => prev + 1);
        
        const now = Date.now();
        setSwitchHistory((prev) => [...prev, { app: randomApp.name, timestamp: now }]);

        setLastSwitchTime(now);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [applications]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeWindow = 60000;
      setSwitchesPerMinute(switchCount / ((now - lastSwitchTime + timeWindow) / timeWindow));
      setSwitchesPerHour(switchCount * 7.5);
    }, 5000);

    return () => clearInterval(interval);
  }, [switchCount, lastSwitchTime]);

  return {
    currentApp,
    category,
    switchCount,
    switchesPerMinute,
    switchesPerHour,
    isActive,
  };
}
