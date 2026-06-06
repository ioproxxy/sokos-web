/**
 * ⚠️ DEPRECATED: This Express server is no longer used
 * 
 * This file is kept for reference only and should NOT be used in production.
 * 
 * The application has been refactored to use serverless API routes in the `/api` directory.
 * 
 * Old approach (deprecated):
 * - Run `npm run server` to start Express server
 * - Server runs on localhost:3000
 * - Requires manual server management
 * 
 * New approach (use instead):
 * - Run `vercel dev` for local development
 * - API routes in `/api` directory
 * - Works on any machine without manual server
 * - Production-ready for Vercel deployment
 * 
 * See SERVERLESS_ARCHITECTURE.md for migration guide.
 * See MIGRATION_GUIDE.md for route mapping.
 */

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import multer from 'multer';
import dotenv from 'dotenv';
import { isValidKenyanPhone, sanitizeFilename } from '../utils/validation';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

// Warn (do not exit) if critical env vars are missing
const requiredEnvVars = ['DATABASE_URL', 'BLOB_READ_WRITE_TOKEN'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingEnvVars.join(', '));
    console.warn('Some features may not work until these are set (see .env.example).');
}

const app = express();
const prisma = new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'minimal',
});
const PORT = process.env.PORT || 3000;
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(null, false);
        }
        cb(null, true);
    }
});

