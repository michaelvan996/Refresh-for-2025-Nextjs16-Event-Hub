import mongoose from 'mongoose';

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
    const error = new Error('Please define the MONGODB_URI environment variable');
    console.error('MongoDB connection error:', error.message);
    throw error;
  }

  // Return cached connection if it exists and is still connected
  if (cached.conn) {
    // Check if the connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      // Connection is dead, clear cache
      console.log('MongoDB connection state:', mongoose.connection.readyState, '- reconnecting...');
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

    console.log('Attempting to connect to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        console.log('MongoDB database name:', mongoose.connection.db?.databaseName);
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', {
          message: error.message,
          name: error.name,
          code: (error as any).code,
          stack: error.stack,
        });
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    
    // Verify connection is actually ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`MongoDB connection not ready. State: ${mongoose.connection.readyState}`);
    }
    
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('MongoDB connection failed:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export default connectDB;
