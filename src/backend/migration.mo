import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
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

  type OldActor = {
    nextReportId : Nat;
    sessions : Map.Map<Principal, List.List<Session>>;
    switches : Map.Map<Principal, List.List<ContextSwitch>>;
    achievements : Map.Map<Principal, List.List<Achievement>>;
    breaks : Map.Map<Principal, List.List<BreakSession>>;
    reports : Map.Map<Nat, Report>;
  };

  type FocusScore = {
    timestamp : Time.Time;
    distractionScore : Nat;
    tabSwitchCount : Nat;
    timeAway : Nat;
  };

  type NewActor = {
    nextReportId : Nat;
    sessions : Map.Map<Principal, List.List<Session>>;
    switches : Map.Map<Principal, List.List<ContextSwitch>>;
    achievements : Map.Map<Principal, List.List<Achievement>>;
    breaks : Map.Map<Principal, List.List<BreakSession>>;
    reports : Map.Map<Nat, Report>;
    focusScores : Map.Map<Principal, List.List<FocusScore>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      focusScores = Map.empty<Principal, List.List<FocusScore>>()
    };
  };
};
