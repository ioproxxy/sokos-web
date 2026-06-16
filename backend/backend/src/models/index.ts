/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Listing, Message, Review, Order, Notification } from '../../../shared/types/index.js';
import { getDatabasePool } from '../db/index.js';
import { logger } from '../utils/index.js';

// Reusable mapper helpers (convert snake_case DB columns to CamelCase properties)

export function mapUserToCamel(row: any): User {
  return {
    id: row.id,
    name: row.name,
    username: row.username || undefined,
    phone: row.phone,
    email: row.email || undefined,
    avatarUrl: row.avatar_url || undefined,
    verified: !!row.verified,
    docVerified: !!row.doc_verified,
    verificationDocType: row.verification_doc_type || undefined,
    rating: parseFloat(row.rating ?? 0),
    reviewsCount: parseInt(row.reviews_count ?? 0, 10),
    locationName: row.location_name,
    latitude: parseFloat(row.latitude ?? 0),
    longitude: parseFloat(row.longitude ?? 0),
    onboarded: !!row.onboarded,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    password: row.password || undefined,
    subscriptionPlan: row.subscription_plan || 'free',
    subscriptionStatus: row.subscription_status || 'none',
    subscriptionExpiresAt: row.subscription_expires_at || undefined,
    storeName: row.store_name || undefined,
    storeTagline: row.store_tagline || undefined,
    storeBanner: row.store_banner || undefined,
    premiumBoostQuota: parseInt(row.premium_boost_quota ?? 0, 10)
  };
}

export function mapListingToCamel(row: any): Listing {
  let images: string[] = [];
  try {
    if (typeof row.images === 'string') {
      images = JSON.parse(row.images);
    } else if (Array.isArray(row.images)) {
      images = row.images;
    }
  } catch {
    if (row.images) {
      images = row.images.split(',').map((img: string) => img.trim());
    }
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: parseFloat(row.price ?? 0),
    category: row.category,
    images,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    vendorVerified: !!row.vendor_verified,
    latitude: parseFloat(row.latitude ?? 0),
    longitude: parseFloat(row.longitude ?? 0),
    status: row.status as ('active' | 'sold'),
    condition: row.condition as ('new' | 'like_new' | 'good' | 'fair'),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    isBoosted: !!row.is_boosted,
    boostExpiresAt: row.boost_expires_at || undefined,
    views: parseInt(row.views ?? 0, 10)
  };
}

export function mapOrderToCamel(row: any): Order {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    buyerName: row.buyer_name,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    listingImage: row.listing_image,
    price: parseFloat(row.price ?? 0),
    status: row.status as any,
    paymentMethod: row.payment_method as ('mpesa' | 'cash'),
    mpesaPhone: row.mpesa_phone || undefined,
    mpesaCheckoutRequestId: row.mpesa_checkout_request_id || undefined,
    mpesaReceiptNumber: row.mpesa_receipt_number || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
  };
}

export class UserModel {
  public static async findById(id: string): Promise<User | null> {
    const pool = getDatabasePool();
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return mapUserToCamel(res.rows[0]);
    } catch (err) {
      logger.error('Error fetching user by ID', err);
      return null;
    }
  }

  public static async create(user: User): Promise<User> {
    const pool = getDatabasePool();
    await pool.query(
      `INSERT INTO users (
        id, name, username, phone, email, avatar_url, verified, doc_verified, 
        verification_doc_type, rating, reviews_count, location_name, latitude, 
        longitude, onboarded, password, subscription_plan, subscription_status, 
        subscription_expires_at, store_name, store_tagline, store_banner, premium_boost_quota
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
      [
        user.id, user.name, user.username, user.phone, user.email, user.avatarUrl,
        user.verified, user.docVerified, user.verificationDocType, user.rating,
        user.reviewsCount, user.locationName, user.latitude, user.longitude,
        user.onboarded, user.password, user.subscriptionPlan || 'free',
        user.subscriptionStatus || 'none', user.subscriptionExpiresAt,
        user.storeName, user.storeTagline, user.storeBanner, user.premiumBoostQuota || 0
      ]
    );
    return user;
  }

  public static async update(id: string, updates: Partial<User>): Promise<boolean> {
    const pool = getDatabasePool();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const mappings: Record<string, string> = {
      name: 'name',
      username: 'username',
      phone: 'phone',
      email: 'email',
      avatarUrl: 'avatar_url',
      verified: 'verified',
      docVerified: 'doc_verified',
      verificationDocType: 'verification_doc_type',
      rating: 'rating',
      reviewsCount: 'reviews_count',
      locationName: 'location_name',
      latitude: 'latitude',
      longitude: 'longitude',
      onboarded: 'onboarded',
      password: 'password',
      subscriptionPlan: 'subscription_plan',
      subscriptionStatus: 'subscription_status',
      subscriptionExpiresAt: 'subscription_expires_at',
      storeName: 'store_name',
      storeTagline: 'store_tagline',
      storeBanner: 'store_banner',
      premiumBoostQuota: 'premium_boost_quota'
    };

    for (const [key, val] of Object.entries(updates)) {
      if (mappings[key]) {
        fields.push(`${mappings[key]} = $${idx++}`);
        values.push(val);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`;
    const result = await pool.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
}

export class ListingModel {
  public static async findById(id: string): Promise<Listing | null> {
    const pool = getDatabasePool();
    const res = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return mapListingToCamel(res.rows[0]);
  }

  public static async create(listing: Listing): Promise<Listing> {
    const pool = getDatabasePool();
    await pool.query(
      `INSERT INTO listings (
        id, title, description, price, category, images, vendor_id, vendor_name,
        vendor_verified, latitude, longitude, status, condition, is_boosted, boost_expires_at, views
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        listing.id, listing.title, listing.description, listing.price, listing.category,
        JSON.stringify(listing.images), listing.vendorId, listing.vendorName,
        listing.vendorVerified, listing.latitude, listing.longitude,
        listing.status, listing.condition, listing.isBoosted || false,
        listing.boostExpiresAt, listing.views || 0
      ]
    );
    return listing;
  }

  public static async incrementViews(id: string): Promise<void> {
    const pool = getDatabasePool();
    await pool.query('UPDATE listings SET views = views + 1 WHERE id = $1', [id]);
  }
}

export class OrderModel {
  public static async findById(id: string): Promise<Order | null> {
    const pool = getDatabasePool();
    const res = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    return mapOrderToCamel(res.rows[0]);
  }

  public static async create(order: Order): Promise<Order> {
    const pool = getDatabasePool();
    await pool.query(
      `INSERT INTO orders (
        id, buyer_id, buyer_name, seller_id, seller_name, listing_id, listing_title,
        listing_image, price, status, payment_method, mpesa_phone, mpesa_checkout_request_id, mpesa_receipt_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        order.id, order.buyerId, order.buyerName, order.sellerId, order.sellerName,
        order.listingId, order.listingTitle, order.listingImage, order.price,
        order.status, order.paymentMethod, order.mpesaPhone,
        order.mpesaCheckoutRequestId, order.mpesaReceiptNumber
      ]
    );
    return order;
  }

  public static async update(id: string, updates: Partial<Order>): Promise<boolean> {
    const pool = getDatabasePool();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updates)) {
      const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      fields.push(`${dbField} = $${idx++}`);
      values.push(val);
    }

    if (fields.length === 0) return false;
    values.push(id);
    const query = `UPDATE orders SET ${fields.join(', ')} WHERE id = $${idx}`;
    const result = await pool.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
}
