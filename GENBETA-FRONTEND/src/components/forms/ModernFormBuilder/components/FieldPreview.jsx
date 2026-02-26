import React, { memo, useRef } from 'react';
import { 
  Type, 
  Hash, 
  Mail, 
  Phone, 
  ChevronDown, 
  List, 
  Upload, 
  Calendar, 
  Signature as SignatureIcon,
  CheckCircle2,
  Table as TableIcon,
  FileText,
  UserCheck,
  Clock,
  CalendarCheck,
  CreditCard,
  MousePointer2,
  ChevronLeft,
  ChevronRight
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
  // Ref for programmatic scroll via arrow buttons
  const scrollRef = useRef(null);

  const baseInput =
    "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 text-[14px] focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm";

  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[field.alignment || "left"];

  const widthStyle = { width: field.width || "100%" };

  // Resolve column label regardless of which key the API uses
  const getColLabel = (col, idx) =>
    col.label || col.header || col.name || col.title || `Column ${idx + 1}`;

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
          <select
            className={`${baseInput} appearance-none ${alignmentClass}`}
            disabled={!isPreview}
          >
            <option>{field.placeholder || "Select an option"}</option>
            {field.options?.map((opt, i) => (
              <option key={i}>{opt}</option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={16}
          />
        </div>
      );

    case "checkbox":
    case "radio":
      return (
        <div style={widthStyle} className={`space-y-2 ${alignmentClass}`}>
          {field.options?.map((opt, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 ${
                field.alignment === "center"
                  ? "justify-center"
                  : field.alignment === "right"
                  ? "justify-end"
                  : ""
              }`}
            >
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
        <div
          style={widthStyle}
          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h4
              className={`text-sm font-black text-slate-700 uppercase tracking-tight ${alignmentClass}`}
            >
              {field.label}
            </h4>
          </div>
          <div className="divide-y divide-slate-100">
            {field.items?.map((item, i) => (
              <div
                key={item.id || i}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
              >
                <p
                  className={`flex-1 text-sm font-medium text-slate-600 ${alignmentClass}`}
                >
                  {item.question}
                </p>
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

    // ─────────────────────────────────────────────────────────────────────────
    // GRID TABLE
    //
    // ROOT CAUSE of "not scrollable":
    //   overflow-x: auto only scrolls when the child is WIDER than the container.
    //   If the container itself has no explicit width (it just stretches to fit),
    //   the browser never creates a scrollbar.
    //
    // FIX:
    //   1. Give the scroll wrapper an explicit `width: 100%` AND `display: block`
    //      so the browser knows its box boundary.
    //   2. Give the <table> an explicit pixel width (sum of all column widths)
    //      so it's guaranteed wider than the wrapper when there are many columns.
    //   3. Use `tableLayout: "fixed"` so columns don't collapse.
    //   4. Add arrow buttons that use a ref to programmatically scroll —
    //      these work even inside drag-and-drop canvases that intercept pointer events.
    // ─────────────────────────────────────────────────────────────────────────
    case "grid-table": {
      const columns     = field.columns || [];
      const items       = field.items   || [];
      const columnCount = columns.length;

      // Fixed pixel widths — guarantees table is wider than wrapper
      const COL_W      = 160;  // px per data column
      const LABEL_W    = 180;  // px for the sticky "Question" column
      const totalW     = LABEL_W + columnCount * COL_W;

      return (
        <div
          style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
          className="rounded-xl border border-slate-200 shadow-sm bg-white"
        >

          {/* ── Top bar: column count + arrow scroll buttons ──────────────── */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200 rounded-t-xl">
            <div className="flex items-center gap-2">
              <TableIcon size={13} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {columnCount} {columnCount === 1 ? "Column" : "Columns"}
                {items.length > 0 && ` · ${items.length} Rows`}
              </span>
            </div>

            {/* Arrow buttons — use onClick for better compatibility */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (scrollRef.current) {
                    scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
                  }
                }}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm active:scale-95"
                title="Scroll left"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (scrollRef.current) {
                    scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
                  }
                }}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm active:scale-95"
                title="Scroll right"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* ── SCROLL CONTAINER ───────────────────────────────────────────── */}
          <div
            ref={scrollRef}
            style={{
              position: "relative",
              width: "100%",
              overflowX: "auto",
              overflowY: "auto",
              maxHeight: "380px",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "thin",
              scrollbarColor: "#a5b4fc #f1f5f9",
              msOverflowStyle: "auto",
              pointerEvents: "auto",
            }}
            className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          >
            {/* ── TABLE — explicit pixel width ensures it overflows ────────── */}
            <div style={{ minWidth: "100%", width: "max-content" }}>
              <table
                style={{
                  tableLayout: "fixed",
                  width: `${totalW}px`,
                  minWidth: `${totalW}px`,
                  borderCollapse: "collapse",
                }}
                className="text-[13px]"
              >
                {/* THEAD — sticky top */}
                <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
                  <tr>
                    {/* Sticky "Question" header — sticks left AND top */}
                    <th
                      style={{
                        width: `${LABEL_W}px`,
                        minWidth: `${LABEL_W}px`,
                        position: "sticky",
                        left: 0,
                        top: 0,
                        zIndex: 5,
                        backgroundColor: "#f8fafc",
                      }}
                      className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-r-2 border-slate-200 whitespace-nowrap"
                    >
                      Question
                    </th>

                    {columns.map((col, i) => (
                      <th
                        key={col.id || i}
                        style={{
                          width: `${COL_W}px`,
                          minWidth: `${COL_W}px`,
                          backgroundColor: "#f8fafc",
                        }}
                        className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest border-b-2 border-r border-slate-200 last:border-r-0 whitespace-nowrap"
                      >
                        {getColLabel(col, i)}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* TBODY */}
                <tbody>
                  {items.length > 0 ? (
                    items.map((item, ri) => (
                      <tr
                        key={item.id || ri}
                        className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/20 transition-colors group"
                      >
                        {/* Sticky label cell */}
                        <td
                          style={{
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                            backgroundColor: "white",
                            width: `${LABEL_W}px`,
                          }}
                          className="px-4 py-3 border-r-2 border-slate-200 group-hover:bg-indigo-50/20"
                        >
                          <span className="text-[12px] font-semibold text-slate-700 whitespace-nowrap">
                            {item.question || item.label || `Row ${ri + 1}`}
                          </span>
                        </td>

                        {columns.map((col, ci) => (
                          <td
                            key={col.id || ci}
                            style={{ width: `${COL_W}px` }}
                            className="px-3 py-2.5 border-r border-slate-100 last:border-r-0"
                          >
                            <div className="h-8 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 group-hover:border-indigo-200 transition-colors" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    // No items — show placeholder rows
                    [...Array(Math.max(1, field.rows || 2))].map((_, ri) => (
                      <tr
                        key={ri}
                        className="border-b border-slate-100 last:border-0 group"
                      >
                        <td
                          style={{
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                            backgroundColor: "white",
                            width: `${LABEL_W}px`,
                          }}
                          className="px-4 py-3 border-r-2 border-slate-200"
                        >
                          <div className="h-7 w-20 bg-slate-100 rounded border border-dashed border-slate-200" />
                        </td>
                        {columns.map((_, ci) => (
                          <td
                            key={ci}
                            style={{ width: `${COL_W}px` }}
                            className="px-3 py-2.5 border-r border-slate-100 last:border-r-0"
                          >
                            <div className="h-8 w-full bg-slate-50/50 rounded-lg border border-dashed border-slate-100 group-hover:border-indigo-200 transition-colors" />
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Scroll hint (> 4 columns) ─────────────────────────────────── */}
          {columnCount > 4 && (
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 border-t border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {[0, 150, 300].map((delay, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide ml-1">
                  ↔ {columnCount} columns · use arrows or drag scrollbar
                </span>
              </div>
              <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-100 px-2 py-1 rounded-full">
                ← → buttons above
              </span>
            </div>
          )}

          {/* ── Add row button ─────────────────────────────────────────────── */}
          {field.repeatable && (
            <button className="w-full py-2.5 bg-slate-50/50 text-[10px] font-black text-slate-400 hover:text-indigo-600 hover:bg-white transition-all border-t border-slate-200 rounded-b-xl uppercase tracking-widest">
              + ADD NEW ROW
            </button>
          )}
        </div>
      );
    }

    case "file":
    case "image":
      return (
        <div
          style={widthStyle}
          className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50 flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-white transition-all group"
        >
          <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
            {field.type === "image" ? (
              <CreditCard className="text-indigo-500" size={24} />
            ) : (
              <Upload className="text-indigo-500" size={24} />
            )}
          </div>
          <div className="text-center">
            <span className="text-[13px] font-bold text-slate-700 block">
              Click or drag {field.type} to upload
            </span>
            <span className="text-[11px] text-slate-400">
              Up to {field.maxFileSize || 5}MB
            </span>
          </div>
        </div>
      );

    case "signature":
      return <SignaturePad label={field.label} readOnly={!isPreview} />;

    case "terms":
      return (
        <div
          style={widthStyle}
          className="flex gap-3 p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl"
        >
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300"
            disabled={!isPreview}
          />
          <p className="text-[13px] text-slate-600 leading-snug break-words overflow-hidden">
            {field.content}
          </p>
        </div>
      );

    case "auto-date":
      return (
        <div
          style={widthStyle}
          className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <Clock size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Auto Submission Date
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">YYYY-MM-DD</span>
        </div>
      );

    case "auto-user":
      return (
        <div
          style={widthStyle}
          className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <UserCheck size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Auto User Information
            </span>
          </div>
          <div className="flex gap-1 flex-wrap justify-end">
            {field.fields?.map(f => (
              <span
                key={f}
                className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-400 uppercase"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      );

    default:
      return <div className={baseInput}>{field.label}</div>;
  }
});