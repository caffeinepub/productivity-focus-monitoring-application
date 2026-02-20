import { useState, useEffect, useCallback, useRef } from 'react';
import { useRecordFocusScore, useGetFocusScores } from './useQueries';
import { useApplications } from './useApplications';

interface FocusEvent {
  timestamp: number;
  type: 'leave' | 'return';
}

interface SwitchEvent {
  timestamp: string;
  awayDuration: number;
  distractionScore: number;
}

interface CategorizedSwitchEvent {
  timestamp: number;
  sourceUrl: string;
  targetUrl: string;
  sourceCategory: 'productive' | 'distracting' | 'unknown';
  targetCategory: 'productive' | 'distracting' | 'unknown';
  switchType: string;
}

interface UseFocusMonitorReturn {
  distractionScore: number;
  switchCount: number;
  switchesPerMinute: number;
  switchesPerHour: number;
  timeAway: number;
  isAway: boolean;
  switchingHistory: SwitchEvent[];
  productiveToProductive: number;
  productiveToDistracting: number;
  distractingToProductive: number;
  distractingToDistracting: number;
  categorizedSwitchingHistory: CategorizedSwitchEvent[];
}

/**
 * Custom React hook that monitors browser tab switching and window focus events
 * to calculate distraction metrics and send data to the backend.
 * 
 * Privacy: Only tracks focus state, timestamps, and switch counts.
 * Does NOT record page content, keystrokes, or personal data.
 * 
 * Why Page Visibility API?
 * - Detects when user switches to a different browser tab
 * - More reliable than focus/blur alone for tab switching
 * - Supported in all modern browsers
 * 
 * Why window focus/blur events?
 * - Captures when user switches to a different application entirely
 * - Complements Page Visibility API for complete coverage
 * - Together they provide comprehensive focus tracking
 */
