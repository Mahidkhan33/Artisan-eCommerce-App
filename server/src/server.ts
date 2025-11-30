import "../config/env.config.js";
import type { Request, Response, NextFunction } from "express";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "../db/db.js";
import { errorHandler } from "../middlewares/errorHandler.middleware.js";
import userRoutes from "../routes/user.routes.js";
import farmerRoutes from "../routes/farmer.routes.js";
import publicProductRoutes from "../routes/publicProduct.routes.js";
import cartRoutes from "../routes/cart.routes.js";
import paymentRoutes from "../routes/payment.routes.js";
import uploadRoutes from "../routes/upload.routes.js";
import reviewRoutes from "../routes/review.routes.js";
import { stripeWebhook } from "../controllers/stripeWebhook.controller.js";
import serverless from "serverless-http";

const app = express();


let isDBConnected = false;
async function initDB() {
  if (!isDBConnected) {
    await connectDB();
    isDBConnected = true;
  }
}


app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(cookieParser());


app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(helmet());
app.use(morgan("dev"));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON",
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

export const handler = serverless(async (req, res) => {
  await initDB(); // ensure DB connection BEFORE handling requests
  return app(req, res);
});
