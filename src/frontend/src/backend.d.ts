import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DistractionLog {
    source: string;
    description: string;
    sourceType: SourceType;
    timestamp: bigint;
    category: Category;
}
export interface ActivitySwitch {
    toApp: string;
    toCategory: Category;
    fromCategory: Category;
    fromApp: string;
    timestamp: bigint;
}
export interface SessionSummary {
    startTime: bigint;
    productiveTime: bigint;
    endTime: bigint;
    totalDuration: bigint;
    distractingTime: bigint;
    burnoutScore: bigint;
    sessionId: bigint;
    switchesCount: bigint;
    distractionsCount: bigint;
}
export enum Category {
    productive = "productive",
    distracting = "distracting",
    neutral = "neutral"
}
export enum SourceType {
    other = "other",
    news = "news",
    workApp = "workApp",
    shopping = "shopping",
    socialMedia = "socialMedia"
}
export interface backendInterface {
    endSession(): Promise<void>;
    getActivitySwitches(): Promise<Array<[bigint, ActivitySwitch]>>;
    getAllAppCategories(): Promise<Array<[string, Category]>>;
    getAppCategory(appName: string): Promise<Category | null>;
    getCurrentSessionStats(): Promise<[bigint, bigint, bigint, bigint, bigint]>;
    getDistractionLogs(): Promise<Array<[bigint, DistractionLog]>>;
    getLongestFocusStreak(): Promise<bigint>;
    getMostFrequentDistractions(): Promise<Array<[string, bigint]>>;
    getSessionHistory(sortBy: string): Promise<Array<SessionSummary>>;
    getSessionSummaries(): Promise<Array<[bigint, SessionSummary]>>;
    logDistraction(source: string, category: Category, sourceType: SourceType, description: string): Promise<void>;
    recordActivitySwitch(fromApp: string, toApp: string, fromCategory: Category, toCategory: Category): Promise<void>;
    recordTimeBlock(category: Category, duration: bigint): Promise<void>;
    setAppCategory(appName: string, category: Category): Promise<void>;
    startSession(): Promise<void>;
}
