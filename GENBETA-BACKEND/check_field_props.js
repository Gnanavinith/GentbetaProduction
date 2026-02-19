import mongoose from 'mongoose';
import Form from './src/models/Form.model.js';

await mongoose.connect('mongodb+srv://aravind:Aravind123@cluster0.x2c1o.mongodb.net/?appName=Cluster0', {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false
});

const form = await Form.findById('698f322d931f8c8b82015ef2');
console.log('=== FIELD PROPERTIES ===');
form.sections[0].fields.forEach((field, i) => {
  console.log(`${i + 1}. ${field.type}:`);
  console.log('  Keys:', Object.keys(field));
  console.log('  ID:', field.id);
  console.log('  FieldId:', field.fieldId);
  console.log('  Label:', field.label);
  console.log('  Name:', field.name);
  console.log('');
});
await mongoose.connection.close();