export function useFocusMonitor(): UseFocusMonitorReturn {
  // Track all focus/blur events with timestamps for rolling window calculations
  const [events, setEvents] = useState<FocusEvent[]>([]);
  
  // Track detailed switching history for validation (last 20 events)
  const [switchingHistory, setSwitchingHistory] = useState<SwitchEvent[]>([]);
  
  /**
   * Track categorized switching counts
   * - productiveToProductive: Switching between productive websites (e.g., GitHub to Stack Overflow)
   * - productiveToDistracting: Switching from productive to distracting (e.g., VS Code docs to YouTube)
   * - distractingToProductive: Switching from distracting to productive (e.g., Facebook to Google Docs)
   * - distractingToDistracting: Switching between distracting websites (e.g., Instagram to TikTok)
   */
  const [productiveToProductive, setProductiveToProductive] = useState(0);
  const [productiveToDistracting, setProductiveToDistracting] = useState(0);
  const [distractingToProductive, setDistractionToProductive] = useState(0);
  const [distractingToDistracting, setDistractionToDistracting] = useState(0);
  
  /**
   * Track detailed categorized switching history (last 50 events)
   * Each event includes source/target URLs, categories, and switch type
   */
  const [categorizedSwitchingHistory, setCategorizedSwitchingHistory] = useState<CategorizedSwitchEvent[]>([]);
  
  /**
   * Track the previous URL to detect URL changes
   * Using ref to avoid unnecessary re-renders
   */
  const previousUrlRef = useRef<string>(window.location.href);
  
  /**
   * Distraction score increases when user switches tabs frequently
   * Threshold: 5+ switches in 2 minutes triggers score increment
   * Score accumulates over time to track overall distraction patterns
   */
  const [distractionScore, setDistractionScore] = useState(0);
  
  // Track current focus state (true = user is away from page)
  const [isAway, setIsAway] = useState(false);
  
  /**
   * Track when user left the page (for calculating time away)
   * Using ref instead of state to avoid unnecessary re-renders
   */
  const leaveTimestampRef = useRef<number | null>(null);
  
  // Track cumulative time away in milliseconds
  const [timeAway, setTimeAway] = useState(0);
  
  // Last time we sent data to backend (to enforce 10-second minimum interval)
  const lastSendTimeRef = useRef<number>(0);
  
  // Track if we've initialized from backend data
  const initializedRef = useRef(false);

  // Get mutation hook for recording focus scores
  const recordFocusScore = useRecordFocusScore();
  
  // Fetch existing focus scores to restore state on mount
  const { data: focusScores } = useGetFocusScores();
  
  // Get application categories for URL pattern matching
  const { applications } = useApplications();

  /**
   * Initialize state from backend data on mount
   * Restores distraction score and switch count from last session
   */
  useEffect(() => {
    if (!initializedRef.current && focusScores && focusScores.length > 0) {
      try {
        // Get the most recent focus score
        const latestScore = focusScores[focusScores.length - 1];
        
        // Restore state from backend
        setDistractionScore(Number(latestScore.distractionScore));
        setTimeAway(Number(latestScore.timeAway) * 1000); // Convert seconds to milliseconds
        setProductiveToProductive(Number(latestScore.productiveToProductive));
        setProductiveToDistracting(Number(latestScore.productiveToDistracting));
        setDistractionToProductive(Number(latestScore.distractingToProductive));
        setDistractionToDistracting(Number(latestScore.distractingToDistracting));
        
        initializedRef.current = true;
      } catch (error) {
        console.error('Error initializing focus monitor state:', error);
      }
    }
  }, [focusScores]);

  /**
   * Categorize a URL based on application list
   * 
   * URL Pattern Matching Logic:
   * - Extracts domain from URL (e.g., "github.com" from "https://github.com/user/repo")
   * - Checks if domain contains any application name from the categorized list
   * - Returns 'productive', 'distracting', or 'unknown' based on match
   * 
   * Example:
   * - URL: "https://www.youtube.com/watch?v=abc"
   * - Domain: "youtube.com"
   * - Application list contains: { name: "YouTube", category: "distracting" }
   * - Match found: "youtube" in "youtube.com"
   * - Returns: "distracting"
   */
  const categorizeUrl = useCallback((url: string): 'productive' | 'distracting' | 'unknown' => {
    try {
      // Extract domain from URL (e.g., "github.com" from "https://github.com/user/repo")
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      // Check if domain matches any application in our categorized list
      for (const app of applications) {
        const appName = app.name.toLowerCase();
        
        // Check if the domain contains the application name
        // Example: "youtube.com" contains "youtube"
        if (domain.includes(appName) || appName.includes(domain)) {
          return app.category;
        }
      }
      
      // If no match found, return unknown
      return 'unknown';
    } catch (error) {
      // If URL parsing fails, return unknown
      return 'unknown';
    }
  }, [applications]);

  /**
   * Detect and categorize URL transitions when user returns to the page
   * 
   * URL Transition Detection:
   * - document.referrer: The URL of the page the user came from (previous page)
   * - window.location.href: The current page URL
   * 
   * Switch Type Classification Decision Tree:
   * 1. Both URLs are productive → productive-to-productive
   * 2. Source is productive, target is distracting → productive-to-distracting (WARNING)
   * 3. Source is distracting, target is productive → distracting-to-productive (GOOD)
   * 4. Both URLs are distracting → distracting-to-distracting (ALERT)
   * 
   * Counter Increment Logic:
   * - Each switch type increments its corresponding counter
   * - Counters accumulate over the session to track switching patterns
   */
  const detectAndCategorizeSwitch = useCallback(() => {
    // Get the current URL (where the user is now)
    const currentUrl = window.location.href;
    
    // Get the previous URL (where the user was before)
    // document.referrer contains the URL of the page that linked to this page
    const sourceUrl = previousUrlRef.current;
    
    // Only process if we have both URLs and they're different
    if (sourceUrl && currentUrl && sourceUrl !== currentUrl) {
      // Categorize both URLs using our application list
      const sourceCategory = categorizeUrl(sourceUrl);
      const targetCategory = categorizeUrl(currentUrl);
      
      // Determine switch type based on source and target categories
      let switchType = '';
      
      /**
       * Switch Type Classification:
       * - Productive → Productive: Good focus maintenance
       * - Productive → Distracting: Warning - losing focus
       * - Distracting → Productive: Good - returning to work
       * - Distracting → Distracting: Alert - deep distraction
       */
      if (sourceCategory === 'productive' && targetCategory === 'productive') {
        // Switching between productive sites (e.g., GitHub to Stack Overflow)
        setProductiveToProductive(prev => prev + 1);
        switchType = 'productive-to-productive';
      } else if (sourceCategory === 'productive' && targetCategory === 'distracting') {
        // Switching from productive to distracting (e.g., VS Code docs to YouTube)
        setProductiveToDistracting(prev => prev + 1);
        switchType = 'productive-to-distracting';
      } else if (sourceCategory === 'distracting' && targetCategory === 'productive') {
        // Switching from distracting to productive (e.g., Facebook to Google Docs)
        setDistractionToProductive(prev => prev + 1);
        switchType = 'distracting-to-productive';
      } else if (sourceCategory === 'distracting' && targetCategory === 'distracting') {
        // Switching between distracting sites (e.g., Instagram to TikTok)
        setDistractionToDistracting(prev => prev + 1);
        switchType = 'distracting-to-distracting';
      }
      
      // Record the switch event in history (if it was categorized)
      if (switchType) {
        const switchEvent: CategorizedSwitchEvent = {
          timestamp: Date.now(),
          sourceUrl,
          targetUrl: currentUrl,
          sourceCategory,
          targetCategory,
          switchType,
        };
        
        // Add to history, keeping only the last 50 events
        setCategorizedSwitchingHistory(prev => {
          const updated = [...prev, switchEvent];
          return updated.slice(-50);
        });
      }
    }
    
    // Update the previous URL for next comparison
    previousUrlRef.current = currentUrl;
  }, [categorizeUrl]);

  /**
   * Handle when user leaves the page (tab becomes hidden or window loses focus)
   * 
   * This fires when:
   * - User switches to another browser tab
   * - User switches to another application
   * - User minimizes the browser window
   */
  const handleLeave = useCallback(() => {
    const now = Date.now();
    
    // Only record if we're not already marked as away (prevents duplicate events)
    if (!leaveTimestampRef.current) {
      leaveTimestampRef.current = now;
      setIsAway(true);
      
      // Add leave event to history for frequency calculations
      setEvents((prev) => [...prev, { timestamp: now, type: 'leave' }]);
    }
  }, []);

  /**
   * Handle when user returns to the page (tab becomes visible or window gains focus)
   * 
   * Duration calculation example:
   * - User leaves at timestamp 1000ms
   * - User returns at timestamp 5000ms
   * - Duration = 5000 - 1000 = 4000ms (4 seconds away)
   */
  const handleReturn = useCallback(() => {
    const now = Date.now();
    
    // Detect and categorize URL transition when user returns
    detectAndCategorizeSwitch();
    
    // Calculate time away if we have a leave timestamp
    if (leaveTimestampRef.current) {
      const duration = now - leaveTimestampRef.current;
      setTimeAway((prev) => prev + duration);
      
      // Add to switching history with millisecond-precision timestamp
      setSwitchingHistory((prev) => {
        const newEvent: SwitchEvent = {
          timestamp: new Date(now).toISOString(),
          awayDuration: duration,
          distractionScore: distractionScore,
        };
        
        // Keep only the last 20 events
        const updated = [...prev, newEvent];
        return updated.slice(-20);
      });
      
      leaveTimestampRef.current = null;
      setIsAway(false);
      
      // Add return event to history
      setEvents((prev) => [...prev, { timestamp: now, type: 'return' }]);
    }
  }, [distractionScore, detectAndCategorizeSwitch]);

  /**
   * Set up event listeners for page visibility and window focus changes
   * 
   * Page Visibility API (visibilitychange):
   * - Fires when document.hidden changes
   * - Detects tab switches within the same browser
   * 
   * Window focus/blur events:
   * - Fire when window gains/loses focus
   * - Detect switches to other applications
   * 
   * Using both ensures comprehensive tracking across all scenarios
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
    // This prevents memory leaks and duplicate event handlers
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [handleLeave, handleReturn]);

  /**
   * Calculate switching frequency and distraction score
   * Runs whenever events array changes
   * 
   * Rolling window filtering example:
   * - Current time: 120000ms (2 minutes)
   * - Time window: 120000ms (2 minutes)
   * - Event at 10000ms: 120000 - 10000 = 110000ms ago (EXCLUDED, too old)
   * - Event at 60000ms: 120000 - 60000 = 60000ms ago (INCLUDED, within window)
   * - Event at 100000ms: 120000 - 100000 = 20000ms ago (INCLUDED, within window)
   */
  useEffect(() => {
    const now = Date.now();
    
    // Define time window: 2 minutes (120,000 milliseconds)
    // We only count switches within this rolling window
    const twoMinuteWindow = 2 * 60 * 1000;
    
    // Filter events to only include those within the last 2 minutes
    const recentEvents = events.filter((event) => now - event.timestamp < twoMinuteWindow);
    
    // Count only "leave" events as switches (each leave represents a tab switch)
    const switchesInTwoMinutes = recentEvents.filter((event) => event.type === 'leave').length;
    
    /**
     * Distraction score logic:
     * - Threshold: 5 switches in 2 minutes indicates frequent distraction
     * - When threshold is exceeded, increment the distraction score
     * - Score accumulates over time to track overall distraction patterns
     * 
     * Example:
     * - 3 switches in 2 minutes: No score change (below threshold)
     * - 6 switches in 2 minutes: Score increases (above threshold)
     * - Score = floor(6 / 2) = 3
     */
    if (switchesInTwoMinutes > 5) {
      setDistractionScore((prev) => {
        // Calculate new score based on switch frequency
        const newScore = Math.max(prev, Math.floor(switchesInTwoMinutes / 2));
        return newScore;
      });
    }
    
    // Clean up old events (older than 2 minutes) to prevent memory bloat
    if (recentEvents.length < events.length) {
      setEvents(recentEvents);
    }
  }, [events]);

  /**
   * Send focus monitoring data to backend every 10 seconds
   * 
   * Backend communication pattern:
   * - Sends data every 10 seconds for real-time updates
   * - Data sent: distractionScore, tabSwitchCount, timeAway, and categorized switching counts (all as BigInt)
   * 
   * Error handling:
   * - Network errors are caught and logged
   * - Failed transmissions don't crash the app
   * - Data continues to accumulate locally for next successful send
   * 
   * Privacy note: Only numeric metrics are sent, no content or personal data
   */
  useEffect(() => {
    const now = Date.now();
    const tenSeconds = 10 * 1000;
    const timeSinceLastSend = now - lastSendTimeRef.current;
    
    // Calculate current switch count for the payload
    const twoMinuteWindow = 2 * 60 * 1000;
    const recentSwitches = events.filter(
      (event) => event.type === 'leave' && now - event.timestamp < twoMinuteWindow
    ).length;
    
    /**
     * Send data when:
     * 1. It's been 10+ seconds since last send
     * 2. We have meaningful data to send
     * 3. Mutation is not currently pending
     */
    const shouldSend = 
      timeSinceLastSend >= tenSeconds &&
      !recordFocusScore.isPending &&
      (distractionScore > 0 || recentSwitches > 0 || timeAway > 0);
    
    if (shouldSend) {
      // Wrap backend call in try-catch to prevent UI errors
      try {
        recordFocusScore.mutate(
          {
            distractionScore: BigInt(distractionScore),
            tabSwitchCount: BigInt(recentSwitches),
            timeAway: BigInt(Math.floor(timeAway / 1000)), // Convert milliseconds to seconds
            productiveToProductive: BigInt(productiveToProductive),
            productiveToDistracting: BigInt(productiveToDistracting),
            distractingToProductive: BigInt(distractingToProductive),
            distractingToDistracting: BigInt(distractingToDistracting),
          },
          {
            onSuccess: () => {
              lastSendTimeRef.current = now;
            },
            onError: (error) => {
              console.error('Failed to record focus score:', error);
              // Data remains in local state for retry on next trigger
            },
          }
        );
      } catch (error) {
        console.error('Error submitting focus score:', error);
      }
    }
  }, [
    distractionScore, 
    timeAway, 
    events, 
    recordFocusScore, 
    productiveToProductive, 
    productiveToDistracting, 
    distractingToProductive, 
    distractingToDistracting
  ]);

  /**
   * Calculate current metrics for return value
   * 
   * Switches per minute calculation:
   * - Count switches in last 60 seconds
   * - Divide by 1 (already per minute)
   * 
   * Switches per hour calculation:
   * - Count switches in last 3600 seconds (1 hour)
   * - Divide by 1 (already per hour)
   */
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
  const recentSwitches = events.filter(
    (event) => event.type === 'leave' && now - event.timestamp < twoMinuteWindow
  ).length;

  return {
    distractionScore,
    switchCount: recentSwitches,
    switchesPerMinute: switchesInLastMinute,
    switchesPerHour: switchesInLastHour,
    timeAway: Math.floor(timeAway / 1000), // Return in seconds
    isAway,
    switchingHistory,
    productiveToProductive,
    productiveToDistracting,
    distractingToProductive,
    distractingToDistracting,
    categorizedSwitchingHistory,
  };
}
