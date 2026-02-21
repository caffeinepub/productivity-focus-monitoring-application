import { useState, useEffect, useCallback, useRef } from 'react';

interface FocusEvent {
  timestamp: number;
  type: 'leave' | 'return';
}

interface SwitchEvent {
  timestamp: string;
  awayDuration: number;
  distractionScore: number;
}

interface UseFocusMonitorReturn {
  distractionScore: number;
  switchCount: number;
  switchesPerMinute: number;
  switchesPerHour: number;
  timeAway: number;
  isAway: boolean;
  switchingHistory: SwitchEvent[];
  isMonitoringActive: boolean;
  startMonitoring: () => void;
}

/**
 * Custom React hook that monitors browser tab switching and window focus events
 * to calculate distraction metrics.
 * 
 * Privacy: Only tracks focus state, timestamps, and switch counts.
 * Does NOT record page content, keystrokes, or personal data.
 */
export function useFocusMonitor(): UseFocusMonitorReturn {
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [events, setEvents] = useState<FocusEvent[]>([]);
  const [switchingHistory, setSwitchingHistory] = useState<SwitchEvent[]>([]);
  const [distractionScore, setDistractionScore] = useState(0);
  const [isAway, setIsAway] = useState(false);
  const leaveTimestampRef = useRef<number | null>(null);
  const [timeAway, setTimeAway] = useState(0);

  const startMonitoring = useCallback(() => {
    setIsMonitoringActive(true);
  }, []);

  const handleLeave = useCallback(() => {
    if (!isMonitoringActive) return;
    
    const now = Date.now();
    
    if (!leaveTimestampRef.current) {
      leaveTimestampRef.current = now;
      setIsAway(true);
      setEvents((prev) => [...prev, { timestamp: now, type: 'leave' }]);
    }
  }, [isMonitoringActive]);

  const handleReturn = useCallback(() => {
    if (!isMonitoringActive) return;
    
    const now = Date.now();
    
    if (leaveTimestampRef.current) {
      const duration = now - leaveTimestampRef.current;
      setTimeAway((prev) => prev + duration);
      
      setSwitchingHistory((prev) => {
        const newEvent: SwitchEvent = {
          timestamp: new Date(now).toISOString(),
          awayDuration: duration,
          distractionScore: distractionScore,
        };
        
        const updated = [...prev, newEvent];
        return updated.slice(-20);
      });
      
      leaveTimestampRef.current = null;
      setIsAway(false);
      setEvents((prev) => [...prev, { timestamp: now, type: 'return' }]);
    }
  }, [isMonitoringActive, distractionScore]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleLeave();
      } else {
        handleReturn();
      }
    };

    const handleBlur = () => {
      handleLeave();
    };

    const handleFocus = () => {
      handleReturn();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleLeave, handleReturn]);

  useEffect(() => {
    if (!isMonitoringActive) return;
    
    const now = Date.now();
    const twoMinuteWindow = 2 * 60 * 1000;
    const recentEvents = events.filter((event) => now - event.timestamp < twoMinuteWindow);
    const switchesInTwoMinutes = recentEvents.filter((event) => event.type === 'leave').length;
    
    if (switchesInTwoMinutes > 5) {
      setDistractionScore((prev) => {
        const newScore = Math.max(prev, Math.floor(switchesInTwoMinutes / 2));
        return newScore;
      });
    }
    
    if (recentEvents.length < events.length) {
      setEvents(recentEvents);
    }
  }, [events, isMonitoringActive]);

  const now = Date.now();
  const oneMinuteWindow = 60 * 1000;
  const oneHourWindow = 60 * 60 * 1000;
  
  const switchesInLastMinute = events.filter(
    (event) => event.type === 'leave' && now - event.timestamp < oneMinuteWindow
  ).length;
  
  const switchesInLastHour = events.filter(
    (event) => event.type === 'leave' && now - event.timestamp < oneHourWindow
  ).length;
  
  const twoMinuteWindow = 2 * 60 * 1000;
  const switchCount = events.filter(
    (event) => event.type === 'leave' && now - event.timestamp < twoMinuteWindow
  ).length;

  return {
    distractionScore,
    switchCount,
    switchesPerMinute: switchesInLastMinute,
    switchesPerHour: switchesInLastHour,
    timeAway,
    isAway,
    switchingHistory,
    isMonitoringActive,
    startMonitoring,
  };
}
