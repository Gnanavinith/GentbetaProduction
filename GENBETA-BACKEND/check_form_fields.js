import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Form from './src/models/Form.model.js';

dotenv.config();

const checkFormFields = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find the specific form mentioned in the issue
    const form = await Form.findById('698dd4de4fd390b4106d655b');
    
    if (form) {
      console.log('\n=== FORM DATA STRUCTURE ===');
      console.log('Form ID:', form._id);
      console.log('Facility Name:', form.formName);
      console.log('Status:', form.status);
      console.log('Is Template:', form.isTemplate);
      
      console.log('\n=== FIELDS ANALYSIS ===');
      console.log('Top-level fields count:', form.fields?.length || 0);
      console.log('Fields array:', JSON.stringify(form.fields, null, 2));
      
      console.log('\n=== SECTIONS ANALYSIS ===');
      console.log('Sections count:', form.sections?.length || 0);
      if (form.sections && form.sections.length > 0) {
        form.sections.forEach((section, index) => {
          console.log(`\nSection ${index + 1}:`);
          console.log('  Name:', section.name);
          console.log('  Fields count:', section.fields?.length || 0);
          console.log('  Fields:', JSON.stringify(section.fields, null, 2));
        });
      }
      
      // Calculate total fields as the frontend does
      const topLevelFields = form.fields?.length || 0;
      const sectionFields = form.sections?.reduce((total, section) => 
        total + (section.fields?.length || 0), 0) || 0;
      const totalFields = topLevelFields + sectionFields;
      
      console.log('\n=== FIELD COUNT SUMMARY ===');
      console.log('Top-level fields:', topLevelFields);
      console.log('Section fields:', sectionFields);
      console.log('Total calculated fields:', totalFields);
      
    } else {
      console.log('Form not found');
      
      // List all forms to see what's available
      const allForms = await Form.find({}, 'formName fields sections status isTemplate');
      console.log('\n=== ALL FORMS ===');
      allForms.forEach(f => {
        const topLevel = f.fields?.length || 0;
        const sectionFields = f.sections?.reduce((total, section) => 
          total + (section.fields?.length || 0), 0) || 0;
        const total = topLevel + sectionFields;
        console.log(`${f.formName}: ${topLevel} top-level + ${sectionFields} section = ${total} total fields`);
      });
    }
    
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkFormFields();