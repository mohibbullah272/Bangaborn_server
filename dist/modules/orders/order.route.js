"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
// order.route.ts
const express_1 = require("express");
const order_service_1 = require("./order.service");
const router = (0, express_1.Router)();
// POST /api/orders
router.post('/', async (req, res) => {
    try {
        const order = await (0, order_service_1.createOrder)(req.body);
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});
// GET /api/orders
router.get('/', async (req, res) => {
    try {
        const result = await (0, order_service_1.getAllOrders)(req.query);
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const order = await (0, order_service_1.getOrderById)(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// DELETE /api/orders/:id  →  Cancels order + restores stock (industry standard)
router.delete('/:id', async (req, res) => {
    try {
        const order = await (0, order_service_1.cancelOrder)(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully. Stock restored.',
            order,
        });
    }
    catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
});
exports.orderRouter = router;
