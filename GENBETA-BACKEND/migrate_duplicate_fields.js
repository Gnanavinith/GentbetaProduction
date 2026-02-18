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

const migrateForms = async () => {
  try {
    console.log('🔍 Finding forms with duplicated fields...');
    
    // Find forms that have both root fields and section fields
    const formsWithDuplication = await Form.find({
      $and: [
        { 'fields.0': { $exists: true } }, // Has root fields
        { 'sections.0': { $exists: true } }, // Has sections
        { 'sections.fields.0': { $exists: true } } // Sections have fields
      ]
    });
    
    console.log(`Found ${formsWithDuplication.length} forms with potential duplication`);
    
    let migratedCount = 0;
    
    for (const form of formsWithDuplication) {
      console.log(`\n--- Processing Form: ${form.formName} (${form._id}) ---`);
      
      // Check if root fields are duplicated in sections
      const rootFieldIds = form.fields.map(f => f.fieldId || f.label).filter(Boolean);
      const sectionFieldIds = form.sections.flatMap(s => 
        (s.fields || []).map(f => f.fieldId || f.label)
      ).filter(Boolean);
      
      // Find duplicates
      const duplicates = rootFieldIds.filter(id => sectionFieldIds.includes(id));
      
      if (duplicates.length > 0) {
        console.log(`  Found ${duplicates.length} duplicated fields:`, duplicates);
        
        // Remove root fields that exist in sections (keep sections as the source of truth)
        const uniqueRootFields = form.fields.filter(field => {
          const fieldId = field.fieldId || field.label;
          return !sectionFieldIds.includes(fieldId);
        });
        
        console.log(`  Keeping ${uniqueRootFields.length} unique root fields (removing ${form.fields.length - uniqueRootFields.length})`);
        
        // Update the form
        form.fields = uniqueRootFields;
        
        // Fix invalid status if needed
        if (form.status === "ARCHIVED") {
          form.status = "DRAFT";
        }
        
        await form.save();
        migratedCount++;
        
        console.log('  ✅ Form updated successfully');
      } else {
        console.log('  No duplication found - skipping');
      }
    }
    
    console.log(`\n🎉 Migration complete! Updated ${migratedCount} forms.`);
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('Migration error:', error);
    await mongoose.connection.close();
  }
};

migrateForms();