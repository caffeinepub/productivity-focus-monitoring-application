# Specification

## Summary
**Goal:** Implement browser tab switching detection and focus monitoring to help users track and reduce distractions.

**Planned changes:**
- Create a useFocusMonitor React hook that tracks page visibility changes and window focus/blur events
- Record timestamps when users leave and return to the page
- Calculate time spent away from the page and count tab switches per time period
- Implement distraction score calculation based on switching frequency (threshold: more than 5 switches in 2 minutes)
- Display dismissible on-screen warning when distraction threshold is exceeded
- Send distraction score and switching statistics to backend via POST request
- Create backend Motoko function to record and store focus monitoring data
- Add inline code comments to explain hook logic and make it beginner-friendly

**User-visible outcome:** Users will see warnings when they switch tabs frequently, helping them become aware of distractions and maintain focus. The application will track their tab switching behavior without recording any page content or personal data.
