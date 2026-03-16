import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EarnRecord {
    id: bigint;
    status: Variant_pending_approved_rejected;
    contentId: string;
    username: string;
    userId: Principal;
    createdAt: bigint;
    taskType: Variant_writeArticle_watchVideo;
    amount: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface AdminDashboardStats {
    totalPendingWithdrawals: bigint;
    totalPlatformBalance: bigint;
    totalPendingDeposits: bigint;
    totalUsers: bigint;
    totalPendingEarnRecords: bigint;
}
export interface UserAccount {
    username: string;
    balance: bigint;
    totalEarned: bigint;
    passwordHash: Uint8Array;
    totalDeposited: bigint;
}
export interface VlogPost {
    id: bigint;
    title: string;
    thumbnailUrl: string;
    createdAt: bigint;
    description: string;
    category: VlogCategory;
    videoUrl: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface DepositRequest {
    id: bigint;
    status: Variant_pending_approved_rejected;
    username: string;
    userId: Principal;
    createdAt: bigint;
    reviewedAt: bigint;
    currency: string;
    txHash: string;
    amount: string;
}
export interface Announcement {
    id: bigint;
    title: string;
    content: string;
    createdAt: bigint;
}
export interface WithdrawalRequest {
    id: bigint;
    status: Variant_pending_approved_rejected;
    username: string;
    userId: Principal;
    createdAt: bigint;
    walletAddress: string;
    reviewedAt: bigint;
    currency: string;
    amount: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Ad {
    id: bigint;
    title: string;
    linkUrl: string;
    createdAt: bigint;
    description: string;
    isActive: boolean;
    imageUrl: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Variant_writeArticle_watchVideo {
    writeArticle = "writeArticle",
    watchVideo = "watchVideo"
}
export enum VlogCategory {
    vlog = "vlog",
    trading = "trading",
    promo = "promo"
}
export interface backendInterface {
    approveDeposit(id: bigint): Promise<void>;
    approveEarnRecord(id: bigint): Promise<void>;
    approveWithdrawal(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimEarnForArticle(username: string, articleTitle: string): Promise<void>;
    claimEarnForVideo(username: string, videoId: bigint): Promise<void>;
    createAd(title: string, description: string, imageUrl: string, linkUrl: string): Promise<void>;
    createAnnouncement(title: string, content: string): Promise<void>;
    createVlogPost(title: string, description: string, videoUrl: string, thumbnailUrl: string, category: VlogCategory): Promise<void>;
    deleteAd(id: bigint): Promise<void>;
    deleteAnnouncement(id: bigint): Promise<void>;
    deleteVlogPost(id: bigint): Promise<void>;
    fetchCryptoPrices(): Promise<string>;
    fetchWorldNews(): Promise<string>;
    getActiveAds(): Promise<Array<Ad>>;
    getAdminStats(): Promise<AdminDashboardStats>;
    getAnnouncement(id: bigint): Promise<Announcement>;
    getAnnouncements(): Promise<Array<Announcement>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPendingDeposits(): Promise<Array<DepositRequest>>;
    getPendingEarnRecords(): Promise<Array<EarnRecord>>;
    getPendingWithdrawals(): Promise<Array<WithdrawalRequest>>;
    getUserAccount(): Promise<UserAccount | null>;
    getUserDeposits(): Promise<Array<DepositRequest>>;
    getUserEarnRecords(): Promise<Array<EarnRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserWithdrawals(): Promise<Array<WithdrawalRequest>>;
    getVlogPost(id: bigint): Promise<VlogPost>;
    getVlogPosts(): Promise<Array<VlogPost>>;
    getVlogPostsByCategory(category: VlogCategory): Promise<Array<VlogPost>>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(username: string, passwordHash: Uint8Array): Promise<void>;
    rejectDeposit(id: bigint): Promise<void>;
    rejectEarnRecord(id: bigint): Promise<void>;
    rejectWithdrawal(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitDepositRequest(username: string, currency: string, amount: string, txHash: string): Promise<void>;
    submitWithdrawalRequest(username: string, amount: bigint, currency: string, walletAddress: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAd(id: bigint, title: string, description: string, imageUrl: string, linkUrl: string, isActive: boolean): Promise<void>;
    updateAnnouncement(id: bigint, title: string, content: string): Promise<void>;
    updateVlogPost(id: bigint, title: string, description: string, videoUrl: string, thumbnailUrl: string, category: VlogCategory): Promise<void>;
}
