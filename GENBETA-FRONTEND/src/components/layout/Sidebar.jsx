import { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import {
  LayoutDashboard,
  Building,
  Building2,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Factory,
  Clock,
  Layers,
  Inbox,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileCheck,
  FileEdit,
  Archive,
  Bookmark,
  CreditCard,

  } from "lucide-react";

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [expandedFacility, setExpandedFacility] = useState(false);
  const [templateFeatureEnabled, setTemplateFeatureEnabled] = useState(null); // null = not loaded yet

  // Compute submenu items based on template feature status
  const plantSubmenuItems = useMemo(() => {
    const baseItems = [
      { title: "Facility Forms", path: "/plant/forms/active", icon: FileCheck },
      { title: "Drafts", path: "/plant/forms/draft", icon: FileEdit },
      { title: "Archived", path: "/plant/forms/archived", icon: Archive }
    ];
    
    if (templateFeatureEnabled === true) {
      baseItems.push({ title: "Saved Templates", path: "/plant/forms/templates", icon: Bookmark });
    }
    
    return baseItems;
  }, [templateFeatureEnabled]);

  // Check if any facility submenu is active
  const isFacilitySubmenuActive = [
    "/plant/forms/active",
    "/plant/forms/draft", 
    "/plant/forms/archived",
    "/plant/forms/templates"
  ].some(path => location.pathname.startsWith(path));

  // Fetch template feature status for plant admin
  useEffect(() => {
    if (user?.role === "PLANT_ADMIN" && user?.plantId && templateFeatureEnabled === null) {
      const fetchTemplateFeatureStatus = async () => {
        try {
          const response = await api.get("/api/plants/my-plant");
          if (response && response.data) {
            const plant = response.data.plant;
            const company = response.data.company;
            
            // Check if template feature is enabled
            // If plant has explicit setting, use it; otherwise inherit from company
            let enabled = false;
            if (plant.templateFeatureEnabled !== null && plant.templateFeatureEnabled !== undefined) {
              enabled = plant.templateFeatureEnabled;
            } else {
              enabled = company?.templateFeatureEnabled || false;
            }
            
            setTemplateFeatureEnabled(enabled);
          }
        } catch (err) {
          console.error("Error fetching template feature status:", err);
          setTemplateFeatureEnabled(false); // Default to false if there's an error
        }
      };
      
      fetchTemplateFeatureStatus();
    } else if (user?.role !== "PLANT_ADMIN") {
      // For non-plant admins, we don't show the templates menu anyway
      setTemplateFeatureEnabled(false);
    }
  }, [user, templateFeatureEnabled]);

  // Toggle facility submenu
  const toggleFacilityMenu = () => {
    setExpandedFacility(!expandedFacility);
  };

  const getMenuItems = () => {
    const role = user?.role;

    if (role === "PLANT_ADMIN") {
      return {
        primary: [
          { title: "Dashboard", icon: LayoutDashboard, path: "/plant/dashboard" },
          { 
            title: "Facility", 
            icon: Layers, 
            path: "/plant/forms", 
            submenu: plantSubmenuItems,
            expanded: expandedFacility,
            toggle: toggleFacilityMenu,
            isActive: isFacilitySubmenuActive || location.pathname === "/plant/forms"
          },
          { title: "Summary", icon: BarChart3, path: "/plant/forms-view" },
          { title: "Submissions", icon: Inbox, path: "/plant/submissions" },
          { title: "Approvals", icon: Clock, path: "/plant/approval/pending" },
        ],
        secondary: [
          { title: "Employees", icon: Users, path: "/plant/employees" },
          { title: "Assignments", icon: ClipboardList, path: "/plant/assignments" },
          { title: "Plant Profile", icon: Factory, path: "/plant/profile" },
        ]
      };
    }

    const commonItems = [
      { title: "My Profile", icon: Users, path: "/profile" },
    ];

    if (role === "SUPER_ADMIN") {
      return {
        primary: [
          { title: "Dashboard", icon: LayoutDashboard, path: "/super/dashboard" },
          { title: "Companies", icon: Building, path: "/super/companies" },
        ],
        secondary: commonItems
      };
    }

    if (role === "COMPANY_ADMIN") {
      return {
        primary: [
          { title: "Dashboard", icon: LayoutDashboard, path: "/company/dashboard" },
          { title: "Company Profile", icon: Building, path: "/company/profile" },
          { title: "Plants", icon: Factory, path: "/company/plants" },
        ],
        secondary: [
          { title: "Plans & Usage", icon: CreditCard, path: "/company/plans" },
        ]
      };
    }

    if (role === "EMPLOYEE") {
      return {
        primary: [
          { title: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard" },
          { title: "Facility", icon: Building2, path: "/employee/templates" },
          { title: "Summary", icon: BarChart3, path: "/employee/forms-view" },
          { title: "Assigned Forms", icon: ClipboardList, path: "/employee/assignments" },
          { title: "Pending Forms", icon: Clock, path: "/employee/approval/pending" },
        ],
        secondary: commonItems
      };
    }

    return { primary: [], secondary: [] };
  };

  const sections = getMenuItems();

  const renderNavLink = (item) => {
    if (item.submenu) {
      return (
        <div key={item.path}>
          <div
            onClick={item.toggle}
            title={!isOpen ? item.title : ""}
            className={`flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2.5 rounded-xl transition-all duration-200 group cursor-pointer relative ${
              item.isActive 
                ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm shadow-indigo-100/50 font-semibold" 
                : "text-slate-600 hover:bg-slate-50/80 hover:text-indigo-600"
            }`}
          >
            <item.icon className={`w-4.5 h-4.5 transition-all flex-shrink-0 ${
              item.isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
            }`} />
            <span className={`text-[13px] font-medium transition-all duration-200 whitespace-nowrap overflow-hidden flex-1 ${
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}>
              {item.title}
            </span>
            <ChevronDown 
              className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ml-auto ${
                item.expanded ? "rotate-180" : ""
              } ${isOpen ? "opacity-100" : "opacity-0"}`}
            />
          </div>
          
          {/* Submenu */}
          {isOpen && item.expanded && (
            <div className="ml-3 mt-1 space-y-1 pl-2 border-l border-slate-200">
              {item.submenu.map((subItem) => (
                <NavLink
                  key={subItem.path}
                  to={subItem.path}
                  className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[12px] ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700 font-medium" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  }`}
                >
                  <subItem.icon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{subItem.title}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <NavLink
          key={item.path}
          to={item.path}
          title={!isOpen ? item.title : ""}
          className={({ isActive }) => `flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2.5 rounded-xl transition-all duration-200 group relative ${
            isActive 
              ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm shadow-indigo-100/50 font-semibold" 
              : "text-slate-600 hover:bg-slate-50/80 hover:text-indigo-600"
          }`}
        >
          <item.icon className={`w-4.5 h-4.5 transition-all flex-shrink-0 ${
            location.pathname === item.path ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
          }`} />
          <span className={`text-[13px] font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${
            isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
          }`}>
            {item.title}
          </span>
        </NavLink>
      );
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onToggle} />
      )}

        {/* Sidebar */}
        <aside className={`fixed lg:relative inset-y-0 left-0 z-50 bg-gradient-to-b from-white to-slate-50/30 border-r border-slate-200/60 backdrop-blur-xl transition-all duration-300 ease-in-out shadow-lg lg:shadow-xl ${
          isOpen ? "w-60 translate-x-0" : "w-[72px] -translate-x-full lg:translate-x-0"
        }`}>
          {/* Edge Toggle Button */}
          <button
            onClick={onToggle}
            className="absolute -right-3 top-8 z-[60] flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-md transition-all hover:text-indigo-600 hover:border-indigo-300 hover:shadow-lg hidden lg:flex"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? (
              <ChevronLeft className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          <div className="flex flex-col h-full overflow-hidden">

          {/* Header */}
          <div className={`h-16 flex items-center border-b border-slate-200/60 gap-3 transition-all duration-300 ${
            isOpen ? "px-6" : "justify-center px-0"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center flex-shrink-0 shadow-sm">
              {user?.companyLogo ? (
                <img 
                  src={user.companyLogo} 
                  alt="Logo" 
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Factory className="w-6 h-6 text-slate-700" />
              )}
            </div>
            <div className={`min-w-0 transition-all duration-200 ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {user?.companyName || (user?.role === "SUPER_ADMIN" ? "Super Admin" : "Plant Admin")}
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block leading-none mt-0.5">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {/* Primary Navigation */}
            <div className="space-y-1">
              <p className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-all duration-200 ${
                isOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
              }`}>
                Primary
              </p>
              {sections.primary.map(renderNavLink)}
            </div>

            {/* Secondary Navigation */}
            {sections.secondary.length > 0 && (
              <div className="space-y-1">
                <p className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 transition-all duration-200 ${
                  isOpen ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
                }`}>
                  Management
                </p>
                {sections.secondary.map(renderNavLink)}
              </div>
            )}
          </div>

        {/* Footer Section */}
        <div className="p-3 border-t border-slate-200/60 space-y-1">
          {user?.role !== "PLANT_ADMIN" && user?.role !== "EMPLOYEE" && (
            <NavLink
              to="/settings"
              title={!isOpen ? "Settings" : ""}
              className={({ isActive }) => `flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm shadow-indigo-100/50 font-semibold" 
                  : "text-slate-600 hover:bg-slate-50/80 hover:text-indigo-600"
              }`}
            >
              <Settings className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-600 flex-shrink-0 transition-colors" />
              <span className={`text-[13px] font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}>
                Settings
              </span>
            </NavLink>
          )}
          
          <button
              onClick={logout}
              title={!isOpen ? "Sign Out" : ""}
              className={`w-full flex items-center ${isOpen ? "gap-2.5 px-3" : "justify-center px-0"} py-2.5 rounded-xl text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-200 group font-medium`}
            >
              <LogOut className="w-4.5 h-4.5 flex-shrink-0 transition-all" />
              <span className={`text-[13px] font-medium transition-all duration-200 whitespace-nowrap overflow-hidden ${
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
              }`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}