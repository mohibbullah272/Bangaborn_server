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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_1 = __importDefault(require("./middlewares/error"));
const product_route_1 = require("./modules/products/product.route");
const order_route_1 = require("./modules/orders/order.route");
const admin_route_1 = require("./modules/admin/admin.route");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/products", product_route_1.productRoute);
app.use("/api/orders", order_route_1.orderRouter);
app.use("/api/admin", admin_route_1.adminRoute);
app.get("/healthz", (req, res) => {
    res.send("ok");
});
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`this is bangaborn server `);
}));
app.use(error_1.default);
exports.default = app;
