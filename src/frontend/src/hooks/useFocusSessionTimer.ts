import { useState, useEffect, useCallback } from 'react';

export interface FocusSessionTimerState {
  duration: number;
  remainingTime: number;
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  isBreakMode: boolean;
  breakDuration: number;
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
      isBreakMode: false,
      breakDuration: 5,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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

  const startWorkSession = useCallback((durationInMinutes: number) => {
    const durationInSeconds = durationInMinutes * 60;
    setState({
      duration: durationInSeconds,
      remainingTime: durationInSeconds,
      isActive: true,
      isPaused: false,
      isCompleted: false,
      isBreakMode: false,
      breakDuration: state.breakDuration,
    });
  }, [state.breakDuration]);

  const startBreakSession = useCallback((durationInMinutes: number) => {
    const durationInSeconds = durationInMinutes * 60;
    setState({
      duration: durationInSeconds,
      remainingTime: durationInSeconds,
      isActive: true,
      isPaused: false,
      isCompleted: false,
      isBreakMode: true,
      breakDuration: durationInMinutes,
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
      isBreakMode: false,
      breakDuration: 5,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setBreakDuration = useCallback((minutes: number) => {
    setState((prev) => ({ ...prev, breakDuration: minutes }));
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
    startWorkSession,
    startBreakSession,
    pauseSession,
    resumeSession,
    resetSession,
    setBreakDuration,
    formatTime,
    formattedTime: formatTime(state.remainingTime),
  };
}
