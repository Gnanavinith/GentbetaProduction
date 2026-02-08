import { useTheme } from "../../context/ThemeContext";


export default function TopBar({ title, action }) {
  const { toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white dark:bg-slate-800">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-lg border text-sm"
        >
          🌗
        </button>

        {action}
      </div>
    </div>
  );
}
