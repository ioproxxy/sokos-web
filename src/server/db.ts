/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { User, Listing, Message, Review, Order, Notification } from '../types.js';

dotenv.config();

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

interface Schema {
  users: User[];
  listings: Listing[];
  messages: Message[];
  reviews: Review[];
  orders: Order[];
  notifications: Notification[];
}

const DEFAULT_DB: Schema = {
  users: [],
  listings: [],
  messages: [],
  reviews: [],
  orders: [],
  notifications: []
};

// Nairobi Coordinates reference
const NAIROBI_COORDS = {
  CBD: { latitude: -1.2833, longitude: 36.8219 },
  KILIMANI: { latitude: -1.2915, longitude: 36.7900 },
  WESTLANDS: { latitude: -1.2647, longitude: 36.8044 },
  MADARAKA: { latitude: -1.3090, longitude: 36.8123 },
  SOUTHC: { latitude: -1.3204, longitude: 36.8267 },
};

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

// Map PostgreSQL Database snake_case structures into TypeScript camelCase entities
function mapUserToCamel(row: any): User {
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
    // SaaS updates
    subscriptionPlan: row.subscription_plan || 'free',
    subscriptionStatus: row.subscription_status || 'none',
    subscriptionExpiresAt: row.subscription_expires_at || undefined,
    storeName: row.store_name || undefined,
    storeTagline: row.store_tagline || undefined,
    storeBanner: row.store_banner || undefined,
    premiumBoostQuota: parseInt(row.premium_boost_quota ?? 0, 10),
    isAdmin: !!row.is_admin
  };
}

function mapListingToCamel(row: any): Listing {
  let images: string[] = [];
  try {
    if (typeof row.images === 'string') {
      images = JSON.parse(row.images);
    } else if (Array.isArray(row.images)) {
      images = row.images;
    }
  } catch (e) {
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
    images: images,
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    vendorVerified: !!row.vendor_verified,
    latitude: parseFloat(row.latitude ?? 0),
    longitude: parseFloat(row.longitude ?? 0),
    status: row.status as ('active' | 'sold'),
    condition: row.condition as ('new' | 'like_new' | 'good' | 'fair'),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    // SaaS updates
    isBoosted: !!row.is_boosted,
    boostExpiresAt: row.boost_expires_at || undefined,
    views: parseInt(row.views ?? 0, 10),
    urgencyLevel: (row.urgency_level as any) || 'low',
    isApproved: row.is_approved !== false,
    isSpam: !!row.is_spam,
    isFeatured: !!row.is_featured
  };
}

function mapMessageToCamel(row: any): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    listingId: row.listing_id,
    text: row.text,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
  };
}

function mapReviewToCamel(row: any): Review {
  return {
    id: row.id,
    targetUserId: row.target_user_id,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    rating: parseInt(row.rating),
    text: row.text,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
  };
}

function mapOrderToCamel(row: any): Order {
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

function mapNotificationToCamel(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type as any,
    read: !!row.read,
    link: row.link || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
  };
}

// PostgreSQL connection pool (instantiated safely if DATABASE_URL exists)
let pool: pg.Pool | null = null;
const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log('[Database] PostgreSQL DATABASE_URL detected. Starting initialization pool client...');
  pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
  });

  pool.connect()
    .then(async (client) => {
      console.log('[Database] Postgres connection confirmed. Running schema configuration checks...');
      await initPostgresTables(client);
      client.release();
    })
    .catch((err) => {
      console.error('[Database] Failed to hook pg client. Reverting server adapter to db.json storage.', err);
      pool = null;
    });
} else {
  console.log('[Database] Running local sandbox context via JSON server side db.json file.');
}

