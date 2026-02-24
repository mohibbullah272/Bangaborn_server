"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoute = void 0;
// product.route.ts
const express_1 = require("express");
const product_service_1 = require("./product.service");
const router = (0, express_1.Router)();
// GET /api/products - full filtered, paginated, sorted list
router.get('/', async (req, res) => {
    try {
        const result = await (0, product_service_1.getAllProducts)(req.query);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/products/featured
router.get('/featured', async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 8;
        const products = await (0, product_service_1.getFeaturedProducts)(limit);
        res.status(200).json({ success: true, count: products.length, products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/products/category/:category
router.get('/category/:category', async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 12;
        const products = await (0, product_service_1.getProductsByCategory)(req.params.category, limit);
        res.status(200).json({ success: true, count: products.length, products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/products/:id - supports both Mongo _id and slug
router.get('/:id', async (req, res) => {
    try {
        const product = await (0, product_service_1.getProductByIdentifier)(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, product });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// POST /api/products - create with full validation
router.post('/', async (req, res) => {
    try {
        const product = await (0, product_service_1.createProduct)(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product,
        });
    }
    catch (error) {
        const status = error.message.includes('already exists') ? 409 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
});
// PUT /api/products/:id - update with full validation
router.put('/:id', async (req, res) => {
    try {
        const product = await (0, product_service_1.updateProduct)(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product,
        });
    }
    catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
});
// DELETE /api/products/:id - soft delete
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await (0, product_service_1.softDeleteProduct)(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Product soft-deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.productRoute = router;
