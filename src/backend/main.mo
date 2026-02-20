import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

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

  var nextReportId = 0;
  let sessions = Map.empty<Principal, List.List<Session>>();
  let switches = Map.empty<Principal, List.List<ContextSwitch>>();
  let achievements = Map.empty<Principal, List.List<Achievement>>();
  let breaks = Map.empty<Principal, List.List<BreakSession>>();
  let reports = Map.empty<Nat, Report>();

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

  public shared ({ caller }) func recordContextSwitch() : async () {
    let lastApp = "App1";
    let newApp = "App2";
    let newSwitch : ContextSwitch = {
      timestamp = 1718151800_00;
      sourceApp = lastApp;
      targetApp = newApp;
    };
    await recordSwitch(newSwitch);
  };

  public query ({ caller }) func getReportById(reportId : Nat) : async Report {
    switch (reports.get(reportId)) {
      case (?report) { report };
      case (null) { Runtime.trap("Report not found") };
    };
  };
};
