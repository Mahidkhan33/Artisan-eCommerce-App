import type { Request,Response,NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
export const errorHandler = (err:Error | ApiError,_req:Request,res:Response,_next:NextFunction)=>{
    const statusCode = (err as ApiError).statusCode || 500;
    const message = err.message || "Internal Server Error"
    console.error("Error:",err);
    res.status(statusCode).json({
        success:false,
        message,
        ...(process.env.NODE_ENV === "development" && {stack:err.stack})
    })
}