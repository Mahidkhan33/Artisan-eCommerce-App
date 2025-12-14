import "./config/env.config.js";
import type { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./db/db.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import userRoutes from "./routes/user.routes.js"
import farmerRoutes from "./routes/farmer.routes.js";
import publicProductRoutes from "./routes/publicProduct.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import { stripeWebhook } from "./controllers/stripeWebhook.controller.js";

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL ?? "https://farm-se-ghar.vercel.app";

connectDB();



// CORS middleware - MUST be first and before Helmet
// Explicit OPTIONS handler for all routes (critical for Vercel serverless functions)
app.options('*', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Date,X-Api-Version');
  return res.sendStatus(200);
});

// CORS configuration for Vercel serverless functions
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Ensure CORS headers are always set on every response (critical for Vercel)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Date,X-Api-Version');
  next();
});

app.use(cookieParser());
app.use(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Helmet to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false
}));
app.use(morgan("dev"));
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        // Ensure CORS headers are set before sending error response
        res.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return res.status(400).json({ 
            success: false, 
            message: "Invalid JSON" 
        });
    }
    next(err);
});



app.use("/api/users", userRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/public", publicProductRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", reviewRoutes);
app.get("/", (_req, res) => res.json({ status: "OK" }));
app.use(errorHandler);


if(process.env.NODE_ENV !== "production"){
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
}


export default app;


