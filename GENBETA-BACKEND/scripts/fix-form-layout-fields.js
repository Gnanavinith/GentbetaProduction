import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the Facility model
import Facility from '../src/models/Facility.model.js';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/genbeta', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Helper function to normalize form fields and nest them properly within layout containers
const normalizeFacilityFields = (fields) => {
  if (!fields || !Array.isArray(fields)) return [];

  const normalizedFields = [];
  let i = 0;

  while (i < fields.length) {
    const field = fields[i];

    // If this is a layout field (columns-2, columns-3, etc.), nest following fields inside it
    if (['columns-2', 'columns-3', 'section-header', 'section-divider', 'spacer'].includes(field.type)) {
      const layoutField = { ...field };
      layoutField.fields = layoutField.fields || [];

      // Look ahead for fields that should be nested inside this layout
      i++;
      while (i < fields.length) {
        const nextField = fields[i];

        // If we encounter another layout field or section-related field, stop nesting
        if (['columns-2', 'columns-3', 'section-header', 'section-divider', 'spacer'].includes(nextField.type)) {
          break;
        }

        // Add this field to the current layout's fields
        layoutField.fields.push(nextField);
        i++;
      }

      normalizedFields.push(layoutField);
    } else {
      // Regular field, add directly (unless it's a grid-table that needs items/columns)
      if (field.type === 'grid-table') {
        const gridTableField = { ...field };
        if (!gridTableField.items || gridTableField.items.length === 0) {
          // Create at least one row with default IDs
          gridTableField.items = [{ id: 'row-1', question: 'Row 1', label: 'Row 1' }];
        }
        if (!gridTableField.columns || gridTableField.columns.length === 0) {
          // Ensure there's at least one column if no columns exist
          gridTableField.columns = [{ id: 'col-1', label: 'Column 1' }];
        }
        normalizedFields.push(gridTableField);
      } else {
        normalizedFields.push(field);
        i++;
      }
    }
  }

  return normalizedFields;
};

// Migration function
const migrateFacilitys = async () => {
  try {
    console.log('Starting form layout migration...');
    
    // Find all forms
    const forms = await Facility.find({});
    console.log(`Found ${forms.length} forms to process`);

    let updatedCount = 0;
    let processedCount = 0;

    for (const form of forms) {
      let needsUpdate = false;
      let updatedFacility = { ...form.toObject() };

      // Process top-level fields
      if (updatedFacility.fields && updatedFacility.fields.length > 0) {
        const normalizedFields = normalizeFacilityFields(updatedFacility.fields);
        if (JSON.stringify(normalizedFields) !== JSON.stringify(updatedFacility.fields)) {
          updatedFacility.fields = normalizedFields;
          needsUpdate = true;
        }
      }

      // Process fields within sections
      if (updatedFacility.sections && updatedFacility.sections.length > 0) {
        for (let j = 0; j < updatedFacility.sections.length; j++) {
          const section = updatedFacility.sections[j];
          if (section.fields && section.fields.length > 0) {
            const normalizedSectionFields = normalizeFacilityFields(section.fields);
            if (JSON.stringify(normalizedSectionFields) !== JSON.stringify(section.fields)) {
              updatedFacility.sections[j].fields = normalizedSectionFields;
              needsUpdate = true;
            }
          }
        }
      }

      if (needsUpdate) {
        // Update the form in the database
        await Facility.findByIdAndUpdate(
          form._id,
          { 
            fields: updatedFacility.fields,
            sections: updatedFacility.sections
          },
          { new: true, runValidators: true }
        );
        
        updatedCount++;
        console.log(`Updated form: ${form.formName} (${form._id})`);
      }

      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`Processed ${processedCount}/${forms.length} forms...`);
      }
    }

    console.log(`Migration completed! Processed: ${processedCount}, Updated: ${updatedCount}`);
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration error:', error);
    await mongoose.connection.close();
  }
};

// Run the migration
migrateFacilitys();