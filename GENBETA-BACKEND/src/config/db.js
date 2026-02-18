import mongoose from "mongoose";

// Production database configuration
const DB_CONFIG = {
  // Connection Pool Settings
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 100,
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE) || 10,
  
  // Timeout Settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  
  // Retry Settings
  retryWrites: true,
  retryReads: true,
  
  // Write Concern
  w: 'majority',
  journal: true,
  
  // Read Preference (for scaling)
  readPreference: process.env.MONGO_READ_PREFERENCE || 'primary',
  
  // Connection Options
  family: 4, // Use IPv4
  autoIndex: process.env.NODE_ENV === 'development',
  
  // Monitoring
  heartbeatFrequencyMS: 10000
};

export const connectDB = async () => {
  try {
    console.log("🚀 Connecting to MongoDB...");
    console.log(`📊 Pool Size: ${DB_CONFIG.minPoolSize}-${DB_CONFIG.maxPoolSize}`);
    console.log(`📡 Read Preference: ${DB_CONFIG.readPreference}`);
    
    await mongoose.connect(process.env.MONGO_URI, DB_CONFIG);
    
    const db = mongoose.connection;
    
    // Connection event handlers
    db.on('connected', () => {
      console.log("✅ MongoDB Connected Successfully");
      console.log(`📍 Host: ${db.host}`);
      console.log(`🔢 Port: ${db.port}`);
      console.log(`📁 Database: ${db.name}`);
    });
    
    db.on('error', (error) => {
      console.error("❌ MongoDB Connection Error:", error);
    });
    
    db.on('disconnected', () => {
      console.log("⚠️  MongoDB Disconnected");
    });
    
    db.on('reconnected', () => {
      console.log("🔄 MongoDB Reconnected");
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down MongoDB connection...');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
    
  } catch (error) {
    console.error("💥 MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Database health check
export const checkDBHealth = async () => {
  try {
    const db = mongoose.connection;
    if (db.readyState === 1) {
      // Run a simple ping query
      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } else {
      return { status: 'unhealthy', readyState: db.readyState };
    }
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};

// Get database statistics
export const getDBStats = async () => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    return {
      dbName: db.databaseName,
      collections: stats.collections,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Database stats error:', error);
    return null;
  }
};
