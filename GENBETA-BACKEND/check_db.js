import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabase = async () => {
  try {
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
    
    // Check current database
    console.log('Current database:', mongoose.connection.db.databaseName);
    
    // List collections in current database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in current database:', collections.map(c => c.name));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

checkDatabase();