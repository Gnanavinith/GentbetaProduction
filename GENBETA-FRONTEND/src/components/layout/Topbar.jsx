import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, User, Building2, ChevronDown } from "lucide-react";
import logo from "../../assets/MatapanLogo.png";

export default function Topbar({ onMenuClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      SUPER_ADMIN: "Super Admin",
      PLANT_ADMIN: "Plant Admin",
      COMPANY_ADMIN: "Company Admin",
      CLIENT: "Client",
      EMPLOYEE: "Employee",
    };
    return roleMap[role] || role;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">

        {/* Left: Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-slate-600" />
          </button>

          {/* Logo (Desktop) */}
          <div className="hidden lg:flex items-center">
            <div className="bg-white px-4 py-2 flex items-center">
              <img
                src={logo}
                alt="Matapan Logo"
                className="h-12 w-auto object-contain"
              />
            <span className="text-2xl font-extrabold text-slate-900 ml-2 tracking-wide font-[Satoshi]">
  Metapang
</span>

            </div>
          </div>
        </div>

        {/* Center: Logo (Mobile) */}
        <div className="lg:hidden flex justify-center flex-1">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <img
              src={logo}
              alt="Matapan Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-extrabold text-slate-900 ml-2 font-serif">metapang</span>
          </div>
        </div>

        {/* Right: Profile Dropdown */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1"
          >
            <User className="w-5 h-5 text-slate-600" />
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {user?.name || "User"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Building2 className="w-3 h-3 text-indigo-500" />
                    <p className="text-xs text-indigo-600 font-medium truncate">
                      {user?.companyName || getRoleDisplay(user?.role)}
                    </p>
                  </div>
                </div>
                
                {/* Profile Option */}
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Profile</span>
                </button>
                
                {/* Logout Option */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}