import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from './src/models/Company.model.js';

dotenv.config();

const listCompanies = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matapang');
    console.log('Connected to database');

    // List all companies
    const companies = await Company.find({}, 'name subscription');
    
    console.log(`Found ${companies.length} companies:`);
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   ID: ${company._id}`);
      console.log(`   Plan: ${company.subscription?.plan || 'SILVER'}`);
      console.log(`   Custom Limits:`, company.subscription?.customLimits);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

listCompanies();