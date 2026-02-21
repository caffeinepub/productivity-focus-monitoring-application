import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Categorization Types
  public type Category = {
    #productive;
    #distracting;
    #neutral;
  };

  public type SourceType = {
    #workApp;
    #socialMedia;
    #news;
    #shopping;
    #other;
  };

  public type DistractionLog = {
    timestamp : Int;
    source : Text;
    category : Category;
    sourceType : SourceType;
    description : Text;
  };

  public type ActivitySwitch = {
    timestamp : Int;
    fromApp : Text;
    toApp : Text;
    fromCategory : Category;
    toCategory : Category;
  };

  public type SessionSummary = {
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

  // Persistent Data Structures
  let distractionLogs = Map.empty<Nat, DistractionLog>();
  let activitySwitches = Map.empty<Nat, ActivitySwitch>();
  let sessionSummaries = Map.empty<Nat, SessionSummary>();
  let appCategories = Map.empty<Text, Category>();

  // Session State
  var currentSessionId = 0;
  var currentSessionStartTime : Int = 0;
  var currentSwitchCount = 0;
  var currentDistractionCount = 0;
  var productiveTime : Nat = 0;
  var distractingTime : Nat = 0;

  // Category Management
  public shared ({ caller }) func setAppCategory(appName : Text, category : Category) : async () {
    appCategories.add(appName, category);
  };

  public query ({ caller }) func getAppCategory(appName : Text) : async ?Category {
    appCategories.get(appName);
  };

  public query ({ caller }) func getAllAppCategories() : async [(Text, Category)] {
    appCategories.toArray();
  };

  // Distraction Logging
  public shared ({ caller }) func logDistraction(source : Text, category : Category, sourceType : SourceType, description : Text) : async () {
    let log : DistractionLog = {
      timestamp = Time.now();
      source;
      category;
      sourceType;
      description;
    };
    distractionLogs.add(distractionLogs.size(), log);
    currentDistractionCount += 1;
  };

  public query ({ caller }) func getDistractionLogs() : async [(Nat, DistractionLog)] {
    distractionLogs.toArray();
  };

  // Activity Switch Tracking
  public shared ({ caller }) func recordActivitySwitch(fromApp : Text, toApp : Text, fromCategory : Category, toCategory : Category) : async () {
    let switchRecord : ActivitySwitch = {
      timestamp = Time.now();
      fromApp;
      toApp;
      fromCategory;
      toCategory;
    };
    activitySwitches.add(activitySwitches.size(), switchRecord);
    currentSwitchCount += 1;

    if (fromCategory == #productive and toCategory == #distracting) {
      currentDistractionCount += 1;
    };
  };

  public query ({ caller }) func getActivitySwitches() : async [(Nat, ActivitySwitch)] {
    activitySwitches.toArray();
  };

  // Session Management
  public shared ({ caller }) func startSession() : async () {
    currentSessionId += 1;
    currentSessionStartTime := Time.now();
    currentSwitchCount := 0;
    currentDistractionCount := 0;
    productiveTime := 0;
    distractingTime := 0;
  };

  public shared ({ caller }) func endSession() : async () {
    if (currentSessionStartTime == 0) {
      Runtime.trap("No active session");
    };

    let endTime = Time.now();
    let totalDuration = endTime - currentSessionStartTime;

    let summary : SessionSummary = {
      sessionId = currentSessionId;
      startTime = currentSessionStartTime;
      endTime;
      totalDuration;
      productiveTime;
      distractingTime;
      distractionsCount = currentDistractionCount;
      switchesCount = currentSwitchCount;
      burnoutScore = calculateBurnoutScore(totalDuration, productiveTime, distractingTime, currentDistractionCount, currentSwitchCount);
    };

    sessionSummaries.add(currentSessionId, summary);
    currentSessionStartTime := 0;
  };

  public query ({ caller }) func getSessionSummaries() : async [(Nat, SessionSummary)] {
    sessionSummaries.toArray();
  };

  // Time Tracking
  public shared ({ caller }) func recordTimeBlock(category : Category, duration : Int) : async () {
    if (duration < 0) { return };
    let natDuration = duration.toNat();
    switch (category) {
      case (#productive) {
        productiveTime += natDuration;
      };
      case (#distracting) { distractingTime += natDuration };
      case (_) {};
    };
  };

  public query ({ caller }) func getCurrentSessionStats() : async (Nat, Nat, Int, Nat, Nat) {
    (productiveTime, distractingTime, currentSessionStartTime, currentDistractionCount, currentSwitchCount);
  };

  // Analytics
  public query ({ caller }) func getMostFrequentDistractions() : async [(Text, Nat)] {
    let counts = Map.empty<Text, Nat>();

    distractionLogs.values().forEach(
      func(log) {
        let source = log.source;
        let currentCount = switch (counts.get(source)) {
          case (null) { 0 };
          case (?count) { count };
        };
        counts.add(source, currentCount + 1);
      }
    );

    counts.toArray();
  };

  public query ({ caller }) func getLongestFocusStreak() : async Int {
    var maxDuration : Int = 0;
    switch (sessionSummaries.isEmpty()) {
      case (true) { 0 };
      case (false) {
        for (summary in sessionSummaries.values()) {
          if (summary.totalDuration > maxDuration) {
            maxDuration := summary.totalDuration;
          };
        };
        maxDuration;
      };
    };
  };

  public query ({ caller }) func getSessionHistory(sortBy : Text) : async [SessionSummary] {
    var summaries = sessionSummaries.values().toArray();
    summaries;
  };

  func calculateBurnoutScore(totalDuration : Int, productiveTime : Nat, distractingTime : Nat, distractionsCount : Nat, switchesCount : Nat) : Int {
    if (totalDuration <= 0) { return 0 };

    let focusRatio = if (totalDuration > 0) {
      (productiveTime * 100) / totalDuration.toNat();
    } else { 0 };

    let switchPenalty = switchesCount * 5;
    let distractionPenalty = distractionsCount * 10;

    let normalizedDuration = totalDuration / (60 * 60 * 1000000000);

    let finalScore = focusRatio - switchPenalty - distractionPenalty + normalizedDuration;

    if (finalScore < 0) { 0 } else { finalScore };
  };
};
