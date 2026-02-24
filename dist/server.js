"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let server;
const PORT = process.env.PORT || 5000;
const Main = async () => {
    try {
        await mongoose_1.default.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3t5vk.mongodb.net/aadyDB?retryWrites=true&w=majority&appName=Cluster0`);
        console.log('db connected');
        server = app_1.default.listen(PORT, () => { console.log('server running on port 5000'); });
    }
    catch (error) {
        console.log(error);
    }
};
process.on('unhandledRejection', (err) => {
    console.log('error detected server about to shuting down......', err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.log('error detected server about to shuting down......', err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log(' server about to shuting down......');
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
Main();
