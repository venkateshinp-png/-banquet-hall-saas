export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  ASSISTANT = 'ASSISTANT',
  ADMIN = 'ADMIN',
}

export enum HallStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentMode {
  FULL = 'FULL',
  INSTALLMENT = 'INSTALLMENT',
}

export enum PaymentType {
  FULL = 'FULL',
  INSTALLMENT_1 = 'INSTALLMENT_1',
  INSTALLMENT_2 = 'INSTALLMENT_2',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface User {
  id: number;
  phone: string | null;
  email: string | null;
  fullName: string;
  role: UserRole;
  phoneVerified: boolean;
  profilePicture: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string | null;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface HallDocument {
  id: number;
  documentType: string;
  filePath: string;
  uploadedAt: string;
}

export interface Hall {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  status: HallStatus;
  termsConditions: string;
  adminNotes: string;
  createdAt: string;
  owner: User;
  documents: HallDocument[];
  distance: number | null;
}

export interface Venue {
  id: number;
  hallId: number;
  name: string;
  description: string;
  capacity: number;
  minBookingDurationHours: number;
  basePricePerHour: number;
  imageUrls: string;
  active: boolean;
}

export interface VenuePricing {
  effectiveDate: string;
  slotStart: string;
  slotEnd: string;
  price: number;
}

export interface Booking {
  id: number;
  customerId: number;
  customerName: string;
  venueId: number;
  venueName: string;
  hallName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paidAmount: number;
  status: BookingStatus;
  paymentMode: PaymentMode;
  cancellationReason: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  stripePaymentIntentId: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ExternalHall {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  userRatingsTotal: number | null;
  phoneNumber: string | null;
  website: string | null;
  types: string[];
  openNow: boolean | null;
  source: string;
  canBook: boolean;
  googleMapsUrl: string;
}
