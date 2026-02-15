import React, { memo } from 'react';
import { 
  Type, 
  Hash, 
  Mail, 
  Phone, 
  ChevronDown, 
  List, 
  Columns, 
  Upload, 
  Calendar, 
  Layout,
  Signature as SignatureIcon,
  CheckCircle2,
  Table as TableIcon,
  AlignLeft,
  FileText,
  UserCheck,
  Clock,
  CalendarCheck,
  CreditCard,
  Grid3X3,
  Divide,
  MousePointer2
} from "lucide-react";
import SignaturePad from "./SignaturePad";

export const FieldIcon = memo(function FieldIcon({ type }) {
    const icons = {
      text: Type,
      number: Hash,
      email: Mail,
      phone: Phone,
      date: Calendar,
      daterange: CalendarCheck,
      dropdown: ChevronDown,
      checkbox: List,
      radio: MousePointer2,
      checklist: CheckCircle2,
      "grid-table": TableIcon,

    file: Upload,
    image: CreditCard,
    signature: SignatureIcon,
    terms: FileText,
    "auto-date": Clock,
    "auto-user": UserCheck,
  };
  const Icon = icons[type] || Type;
  return <Icon size={14} />;
});

export const FieldPreview = memo(function FieldPreview({ field, isPreview }) {
  const baseInput = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-[14px] focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm";
  
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right"
  }[field.alignment || "left"];

  const widthStyle = { width: field.width || "100%" };

  switch (field.type) {
    case "text":
    case "email":
    case "phone":
    case "number":
      return (
        <div style={widthStyle}>
          <input 
            placeholder={field.placeholder} 
            className={`${baseInput} ${alignmentClass}`} 
            disabled={!isPreview} 
          />
        </div>
      );
    case "date":
      return (
        <div style={widthStyle}>
          <input type="date" className={baseInput} disabled={!isPreview} />
        </div>
      );
    case "daterange":
      return (
        <div style={widthStyle} className="flex gap-2">
          <input type="date" className={baseInput} disabled={!isPreview} />
          <input type="date" className={baseInput} disabled={!isPreview} />
        </div>
      );
    case "dropdown":
      return (
        <div style={widthStyle} className="relative">
          <select className={`${baseInput} appearance-none ${alignmentClass}`} disabled={!isPreview}>
            <option>{field.placeholder || "Select an option"}</option>
            {field.options?.map((opt, i) => <option key={i}>{opt}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      );
    case "checkbox":
    case "radio":
      return (
        <div style={widthStyle} className={`space-y-2 ${alignmentClass}`}>
          {field.options?.map((opt, i) => (
            <div key={i} className={`flex items-center gap-3 ${field.alignment === 'center' ? 'justify-center' : field.alignment === 'right' ? 'justify-end' : ''}`}>
              <input 
                type={field.type} 
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                disabled={!isPreview}
              />
              <span className="text-sm text-slate-600">{opt}</span>
            </div>
          ))}
        </div>
      );
        case "checklist":
          return (
            <div style={widthStyle} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                 <h4 className={`text-sm font-black text-slate-700 uppercase tracking-tight ${alignmentClass}`}>{field.label}</h4>
              </div>
              <div className="divide-y divide-slate-100">
                {field.items?.map((item, i) => (
                  <div key={item.id || i} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                    <p className={`flex-1 text-sm font-medium text-slate-600 ${alignmentClass}`}>{item.question}</p>
                    <div className="flex gap-2 ml-4">
                      {field.options?.map((opt, oi) => (
                        <button 
                          key={oi}
                          className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all uppercase tracking-tighter"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                <button className="text-[10px] font-black text-indigo-500 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-widest">
                  + ADD CHECKLIST ITEM
                </button>
              </div>
            </div>
          );
      case "grid-table":
        const columnCount = field.columns?.length || 0;
        return (
          <div style={widthStyle} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
              <div className={columnCount > 6 ? "min-w-[800px]" : "w-full"}>
                <table className="w-full text-[13px] border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {field.columns?.map((col, i) => (
                        <th 
                          key={col.id || i} 
                          style={{ minWidth: col.width || '120px' }} 
                          className="px-4 py-3 text-left font-black text-slate-500 uppercase tracking-widest text-[10px] border-r last:border-0 border-slate-200/50"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(field.rows || 1)].map((_, ri) => (
                      <tr key={ri} className="border-b border-slate-100 last:border-0">
                        {field.columns?.map((col, ci) => (
                          <td key={ci} className="px-4 py-3 border-r last:border-0 border-slate-100">
                            <div className="h-8 w-full bg-slate-50/50 rounded-lg border border-slate-100 border-dashed" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {columnCount > 6 && (
              <div className="px-4 py-1 bg-indigo-50/50 border-t border-indigo-100/50 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tight">Scroll to view all {columnCount} columns</span>
              </div>
            )}

            {field.repeatable && (
              <button className="w-full py-2.5 bg-slate-50/50 text-[10px] font-black text-slate-400 hover:text-indigo-600 hover:bg-white transition-all border-t border-slate-200 uppercase tracking-widest">
                + ADD NEW ROW
              </button>
            )}
          </div>
        );

    case "file":
    case "image":
      return (
        <div style={widthStyle} className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50 flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-white transition-all group">
          <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
            {field.type === 'image' ? <CreditCard className="text-indigo-500" size={24} /> : <Upload className="text-indigo-500" size={24} />}
          </div>
          <div className="text-center">
            <span className="text-[13px] font-bold text-slate-700 block">Click or drag {field.type} to upload</span>
            <span className="text-[11px] text-slate-400">Up to {field.maxFileSize || 5}MB</span>
          </div>
        </div>
      );
    case "signature":
      return <SignaturePad label={field.label} readOnly={!isPreview} />;
    case "terms":
      return (
        <div style={widthStyle} className="flex gap-3 p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl">
          <input type="checkbox" className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300" disabled={!isPreview} />
            <p className="text-[13px] text-slate-600 leading-snug break-words overflow-hidden">{field.content}</p>
        </div>
      );
    case "auto-date":
      return (
        <div style={widthStyle} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Auto Submission Date</span>
          </div>
          <span className="text-xs font-mono text-slate-400">YYYY-MM-DD</span>
        </div>
      );
    case "auto-user":
      return (
        <div style={widthStyle} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 text-slate-400">
            <UserCheck size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Auto User Information</span>
          </div>
          <div className="flex gap-1">
            {field.fields?.map(f => (
              <span key={f} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 uppercase">{f}</span>
            ))}
          </div>
        </div>
      );

    default:
      return <div className={baseInput}>{field.label}</div>;
  }
});
