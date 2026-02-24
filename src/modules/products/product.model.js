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
// product.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Name cannot be longer than 200 characters'],
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
        type: Number,
        min: [0, 'Discount price cannot be negative'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        // Common BD clothing categories: Panjabi, Three Piece, Shirt, Pant, Lungi, Saree, Kurti, etc.
    },
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Kids', 'Unisex'],
        required: [true, 'Gender is required'],
    },
    material: {
        type: String,
        trim: true,
    },
    sizes: {
        type: [String],
        required: [true, 'At least one size is required'],
        validate: {
            validator: (v) => v.length > 0,
            message: 'At least one size is required',
        },
    },
    colors: {
        type: [String],
        required: [true, 'At least one color is required'],
        validate: {
            validator: (v) => v.length > 0,
            message: 'At least one color is required',
        },
    },
    images: {
        type: [String],
        required: [true, 'At least one image URL is required'],
        validate: {
            validator: (v) => v.length > 0,
            message: 'At least one image URL is required',
        },
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
    },
    sold: {
        type: Number,
        default: 0,
        min: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    numReviews: {
        type: Number,
        default: 0,
        min: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    tags: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});
// Auto-generate slug before save if not provided
productSchema.pre('save', function () {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }
});
// Indexes for performance (common queries in BD clothing store)
productSchema.index({ category: 1, gender: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ 'sizes': 1 });
productSchema.index({ 'colors': 1 });
productSchema.index({ name: 'text', description: 'text', category: 'text' });
const Product = mongoose_1.default.model('Product', productSchema);
exports.default = Product;
