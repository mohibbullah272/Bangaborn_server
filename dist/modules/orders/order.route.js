"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
// order.route.ts
const express_1 = require("express");
const order_service_1 = require("./order.service");
const router = (0, express_1.Router)();
// POST /api/orders
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield (0, order_service_1.createOrder)(req.body);
        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}));
// GET /api/orders
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, order_service_1.getAllOrders)(req.query);
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));
// GET /api/orders/:id
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield (0, order_service_1.getOrderById)(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));
// DELETE /api/orders/:id  →  Cancels order + restores stock (industry standard)
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield (0, order_service_1.cancelOrder)(req.params.id);
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
}));
exports.orderRouter = router;