async function initPostgresTables(client: pg.PoolClient) {
  try {
    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(100),
          avatar_url TEXT,
          password TEXT,
          verified BOOLEAN NOT NULL DEFAULT FALSE,
          doc_verified BOOLEAN NOT NULL DEFAULT FALSE,
          verification_doc_type VARCHAR(30) DEFAULT NULL,
          rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
          reviews_count INT NOT NULL DEFAULT 0,
          location_name VARCHAR(150) NOT NULL,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          onboarded BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Listings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(12, 2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          images TEXT NOT NULL,
          vendor_id VARCHAR(50) NOT NULL,
          vendor_name VARCHAR(100) NOT NULL,
          vendor_verified BOOLEAN NOT NULL DEFAULT FALSE,
          latitude DECIMAL(10, 8) NOT NULL,
          longitude DECIMAL(11, 8) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          condition VARCHAR(20) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Ensure Admin & Spam control columns exist on Postgres
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;');
    await client.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT TRUE;');
    await client.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT FALSE;');
    await client.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;');

    // 3. Messages Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
          id VARCHAR(50) PRIMARY KEY,
          sender_id VARCHAR(50) NOT NULL,
          receiver_id VARCHAR(50) NOT NULL,
          listing_id VARCHAR(50) NOT NULL,
          text TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
      );
    `);

    // 4. Reviews Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
          id VARCHAR(50) PRIMARY KEY,
          target_user_id VARCHAR(50) NOT NULL,
          reviewer_id VARCHAR(50) NOT NULL,
          reviewer_name VARCHAR(100) NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          text TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 5. Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(50) PRIMARY KEY,
          buyer_id VARCHAR(50) NOT NULL,
          buyer_name VARCHAR(100) NOT NULL,
          seller_id VARCHAR(50) NOT NULL,
          seller_name VARCHAR(100) NOT NULL,
          listing_id VARCHAR(50) NOT NULL,
          listing_title VARCHAR(200) NOT NULL,
          listing_image TEXT NOT NULL,
          price DECIMAL(12, 2) NOT NULL,
          status VARCHAR(30) NOT NULL DEFAULT 'pending',
          payment_method VARCHAR(20) NOT NULL,
          mpesa_phone VARCHAR(20) DEFAULT NULL,
          mpesa_checkout_request_id VARCHAR(100) DEFAULT NULL,
          mpesa_receipt_number VARCHAR(50) DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
      );
    `);

    // 6. Notifications Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL,
          title VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(30) NOT NULL,
          read BOOLEAN NOT NULL DEFAULT FALSE,
          link TEXT DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Index optimizations helper
    try { await client.query('CREATE INDEX IF NOT EXISTS idx_listings_vendor_id ON listings(vendor_id);'); } catch (e) {}
    try { await client.query('CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);'); } catch (e) {}
    try { await client.query('CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);'); } catch (e) {}
    try { await client.query('CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);'); } catch (e) {}
    try { await client.query('CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);'); } catch (e) {}
    try { await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_target_user ON reviews(target_user_id);'); } catch (e) {}
    try { await client.query('CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);'); } catch (e) {}
    try { await client.query('CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);'); } catch (e) {}
    try { await client.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);'); } catch (e) {}

    // Verify row indicators to seed local dataset
    const countCheck = await client.query('SELECT COUNT(*) FROM users;');
    const rowCount = parseInt(countCheck.rows[0].count, 10);

    if (rowCount === 0) {
      console.log('[Database] PostgreSQL is completely empty. Seeding default Nairobi merchant records inside SSH container...');
      const d = new Database();
      const s = d.getSeededData();

      // Seed Users
      for (const u of s.users) {
        await client.query(`
          INSERT INTO users (id, name, username, phone, email, avatar_url, verified, doc_verified, verification_doc_type, rating, reviews_count, location_name, latitude, longitude, onboarded, created_at, password)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        `, [
          u.id, u.name, u.username || null, u.phone, u.email || null, u.avatarUrl || null, u.verified, u.docVerified, u.verificationDocType || null,
          u.rating, u.reviewsCount, u.locationName, u.latitude, u.longitude, u.onboarded ?? true, u.createdAt, u.password || 'soko123'
        ]);
      }

      // Seed Listings
      for (const l of s.listings) {
        await client.query(`
          INSERT INTO listings (id, title, description, price, category, images, vendor_id, vendor_name, vendor_verified, latitude, longitude, status, condition, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
          l.id, l.title, l.description, l.price, l.category, JSON.stringify(l.images), l.vendorId, l.vendorName,
          l.vendorVerified, l.latitude, l.longitude, l.status, l.condition, l.createdAt
        ]);
      }

      // Seed Reviews
      for (const r of s.reviews) {
        await client.query(`
          INSERT INTO reviews (id, target_user_id, reviewer_id, reviewer_name, rating, text, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          r.id, r.targetUserId, r.reviewerId, r.reviewerName, r.rating, r.text, r.createdAt
        ]);
      }

      // Seed Messages
      for (const m of s.messages) {
        await client.query(`
          INSERT INTO messages (id, sender_id, receiver_id, listing_id, text, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          m.id, m.senderId, m.receiverId, m.listingId, m.text, m.createdAt
        ]);
      }

      console.log('[Database] PostgreSQL database seeded successfully with Nairobi mock participants!');
    } else {
      console.log('[Database] PostgreSQL already displays records. Skipped seeding default profiles.');
    }
  } catch (err) {
    console.error('[Database] Schema execution error on remote pg client', err);
  }
}

class Database {
  private cache: Schema = { ...DEFAULT_DB };

  constructor() {
    this.init();
  }

  private init() {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE_PATH)) {
      const seeded = this.getSeededData();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(seeded, null, 2), 'utf-8');
      this.cache = seeded;
      console.log('Database initialized with seeded Nairobi local traders.');
    } else {
      try {
        const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.cache = JSON.parse(content);
      } catch (e) {
        console.error('Error reading DB, resetting to default', e);
        this.cache = { ...DEFAULT_DB };
      }
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving data to db.json', e);
    }
  }

  public getSeededData(): Schema {
    const users: User[] = [
      {
        id: 'usr_johndoe',
        name: 'John Kamau',
        username: 'johndoe',
        phone: '0712345678',
        email: 'kamau@sokos.co.ke',
        verified: true,
        docVerified: true,
        verificationDocType: 'national_id',
        rating: 4.8,
        reviewsCount: 15,
        locationName: 'Kilimani, Nairobi',
        latitude: NAIROBI_COORDS.KILIMANI.latitude,
        longitude: NAIROBI_COORDS.KILIMANI.longitude,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        onboarded: true,
        password: 'soko123'
      },
      {
        id: 'usr_marywaweru',
        name: 'Mary Waweru',
        username: 'marywaweru',
        phone: '0722111222',
        email: 'mary@sokos.co.ke',
        verified: true,
        docVerified: true,
        verificationDocType: 'business_permit',
        rating: 4.9,
        reviewsCount: 24,
        locationName: 'Westlands, Nairobi',
        latitude: NAIROBI_COORDS.WESTLANDS.latitude,
        longitude: NAIROBI_COORDS.WESTLANDS.longitude,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        onboarded: true,
        password: 'soko123'
      },
      {
        id: 'usr_davidotieno',
        name: 'David Otieno',
        username: 'davidotieno',
        phone: '0733444555',
        email: 'otieno@sokos.co.ke',
        verified: false,
        docVerified: false,
        rating: 4.2,
        reviewsCount: 5,
        locationName: 'Madaraka, Nairobi',
        latitude: NAIROBI_COORDS.MADARAKA.latitude,
        longitude: NAIROBI_COORDS.MADARAKA.longitude,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        onboarded: true,
        password: 'soko123'
      },
      {
        id: 'usr_aminamohan',
        name: 'Amina Mohammed',
        username: 'aminamohan',
        phone: '0700999888',
        email: 'amina@sokos.co.ke',
        verified: true,
        docVerified: true,
        verificationDocType: 'national_id',
        rating: 4.7,
        reviewsCount: 12,
        locationName: 'South C, Nairobi',
        latitude: NAIROBI_COORDS.SOUTHC.latitude,
        longitude: NAIROBI_COORDS.SOUTHC.longitude,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        onboarded: true,
        password: 'soko123'
      },
      {
        id: 'usr_buyer1',
        name: 'Alex Gathu',
        username: 'alexg',
        phone: '0799888777',
        email: 'gathu@example.com',
        verified: false,
        docVerified: false,
        rating: 5.0,
        reviewsCount: 1,
        locationName: 'Nairobi CBD',
        latitude: NAIROBI_COORDS.CBD.latitude,
        longitude: NAIROBI_COORDS.CBD.longitude,
        createdAt: new Date().toISOString(),
        onboarded: true,
        password: 'soko123'
      }
    ];

    const listings: Listing[] = [
      {
        id: 'lst_iphone13',
        title: 'iPhone 13 Pro (128GB, Sierra Blue)',
        description: 'Excellent condition iPhone 13 Pro. 88% battery health, original liquid retina screen, face ID is operational. Comes with adapter, charging cable and phone cover. Need to clear fast to cover university module fees before Friday!',
        price: 75000,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80'],
        vendorId: 'usr_johndoe',
        vendorName: 'John Kamau',
        vendorVerified: true,
        latitude: NAIROBI_COORDS.KILIMANI.latitude,
        longitude: NAIROBI_COORDS.KILIMANI.longitude,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        condition: 'like_new',
        urgencyLevel: 'high'
      },
      {
        id: 'lst_sofa',
        title: 'L-Shaped Cozy Living Room Sofa Set',
        description: 'Solid mahogany base with grey fabric L-shaped cushions. Extremely comfortable and durable. Only 5 months old, no stains or wear. Moving houses out of Westlands by Tuesday morning so pricing to go immediately! Best near offer wins.',
        price: 45000,
        category: 'Furniture',
        images: ['https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80'],
        vendorId: 'usr_marywaweru',
        vendorName: 'Mary Waweru',
        vendorVerified: true,
        latitude: NAIROBI_COORDS.WESTLANDS.latitude,
        longitude: NAIROBI_COORDS.WESTLANDS.longitude,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        condition: 'good',
        urgencyLevel: 'urgent'
      },
      {
        id: 'lst_dellxps',
        title: 'Dell XPS 13 Laptop (Core i7, 16GB, 512GB SSD)',
        description: 'Elite developer thin laptop with 4K touch screen display, metallic silver chassis. Intel Core i7 11th Gen, excellent 7-hour battery backup. Standard keyboard backlight. Selling urgently to secure business stock space.',
        price: 85000,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'],
        vendorId: 'usr_buyer1',
        vendorName: 'Alex Gathu',
        vendorVerified: false,
        latitude: NAIROBI_COORDS.CBD.latitude,
        longitude: NAIROBI_COORDS.CBD.longitude,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        condition: 'like_new',
        urgencyLevel: 'urgent'
      },
      {
        id: 'lst_mountainbike',
        title: 'Mountain Bike - Shimano 21 Gear Sport',
        description: 'Dual suspension mountain bike. Shimano gear system, front and rear disc brakes. Lightweight aluminum alloy frame. Selling since I rarely ride due to work, open to reasonable cash or M-pesa trade offers.',
        price: 18000,
        category: 'Sports & Outdoors',
        images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80'],
        vendorId: 'usr_davidotieno',
        vendorName: 'David Otieno',
        vendorVerified: false,
        latitude: NAIROBI_COORDS.MADARAKA.latitude,
        longitude: NAIROBI_COORDS.MADARAKA.longitude,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        condition: 'good',
        urgencyLevel: 'medium'
      },
      {
        id: 'lst_microwave',
        title: 'Ramtons Digital Microwave oven 20L',
        description: 'Ramtons kitchen microwave with 6-stage manual digital preset control panels. Solves meal preps fast! Works 100% perfectly, inside is very neat and clean. Moving office, so clearing kitchen appliances quickly.',
        price: 6550,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1585659722982-796fc558af07?auto=format&fit=crop&w=600&q=80'],
        vendorId: 'usr_marywaweru',
        vendorName: 'Mary Waweru',
        vendorVerified: true,
        latitude: NAIROBI_COORDS.WESTLANDS.latitude,
        longitude: NAIROBI_COORDS.WESTLANDS.longitude,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        condition: 'good',
        urgencyLevel: 'high'
      },
      {
        id: 'lst_dress',
        title: 'Handmade Swahili Ankara Print Dinner Wear',
        description: 'Premium quality Ankara kitenge print formal gown dress. Fits Medium size perfectly (sizes 10-14). Breathable organic weave. Made to order for custom fashion boutique setup.',
        price: 3500,
        category: 'Clothing & Fashion',
        images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80'],
        vendorId: 'usr_aminamohan',
        vendorName: 'Amina Mohammed',
        vendorVerified: true,
        latitude: NAIROBI_COORDS.SOUTHC.latitude,
        longitude: NAIROBI_COORDS.SOUTHC.longitude,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        condition: 'new',
        urgencyLevel: 'low'
      },
      {
        id: 'lst_ps5',
        title: 'PlayStation 5 Console (Disc Edition + 2 Controllers)',
        description: 'Sony PS5 Disc Edition console in slate-white. Includes two dualsense wireless pads, power cable, and original box. Works perfectly, firmware updated. Need to solve an urgent medical bill by weekend hence quick clearance pricing.',
        price: 62000,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&q=80'],
        vendorId: 'usr_johndoe',
        vendorName: 'John Kamau',
        vendorVerified: true,
        latitude: NAIROBI_COORDS.KILIMANI.latitude,
        longitude: NAIROBI_COORDS.KILIMANI.longitude,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        condition: 'like_new',
        urgencyLevel: 'high'
      },
      {
        id: 'lst_hisense_tv',
        title: 'Hisense 43" Smart UHD 4K LED TV',
        description: 'UHD Smart TV with dynamic HDR contrast, voice controls and fast Wi-Fi connectivity. Netflix, YouTube, Prime play flawlessly. Pristine condition screen, original remote and table stands. Transitioning to a new apartment, must be sold this Saturday.',
        price: 28000,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&q=80'],
        vendorId: 'usr_davidotieno',
        vendorName: 'David Otieno',
        vendorVerified: true,
        latitude: NAIROBI_COORDS.MADARAKA.latitude,
        longitude: NAIROBI_COORDS.MADARAKA.longitude,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        condition: 'like_new',
        urgencyLevel: 'urgent'
      }
    ];

    const reviews: Review[] = [
      {
        id: 'rev_1',
        targetUserId: 'usr_johndoe',
        reviewerId: 'usr_marywaweru',
        reviewerName: 'Mary Waweru',
        rating: 5,
        text: 'Excellent seller! Very trustworthy. Legitimate iPhone products. The coordinate meet-up at Prestige Plaza was extremely safe.',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rev_2',
        targetUserId: 'usr_marywaweru',
        reviewerId: 'usr_johndoe',
        reviewerName: 'John Kamau',
        rating: 5,
        text: 'Excellent buyer and seller. Courteous, prompt M-Pesa payment, and very professional.',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const messages: Message[] = [
      {
        id: 'msg_1',
        senderId: 'usr_buyer1',
        receiverId: 'usr_johndoe',
        listingId: 'lst_iphone13',
        text: 'Hi John, is this iPhone 13 Pro still available? What is the lowest price you would take?',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_2',
        senderId: 'usr_johndoe',
        receiverId: 'usr_buyer1',
        listingId: 'lst_iphone13',
        text: 'Hi Alex, yes it is! The battery is at 88%. I can take 72,000 Ksh if we meet in Prestige plaza Kilimani today.',
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg_3',
        senderId: 'usr_buyer1',
        receiverId: 'usr_johndoe',
        listingId: 'lst_iphone13',
        text: 'That sounds perfect. I am in Westlands but can drive to Kilimani around 3 PM! Can I pay via M-Pesa on spot?',
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
      }
    ];

    return {
      users,
      listings,
      messages,
      reviews,
      orders: [],
      notifications: []
    };
  }

  // --- Users API ---
  public async getUsers(): Promise<User[]> {
    if (pool) {
      const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC;');
      return res.rows.map(mapUserToCamel);
    }
    return this.cache.users;
  }

  public async getUserById(id: string): Promise<User | undefined> {
    if (pool) {
      const res = await pool.query('SELECT * FROM users WHERE id = $1;', [id]);
      return res.rows[0] ? mapUserToCamel(res.rows[0]) : undefined;
    }
    return this.cache.users.find(u => u.id === id);
  }

  public async createUser(user: User): Promise<User> {
    if (pool) {
      await pool.query(`
        INSERT INTO users (id, name, username, phone, email, avatar_url, verified, doc_verified, verification_doc_type, rating, reviews_count, location_name, latitude, longitude, onboarded, created_at, password)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (id) DO NOTHING;
      `, [
        user.id, user.name, user.username || null, user.phone, user.email || null, user.avatarUrl || null,
        user.verified, user.docVerified, user.verificationDocType || null,
        user.rating, user.reviewsCount, user.locationName, user.latitude, user.longitude,
        user.onboarded ?? false, user.createdAt, user.password || null
      ]);
      return user;
    }
    const existing = await this.getUserById(user.id);
    if (existing) return existing;
    this.cache.users.push(user);
    this.save();
    return user;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User> {
    if (pool) {
      const keys = Object.keys(updates);
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      for (const key of keys) {
        const val = (updates as any)[key];
        if (val === undefined) continue;

        let columnName = key;
        if (key === 'avatarUrl') columnName = 'avatar_url';
        else if (key === 'docVerified') columnName = 'doc_verified';
        else if (key === 'verificationDocType') columnName = 'verification_doc_type';
        else if (key === 'reviewsCount') columnName = 'reviews_count';
        else if (key === 'locationName') columnName = 'location_name';
        else if (key === 'subscriptionPlan') columnName = 'subscription_plan';
        else if (key === 'subscriptionStatus') columnName = 'subscription_status';
        else if (key === 'subscriptionExpiresAt') columnName = 'subscription_expires_at';
        else if (key === 'storeName') columnName = 'store_name';
        else if (key === 'storeTagline') columnName = 'store_tagline';
        else if (key === 'storeBanner') columnName = 'store_banner';
        else if (key === 'premiumBoostQuota') columnName = 'premium_boost_quota';
        else if (key === 'isAdmin') columnName = 'is_admin';

        setClauses.push(`${columnName} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }

      if (setClauses.length > 0) {
        values.push(id);
        const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;
        const res = await pool.query(query, values);
        if (res.rows[0]) {
          return mapUserToCamel(res.rows[0]);
        }
      }
      const user = await this.getUserById(id);
      if (!user) throw new Error('User not found');
      return user;
    }

    const idx = this.cache.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    this.cache.users[idx] = { ...this.cache.users[idx], ...updates };
    this.save();
    return this.cache.users[idx];
  }

  // --- User Account Deletion (Kenya Data Protection Act, 2019) ---
  public async deleteUser(id: string): Promise<boolean> {
    if (pool) {
      // PostgreSQL: CASCADE on foreign keys handles related data automatically
      const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id;', [id]);
      return res.rowCount !== null && res.rowCount > 0;
    }

    // JSON fallback: manually remove user and all associated records
    const userIdx = this.cache.users.findIndex(u => u.id === id);
    if (userIdx === -1) return false;

    // Remove all related data
    this.cache.listings = this.cache.listings.filter(l => l.vendorId !== id);
    this.cache.messages = this.cache.messages.filter(m => m.senderId !== id || m.receiverId !== id);
    this.cache.reviews = this.cache.reviews.filter(r => r.targetUserId !== id || r.reviewerId === id);
    this.cache.orders = this.cache.orders.filter(o => o.buyerId !== id || o.sellerId === id);
    this.cache.notifications = this.cache.notifications.filter(n => n.userId !== id);

    // Remove the user record itself
    this.cache.users.splice(userIdx, 1);
    this.save();
    return true;
  }

  // --- Listings API ---
  public async getListings(filters: Partial<{ query: string; category: string; maxDistance: number; latitude: number; longitude: number; sortBy: string; includeUnapproved: boolean; includeSpam: boolean }>): Promise<Listing[]> {
    let list: Listing[] = [];

    if (pool) {
      let query = `SELECT * FROM listings WHERE status = 'active'`;
      const params: any[] = [];
      let pIdx = 1;

      if (!filters.includeUnapproved) {
        query += ` AND is_approved = TRUE`;
      }

      if (!filters.includeSpam) {
        query += ` AND is_spam = FALSE`;
      }

      if (filters.category && filters.category !== 'All') {
        query += ` AND LOWER(category) = LOWER($${pIdx})`;
        params.push(filters.category);
        pIdx++;
      }

      if (filters.query) {
        query += ` AND (LOWER(title) LIKE $${pIdx} OR LOWER(description) LIKE $${pIdx})`;
        params.push(`%${filters.query.toLowerCase()}%`);
        pIdx++;
      }

      const res = await pool.query(query, params);
      list = res.rows.map(mapListingToCamel);
    } else {
      list = this.cache.listings.filter(l => l.status === 'active');

      if (!filters.includeUnapproved) {
        list = list.filter(l => l.isApproved !== false);
      }

      if (!filters.includeSpam) {
        list = list.filter(l => !l.isSpam);
      }

      if (filters.category && filters.category !== 'All') {
        list = list.filter(l => l.category.toLowerCase() === filters.category!.toLowerCase());
      }

      if (filters.query) {
        const q = filters.query.toLowerCase();
        list = list.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
      }
    }

    // Geolocation filtering (same for memory and postgres results to keep exact coordinate logic safety!)
    if (filters.latitude !== undefined && filters.longitude !== undefined) {
      const uLat = filters.latitude;
      const uLon = filters.longitude;
      const radius = filters.maxDistance ?? 5;

      list = list.filter(l => {
        const d = getDistance(uLat, uLon, l.latitude, l.longitude);
        return d <= radius;
      });

      if (filters.sortBy === 'distance') {
        list.sort((a, b) => {
          const d1 = getDistance(uLat, uLon, a.latitude, a.longitude);
          const d2 = getDistance(uLat, uLon, b.latitude, b.longitude);
          return d1 - d2;
        });
      }
    }

    if (filters.sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'date' || !filters.sortBy) {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }

  public async getListingById(id: string): Promise<Listing | undefined> {
    if (pool) {
      const res = await pool.query('SELECT * FROM listings WHERE id = $1;', [id]);
      return res.rows[0] ? mapListingToCamel(res.rows[0]) : undefined;
    }
    return this.cache.listings.find(l => l.id === id);
  }

  public async createListing(listing: Listing): Promise<Listing> {
    if (pool) {
      await pool.query(`
        INSERT INTO listings (id, title, description, price, category, images, vendor_id, vendor_name, vendor_verified, latitude, longitude, status, condition, created_at, urgency_level, is_approved, is_spam, is_featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18);
      `, [
        listing.id, listing.title, listing.description, listing.price, listing.category,
        JSON.stringify(listing.images), listing.vendorId, listing.vendorName, listing.vendorVerified,
        listing.latitude, listing.longitude, listing.status, listing.condition, listing.createdAt,
        listing.urgencyLevel || 'low',
        listing.isApproved !== false,
        !!listing.isSpam,
        !!listing.isFeatured
      ]);
      return listing;
    }
    this.cache.listings.push(listing);
    this.save();
    return listing;
  }

  public async updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    if (pool) {
      const keys = Object.keys(updates);
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      for (const key of keys) {
        const val = (updates as any)[key];
        if (val === undefined) continue;

        let columnName = key;
        let finalVal = val;
        if (key === 'vendorId') columnName = 'vendor_id';
        else if (key === 'vendorName') columnName = 'vendor_name';
        else if (key === 'vendorVerified') columnName = 'vendor_verified';
        else if (key === 'isBoosted') columnName = 'is_boosted';
        else if (key === 'boostExpiresAt') columnName = 'boost_expires_at';
        else if (key === 'urgencyLevel') columnName = 'urgency_level';
        else if (key === 'isApproved') columnName = 'is_approved';
        else if (key === 'isSpam') columnName = 'is_spam';
        else if (key === 'isFeatured') columnName = 'is_featured';
        else if (key === 'images') {
          finalVal = JSON.stringify(val);
        }

        setClauses.push(`${columnName} = $${paramIndex}`);
        values.push(finalVal);
        paramIndex++;
      }

      if (setClauses.length > 0) {
        values.push(id);
        const query = `UPDATE listings SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;
        const res = await pool.query(query, values);
        if (res.rows[0]) {
          return mapListingToCamel(res.rows[0]);
        }
      }
      const listing = await this.getListingById(id);
      if (!listing) throw new Error('Listing not found');
      return listing;
    }

    const idx = this.cache.listings.findIndex(l => l.id === id);
    if (idx === -1) throw new Error('Listing not found');
    this.cache.listings[idx] = { ...this.cache.listings[idx], ...updates };
    this.save();
    return this.cache.listings[idx];
  }

  // --- Messages & Conversations API ---
  public async getMessagesBetween(u1: string, u2: string, listingId: string): Promise<Message[]> {
    if (pool) {
      const res = await pool.query(`
        SELECT * FROM messages 
        WHERE listing_id = $1 AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2))
        ORDER BY created_at ASC;
      `, [listingId, u1, u2]);
      return res.rows.map(mapMessageToCamel);
    }

    return this.cache.messages
      .filter(m => 
        m.listingId === listingId && 
        ((m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1))
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public async createMessage(msg: Message): Promise<Message> {
    if (pool) {
      await pool.query(`
        INSERT INTO messages (id, sender_id, receiver_id, listing_id, text, created_at)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [msg.id, msg.senderId, msg.receiverId, msg.listingId, msg.text, msg.createdAt]);
      return msg;
    }
    this.cache.messages.push(msg);
    this.save();
    return msg;
  }

  public async getConversationsForUser(userId: string): Promise<any[]> {
    let listingsList: Listing[] = [];
    let usersList: User[] = [];
    let messagesList: Message[] = [];

    if (pool) {
      const lRes = await pool.query('SELECT * FROM listings;');
      listingsList = lRes.rows.map(mapListingToCamel);

      const uRes = await pool.query('SELECT * FROM users;');
      usersList = uRes.rows.map(mapUserToCamel);

      const mRes = await pool.query(`
        SELECT * FROM messages 
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY created_at ASC;
      `, [userId]);
      messagesList = mRes.rows.map(mapMessageToCamel);
    } else {
      listingsList = this.cache.listings;
      usersList = this.cache.users;
      messagesList = [...this.cache.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    const map = new Map<string, { lastMsg: Message }>();
    messagesList.forEach(m => {
      const listing = listingsList.find(l => l.id === m.listingId);
      if (!listing) return;

      const buyerId = (listing.vendorId === m.senderId) ? m.receiverId : m.senderId;
      const sellerId = listing.vendorId;
      const threadId = `${sellerId}_${buyerId}_${m.listingId}`;

      map.set(threadId, { lastMsg: m });
    });

    const conversations: any[] = [];
    map.forEach((value, threadId) => {
      const [sellerId, buyerId, listingId] = threadId.split('_');
      const listing = listingsList.find(l => l.id === listingId);
      if (!listing) return;

      const otherUserId = sellerId === userId ? buyerId : sellerId;
      const otherUserObj = usersList.find(u => u.id === otherUserId);
      if (!otherUserObj) return;

      conversations.push({
        id: threadId,
        sellerId,
        buyerId,
        listingId,
        listingTitle: listing.title,
        listingPrice: listing.price,
        listingImage: listing.images[0] || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=150&q=80',
        otherUser: {
          id: otherUserObj.id,
          name: otherUserObj.name,
          avatarUrl: otherUserObj.avatarUrl,
          verified: otherUserObj.verified
        },
        lastMessage: value.lastMsg,
        unreadCount: 0
      });
    });

    return conversations.sort((a, b) => {
      const t1 = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const t2 = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return t2 - t1;
    });
  }

  // --- Reviews/Ratings API ---
  public async getReviewsForUser(userId: string): Promise<Review[]> {
    if (pool) {
      const res = await pool.query('SELECT * FROM reviews WHERE target_user_id = $1 ORDER BY created_at DESC;', [userId]);
      return res.rows.map(mapReviewToCamel);
    }
    return this.cache.reviews
      .filter(r => r.targetUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createReview(review: Review): Promise<Review> {
    if (pool) {
      await pool.query(`
        INSERT INTO reviews (id, target_user_id, reviewer_id, reviewer_name, rating, text, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `, [review.id, review.targetUserId, review.reviewerId, review.reviewerName, review.rating, review.text, review.createdAt]);

      const reviews = await this.getReviewsForUser(review.targetUserId);
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = parseFloat((sum / reviews.length).toFixed(1));

      await this.updateUser(review.targetUserId, {
        rating: avg,
        reviewsCount: reviews.length
      });

      return review;
    }

    this.cache.reviews.push(review);
    const reviews = await this.getReviewsForUser(review.targetUserId);
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / reviews.length).toFixed(1));

    await this.updateUser(review.targetUserId, {
      rating: avg,
      reviewsCount: reviews.length
    });

    this.save();
    return review;
  }

  // --- Orders API ---
  public async getOrdersForUser(userId: string): Promise<Order[]> {
    if (pool) {
      const res = await pool.query('SELECT * FROM orders WHERE buyer_id = $1 OR seller_id = $1 ORDER BY created_at DESC;', [userId]);
      return res.rows.map(mapOrderToCamel);
    }
    return this.cache.orders
      .filter(o => o.buyerId === userId || o.sellerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getOrderById(id: string): Promise<Order | undefined> {
    if (pool) {
      const res = await pool.query('SELECT * FROM orders WHERE id = $1;', [id]);
      return res.rows[0] ? mapOrderToCamel(res.rows[0]) : undefined;
    }
    return this.cache.orders.find(o => o.id === id);
  }

  public async getOrderByMpesaCheckoutRequestId(checkoutRequestId: string): Promise<Order | undefined> {
    if (pool) {
      const res = await pool.query('SELECT * FROM orders WHERE mpesa_checkout_request_id = $1;', [checkoutRequestId]);
      return res.rows[0] ? mapOrderToCamel(res.rows[0]) : undefined;
    }
    return this.cache.orders.find(o => o.mpesaCheckoutRequestId === checkoutRequestId);
  }

  public async createOrder(order: Order): Promise<Order> {
    if (pool) {
      await pool.query(`
        INSERT INTO orders (id, buyer_id, buyer_name, seller_id, seller_name, listing_id, listing_title, listing_image, price, status, payment_method, mpesa_phone, mpesa_checkout_request_id, mpesa_receipt_number, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
      `, [
        order.id, order.buyerId, order.buyerName, order.sellerId, order.sellerName,
        order.listingId, order.listingTitle, order.listingImage, order.price, order.status,
        order.paymentMethod, order.mpesaPhone || null, order.mpesaCheckoutRequestId || null,
        order.mpesaReceiptNumber || null, order.createdAt, order.updatedAt
      ]);
      return order;
    }
    this.cache.orders.push(order);
    this.save();
    return order;
  }

  public async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    if (pool) {
      const keys = Object.keys(updates);
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      for (const key of keys) {
        const val = (updates as any)[key];
        if (val === undefined) continue;

        let columnName = key;
        if (key === 'buyerId') columnName = 'buyer_id';
        else if (key === 'buyerName') columnName = 'buyer_name';
        else if (key === 'sellerId') columnName = 'seller_id';
        else if (key === 'sellerName') columnName = 'seller_name';
        else if (key === 'listingId') columnName = 'listing_id';
        else if (key === 'listingTitle') columnName = 'listing_title';
        else if (key === 'listingImage') columnName = 'listing_image';
        else if (key === 'paymentMethod') columnName = 'payment_method';
        else if (key === 'mpesaPhone') columnName = 'mpesa_phone';
        else if (key === 'mpesaCheckoutRequestId') columnName = 'mpesa_checkout_request_id';
        else if (key === 'mpesaReceiptNumber') columnName = 'mpesa_receipt_number';
        else if (key === 'createdAt') columnName = 'created_at';
        else if (key === 'updatedAt') columnName = 'updated_at';

        setClauses.push(`${columnName} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }

      if (setClauses.length > 0) {
        values.push(id);
        const query = `UPDATE orders SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *;`;
        const res = await pool.query(query, values);
        if (res.rows[0]) {
          return mapOrderToCamel(res.rows[0]);
        }
      }
      const order = await this.getOrderById(id);
      if (!order) throw new Error('Order not found');
      return order;
    }

    const idx = this.cache.orders.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Order not found');
    this.cache.orders[idx] = { ...this.cache.orders[idx], ...updates };
    this.save();
    return this.cache.orders[idx];
  }

  // --- Notifications API ---
  public async getNotificationsForUser(userId: string): Promise<Notification[]> {
    if (pool) {
      const res = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC;', [userId]);
      return res.rows.map(mapNotificationToCamel);
    }
    return this.cache.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createNotification(n: Notification): Promise<Notification> {
    if (pool) {
      await pool.query(`
        INSERT INTO notifications (id, user_id, title, message, type, read, link, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [n.id, n.userId, n.title, n.message, n.type, n.read, n.link || null, n.createdAt]);
      return n;
    }
    this.cache.notifications.push(n);
    this.save();
    return n;
  }

  public async markNotificationRead(id: string): Promise<void> {
    if (pool) {
      await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1;', [id]);
      return;
    }
    const idx = this.cache.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.cache.notifications[idx].read = true;
      this.save();
    }
  }

  public async markAllNotificationsRead(userId: string): Promise<void> {
    if (pool) {
      await pool.query('UPDATE notifications SET read = TRUE WHERE user_id = $1;', [userId]);
      return;
    }
    this.cache.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }
}

export const db = new Database();