// Configure CORS to allow requests from production domain
const corsOptions = {
    origin: [
        'http://localhost:5173',  // Local development (Vite default)
        'http://localhost:3000',  // Local development (alternative)
        'https://www.sokos.co.ke', // Production domain
        'https://sokos.co.ke',    // Production domain (without www)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Test database connection on startup (non-fatal)
prisma.$connect()
    .then(() => {
        console.log('✓ Database connected successfully');
    })
    .catch((error) => {
        console.error('✗ Database connection failed:', error.message);
        console.error('⚠️  The server will start but sign-up/login will not work until database is accessible');
        console.error('📖 See DATABASE_SETUP.md for setup instructions');
        console.error('');
    });

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    } catch {
        res.status(503).json({ status: 'error', database: 'disconnected' });
    }
});

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, phone, role } = req.body;

        // Validate input
        if (!name || !phone || !role) {
            return res.status(400).json({ error: 'Name, phone, and role are required' });
        }

        // Validate phone format (basic validation)
        if (!isValidKenyanPhone(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format. Use Kenyan format (e.g., 0712345678)' });
        }

        // Validate role
        if (!['VENDOR', 'CUSTOMER'].includes(role)) {
            return res.status(400).json({ error: 'Role must be either VENDOR or CUSTOMER' });
        }
        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { phone } });
        if (existing) {
            return res.json(existing);
        }

        // Create new user
        const user = await prisma.user.create({
            data: {
                name,
                phone,
                role,
                isVerified: role === 'VENDOR' ? Math.random() > 0.5 : false // Randomly verify for demo
            }
        });

        res.json(user);
    } catch (error: any) {
        console.error('Registration error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please check your DATABASE_URL configuration.'
            });
        }
        
        // Check for unique constraint violations
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'User with this phone number already exists' });
        }
        
        res.status(500).json({ 
            error: 'Failed to register user',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// Login (Simulated by Phone)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { phone } = req.body;

        // Validate input
        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        // Validate phone format
        if (!isValidKenyanPhone(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
        const user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
            return res.status(401).json({ error: 'User not found. Please sign up first.' });
        }

        res.json(user);
    } catch (error: any) {
        console.error('Login error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Login failed',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// --- Upload Route ---

// Upload Image to Vercel Blob
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid file type. Only images are allowed.' });
        }

        // Additional validation for image type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'Only image files are allowed' });
        }

        // Validate file size (already done by multer but double-check)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size exceeds 5MB limit' });
        }

        // Generate unique filename using shared utility
        const timestamp = Date.now();
        const filename = `products/${timestamp}-${sanitizeFilename(req.file.originalname)}`;

        console.log(`Uploading file to Vercel Blob: ${filename}`);

        const blob = await put(filename, req.file.buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        console.log(`File uploaded successfully: ${blob.url}`);
        res.json({ url: blob.url });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: 'Failed to upload image',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// --- Product Routes ---

// Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { vendor: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error: any) {
        console.error('Get products error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch products',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// Create Product
app.post('/api/products', async (req, res) => {
    try {
        const {
            name, description, price, imageUrl, images,
            latitude, longitude, category, vendorId, vendorName, vendorPhone
        } = req.body;

        // Validate required fields
        if (!name || !price || !latitude || !longitude || !category || !vendorId) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, price, latitude, longitude, category, vendorId' 
            });
        }

        // Validate price
        const parsedPrice = Number(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ error: 'Price must be a positive number' });
        }

        // Validate coordinates
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }

        // Verify vendor exists
        const vendor = await prisma.user.findUnique({ 
            where: { id: vendorId },
            select: { id: true, name: true, phone: true, role: true }
        });

        if (!vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        if (vendor.role !== 'VENDOR') {
            return res.status(403).json({ error: 'User is not a vendor' });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description: description || null,
                price: parsedPrice,
                imageUrl: imageUrl || null,
                images: Array.isArray(images) ? images : [],
                latitude: lat,
                longitude: lng,
                category,
                vendorId,
                vendorName: vendorName || vendor.name,
                vendorPhone: vendorPhone || vendor.phone
            },
            include: {
                vendor: true
            }
        });
        res.json(product);
    } catch (error: any) {
        console.error('Create product error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to create product',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// --- User/Vendor Routes ---

// Get User Profile
app.get('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                products: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        console.error('Get user profile error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch user profile',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// Update User Profile
app.patch('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, bio, businessHours } = req.body;

        // Validate at least one field is provided
        if (!name && !bio && !businessHours) {
            return res.status(400).json({ error: 'At least one field must be provided for update' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Build update data object with only provided fields
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (businessHours !== undefined) updateData.businessHours = businessHours;

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        res.json(user);
    } catch (error: any) {
        console.error('Update profile error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to update profile',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// Get Vendor Products
app.get('/api/user/:id/products', async (req, res) => {
    try {
        const { id } = req.params;
        const products = await prisma.product.findMany({
            where: { vendorId: id },
            include: { vendor: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    } catch (error: any) {
        console.error('Get vendor products error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch vendor products',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// --- Message Routes ---

// Send Message
app.post('/api/messages', async (req, res) => {
    try {
        const { productId, senderId, senderName, senderRole, content } = req.body;

        const message = await prisma.message.create({
            data: {
                productId,
                senderId,
                senderName,
                senderRole,
                content
            }
        });
        res.json(message);
    } catch (error: any) {
        console.error('Send message error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to send message',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// Get Messages for Product
app.get('/api/messages/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const messages = await prisma.message.findMany({
            where: { productId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error: any) {
        console.error('Get messages error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch messages',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// --- Rating Routes ---

// Submit Rating
app.post('/api/ratings', async (req, res) => {
    try {
        const { productId, userId, userName, rating, comment } = req.body;

        const newRating = await prisma.rating.create({
            data: {
                productId,
                userId,
                userName,
                rating: Number(rating),
                comment
            }
        });
        res.json(newRating);
    } catch (error: any) {
        console.error('Submit rating error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to submit rating',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// Get Ratings for Product
app.get('/api/ratings/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const ratings = await prisma.rating.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(ratings);
    } catch (error: any) {
        console.error('Get ratings error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to fetch ratings',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// Get Average Rating for Product
app.get('/api/products/:id/average-rating', async (req, res) => {
    try {
        const { id } = req.params;
        const ratings = await prisma.rating.findMany({
            where: { productId: id }
        });

        if (ratings.length === 0) {
            return res.json({ average: 0, count: 0 });
        }

        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / ratings.length;

        res.json({ average: Number(average.toFixed(1)), count: ratings.length });
    } catch (error: any) {
        console.error('Calculate average rating error:', error);
        
        // Check for database connection errors
        if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
            return res.status(503).json({ 
                error: 'Database connection failed',
                message: 'Unable to connect to the database. Please try again later.'
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to calculate average rating',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// --- Payment Routes (M-Pesa Mock) ---

// Initiate STK Push
app.post('/api/payments/stk-push', async (req, res) => {
    try {
        const { phone, amount, orderId } = req.body;

        console.log(`[M-PESA] Initiating STK Push for ${phone}, Amount: ${amount}`);

        // Simulating Safariom Response
        setTimeout(async () => {
            console.log(`[M-PESA] Simulating Callback for Order: ${orderId}`);
            // In a real app, this would be a webhook from Safaricom
        }, 5000);

        res.json({
            MerchantRequestID: "mock-" + Date.now(),
            CheckoutRequestID: "check-" + Date.now(),
            ResponseDescription: "Success. Request accepted for processing",
            ResponseCode: "0",
            CustomerMessage: "Success. Request accepted for processing"
        });
    } catch (error) {
        res.status(500).json({ error: 'M-Pesa initiation failed' });
    }
});

// Callback (In production, Safaricom calls this)
app.post('/api/payments/callback', async (req, res) => {
    // Just logging for mock
    console.log('[M-PESA] Callback received:', req.body);
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Database connected`);
    console.log(`✅ Vercel Blob storage configured`);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
    await prisma.$disconnect();
    process.exit(0);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
