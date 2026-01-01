import mongoose from "mongoose";

// Define the MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB database
 * Optimized for serverless environments like Vercel
 * @returns Promise that resolves to the mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Check if MONGODB_URI is defined
  if (!MONGODB_URI) {
    const errorMessage = "MONGODB_URI environment variable is not defined";
    console.error("MongoDB connection error:", errorMessage);
    // In production, provide a more helpful error
    if (process.env.NODE_ENV === "production") {
      console.error(
        "Please set MONGODB_URI in your Vercel environment variables"
      );
    }
    throw new Error(errorMessage);
  }

  // Return cached connection if it exists and is still connected
  if (cached.conn) {
    // Check if the connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      // Connection is dead, clear cache
      console.log(
        "MongoDB connection state:",
        mongoose.connection.readyState,
        "- reconnecting..."
      );
      cached.conn = null;
    }
  }

  // Return existing connection promise if one is in progress
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Increased to 10 seconds for serverless
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Connection timeout
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log("Attempting to connect to MongoDB...");
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully");
        console.log(
          "MongoDB connection state:",
          mongoose.connection.readyState
        );
        console.log(
          "MongoDB database name:",
          mongoose.connection.db?.databaseName
        );
        return mongoose;
      })
      .catch((error) => {
        const isIPWhitelistError =
          error.message?.includes("whitelist") ||
          error.message?.includes("IP") ||
          error.name === "MongooseServerSelectionError";

        if (isIPWhitelistError && process.env.NODE_ENV !== "production") {
          console.error("MongoDB connection error - IP Whitelist Issue:", {
            message: error.message,
            name: error.name,
            code: (error as any).code,
          });
          console.error("\n📋 To fix this issue:");
          console.error("1. Go to MongoDB Atlas: https://cloud.mongodb.com/");
          console.error("2. Navigate to: Network Access → IP Access List");
          console.error('3. Click "Add IP Address"');
          console.error(
            '4. Click "Add Current IP Address" (or use 0.0.0.0/0 to allow all IPs - less secure)'
          );
          console.error("5. Wait a few minutes for changes to propagate");
          console.error(
            "\nFor Vercel deployments, you may need to allow all IPs (0.0.0.0/0) or use Vercel's IP ranges."
          );
        } else {
          console.error("MongoDB connection error:", {
            message: error.message,
            name: error.name,
            code: (error as any).code,
            stack: error.stack,
          });
        }
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;

    // Verify connection is actually ready, but don't throw if it's connecting (state 2)
    // State 1 = connected, State 2 = connecting, State 0 = disconnected
    const readyState = mongoose.connection.readyState;
    if (readyState === 0) {
      // Connection is disconnected, clear and retry
      cached.conn = null;
      cached.promise = null;
      throw new Error("MongoDB connection disconnected");
    }

    // If connecting (state 2), wait a bit and check again
    if (readyState === 2) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (mongoose.connection.readyState !== 1) {
        throw new Error("MongoDB connection timeout");
      }
    }

    return cached.conn;
  } catch (e) {
    cached.promise = null;
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("MongoDB connection failed:", {
      message: error.message,
      stack: error.stack,
      readyState: mongoose.connection.readyState,
    });
    throw error;
  }
}

export default connectDB;
