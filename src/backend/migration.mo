import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type FocusSessionViolation = {
    timestamp : Int;
    violationCount : Nat;
    sourceTab : {
      #productive;
      #distractive;
    };
    targetTab : {
      #productive;
      #distractive;
    };
  };

  type OldActor = {
    focusScores : Map.Map<Principal, List.List<{
      timestamp : Int;
      distractionScore : Nat;
      tabSwitchCount : Nat;
      timeAway : Nat;
    }>>;
  };

  type NewActor = {
    focusScores : Map.Map<Principal, List.List<{
      timestamp : Int;
      distractionScore : Nat;
      tabSwitchCount : Nat;
      timeAway : Nat;
    }>>;
    focusSessionViolations : Map.Map<Principal, List.List<FocusSessionViolation>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      focusScores = old.focusScores;
      focusSessionViolations = Map.empty<Principal, List.List<FocusSessionViolation>>();
    };
  };
};
