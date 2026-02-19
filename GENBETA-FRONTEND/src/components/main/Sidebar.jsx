import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navClass =
    "block px-4 py-3 rounded-lg text-sm font-medium";

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white dark:bg-slate-900 light:bg-gray-100 light:text-gray-900 border-r border-white/10">
      <div className="p-6 font-bold text-lg">APP NAME</div>

      <nav className="px-4 space-y-2">
        <NavLink
          to="/companies"
          className={({ isActive }) =>
            `${navClass} ${isActive ? "bg-indigo-600 text-white" : "hover:bg-white/10"}`
          }
        >
          Company
        </NavLink>

        <NavLink
          to="/forms"
          className={`${navClass} hover:bg-white/10`}
        >
          Facilitys
        </NavLink>

        <NavLink
          to="/dashboard"
          className={`${navClass} hover:bg-white/10`}
        >
          Dashboard
        </NavLink>
      </nav>
    </aside>
  );
}
