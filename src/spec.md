# Specification

## Summary
**Goal:** Implement a focus session system with time-based durations, tab switching tracking between productive and distractive sections, progressive warnings using grayscale effects, and automatic restriction lifting when the session completes.

**Planned changes:**
- Add focus session setup interface with preset durations (25, 45, 60, 90 minutes) and custom duration input
- Implement session timer countdown display that tracks remaining time
- Track tab switches specifically from productive to distractive sections within the app, incrementing a violation counter
- Apply grayscale visual effect to distractive sections only for 2 minutes after the third violation
- Reset violation counter to zero after the 2-minute grayscale period ends, starting a new warning cycle
- Lock and restrict access to distractive sections during active focus sessions
- Automatically lift all restrictions when the session timer completes
- Store focus session data (duration, violations, completion status) in the backend for historical tracking
- Provide option to start a new focus session after current session ends

**User-visible outcome:** Users can start timed focus sessions with their chosen duration, receive visual warnings (grayscale effects on distractive content) after switching to distractions three times, experience temporary locks on distractive sections, and have all restrictions automatically removed when their session timer completes. Users can track their violations throughout the session and start new sessions as needed.
