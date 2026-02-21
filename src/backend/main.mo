import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Session = {
    timestamp : Time.Time;
    appName : Text;
    category : AppCategory;
    duration : Nat;
    sessionType : SessionType;
  };

  type AppCategory = {
    #productive;
    #distracting;
  };

  type SessionType = {
    #focus;
    #distraction;
    #rest;
  };

  type ContextSwitch = {
    timestamp : Time.Time;
    sourceApp : Text;
    targetApp : Text;
  };

  type BreakSession = {
    startTime : Time.Time;
    endTime : Time.Time;
    breakType : BreakType;
    timerSetting : TimerSetting;
    isRestorative : Bool;
  };

  type BreakType = {
    #deskRecovery;
    #walkBreak;
  };

  type TimerSetting = {
    duration : Nat;
    notification : Bool;
  };

  type Achievement = {
    streakType : StreakType;
    milestone : Nat;
    isDeepWork : Bool;
    streakStart : Time.Time;
    streakEnd : Time.Time;
  };

  type StreakType = {
    #focusStreak;
    #distractionResistance;
    #deepWorkCompletion;
  };

  type Report = {
    timestamp : Time.Time;
    patterns : [Pattern];
  };

  type Pattern = {
    #positive : PositivePattern;
    #negative : NegativePattern;
  };

  type PositivePattern = {
    #workConsistency;
    #healthyBreaks;
    #reducedDistractions;
  };

  type NegativePattern = {
    #lateNightFatigue;
    #frequentSwitching;
    #distractionSpikes;
  };

  type FocusScore = {
    timestamp : Time.Time;
    distractionScore : Nat;
    tabSwitchCount : Nat;
    timeAway : Nat;
  };

  type FocusSessionViolation = {
    timestamp : Time.Time;
    violationCount : Nat;
    sourceTab : TabType;
    targetTab : TabType;
  };

  type TabType = {
    #productive;
    #distractive;
  };

  type FocusSessionData = {
    duration : Nat;
    violations : [FocusSessionViolation];
    completed : Bool;
    focusScore : Nat;
    timestamp : Time.Time;
  };

  type ScoreWindow = {
    start : Time.Time;
    end : Time.Time;
  };

  var nextReportId = 0 : Nat;
  let sessions = Map.empty<Principal, List.List<Session>>();
  let switches = Map.empty<Principal, List.List<ContextSwitch>>();
  let achievements = Map.empty<Principal, List.List<Achievement>>();
  let breaks = Map.empty<Principal, List.List<BreakSession>>();
  let reports = Map.empty<Nat, Report>();
  let focusSessionViolations = Map.empty<Principal, List.List<FocusSessionViolation>>();
  let focusSessionData = Map.empty<Principal, List.List<FocusSessionData>>();
  let focusScores = Map.empty<Principal, List.List<FocusScore>>();
  let scoreWindows = Map.empty<Principal, ScoreWindow>();

  public shared ({ caller }) func recordSession(session : Session) : async () {
    let existingSessions = switch (sessions.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Session>() };
    };
    existingSessions.add(session);
    sessions.add(caller, existingSessions);
  };

  public shared ({ caller }) func recordSwitch(contextSwitch : ContextSwitch) : async () {
    let existingSwitches = switch (switches.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<ContextSwitch>() };
    };
    existingSwitches.add(contextSwitch);
    switches.add(caller, existingSwitches);
  };

  public shared ({ caller }) func addAchievement(achievement : Achievement) : async () {
    let existingAchievements = switch (achievements.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<Achievement>() };
    };
    existingAchievements.add(achievement);
    achievements.add(caller, existingAchievements);
  };

  public shared ({ caller }) func recordBreak(breakSession : BreakSession) : async () {
    let existingBreaks = switch (breaks.get(caller)) {
      case (?list) { list };
      case (null) { List.empty<BreakSession>() };
    };
    existingBreaks.add(breakSession);
    breaks.add(caller, existingBreaks);
  };

  public shared ({ caller }) func generateReport(patterns : [Pattern]) : async Report {
    let report : Report = {
      timestamp = Time.now();
      patterns;
    };
    reports.add(nextReportId, report);
    nextReportId += 1;
    report;
  };

  public query ({ caller }) func getAllReports() : async [Report] {
    reports.values().toArray();
  };

  public query ({ caller }) func getReportById(reportId : Nat) : async ?Report {
    switch (reports.get(reportId)) {
      case (?report) { ?report };
      case (null) { null };
    };
  };

  public shared ({ caller }) func startFocusSession() : async () {
    let now = Time.now();
    scoreWindows.add(
      caller,
      {
        start = now;
        end = now + 10_000_000_000; // 10 seconds in nanoseconds
      },
    );
  };

  public shared ({ caller }) func recordFocusScore(distractionScore : Nat, tabSwitchCount : Nat, timeAway : Nat) : async () {
    let newScore : FocusScore = {
      timestamp = Time.now();
      distractionScore;
      tabSwitchCount;
      timeAway;
    };

    let existingScores = switch (focusScores.get(caller)) {
      case (?scores) { scores };
      case (null) { List.empty<FocusScore>() };
    };
    existingScores.add(newScore);
    focusScores.add(caller, existingScores);
  };

  public shared ({ caller }) func recordTabSwitch(sourceTab : TabType, targetTab : TabType) : async () {
    let now = Time.now();
    let existingViolations = switch (focusSessionViolations.get(caller)) {
      case (?violations) { violations.size() };
      case (null) { 0 };
    };

    let violationCount = if (sourceTab == #productive and targetTab == #distractive) {
      existingViolations + 1;
    } else { existingViolations };

    let newViolation : FocusSessionViolation = {
      timestamp = now;
      violationCount;
      sourceTab;
      targetTab;
    };

    if (sourceTab == #productive and targetTab == #distractive) {
      let existingViolationsList = switch (focusSessionViolations.get(caller)) {
        case (?violations) { violations };
        case (null) { List.empty<FocusSessionViolation>() };
      };
      existingViolationsList.add(newViolation);
      focusSessionViolations.add(caller, existingViolationsList);
    };
  };

  public query ({ caller }) func getFocusScores() : async [FocusScore] {
    switch (focusScores.get(caller)) {
      case (?scores) { scores.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func recordFocusSession(duration : Nat, completed : Bool, focusScore : Nat) : async () {
    let now = Time.now();
    let newSessionData : FocusSessionData = {
      duration;
      violations = [];
      completed;
      focusScore;
      timestamp = now;
    };

    let existingSessions = switch (focusSessionData.get(caller)) {
      case (?sessions) { sessions };
      case (null) { List.empty<FocusSessionData>() };
    };
    existingSessions.add(newSessionData);
    focusSessionData.add(caller, existingSessions);
  };

  public query ({ caller }) func getAllFocusSessions() : async [FocusSessionData] {
    switch (focusSessionData.get(caller)) {
      case (?sessions) { sessions.toArray() };
      case (null) { [] };
    };
  };
};
