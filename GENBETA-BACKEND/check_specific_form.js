import mongoose from 'mongoose';
import Form from './src/models/Form.model.js';

// Connect directly without buffering
await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://aravind:Aravind123@cluster0.x2c1o.mongodb.net/?appName=Cluster0', {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false // Disable buffering
});

const checkSpecificForm = async () => {
  try {
    const formId = '698f235b3dbdd7043d1d9741';
    const form = await Form.findById(formId);
    
    if (!form) {
      console.log('Form not found');
      return;
    }
    
    console.log('=== FORM STRUCTURE ANALYSIS ===');
    console.log('Form ID:', form._id);
    console.log('Form Name:', form.formName);
    console.log('Fields count:', form.fields?.length || 0);
    console.log('Sections count:', form.sections?.length || 0);
    
    // Check root fields
    if (form.fields && form.fields.length > 0) {
      console.log('\n--- ROOT FIELDS ---');
      form.fields.forEach((field, index) => {
        console.log(`${index + 1}. Type: ${field.type}, Label: ${field.label}`);
      });
    }
    
    // Check section fields
    if (form.sections && form.sections.length > 0) {
      console.log('\n--- SECTIONS ---');
      form.sections.forEach((section, secIndex) => {
        console.log(`Section ${secIndex + 1}: ${section.title || 'Untitled'}`);
        console.log(`  Fields count: ${section.fields?.length || 0}`);
        if (section.fields) {
          section.fields.forEach((field, fieldIndex) => {
            console.log(`    ${fieldIndex + 1}. Type: ${field.type}, Label: ${field.label}`);
            console.log(`      Has fields property: ${!!field.fields}`);
            if (field.fields) {
              console.log(`      Nested fields count: ${field.fields.length}`);
              if (field.fields.length > 0) {
                field.fields.forEach((nestedField, nestedIndex) => {
                  console.log(`        ${nestedIndex + 1}. ${nestedField.type} - "${nestedField.label}"`);
                });
              }
            }
          });
        }
      });
    }
    
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
};

checkSpecificForm();