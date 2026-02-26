import { 
  Type, 
  Hash, 
  Mail, 
  Phone, 
  ChevronDown, 
  CheckSquare, 
  Columns, 
  Upload, 
  Signature, 
  Calendar, 
  Clock, 
  Layout,
  List,
  CheckCircle2,
  Table as TableIcon,
  AlignLeft,
  FileText,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Grid3X3,
  Divide,
  MousePointer2
} from "lucide-react";

export const FIELD_GROUPS = [
  {
    id: "basic",
    title: "Basic Inputs",
    fields: [
      { type: "text", label: "Text", icon: Type },
      { type: "number", label: "Number", icon: Hash },
      { type: "email", label: "Email", icon: Mail },
      { type: "phone", label: "Phone", icon: Phone },
      { type: "date", label: "Date", icon: Calendar },
      { type: "daterange", label: "Date Range", icon: CalendarCheck },
      { type: "dropdown", label: "Dropdown", icon: ChevronDown },
      { type: "checkbox", label: "Checkbox", icon: CheckSquare },
      { type: "radio", label: "Radio", icon: MousePointer2 },
    ]
  },
    {
      id: "checklist",
      title: "Checklist & Tables",
      fields: [
        { type: "checklist", label: "Checklist", icon: CheckCircle2 },
        { type: "grid-table", label: "Grid / Table", icon: TableIcon },
      ]
    },

  {
    id: "special",
    title: "Special Fields",
    fields: [
      { type: "signature", label: "Signature", icon: Signature },
      { type: "file", label: "File Upload", icon: Upload },
      { type: "image", label: "Image Upload", icon: CreditCard },
      { type: "terms", label: "Terms & Conditions", icon: FileText },
      { type: "auto-date", label: "Auto Date", icon: Clock },
      { type: "auto-user", label: "Auto User Info", icon: UserCheck },
    ]
  }
];

export const INITIAL_FIELD_CONFIG = {
  text: { label: "Text Field", placeholder: "Enter text...", required: false, width: "100%", alignment: "left" },
  number: { label: "Number Field", placeholder: "0", required: false, width: "100%", alignment: "left" },
  email: { label: "Email Field", placeholder: "email@example.com", required: false, width: "100%", alignment: "left" },
  phone: { label: "Phone Field", placeholder: "+1 (555) 000-0000", required: false, width: "100%", alignment: "left" },
  date: { label: "Date", required: false, width: "100%", alignment: "left" },
  daterange: { label: "Date Range", required: false, width: "100%", alignment: "left" },
  dropdown: { label: "Dropdown", options: ["Option 1", "Option 2"], required: false, width: "100%", alignment: "left" },
  checkbox: { label: "Checkbox", options: ["Option 1"], required: false, width: "100%", alignment: "left" },
  radio: { label: "Radio Buttons", options: ["Option 1", "Option 2"], required: false, width: "100%", alignment: "left" },
    checklist: { 
      label: "Equipment Safety Checklist", 
      items: [
        { id: "item-1", question: "Is equipment safe to use?" },
        { id: "item-2", question: "Are guards in place?" }
      ], 
      options: ["YES", "NO"], 
      width: "100%", 
      alignment: "left"
    },
  "grid-table": { 
    label: "Grid / Table", 
    columns: [
      { id: "col1", label: "Item", width: "50%" }, 
      { id: "col2", label: "Status", width: "50%" }
    ],
    items: [
      { id: "item-1", question: "Row 1" }
    ],
    rows: 1,
    width: "100%",
    repeatable: false
  },

  file: { label: "File Upload", required: false, maxFileSize: 5, width: "100%" },
  image: { label: "Image Upload", required: false, width: "100%" },
  signature: { label: "Signature", required: true, width: "100%" },
  terms: { label: "Terms & Conditions", content: "I agree to the terms...", required: true, width: "100%" },
  "auto-date": { label: "Submission Date", format: "YYYY-MM-DD", width: "100%" },
  "auto-user": { label: "User Information", fields: ["name", "employeeID", "department"], width: "100%" }
};
