/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'customer' | 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
}

export type TokenStatus = 'waiting' | 'calling' | 'completed' | 'cancelled';

export interface Token {
  id: string;
  tokenNumber: string;
  serviceType: string;
  date: string;
  timeSlot: string;
  estimatedWaitMinutes: number;
  status: TokenStatus;
  userId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  additionalNotes?: string;
  counterNumber?: number;
  createdAt?: string;
}

export type ParcelStatus = 
  | 'processing'
  | 'accepted'
  | 'dispatched'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered';

export interface ParcelTimelineEvent {
  status: ParcelStatus;
  timestamp: string;
  location: string;
  description: string;
}

export interface Parcel {
  id: string;
  trackingId: string;
  senderName: string;
  receiverName: string;
  receiverPhone?: string;
  parcelName?: string;
  bookingMessage?: string;
  origin: string;
  destination: string;
  receiverAddress?: string;
  weight: number; // in grams
  type: 'standard' | 'speed_post' | 'registered';
  status: ParcelStatus;
  timeline: ParcelTimelineEvent[];
  deliveryPredictionDate: string;
  charges: number;
  createdAt: string;
  qrCode?: string;
  aiClassification?: string;
}

export type ComplaintType = 'lost_parcel' | 'delayed_delivery' | 'damaged_parcel' | 'wrong_delivery';
export type ComplaintStatus = 'pending' | 'investigating' | 'resolved';

export interface Complaint {
  id: string;
  userId: string;
  customerName: string;
  type: ComplaintType;
  trackingId: string;
  description: string;
  status: ComplaintStatus;
  aiResponse?: string;
  createdAt: string;
}

export type SpamClassification = 'safe' | 'suspicious' | 'fraud';

export interface SpamReport {
  id: string;
  userId: string;
  source: string; // SMS number, Email address, etc
  messageText: string;
  riskScore: number; // 0 to 100
  classification: SpamClassification;
  recommendations: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
  groundingLinks?: { text: string; url: string }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}

export interface PostOffice {
  id: string;
  name: string;
  address: string;
  distance: string; // e.g. "0.8 km"
  pinCode: string;
  openTime: string;
  closeTime: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface LoginActivity {
  id: string;
  email: string;
  role: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed';
  type: 'customer_portal' | 'manager_portal';
}
