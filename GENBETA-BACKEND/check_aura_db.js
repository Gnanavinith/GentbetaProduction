import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkAuraJewellaryDB = async () => {
  try {
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    // Connect to aura-jewellary database
    const uriWithDB = process.env.MONGO_URI.replace('/?', '/aura-jewellary?');
    console.log('Connecting to:', uriWithDB);
    
    await mongoose.connect(uriWithDB);
    console.log('Connected to aura-jewellary database');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check if companies collection exists and has data
    const collectionsNames = collections.map(c => c.name);
    if (collectionsNames.includes('companies')) {
      const Company = mongoose.model('Company', new mongoose.Schema({}), 'companies');
      const companyCount = await Company.countDocuments();
      console.log(`Found ${companyCount} companies`);
      
      if (companyCount > 0) {
        const companies = await Company.find({}, 'name subscription');
        companies.forEach((company, index) => {
          console.log(`${index + 1}. ${company.name}`);
          console.log(`   ID: ${company._id}`);
          console.log(`   Plan: ${company.subscription?.plan || 'SILVER'}`);
          console.log(`   Custom Limits:`, company.subscription?.customLimits);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

checkAuraJewellaryDB();