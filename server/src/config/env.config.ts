import dotenv from "dotenv";
dotenv.config();



interface EnvConfig {
  PORT: string;
  NODE_ENV: string;
  MONGO_URI: string;
  CLIENT_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  SMTP_HOST?: string;
  SMTP_SERVICE?: string;
  SMTP_PORT?: string;
  SMTP_MAIL?: string;
  SMTP_PASSWORD?: string;
  ADMIN_EMAIL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}


const requiredEnvVars: (keyof EnvConfig)[] = [
  "PORT",
  "NODE_ENV",
  "MONGO_URI",
  "CLIENT_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
];


const optionalEnvVars: Record<string, string> = {
  JWT_ACCESS_EXPIRY: "15m",
  JWT_REFRESH_EXPIRY: "7d",
};

export const validateEnv = (): void => {
  const missingVars: string[] = [];
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  });
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(", ")}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const env: EnvConfig = {
  PORT: process.env.PORT || "5000",
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI!,
  CLIENT_URL: process.env.CLIENT_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_SERVICE: process.env.SMTP_SERVICE,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_MAIL: process.env.SMTP_MAIL,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};


validateEnv();
