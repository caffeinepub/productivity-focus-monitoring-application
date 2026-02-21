import { useState, useEffect, useCallback } from 'react';

export interface FocusSessionTimerState {
  duration: number; // in seconds
  remainingTime: number; // in seconds
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
}

const STORAGE_KEY = 'focus-session-timer';

export function useFocusSessionTimer() {
  const [state, setState] = useState<FocusSessionTimerState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        isCompleted: parsed.remainingTime <= 0,
      };
    }
    return {
      duration: 0,
      remainingTime: 0,
      isActive: false,
      isPaused: false,
      isCompleted: false,
    };
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Countdown timer
  useEffect(() => {
    if (!state.isActive || state.isPaused || state.remainingTime <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setState((prev) => {
        const newRemaining = prev.remainingTime - 1;
        if (newRemaining <= 0) {
          return {
            ...prev,
            remainingTime: 0,
            isActive: false,
            isCompleted: true,
          };
        }
        return {
          ...prev,
          remainingTime: newRemaining,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isActive, state.isPaused, state.remainingTime]);

  const startSession = useCallback((durationInMinutes: number) => {
    const durationInSeconds = durationInMinutes * 60;
    setState({
      duration: durationInSeconds,
      remainingTime: durationInSeconds,
      isActive: true,
      isPaused: false,
      isCompleted: false,
    });
  }, []);

  const pauseSession = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
  }, []);

  const resumeSession = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const resetSession = useCallback(() => {
    setState({
      duration: 0,
      remainingTime: 0,
      isActive: false,
      isPaused: false,
      isCompleted: false,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    ...state,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
    formatTime,
    formattedTime: formatTime(state.remainingTime),
  };
}
