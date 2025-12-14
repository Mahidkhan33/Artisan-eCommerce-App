import express from "express";
const router = express.Router();
import {
  getPublicProducts,
  getPublicProductById,
} from "../controllers/publicProduct.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { productQuerySchema } from "../validator/product.schema.js";


router.get("/products", validate(productQuerySchema, "query"), getPublicProducts);
router.get("/products/:id", getPublicProductById);
export default router;
