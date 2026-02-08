function DetailRow({ icon, label, value, isEmail, isAddress }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="mt-0.5 p-2 bg-gradient-to-br from-slate-50 to-white rounded-xl group-hover:shadow-md transition-all">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-sm font-bold text-slate-900 ${
          isEmail ? 'text-blue-600 hover:text-blue-700 underline decoration-blue-200 decoration-2 cursor-pointer' : ''
        } ${
          isAddress ? 'leading-relaxed' : ''
        }`}>
          {value || <span className="text-slate-300 font-semibold italic">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

export default DetailRow;