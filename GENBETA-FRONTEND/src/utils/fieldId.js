export const generateFieldId = (label) => {
  if (!label) return "";
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "_");
};

export const FIELD_TYPES = [
  "text",
  "email",
  "number",
  "radio",
  "checkbox",
  "file",
  "date",
  "range",
  "color",
  "table",
  "textarea",
  "dropdown",
  "multi-select"
];
