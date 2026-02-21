import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldFocusSession = {
    startTime : Int;
    endTime : Int;
    duration : Int;
    isSuccess : Bool;
  };

  type OldDestructiveVisit = {
    timestamp : Int;
    url : Text;
  };

  type OldWarningEvent = {
    timestamp : Int;
    message : Text;
  };

  type OldFocusLockActivation = {
    timestamp : Int;
    duration : Int;
  };

  type OldProductivityTrend = {
    timestamp : Int;
    focusScore : Int;
  };

  type OldActor = {
    focusSessions : Map.Map<Int, OldFocusSession>;
    destructiveVisits : Map.Map<Int, OldDestructiveVisit>;
    warningEvents : Map.Map<Int, OldWarningEvent>;
    focusLockActivations : Map.Map<Int, OldFocusLockActivation>;
    productivityTrends : Map.Map<Int, OldProductivityTrend>;
    sessionId : Int;
    visitId : Int;
    warningId : Int;
    lockId : Int;
    trendId : Int;
  };

  // New Types
  type Category = {
    #productive;
    #distracting;
    #neutral;
  };

  type SourceType = {
    #workApp;
    #socialMedia;
    #news;
    #shopping;
    #other;
  };

  type DistractionLog = {
    timestamp : Int;
    source : Text;
    category : Category;
    sourceType : SourceType;
    description : Text;
  };

  type ActivitySwitch = {
    timestamp : Int;
    fromApp : Text;
    toApp : Text;
    fromCategory : Category;
    toCategory : Category;
  };

  type SessionSummary = {
    sessionId : Nat;
    startTime : Int;
    endTime : Int;
    totalDuration : Int;
    productiveTime : Nat;
    distractingTime : Nat;
    distractionsCount : Nat;
    switchesCount : Nat;
    burnoutScore : Int;
  };

  type NewActor = {
    distractionLogs : Map.Map<Nat, DistractionLog>;
    activitySwitches : Map.Map<Nat, ActivitySwitch>;
    sessionSummaries : Map.Map<Nat, SessionSummary>;
    appCategories : Map.Map<Text, Category>;
    currentSessionId : Nat;
    currentSessionStartTime : Int;
    currentSwitchCount : Nat;
    currentDistractionCount : Nat;
    productiveTime : Nat;
    distractingTime : Nat;
  };

  public func run(_old : OldActor) : NewActor {
    {
      distractionLogs = Map.empty<Nat, DistractionLog>();
      activitySwitches = Map.empty<Nat, ActivitySwitch>();
      sessionSummaries = Map.empty<Nat, SessionSummary>();
      appCategories = Map.empty<Text, Category>();
      currentSessionId = 0;
      currentSessionStartTime = 0;
      currentSwitchCount = 0;
      currentDistractionCount = 0;
      productiveTime = 0;
      distractingTime = 0;
    };
  };
};
