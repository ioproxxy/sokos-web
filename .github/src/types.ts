/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  username?: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  verified: boolean;
  docVerified: boolean;
  verificationDocType?: 'national_id' | 'passport' | 'business_permit';
  rating: number;
  reviewsCount: number;
  locationName: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  onboarded?: boolean;
  password?: string;
  // SaaS Vendor enhancements
  subscriptionPlan?: 'free' | 'bronze' | 'silver' | 'gold';
  subscriptionStatus?: 'active' | 'expiring' | 'none';
  subscriptionExpiresAt?: string;
  storeName?: string;
  storeTagline?: string;
  storeBanner?: string;
  premiumBoostQuota?: number;
  isAdmin?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  vendorId: string;
  vendorName: string;
  vendorVerified: boolean;
  latitude: number;
  longitude: number;
  createdAt: string;
  status: 'active' | 'sold';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  // SaaS Listings enhancements
  isBoosted?: boolean;
  boostExpiresAt?: string;
  views?: number;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'urgent';
  // Admin & Spam Control enhancements
  isApproved?: boolean;
  isSpam?: boolean;
  isFeatured?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string; // sellerId_buyerId_listingId
  sellerId: string;
  buyerId: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl?: string;
    verified: boolean;
  };
  lastMessage?: Message;
  unreadCount: number;
}

export interface Review {
  id: string;
  targetUserId: string; // Seller being rated
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5
  text: string;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  price: number;
  status: 'pending' | 'mpesa_pending' | 'paid' | 'completed' | 'cancelled';
  paymentMethod: 'mpesa' | 'cash';
  mpesaPhone?: string;
  mpesaCheckoutRequestId?: string;
  mpesaReceiptNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MpesaSTKPushRequest {
  phone: string;
  amount: number;
  orderId: string;
}

export interface MpesaCallbackPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: {
          Name: string;
          Value?: any;
        }[];
      };
    };
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'order_update' | 'payment_received' | 'verification';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  category: string;
  maxDistance: number; // in km
  latitude?: number;
  longitude?: number;
  sortBy: 'distance' | 'price_asc' | 'price_desc' | 'date';
}
