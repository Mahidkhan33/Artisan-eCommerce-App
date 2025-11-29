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

// Start the server only after the DB connection is established.
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect to DB, exiting.", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();



app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(
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


