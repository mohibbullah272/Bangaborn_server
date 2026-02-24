import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import AppError from "./appError";
import { verifyToken } from "../utility/genarateToken";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/users/user.model";


export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.headers.authorization;

        if (!accessToken) {
            throw new AppError( "No Token Recieved",403)
        }


        const verifiedToken = verifyToken(accessToken,process.env.JWT_SECRET as string ) as JwtPayload

        const isUserExist = await User.findOne({ email: verifiedToken.email })

        if (!isUserExist) {
            throw new AppError("User does not exist",httpStatus.BAD_REQUEST)
        }
 
        if (isUserExist.isDeleted) {
            throw new AppError( "User is deleted",httpStatus.BAD_REQUEST)
        }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError("You are not permitted to view this route!!!",403 )
        }
        req.user = verifiedToken
        next()

    } catch (error) {
        console.log("jwt error", error);
        next(error)
    }
}