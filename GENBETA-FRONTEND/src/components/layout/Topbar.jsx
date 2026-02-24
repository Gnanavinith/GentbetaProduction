import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, User, Building2, ChevronDown, Settings } from "lucide-react";
import logo from "../../assets/MatapanLogo.png";
import Notifications from "./Notifications";

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

  const handleSettingsClick = () => {
    navigate("/settings");
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

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      SUPER_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
      PLANT_ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
      COMPANY_ADMIN: "bg-indigo-100 text-indigo-700 border-indigo-200",
      CLIENT: "bg-green-100 text-green-700 border-green-200",
      EMPLOYEE: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return colorMap[role] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/60 backdrop-blur-md">
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between max-w-[1920px] mx-auto">

        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Matapan Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Matapang
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <Notifications />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900 leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 leading-tight">
                  {user?.companyName || getRoleDisplay(user?.role)}
                </p>
              </div>
              <ChevronDown className={`hidden md:block w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)}
                />
                
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                  {/* User Info */}
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {user?.email || "user@example.com"}
                        </p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                            <Building2 className="w-3 h-3" />
                            {getRoleDisplay(user?.role)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      <span>My Profile</span>
                    </button>
                    
                    <button
                      onClick={handleSettingsClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-200">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}