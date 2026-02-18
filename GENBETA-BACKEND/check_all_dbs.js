import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkAllDatabases = async () => {
  try {
    console.log('MONGO_URI:', process.env.MONGO_URI);
    
    // Connect to the default database first
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to default database');
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
    
    // Check each database for Matapang collections
    for (const dbInfo of dbs.databases) {
      const dbName = dbInfo.name;
      if (['admin', 'local', 'config'].includes(dbName)) continue;
      
      console.log(`\n--- Checking database: ${dbName} ---`);
      
      // Disconnect from current database
      await mongoose.connection.close();
      
      // Connect to this database
      const dbUri = process.env.MONGO_URI.replace('/?', `/${dbName}?`);
      await mongoose.connect(dbUri);
      
      // List collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      console.log(`Collections: ${collectionNames.join(', ')}`);
      
      // Check for key Matapang collections
      const matapangCollections = ['companies', 'plants', 'forms', 'formtemplates'];
      const foundCollections = matapangCollections.filter(col => collectionNames.includes(col));
      
      if (foundCollections.length > 0) {
        console.log(`✓ Found Matapang collections: ${foundCollections.join(', ')}`);
        
        // Check companies if collection exists
        if (collectionNames.includes('companies')) {
          const Company = mongoose.model('Company', new mongoose.Schema({}), 'companies');
          const companyCount = await Company.countDocuments();
          console.log(`  Companies: ${companyCount}`);
          
          if (companyCount > 0) {
            const companies = await Company.find({}, 'name subscription');
            companies.forEach((company, index) => {
              console.log(`  ${index + 1}. ${company.name} (${company._id})`);
              console.log(`     Plan: ${company.subscription?.plan || 'SILVER'}`);
              console.log(`     Custom Limits:`, company.subscription?.customLimits);
            });
          }
        }
      } else {
        console.log('  No Matapang collections found');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

checkAllDatabases();