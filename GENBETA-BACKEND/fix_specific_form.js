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

const fixSpecificFacility = async () => {
  try {
    const formId = '698f235b3dbdd7043d1d9741';
    const form = await Facility.findById(formId);
    
    if (!form) {
      console.log('Facility not found');
      return;
    }
    
    console.log('=== BEFORE FIX ===');
    console.log('Root fields:', form.fields.length);
    console.log('Section fields:', form.sections[0].fields.length);
    
    // Remove duplicate root fields
    const sectionFieldIds = form.sections[0].fields.map(f => f.fieldId || f.label).filter(Boolean);
    const uniqueRootFields = form.fields.filter(field => {
      const fieldId = field.fieldId || field.label;
      return !sectionFieldIds.includes(fieldId);
    });
    
    form.fields = uniqueRootFields;
    
    console.log('=== AFTER FIX ===');
    console.log('Root fields:', form.fields.length);
    console.log('Section fields:', form.sections[0].fields.length);
    
    await form.save();
    console.log('✅ Facility updated successfully');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
};

fixSpecificFacility();