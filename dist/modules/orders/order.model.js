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
Object.defineProperty(exports, "__esModule", { value: true });
// order.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const orderItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    size: String,
    color: String,
    quantity: { type: Number, required: true, min: 1 },
    image: String,
});
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: true,
    },
    shippingInfo: {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        isInsideDhaka: { type: Boolean, required: true },
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: [(v) => v.length > 0, 'Order must contain at least one item'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
// Indexes for fast queries (very common in BD e-commerce)
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, isActive: 1 });
orderSchema.index({ createdAt: -1 });
const Order = mongoose_1.default.model('Order', orderSchema);
exports.default = Order;
