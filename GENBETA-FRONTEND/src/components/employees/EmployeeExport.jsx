import { useState } from "react";
import { exportToExcel } from "../../utils/exportUtils";
import { Download } from "lucide-react";

export const EmployeeExport = ({ allEmployees, searchTerm }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportExcel = () => {
    // Filter employees based on search term for export
    const filteredEmployees = searchTerm.trim() 
      ? allEmployees.filter(emp => 
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (emp.position && emp.position.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : allEmployees;
    
    const data = filteredEmployees.map(emp => ({
      Name: emp.name,
      Email: emp.email,
      Position: emp.position || "N/A",
      Phone: emp.phoneNumber || "N/A",
      Status: "Active",
      Joined: new Date(emp.createdAt).toLocaleDateString()
    }));
    
    exportToExcel(data, "Employee_Details");
    setShowExportMenu(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={handleExportExcel}
        className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Download className="w-4 h-4" /> Export Excel
      </button>
    </div>
  );
};