import React from 'react';

export enum ChallengeType {
  GPS = 'GPS',
  Photo = 'PHOTO',
  Receipt = 'RECEIPT',
  Social = 'SOCIAL',
  Video = 'VIDEO',
  Booking = 'BOOKING',
  QR_CODE = 'QR_CODE',
}

export interface Challenge {
  id: number;
  venueName: string;
  description: string;
  points: number;
  type: ChallengeType;
  iconName: string;
  validationTag?: string; // e.g. '@username' for social media
  socialUrl?: string; // e.g. URL to the social media profile
  bookingEmail?: string; // e.g., 'booking@example.com'
  qrValidationData?: string; // e.g., 'SECRET_CODE_123'
}

export interface UserRank {
  name: string;
  minPoints: number;
  color: string;
}

export interface Perk {
  id: number;
  name: string;
  description: string;
  requiredPoints: number;
  iconName: string;
}

export interface PartnerDeal {
  id: number;
  name: string;
  description: string;
  qrCodeData: string;
  iconName: string;
  scanCount: number;
}

export enum Role {
  Admin = 'ADMIN',
  Guest = 'GUEST',
}

export interface User {
  id: number;
  username: string;
  // Fix: Corrected typo from `password; string;` to `password: string;` to properly define the type. This resolves errors in App.tsx related to the User type definition.
  password: string; // In a real app, this would be a hash
  role: Role;
  points: number;
  completedChallengeIds: Set<number>;
}

export interface ThemeSettings {
  headerText: string;
  subHeaderText: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  backgroundImage: string; // base64 data URI
}

export interface Vehicle {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  capacity: number;
  type: 'Sedan' | 'SUV' | 'Party Bus';
  iCalUrl: string;
  quickRideBaseFare: number;
  tourHourlyRate: number;
  stripePaymentLink: string;
}

export enum BookingType {
  QuickRide = 'QUICK_RIDE',
  Tour = 'TOUR',
}

export interface Booking {
  id: number;
  vehicleId: number;
  userId: number;
  bookingType: BookingType;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: 'CONFIRMED' | 'PENDING_PAYMENT';
}


// Fix: Added missing poker types.
export enum Suit {
  Spades = 'Spades',
  Hearts = 'Hearts',
  Diamonds = 'Diamonds',
  Clubs = 'Clubs',
}

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  // Fix: Added missing 'value' property to the Card type to hold its numerical value, which is necessary for hand evaluation logic.
  value: number;
}

export interface HandStrength {
  name: string;
  value: number;
}