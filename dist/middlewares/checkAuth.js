"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = __importDefault(require("./appError"));
const genarateToken_1 = require("../utility/genarateToken");
const user_model_1 = require("../modules/users/user.model");
const checkAuth = (...authRoles) => async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken) {
            throw new appError_1.default("No Token Recieved", 403);
        }
        const verifiedToken = (0, genarateToken_1.verifyToken)(accessToken, process.env.JWT_SECRET);
        const isUserExist = await user_model_1.User.findOne({ email: verifiedToken.email });
        if (!isUserExist) {
            throw new appError_1.default("User does not exist", http_status_codes_1.default.BAD_REQUEST);
        }
        if (isUserExist.isDeleted) {
            throw new appError_1.default("User is deleted", http_status_codes_1.default.BAD_REQUEST);
        }
        if (!authRoles.includes(verifiedToken.role)) {
            throw new appError_1.default("You are not permitted to view this route!!!", 403);
        }
        req.user = verifiedToken;
        next();
    }
    catch (error) {
        console.log("jwt error", error);
        next(error);
    }
};
exports.checkAuth = checkAuth;
