export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      
      {/* Modal Box */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-white/10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-4 overflow-y-auto space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Reusable Input Component
========================= */
export function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="
          w-full rounded-lg px-3 py-2
          bg-gray-50 dark:bg-slate-700
          border border-gray-300 dark:border-white/10
          focus:outline-none focus:ring-2 focus:ring-indigo-500
        "
      />
    </div>
  );
}

/* =========================
   Section Wrapper
========================= */
export function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}
