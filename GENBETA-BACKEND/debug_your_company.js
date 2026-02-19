import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Form from './src/models/Form.model.js';
import FormTemplate from './src/models/FormTemplate.model.js';
import Company from './src/models/Company.model.js';
import Plant from './src/models/Plant.model.js';

dotenv.config();

const debugYourCompany = async () => {
  try {
    // Connect to the correct database (test)
    const uriWithDB = process.env.MONGO_URI.replace('/?', '/test?');
    await mongoose.connect(uriWithDB);
    console.log('Connected to test database');

    // Find your company
    const companyId = '6979a623b42aa6e9248ff312';
    
    const company = await Company.findById(companyId);
    if (!company) {
      console.log('Company not found');
      return;
    }

    console.log(`Company: ${company.name || 'Unknown Name'}`);
    console.log(`Company ID: ${company._id}`);
    console.log(`Subscription Plan: ${company.subscription?.plan || 'SILVER'}`);
    console.log(`Custom Limits:`, company.subscription?.customLimits);

    // Get all plants for this company
    const plants = await Plant.find({ companyId, isActive: true });
    console.log(`\nFound ${plants.length} active plants:`);

    for (const plant of plants) {
      console.log(`\nPlant: ${plant.name} (${plant._id})`);
      
      // Count forms from both models
      const formTemplatesCount = await FormTemplate.countDocuments({ 
        plantId: plant._id, 
        isActive: true 
      });
      
      const formsCount = await Form.countDocuments({ 
        plantId: plant._id, 
        isActive: true 
      });
      
      const totalCount = formTemplatesCount + formsCount;
      
      console.log(`  FormTemplate count: ${formTemplatesCount}`);
      console.log(`  Form count: ${formsCount}`);
      console.log(`  Total active forms: ${totalCount}`);
      
      // Check if over limit (Silver plan = 10 forms per plant)
      const limit = 10; // Silver plan limit
      if (totalCount >= limit) {
        console.log(`  ⚠️  OVER LIMIT! Current: ${totalCount}, Limit: ${limit}`);
      } else {
        console.log(`  ✓ Within limit. Remaining: ${limit - totalCount}`);
      }
      
      // Show form details if there are forms
      if (totalCount > 0) {
        console.log('  Form details:');
        const formTemplates = await FormTemplate.find({ 
          plantId: plant._id, 
          isActive: true 
        });
        
        const forms = await Form.find({ 
          plantId: plant._id, 
          isActive: true 
        });
        
        [...formTemplates, ...forms].forEach((form, index) => {
          const modelName = form.constructor.modelName;
          const name = form.templateName || form.formName || 'Unnamed Form';
          const status = form.status || 'Unknown';
          console.log(`    ${index + 1}. ${modelName}: ${name} (Status: ${status})`);
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

debugYourCompany();