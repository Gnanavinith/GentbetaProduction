import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
} from "lucide-react";
import { submissionApi } from "../../api/submission.api";
import { format } from "date-fns";
import ApprovalWorkflowDisplay from "../../components/forms/ApprovalWorkflowDisplay";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getFormFields = (form) => {
  if (!form) return [];
  let allFields = [...(form.fields || [])];
  if (form.sections) {
    form.sections.forEach((section) => {
      if (section.fields) allFields = [...allFields, ...section.fields];
    });
  }
  const uniqueFields = [];
  const seenIds = new Set();
  allFields.forEach((field) => {
    const fieldId = field.fieldId || field.id;
    if (
      fieldId &&
      !seenIds.has(fieldId) &&
      !["section-divider", "section-header", "spacer", "columns-2", "columns-3"].includes(field.type)
    ) {
      seenIds.add(fieldId);
      uniqueFields.push(field);
    }
  });
  return uniqueFields;
};

// Resolve column label from column object
const getColLabel = (col, idx) =>
  col?.label || col?.header || col?.name || col?.title || `Column ${idx + 1}`;

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status, currentLevel, totalLevels, form }) {
  const statusConfig = {
    DRAFT:            { color: "bg-gray-100 text-gray-800",   icon: FileText,    label: "Draft"            },
    SUBMITTED:        { color: "bg-blue-100 text-blue-800",   icon: Send,        label: "Submitted"        },
    PENDING_APPROVAL: { color: "bg-yellow-100 text-yellow-800", icon: Clock,     label: "Pending Approval" },
    APPROVED:         { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Approved"         },
    REJECTED:         { color: "bg-red-100 text-red-800",     icon: XCircle,     label: "Rejected"         },
  };
  const config = statusConfig[status] || statusConfig.DRAFT;
  const Icon = config.icon;
  let calculatedTotalLevels = totalLevels;
  if (!calculatedTotalLevels && form?.approvalFlow) calculatedTotalLevels = form.approvalFlow.length;
  const displayLabel =
    status === "PENDING_APPROVAL" && currentLevel && calculatedTotalLevels
      ? `Level ${currentLevel}/${calculatedTotalLevels}`
      : config.label;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-2" />
      {displayLabel}
    </span>
  );
}

// ─── Grid Table Renderer ─────────────────────────────────────────────────────
// Renders { "item-xxx": { col1: "v", col2: "v" } } as a proper labeled table.
// Looks up column/row labels from the field definition when available.

