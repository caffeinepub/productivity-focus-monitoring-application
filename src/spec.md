# Specification

## Summary
**Goal:** Add detailed real-time metrics display to validate tab switching detection accuracy.

**Planned changes:**
- Create a real-time metrics component showing precise tab switch data with millisecond timestamps, switch frequency, away durations, distraction score breakdown, and total switches count
- Add a 'Validation Metrics' section to the LiveMonitor page displaying all switching data for system verification
- Enhance useFocusMonitor hook to expose a rolling history of the last 20 switch events with timestamps, durations, and scores

**User-visible outcome:** Users can see detailed, real-time tab switching metrics on the LiveMonitor page to verify the accuracy of the focus tracking system.
