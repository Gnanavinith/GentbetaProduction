  import { useState, useEffect } from "react";
  import { Outlet, useLocation } from "react-router-dom";
  import Sidebar from "../components/layout/Sidebar";
  import Topbar from "../components/layout/Topbar";
  
  export default function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    
    // Check if we are on the Create/Edit Company onboarding page or Form Builder
    const isFullWidthPage = location.pathname.includes("/super/companies/create") || 
                           location.pathname.match(/\/super\/companies\/.*\/edit/) ||
                           location.pathname.includes("/plant/forms/create") ||
                           location.pathname.includes("/plant/forms/") && location.pathname.includes("/edit");
  
    // Effect to handle body scroll lock for onboarding flow
    useEffect(() => {
      if (isFullWidthPage) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return () => {
        document.body.style.overflow = "unset";
      };
    }, [isFullWidthPage]);
  
    return (
      <div className={`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isFullWidthPage ? "h-screen overflow-hidden" : "min-h-screen"}`}>
        <div className={`flex h-screen ${isFullWidthPage ? "overflow-hidden" : ""}`}>
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
  
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Topbar */}
            <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
  
            {/* Page Content Area - Scrollable only here */}
            <main className={`flex-1 ${isFullWidthPage ? "overflow-y-auto" : "overflow-y-auto p-6"}`}>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    );
  }




