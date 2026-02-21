import { useState, useEffect, useCallback } from 'react';

export type WarningLevel = 0 | 1 | 2 | 3;

interface WarningState {
  level: WarningLevel;
  dismissed: boolean;
  lastDismissedLevel: WarningLevel;
}

const STORAGE_KEY = 'focus-guardian-warnings';

export function useDistractionWarnings(destructiveVisitCount: number) {
  const [warningState, setWarningState] = useState<WarningState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      level: 0,
      dismissed: false,
      lastDismissedLevel: 0,
    };
  });

  // Calculate warning level based on destructive visit count
  const calculateWarningLevel = useCallback((count: number): WarningLevel => {
    if (count >= 5) return 3; // Final warning
    if (count >= 3) return 2; // Second warning
    if (count >= 2) return 1; // First warning
    return 0; // No warning
  }, []);

  // Update warning level when destructive visit count changes
  useEffect(() => {
    const newLevel = calculateWarningLevel(destructiveVisitCount);
    
    // Show warning if level increased and hasn't been dismissed at this level
    if (newLevel > warningState.lastDismissedLevel) {
      setWarningState(prev => ({
        ...prev,
        level: newLevel,
        dismissed: false,
      }));
    } else if (newLevel > warningState.level) {
      setWarningState(prev => ({
        ...prev,
        level: newLevel,
      }));
    }
  }, [destructiveVisitCount, calculateWarningLevel, warningState.lastDismissedLevel, warningState.level]);

  // Save warning state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(warningState));
  }, [warningState]);

  // Dismiss warning
  const dismissWarning = useCallback(async () => {
    setWarningState(prev => ({
      ...prev,
      dismissed: true,
      lastDismissedLevel: prev.level,
    }));
  }, []);

  // Reset warnings
  const resetWarnings = useCallback(() => {
    setWarningState({
      level: 0,
      dismissed: false,
      lastDismissedLevel: 0,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const shouldShowWarning = warningState.level > 0 && !warningState.dismissed;

  return {
    warningLevel: warningState.level,
    shouldShowWarning,
    dismissWarning,
    resetWarnings,
  };
}