function GridTableRenderer({ value, field }) {
  const scrollRef = useRef(null);

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return <pre className="text-sm text-gray-600">{JSON.stringify(value, null, 2)}</pre>;
  }

  const rowEntries = Object.entries(value); // [ [itemId, {col1:v, col2:v}], ... ]
  if (rowEntries.length === 0) return <span className="text-gray-400 italic">No data</span>;

  // Build column list from field definition or fall back to keys in first row
  const fieldColumns = field?.columns || [];
  const firstRowCols = Object.keys(rowEntries[0][1] || {});

  // All unique column keys across all rows (preserves order)
  const allColKeys = fieldColumns.length > 0
    ? fieldColumns.map((c) => c.id || c.fieldId)
    : [...new Set(rowEntries.flatMap(([, row]) => Object.keys(row || {})))];

  // Label lookup: colKey → display label
  const colLabelMap = {};
  if (fieldColumns.length > 0) {
    fieldColumns.forEach((col) => {
      const key = col.id || col.fieldId;
      if (key) colLabelMap[key] = getColLabel(col, 0);
    });
  } else {
    // No field definition: prettify the key (col1 → Column 1)
    allColKeys.forEach((key, idx) => {
      colLabelMap[key] = key.replace(/^col(\d+)$/i, "Column $1") || `Col ${idx + 1}`;
    });
  }

  // Row label lookup: itemId → display label (from field.items)
  const rowLabelMap = {};
  if (field?.items) {
    field.items.forEach((item) => {
      const key = item.id || item.fieldId;
      if (key) rowLabelMap[key] = item.question || item.label || key;
    });
  }

  const COL_W   = 140; // px per column
  const LABEL_W = 180; // px for row label column
  const totalW  = LABEL_W + allColKeys.length * COL_W;

  return (
    <div className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <TableIcon size={13} className="text-indigo-400" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {rowEntries.length} {rowEntries.length === 1 ? "Row" : "Rows"} · {allColKeys.length} Columns
          </span>
        </div>
        {/* Scroll arrows */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
            }}
            className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
            }}
            className="p-1 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Scroll wrapper */}
      <div
        ref={scrollRef}
        style={{
          display: "block",
          width: "100%",
          overflowX: "scroll",
          overflowY: "auto",
          maxHeight: "420px",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "thin",
          scrollbarColor: "#a5b4fc #f1f5f9",
        }}
      >
        <table
          style={{
            tableLayout: "fixed",
            width: `${totalW}px`,
            minWidth: `${totalW}px`,
            borderCollapse: "collapse",
          }}
          className="text-[13px]"
        >
          {/* THEAD */}
          <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
            <tr>
              {/* Sticky "Row" header */}
              <th
                style={{
                  width: `${LABEL_W}px`,
                  minWidth: `${LABEL_W}px`,
                  position: "sticky",
                  left: 0,
                  zIndex: 5,
                  backgroundColor: "#eef2ff", // indigo-50
                }}
                className="px-4 py-3 text-left text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-r-2 border-indigo-100 whitespace-nowrap"
              >
                Row / Question
              </th>
              {allColKeys.map((colKey, i) => (
                <th
                  key={colKey}
                  style={{
                    width: `${COL_W}px`,
                    minWidth: `${COL_W}px`,
                    backgroundColor: "#eef2ff",
                  }}
                  className="px-4 py-3 text-left text-[10px] font-black text-indigo-600 uppercase tracking-widest border-b-2 border-r border-indigo-100 last:border-r-0 whitespace-nowrap"
                >
                  {colLabelMap[colKey] || colKey}
                </th>
              ))}
            </tr>
          </thead>

          {/* TBODY */}
          <tbody>
            {rowEntries.map(([itemId, rowData], ri) => {
              const rowLabel = rowLabelMap[itemId] || `Row ${ri + 1}`;
              const isEven   = ri % 2 === 0;
              return (
                <tr
                  key={itemId}
                  className={`border-b border-slate-100 last:border-0 transition-colors group hover:bg-indigo-50/30 ${
                    isEven ? "bg-white" : "bg-slate-50/40"
                  }`}
                >
                  {/* Sticky row label */}
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      backgroundColor: isEven ? "white" : "#f8fafc",
                      width: `${LABEL_W}px`,
                    }}
                    className="px-4 py-3 border-r-2 border-slate-200 group-hover:bg-indigo-50/30"
                  >
                    <span className="text-[12px] font-semibold text-slate-700 whitespace-nowrap">
                      {rowLabel}
                    </span>
                  </td>

                  {allColKeys.map((colKey) => {
                    const cellVal = rowData?.[colKey];
                    const isEmpty = cellVal === undefined || cellVal === null || cellVal === "";
                    return (
                      <td
                        key={colKey}
                        style={{ width: `${COL_W}px` }}
                        className="px-4 py-3 border-r border-slate-100 last:border-r-0"
                      >
                        {isEmpty ? (
                          <span className="text-slate-300 text-xs italic">—</span>
                        ) : (
                          <span className="text-[13px] text-slate-800">{String(cellVal)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Scroll hint */}
      {allColKeys.length > 4 && (
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 border-t border-indigo-100 flex items-center gap-2">
          {[0, 150, 300].map((d, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: `${d}ms` }} />
          ))}
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">
            ↔ Scroll horizontally to see all {allColKeys.length} columns
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Field Value Renderer ────────────────────────────────────────────────────

function renderFieldValue(value, field) {
  if (value === null || value === undefined || value === "") return null;

  // Parse JSON strings
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return renderFieldValue(parsed, field);
    } catch {}
  }

  // File / image object from Cloudinary
  if (typeof value === "object" && !Array.isArray(value) && value.url) {
    return (
      <div className="space-y-2">
        <a
          href={value.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 underline text-sm font-medium"
        >
          <FileText size={14} />
          {value.filename || "View File"}
        </a>
        {value.size && (
          <span className="text-gray-400 text-xs ml-2">
            ({(value.size / 1024 / 1024).toFixed(2)} MB)
          </span>
        )}
        {value.mimetype?.startsWith("image") && (
          <img src={value.url} className="mt-2 max-w-[180px] rounded-lg border shadow-sm" alt="" />
        )}
      </div>
    );
  }

  // Array (checkbox, multi-select, checklist)
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((v, i) => (
          <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-medium">
            {String(v)}
          </span>
        ))}
      </div>
    );
  }

  // Direct URL (signature / raw file link)
  if (typeof value === "string" && value.startsWith("http")) {
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(value);
    return (
      <div className="space-y-2">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline text-sm"
        >
          View File →
        </a>
        {isImage && (
          <img src={value} className="mt-1 max-w-[180px] rounded-lg border shadow-sm" alt="preview" />
        )}
      </div>
    );
  }

  // Boolean
  if (typeof value === "boolean") {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  // Grid-table: nested { itemId: { colKey: val } }
  if (typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value);
    const firstVal = keys.length > 0 ? value[keys[0]] : null;
    const isGridTable =
      field?.type === "grid-table" ||
      (firstVal !== null && typeof firstVal === "object" && !firstVal.url);

    if (isGridTable) {
      return <GridTableRenderer value={value} field={field} />;
    }

    // Auto-user / generic key-value object
    return (
      <div className="space-y-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
        {keys.map((k) => (
          <div key={k} className="flex gap-2 text-sm">
            <span className="font-semibold text-slate-600 capitalize min-w-[80px]">{k}:</span>
            <span className="text-slate-800">{String(value[k])}</span>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-sm text-slate-800">{String(value)}</span>;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SubmissionDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => { fetchSubmission(); }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionApi.getSubmissionById(id);
      if (response.success) {
        setSubmission(response.data);
      } else {
        setError("Submission not found");
      }
    } catch (err) {
      setError("Failed to load submission");
      console.error("Error fetching submission:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 h-96" />
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{error || "Submission not found"}</h3>
          <button
            onClick={() => navigate("/plant/submissions")}
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  const formFields = submission.formId ? getFormFields(submission.formId) : [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* ── Header ── */}
      <div>
        <button
          onClick={() => navigate("/plant/submissions")}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submissions
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{submission.formName}</h1>
            <p className="mt-1 text-gray-600">
              {submission.readableId
                ? `Submission: ${submission.readableId}`
                : `Submission #${submission.numericalId || submission._id}`}
            </p>
          </div>
          <StatusBadge
            status={submission.status}
            currentLevel={submission.currentLevel}
            totalLevels={submission.totalLevels}
            form={submission.formId}
          />
        </div>
      </div>

      {/* ── Info Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Submitted</p>
            <p className="font-medium text-gray-900">
              {format(new Date(submission.submittedAt), "MMM d, yyyy h:mm a")}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Submitted By</p>
            <p className="font-medium text-gray-900">{submission.submittedByName}</p>
            <p className="text-sm text-gray-500">{submission.submittedByEmail}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-400 shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <StatusBadge
              status={submission.status}
              currentLevel={submission.currentLevel}
              totalLevels={submission.totalLevels}
              form={submission.formId}
            />
          </div>
        </div>
      </div>

      {/* ── Approval Workflow ── */}
      {submission.formId && (
        <ApprovalWorkflowDisplay form={submission.formId} className="shadow-sm" />
      )}

      {/* ── Form Data ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">Form Data</h2>
        </div>
        <div className="p-6">
          {submission.data ? (
            <div className="space-y-0 divide-y divide-gray-100">
              {(formFields.length > 0
                ? formFields.map((field) => {
                    const rawValue =
                      submission.data[field.fieldId] ?? submission.data[field.id];
                    if (rawValue === undefined || rawValue === null || rawValue === "") return null;
                    let parsed = rawValue;
                    if (typeof rawValue === "string") {
                      try { parsed = JSON.parse(rawValue); } catch {}
                    }
                    const rendered = renderFieldValue(parsed, field);
                    if (!rendered) return null;
                    return { label: field.label || field.question || field.fieldId, rendered, key: field.fieldId || field.id };
                  }).filter(Boolean)
                : Object.entries(submission.data).map(([key, rawValue]) => {
                    if (rawValue === undefined || rawValue === null || rawValue === "") return null;
                    let parsed = rawValue;
                    if (typeof rawValue === "string") {
                      try { parsed = JSON.parse(rawValue); } catch {}
                    }
                    const rendered = renderFieldValue(parsed, null);
                    if (!rendered) return null;
                    const label = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase())
                      .trim();
                    return { label, rendered, key };
                  }).filter(Boolean)
              ).map(({ label, rendered, key }) => (
                <div
                  key={key}
                  className="py-4 first:pt-0 last:pb-0 grid grid-cols-[200px_1fr] gap-6 items-start"
                >
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide pt-0.5">
                    {label}
                  </span>
                  <div className="min-w-0">{rendered}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">No form data available</p>
          )}
        </div>
      </div>

      {/* ── Files ── */}
      {submission.files && submission.files.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Uploaded Files</h2>
          </div>
          <div className="p-6 space-y-2">
            {submission.files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <a
                  href={
                    file.url.includes("cloudinary.com") &&
                    file.mimetype?.startsWith("application/pdf")
                      ? file.url.replace("/upload/", "/upload/f_auto/")
                      : file.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline text-sm truncate"
                >
                  {file.filename || file.url}
                </a>
                {file.size && (
                  <span className="text-xs text-gray-400 ml-auto shrink-0">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Approval History ── */}
      {submission.approvalHistory && submission.approvalHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Approval History</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {submission.approvalHistory.map((history, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      history.status === "APPROVED" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {history.status === "APPROVED" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        Level {history.level} — {history.status}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(history.actionedAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    {history.comments && (
                      <p className="mt-1 text-sm text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
                        {history.comments}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}