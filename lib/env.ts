import { z } from "zod";

/**
 * Environment variable schema validation
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Database
  MONGODB_URI: z
    .string()
    .url("MONGODB_URI must be a valid MongoDB connection string"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  // PostHog (optional)
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional().or(z.literal("")),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Validated environment variables
 * Throws an error at startup if any required variables are missing or invalid
 */
export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NODE_ENV: process.env.NODE_ENV,
});

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
