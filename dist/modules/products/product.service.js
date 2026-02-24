"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsByCategory = exports.getFeaturedProducts = exports.softDeleteProduct = exports.updateProduct = exports.getProductByIdentifier = exports.getAllProducts = exports.createProduct = void 0;
// product.service.ts
const product_model_1 = __importDefault(require("./product.model"));
const mongoose_1 = __importDefault(require("mongoose"));
// Pure helper - slug generator (used as fallback)
const generateSlug = (name) => name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
// CREATE - full business validation
const createProduct = async (data) => {
    // Business rules for clothing store
    if (data.price <= 0)
        throw new Error('Price must be greater than 0');
    if (data.stock < 0)
        throw new Error('Stock cannot be negative');
    if (data.discountPrice !== undefined && data.discountPrice >= data.price) {
        throw new Error('Discount price must be lower than regular price');
    }
    if (data.sizes.length === 0)
        throw new Error('At least one size is required');
    if (data.colors.length === 0)
        throw new Error('At least one color is required');
    if (data.images.length === 0)
        throw new Error('At least one image URL is required');
    const productPayload = {
        ...data,
        slug: generateSlug(data.name),
        sold: 0,
        rating: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: data.isFeatured ?? false,
        tags: data.tags ?? [],
    };
    const product = new product_model_1.default(productPayload);
    return await product.save();
};
exports.createProduct = createProduct;
// READ ALL - full filtering, pagination, sorting (A-Z business logic)
const getAllProducts = async (query = {}) => {
    const { category, gender, minPrice, maxPrice, size, color, search, page = '1', limit = '12', sortBy = 'createdAt', sortOrder = 'desc', } = query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit))); // cap at 100
    const skip = (pageNum - 1) * limitNum;
    const filter = { isActive: true };
    if (category)
        filter.category = category;
    if (gender)
        filter.gender = gender;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice)
            filter.price.$gte = Number(minPrice);
        if (maxPrice)
            filter.price.$lte = Number(maxPrice);
    }
    if (size)
        filter.sizes = { $in: [size] };
    if (color)
        filter.colors = { $in: [color] };
    if (search) {
        filter.$text = { $search: search }; // uses text index
    }
    // Sorting logic
    let sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'popularity' || sortBy === 'sold') {
        sort = { sold: -1 };
    }
    else if (sortBy === 'rating') {
        sort = { rating: -1 };
    }
    else if (sortBy === 'price') {
        sort = { price: order };
    }
    else {
        sort = { [sortBy]: order };
    }
    const [products, total] = await Promise.all([
        product_model_1.default.find(filter).sort(sort).skip(skip).limit(limitNum),
        product_model_1.default.countDocuments(filter),
    ]);
    return {
        products,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };
};
exports.getAllProducts = getAllProducts;
// READ ONE - support both Mongo _id and slug (common UX)
const getProductByIdentifier = async (identifier) => {
    let product = null;
    // Try as ObjectId first
    if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
        product = await product_model_1.default.findById(identifier);
    }
    // Fallback to slug
    if (!product) {
        product = await product_model_1.default.findOne({ slug: identifier });
    }
    if (product && !product.isActive)
        return null;
    return product;
};
exports.getProductByIdentifier = getProductByIdentifier;
// UPDATE - full business validation + slug regeneration
const updateProduct = async (id, data) => {
    if (data.price !== undefined && data.price <= 0)
        throw new Error('Price must be greater than 0');
    if (data.stock !== undefined && data.stock < 0)
        throw new Error('Stock cannot be negative');
    if (data.discountPrice !== undefined && data.price !== undefined && data.discountPrice >= data.price) {
        throw new Error('Discount price must be lower than regular price');
    }
    if (data.sizes && data.sizes.length === 0)
        throw new Error('At least one size is required');
    if (data.colors && data.colors.length === 0)
        throw new Error('At least one color is required');
    if (data.images && data.images.length === 0)
        throw new Error('At least one image URL is required');
    const updatePayload = { ...data };
    // Regenerate slug when name changes
    if (data.name) {
        updatePayload.slug = generateSlug(data.name);
    }
    const updated = await product_model_1.default.findByIdAndUpdate(id, { $set: updatePayload }, { new: true, runValidators: true });
    return updated;
};
exports.updateProduct = updateProduct;
// DELETE - SOFT DELETE (best practice for e-commerce)
const softDeleteProduct = async (id) => {
    const result = await product_model_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
    return !!result;
};
exports.softDeleteProduct = softDeleteProduct;
// Extra business helpers (very useful for clothing store frontend)
const getFeaturedProducts = async (limit = 8) => {
    return await product_model_1.default.find({ isActive: true, isFeatured: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};
exports.getFeaturedProducts = getFeaturedProducts;
const getProductsByCategory = async (category, limit = 12) => {
    return await product_model_1.default.find({ category, isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
};
exports.getProductsByCategory = getProductsByCategory;
