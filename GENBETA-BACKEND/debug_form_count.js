import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Facility from './src/models/Facility.model.js';
import FacilityTemplate from './src/models/FacilityTemplate.model.js';
import Company from './src/models/Company.model.js';
import Plant from './src/models/Plant.model.js';

dotenv.config();

const debugFacilityCount = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matapang');
    console.log('Connected to database');

    // Find your company (you'll need to replace this with your actual company ID)
    const companyId = '6979a623b42aa6e9248ff312'; // From your URL
    
    const company = await Company.findById(companyId);
    if (!company) {
      console.log('Company not found');
      return;
    }

    console.log(`Company: ${company.name}`);
    console.log(`Subscription Plan: ${company.subscription?.plan || 'SILVER'}`);
    console.log(`Custom Limits:`, company.subscription?.customLimits);

    // Get all plants for this company
    const plants = await Plant.find({ companyId, isActive: true });
    console.log(`\nFound ${plants.length} active plants:`);

    for (const plant of plants) {
      console.log(`\nPlant: ${plant.name} (${plant._id})`);
      
      // Count forms from both models
      const formTemplatesCount = await FacilityTemplate.countDocuments({ 
        plantId: plant._id, 
        isActive: true 
      });
      
      const formsCount = await Facility.countDocuments({ 
        plantId: plant._id, 
        isActive: true 
      });
      
      const totalCount = formTemplatesCount + formsCount;
      
      console.log(`  FacilityTemplate count: ${formTemplatesCount}`);
      console.log(`  Facility count: ${formsCount}`);
      console.log(`  Total active forms: ${totalCount}`);
      
      // Show form details
      if (totalCount > 0) {
        console.log('  Facility details:');
        const formTemplates = await FacilityTemplate.find({ 
          plantId: plant._id, 
          isActive: true 
        });
        
        const forms = await Facility.find({ 
          plantId: plant._id, 
          isActive: true 
        });
        
        [...formTemplates, ...forms].forEach((form, index) => {
          const modelName = form.constructor.modelName;
          console.log(`    ${index + 1}. ${modelName}: ${form.templateName || form.formName} (Status: ${form.status})`);
        });
      }
    }

    // Check company-wide counts
    const companyFacilityTemplatesCount = await FacilityTemplate.countDocuments({ 
      companyId, 
      isActive: true 
    });
    
    const companyFacilitysCount = await Facility.countDocuments({ 
      companyId, 
      isActive: true 
    });
    
    console.log(`\nCompany-wide counts:`);
    console.log(`  FacilityTemplate: ${companyFacilityTemplatesCount}`);
    console.log(`  Facility: ${companyFacilitysCount}`);
    console.log(`  Total: ${companyFacilityTemplatesCount + companyFacilitysCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

debugFacilityCount();