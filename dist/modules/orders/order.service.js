"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.getOrderById = exports.getAllOrders = exports.createOrder = void 0;
// order.service.ts
const mongoose_1 = __importDefault(require("mongoose"));
const order_model_1 = __importDefault(require("./order.model"));
const product_model_1 = __importDefault(require("../products/product.model"));
const generateOrderNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000);
    return `ORD-${date}-${random}`;
};
const createOrder = async (data) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        if (data.items.length === 0)
            throw new Error('Order must have at least one item');
        const orderItems = [];
        let subtotal = 0;
        for (const item of data.items) {
            const product = await product_model_1.default.findById(item.productId).session(session);
            if (!product || !product.isActive) {
                throw new Error(`Product not found or inactive: ${item.productId}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }
            if (item.size && !product.sizes.includes(item.size)) {
                throw new Error(`Size ${item.size} not available for ${product.name}`);
            }
            if (item.color && !product.colors.includes(item.color)) {
                throw new Error(`Color ${item.color} not available for ${product.name}`);
            }
            const finalPrice = product.discountPrice && product.discountPrice < product.price
                ? product.discountPrice
                : product.price;
            orderItems.push({
                productId: product._id,
                name: product.name,
                slug: product.slug,
                price: finalPrice,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                image: product.images[0],
            });
            subtotal += finalPrice * item.quantity;
            // Reserve stock (atomic)
            await product_model_1.default.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity } }, { $inc: { sold: item.quantity } });
        }
        const deliveryCharge = data.shippingInfo.isInsideDhaka ? 70 : 120;
        const total = subtotal + deliveryCharge;
        const newOrder = new order_model_1.default({
            orderNumber: generateOrderNumber(),
            shippingInfo: data.shippingInfo,
            items: orderItems,
            subtotal,
            deliveryCharge,
            total,
            status: 'Pending',
            isActive: true,
        });
        await newOrder.save({ session });
        await session.commitTransaction();
        return newOrder;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.createOrder = createOrder;
const getAllOrders = async (query = {}) => {
    const { page = '1', limit = '20', status } = query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const filter = { isActive: true };
    if (status)
        filter.status = status;
    const [orders, total] = await Promise.all([
        order_model_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum),
        order_model_1.default.countDocuments(filter),
    ]);
    return {
        orders,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (id) => {
    return await order_model_1.default.findById(id);
};
exports.getOrderById = getOrderById;
const cancelOrder = async (id) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const order = await order_model_1.default.findById(id).session(session);
        if (!order)
            throw new Error('Order not found');
        if (order.status !== 'Pending')
            throw new Error('Only Pending orders can be cancelled');
        if (!order.isActive)
            throw new Error('Order already cancelled');
        // Restore stock
        for (const item of order.items) {
            await product_model_1.default.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } }, { session });
        }
        order.status = 'Cancelled';
        order.isActive = false;
        await order.save({ session });
        await session.commitTransaction();
        return order;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
};
exports.cancelOrder = cancelOrder;
