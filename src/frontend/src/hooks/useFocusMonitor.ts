import { useState, useEffect, useCallback, useRef } from 'react';
import { useActor } from './useActor';

interface FocusEvent {
  timestamp: number;
  type: 'leave' | 'return';
}

interface UseFocusMonitorReturn {
  distractionScore: number;
  switchCount: number;
  switchesPerMinute: number;
  timeAway: number;
  isAway: boolean;
}

/**
 * Custom React hook that monitors browser tab switching and window focus events
 * to calculate distraction metrics and send data to the backend.
 * 
 * Privacy: Only tracks focus state, timestamps, and switch counts.
 * Does NOT record page content, keystrokes, or personal data.
 */
export function useFocusMonitor(): UseFocusMonitorReturn {
  // Track all focus/blur events with timestamps
  const [events, setEvents] = useState<FocusEvent[]>([]);
  
  // Distraction score increases when user switches tabs frequently
  const [distractionScore, setDistractionScore] = useState(0);
  
  // Track current focus state
  const [isAway, setIsAway] = useState(false);
  
  // Track when user left the page (for calculating time away)
  const leaveTimestampRef = useRef<number | null>(null);
  
  // Track cumulative time away in milliseconds
  const [timeAway, setTimeAway] = useState(0);
  
  const { actor } = useActor();

  /**
   * Handle when user leaves the page (tab becomes hidden or window loses focus)
   */
  const handleLeave = useCallback(() => {
    const now = Date.now();
    
    // Only record if we're not already marked as away
    if (!leaveTimestampRef.current) {
      leaveTimestampRef.current = now;
      setIsAway(true);
      
      // Add leave event to history
      setEvents((prev) => [...prev, { timestamp: now, type: 'leave' }]);
    }
  }, []);

  /**
   * Handle when user returns to the page (tab becomes visible or window gains focus)
   */
  const handleReturn = useCallback(() => {
    const now = Date.now();
    
    // Calculate time away if we have a leave timestamp
    if (leaveTimestampRef.current) {
      const duration = now - leaveTimestampRef.current;
      setTimeAway((prev) => prev + duration);
      leaveTimestampRef.current = null;
      setIsAway(false);
      
      // Add return event to history
      setEvents((prev) => [...prev, { timestamp: now, type: 'return' }]);
    }
  }, []);

  /**
   * Set up event listeners for page visibility and window focus changes
   */
  useEffect(() => {
    // Page Visibility API - detects when tab becomes hidden/visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleLeave();
      } else {
        handleReturn();
      }
    };

    // Window focus/blur events - detects when user switches to another window
    const handleBlur = () => {
      handleLeave();
    };

    const handleFocus = () => {
      handleReturn();
    };

    // Attach event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // Cleanup: remove event listeners when component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleLeave, handleReturn]);

  /**
   * Calculate switching frequency and distraction score
   * Runs whenever events array changes
   */
  useEffect(() => {
    const now = Date.now();
    
    // Define time window: 2 minutes (120,000 milliseconds)
    // We only count switches within this rolling window
    const timeWindow = 2 * 60 * 1000;
    
    // Filter events to only include those within the last 2 minutes
    const recentEvents = events.filter((event) => now - event.timestamp < timeWindow);
    
    // Count only "leave" events as switches (each leave represents a tab switch)
    const switchesInWindow = recentEvents.filter((event) => event.type === 'leave').length;
    
    // Calculate switches per minute (for display purposes)
    const switchesPerMinute = (switchesInWindow / 2).toFixed(1);
    
    /**
     * Distraction score logic:
     * - Threshold: 5 switches in 2 minutes indicates frequent distraction
     * - When threshold is exceeded, increment the distraction score
     * - Score accumulates over time to track overall distraction patterns
     */
    if (switchesInWindow > 5) {
      setDistractionScore((prev) => {
        // Only increment if we haven't already counted this batch
        // (prevents score from increasing on every render)
        const newScore = Math.max(prev, Math.floor(switchesInWindow / 2));
        return newScore;
      });
    }
    
    // Clean up old events (older than 2 minutes) to prevent memory bloat
    if (recentEvents.length < events.length) {
      setEvents(recentEvents);
    }
  }, [events]);

  /**
   * Send focus monitoring data to backend
   * Triggers when user returns to the page after being away
   */
  useEffect(() => {
    // Only send data when:
    // 1. User has returned (not currently away)
    // 2. We have accumulated some time away
    // 3. Backend actor is available
    if (!isAway && timeAway > 0 && actor) {
      const now = Date.now();
      const timeWindow = 2 * 60 * 1000;
      
      // Calculate current switch count for the payload
      const recentSwitches = events.filter(
        (event) => event.type === 'leave' && now - event.timestamp < timeWindow
      ).length;
      
      // Send data to backend (convert to BigInt as required by Motoko)
      // Privacy: Only sending numeric metrics, no content or personal data
      actor
        .recordFocusScore(
          BigInt(distractionScore),
          BigInt(recentSwitches),
          BigInt(Math.floor(timeAway / 1000)) // Convert to seconds
        )
        .catch((error) => {
          console.error('Failed to record focus score:', error);
        });
    }
  }, [isAway, timeAway, distractionScore, events, actor]);

  // Calculate current metrics for return value
  const now = Date.now();
  const timeWindow = 2 * 60 * 1000;
  const recentSwitches = events.filter(
    (event) => event.type === 'leave' && now - event.timestamp < timeWindow
  ).length;
  const switchesPerMinute = parseFloat((recentSwitches / 2).toFixed(1));

  return {
    distractionScore,
    switchCount: recentSwitches,
    switchesPerMinute,
    timeAway: Math.floor(timeAway / 1000), // Return in seconds
    isAway,
  };
}
