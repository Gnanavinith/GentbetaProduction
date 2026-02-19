require('dotenv').config();
const mongoose = require('mongoose');

// Import the model properly
const Form = require('./src/models/Form.model').default;

async function checkForm() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const form = await Form.findById('6996997fcf173350d722d9e1');
    console.log('Form found:', form ? 'Yes' : 'No');
    
    if (form) {
      console.log('\n=== FORM DETAILS ===');
      console.log('Form ID:', form._id);
      console.log('Form Name:', form.formName);
      console.log('Is Template:', form.isTemplate);
      console.log('Status:', form.status);
      
      console.log('\n=== FIELDS ===');
      if (form.fields && form.fields.length > 0) {
        console.log('Number of fields:', form.fields.length);
        form.fields.forEach((field, index) => {
          console.log(`${index + 1}. ${field.label} (${field.type}) - ${field.fieldId}`);
          if (field.type === 'file' || field.type === 'image') {
            console.log(`   ^^^ This is a file/image field!`);
          }
        });
      } else {
        console.log('No fields found');
      }
      
      console.log('\n=== SECTIONS ===');
      if (form.sections && form.sections.length > 0) {
        console.log('Number of sections:', form.sections.length);
        form.sections.forEach((section, index) => {
          console.log(`${index + 1}. ${section.title} (${section.fields?.length || 0} fields)`);
          if (section.fields) {
            section.fields.forEach((field, fieldIndex) => {
              console.log(`   ${fieldIndex + 1}. ${field.label} (${field.type}) - ${field.fieldId}`);
              if (field.type === 'file' || field.type === 'image') {
                console.log(`      ^^^ This is a file/image field!`);
              }
            });
          }
        });
      } else {
        console.log('No sections found');
      }
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkForm();