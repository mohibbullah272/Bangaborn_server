"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoute = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_model_1 = __importDefault(require("./admin.model"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'bangaborn-admin-secret-change-in-prod';
const JWT_EXPIRES = '7d';
// POST /api/admin/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const admin = await admin_model_1.default.findOne({ email: email.toLowerCase().trim() });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin._id, email: admin.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES,
        });
        res.status(200).json({
            success: true,
            token,
            admin: { _id: admin._id, email: admin.email },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        res.status(500).json({ success: false, message });
    }
});
// POST /api/admin/seed  ← run once to create your admin account
router.post('/seed', async (req, res) => {
    try {
        const existing = await admin_model_1.default.findOne({});
        if (existing) {
            return res.status(409).json({ success: false, message: 'Admin already exists' });
        }
        const { email, password } = req.body;
        const admin = await admin_model_1.default.create({ email, password });
        res.status(201).json({ success: true, message: 'Admin created', email: admin.email });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Seed failed';
        res.status(400).json({ success: false, message });
    }
});
// GET /api/admin/verify  ← verify JWT token
router.get('/verify', async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        const token = auth.slice(7);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        res.status(200).json({ success: true, admin: { email: decoded.email } });
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
});
// PATCH /api/orders/:id/status  ← update order status
router.patch('/orders/:id/status', async (req, res) => {
    // Import dynamically to avoid circular deps
    const OrderModel = (await Promise.resolve().then(() => __importStar(require('../orders/order.model')))).default;
    try {
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const token = auth.slice(7);
        jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const { status } = req.body;
        const order = await OrderModel.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, order });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed';
        res.status(400).json({ success: false, message });
    }
});
exports.adminRoute = router;
