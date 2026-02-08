import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useFormStore = create((set) => ({
  formSchema: {
    id: uuidv4(),
    title: 'Untitled Form',
    description: '',
    sections: [
      {
        id: uuidv4(),
        title: 'New Section',
        fields: [],
      },
    ],
  },
  selectedFieldId: null,
  previewMode: false,

  setFormSchema: (schema) => set({ formSchema: schema }),
  
  setSelectedFieldId: (id) => set({ selectedFieldId: id }),
  
  setPreviewMode: (mode) => set({ previewMode: mode }),

  addField: (sectionId, fieldType) => set((state) => {
    const newField = {
      id: uuidv4(),
      type: fieldType,
      label: `New ${fieldType} Field`,
      placeholder: '',
      required: false,
      helpText: '',
      defaultValue: '',
      validation: {},
      permissions: {
        roles: ['Employee', 'Approver', 'Admin'],
        editableLevel: 1,
        readOnlyAfterApproval: true,
      },
      conditionalLogic: null,
    };

    const updatedSections = state.formSchema.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: [...section.fields, newField],
        };
      }
      return section;
    });

    return {
      formSchema: { ...state.formSchema, sections: updatedSections },
      selectedFieldId: newField.id,
    };
  }),

  updateField: (fieldId, updates) => set((state) => {
    const updatedSections = state.formSchema.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => 
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));

    return {
      formSchema: { ...state.formSchema, sections: updatedSections },
    };
  }),

  removeField: (fieldId) => set((state) => {
    const updatedSections = state.formSchema.sections.map((section) => ({
      ...section,
      fields: section.fields.filter((field) => field.id !== fieldId),
    }));

    return {
      formSchema: { ...state.formSchema, sections: updatedSections },
      selectedFieldId: state.selectedFieldId === fieldId ? null : state.selectedFieldId,
    };
  }),

  reorderFields: (sectionId, activeId, overId) => set((state) => {
    const sectionIndex = state.formSchema.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return state;

    const fields = [...state.formSchema.sections[sectionIndex].fields];
    const oldIndex = fields.findIndex(f => f.id === activeId);
    const newIndex = fields.findIndex(f => f.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const [movedField] = fields.splice(oldIndex, 1);
      fields.splice(newIndex, 0, movedField);
    }

    const updatedSections = [...state.formSchema.sections];
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], fields };

    return {
      formSchema: { ...state.formSchema, sections: updatedSections },
    };
  }),

  addSection: () => set((state) => ({
    formSchema: {
      ...state.formSchema,
      sections: [
        ...state.formSchema.sections,
        { id: uuidv4(), title: 'New Section', fields: [] },
      ],
    },
  })),

  updateSection: (sectionId, updates) => set((state) => ({
    formSchema: {
      ...state.formSchema,
      sections: state.formSchema.sections.map((s) => 
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    },
  })),

  removeSection: (sectionId) => set((state) => ({
    formSchema: {
      ...state.formSchema,
      sections: state.formSchema.sections.filter((s) => s.id !== sectionId),
    },
  })),
}));
