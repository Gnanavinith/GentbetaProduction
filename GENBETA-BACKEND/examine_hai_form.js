import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Form from './src/models/Form.model.js';

dotenv.config();

const examineSpecificForm = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find the "hai" form that has 4+4=8 fields
    const forms = await Form.find({ formName: 'hai' });
    
    forms.forEach((form, index) => {
      console.log(`\n=== FORM ${index + 1} ===`);
      console.log('Form ID:', form._id);
      console.log('Facility Name:', form.formName);
      console.log('Status:', form.status);
      console.log('Is Template:', form.isTemplate);
      
      console.log('\n--- TOP-LEVEL FIELDS ---');
      console.log('Count:', form.fields?.length || 0);
      if (form.fields) {
        form.fields.forEach((field, i) => {
          console.log(`  ${i + 1}. ${field.name || field.label || 'unnamed field'} (${field.type})`);
        });
      }
      
      console.log('\n--- SECTIONS ---');
      console.log('Count:', form.sections?.length || 0);
      if (form.sections) {
        form.sections.forEach((section, secIndex) => {
          console.log(`\n  Section ${secIndex + 1}: ${section.name || 'unnamed section'}`);
          console.log(`  Fields in section: ${section.fields?.length || 0}`);
          if (section.fields) {
            section.fields.forEach((field, fieldIndex) => {
              console.log(`    ${fieldIndex + 1}. ${field.name || field.label || 'unnamed field'} (${field.type})`);
            });
          }
        });
      }
      
      // Calculate total fields as the frontend does
      const topLevelFields = form.fields?.length || 0;
      const sectionFields = form.sections?.reduce((total, section) => 
        total + (section.fields?.length || 0), 0) || 0;
      const totalFields = topLevelFields + sectionFields;
      
      console.log(`\n--- FIELD COUNT SUMMARY ---`);
      console.log(`Top-level fields: ${topLevelFields}`);
      console.log(`Section fields: ${sectionFields}`);
      console.log(`Total calculated fields: ${totalFields}`);
    });
    
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

examineSpecificForm();