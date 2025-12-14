import type { Request,Response,NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

const CLIENT_URL = process.env.CLIENT_URL ?? "https://farm-se-ghar.vercel.app";

export const errorHandler = (err:Error | ApiError,_req:Request,res:Response,_next:NextFunction)=>{
    const statusCode = (err as ApiError).statusCode || 500;
    const message = err.message || "Internal Server Error"
    console.error("Error:",err);
    
    // Ensure CORS headers are set on error responses (critical for Vercel)
    res.header('Access-Control-Allow-Origin', CLIENT_URL);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Date,X-Api-Version');
    
    res.status(statusCode).json({
        success:false,
        message,
        ...(process.env.NODE_ENV === "development" && {stack:err.stack})
    })
}