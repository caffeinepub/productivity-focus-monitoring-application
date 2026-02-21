# Specification

## Summary
**Goal:** Transform the focus management system into a manual productivity timer with user-reported distraction logging, activity classification, and burnout tracking.

**Planned changes:**
- Remove automatic focus session start on app launch - users land on dashboard and manually start sessions
- Implement customizable productivity timer with preset durations (15, 25, 45 minutes) or custom intervals
- Add manual distraction logging interface with quick-access button during sessions to record and categorize interruptions
- Build activity classification system where users define apps/websites as productive or distracting
- Implement transition tracking to record activity switch sequences and identify interruption patterns
- Create session history and analytics dashboard showing past sessions, distraction patterns, and top interruption sources
- Add burnout/fatigue scoring algorithm based on switching frequency with weighted penalties for context switches
- Display session duration metrics categorizing activities as sustained focus (25+ min), browsing (5-10 min), or habit checking (<1 min)

**User-visible outcome:** Users can start productivity timers on demand, manually log distractions during work sessions with categories, view analytics showing their most common interruption sources and patterns, see burnout scores based on switching behavior, and review historical session data to identify distraction trends over time.
