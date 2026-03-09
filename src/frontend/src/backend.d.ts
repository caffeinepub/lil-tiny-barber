import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Salon {
    id: bigint;
    status: SalonStatus;
    staffName: string;
    address: string;
    mobile: string;
    registeredAt: bigint;
    salonName: string;
}
export interface Booking {
    id: bigint;
    service: string;
    customerName: string;
    status: BookingStatus;
    createdAt: bigint;
    customerMobile: string;
    timeSlot: string;
    salonId: bigint;
}
export interface BookingResponse {
    bookingId: bigint;
    message: string;
    success: boolean;
}
export interface SalonLoginInfo {
    id: bigint;
    staffName: string;
    address: string;
    mobile: string;
    salonName: string;
}
export interface UserProfile {
    name: string;
    salonId?: bigint;
}
export interface SalonListItem {
    id: bigint;
    address: string;
    salonName: string;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed"
}
export enum SalonStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Admin: Approve salon (admin only)
     */
    approveSalon(id: bigint): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create a new booking
     */
    createBooking(salonId: bigint, customerName: string, customerMobile: string, service: string, timeSlot: string, date: string): Promise<BookingResponse>;
    /**
     * / Get approved salons (public)
     */
    getApprovedSalons(): Promise<Array<SalonListItem>>;
    /**
     * / Get available time slots for a salon on a specific date
     */
    getAvailableSlots(salonId: bigint, date: string): Promise<Array<string>>;
    /**
     * / Get all bookings for a salon (ordered by creation time)
     */
    getBookingsBySalon(salonId: bigint): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Admin: Get pending salons (admin only)
     */
    getPendingSalons(): Promise<Array<Salon>>;
    /**
     * / Admin: Get all salons (admin only)
     */
    getSalons(): Promise<Array<Salon>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Login Salon (only if approved)
     */
    loginSalon(mobile: string): Promise<SalonLoginInfo | null>;
    /**
     * / Register a new Salon
     */
    registerSalon(mobile: string, staffName: string, salonName: string, address: string): Promise<bigint>;
    /**
     * / Admin: Reject salon (admin only)
     */
    rejectSalon(id: bigint): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Update booking status
     */
    updateBookingStatus(bookingId: bigint, status: BookingStatus): Promise<boolean>;
}
