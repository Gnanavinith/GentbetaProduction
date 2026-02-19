import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Form from './src/models/Form.model.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genbeta', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkForm = async () => {
  try {
    const form = await Form.findById('698dd4de4fd390b4106d655b');
    if (form) {
      console.log('Form found:', {
        _id: form._id,
        formName: form.formName,
        status: form.status,
        isActive: form.isActive,
        fieldsCount: form.fields?.length || 0,
        sectionsCount: form.sections?.length || 0
      });
      
      // Check if it has any layout fields
      if (form.fields && form.fields.length > 0) {
        const layoutFields = form.fields.filter(f => ['columns-2', 'columns-3', 'grid-table'].includes(f.type));
        console.log('Layout fields found:', layoutFields.length);
        layoutFields.forEach((f, i) => {
          console.log(`  ${i+1}. Type: ${f.type}, Fields: ${f.fields?.length || 0}`);
        });
      }
      
      // Check sections too
      if (form.sections && form.sections.length > 0) {
        form.sections.forEach((section, secIndex) => {
          if (section.fields && section.fields.length > 0) {
            const layoutFields = section.fields.filter(f => ['columns-2', 'columns-3', 'grid-table'].includes(f.type));
            console.log(`Section ${secIndex+1} layout fields:`, layoutFields.length);
            layoutFields.forEach((f, i) => {
              console.log(`  ${i+1}. Type: ${f.type}, Fields: ${f.fields?.length || 0}`);
            });
          }
        });
      }
    } else {
      console.log('Form not found');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
};

checkForm();