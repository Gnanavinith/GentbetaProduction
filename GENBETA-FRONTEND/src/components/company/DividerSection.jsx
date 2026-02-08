export default function DividerSection({ title }) {
  return (
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="px-4 text-xs font-bold text-slate-400 bg-white uppercase tracking-widest">{title}</span>
      </div>
    </div>
  );
}