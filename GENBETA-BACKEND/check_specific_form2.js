import mongoose from 'mongoose';
import Facility from './src/models/Facility.model.js';

// Connect directly without buffering
await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://aravind:Aravind123@cluster0.x2c1o.mongodb.net/?appName=Cluster0', {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false // Disable buffering
});

const checkFacility = async () => {
  try {
    const formId = '698f322d931f8c8b82015ef2';
    const form = await Facility.findById(formId);
    
    if (!form) {
      console.log('Facility not found');
      return;
    }
    
    console.log('=== FORM STRUCTURE ===');
    console.log('Facility ID:', form._id);
    console.log('Facility Name:', form.formName);
    console.log('Sections:', form.sections?.length || 0);
    console.log('Root fields:', form.fields?.length || 0);
    
    if (form.sections && form.sections.length > 0) {
      console.log('\n--- SECTIONS ---');
      form.sections.forEach((section, secIndex) => {
        console.log(`Section ${secIndex + 1}: ${section.title || 'Untitled'}`);
        console.log(`  Fields: ${section.fields?.length || 0}`);
        if (section.fields) {
          section.fields.forEach((field, fieldIndex) => {
            console.log(`    ${fieldIndex + 1}. ${field.type} - "${field.label || 'no label'}"`);
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

checkFacility();