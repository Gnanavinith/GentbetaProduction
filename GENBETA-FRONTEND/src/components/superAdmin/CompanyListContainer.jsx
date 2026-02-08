import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import CompanyTable from "./CompanyTable";
import CompanyFilters from "./CompanyFilters";
import { DeleteCompanyModal } from "../companies/DeleteCompanyModal";

export default function CompanyListContainer() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  
  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  // Fetch Companies
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest("/api/companies", "GET", null, token);
        setCompanies(data.data || data || []);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
        setError(err.message || "Failed to load companies");
        toast.error("Failed to load companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [token]);

  // Filter companies based on search and filters
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = !selectedIndustry || company.industry === selectedIndustry;
    const matchesPlan = !selectedPlan || (company.subscription?.plan || "SILVER") === selectedPlan;
    
    return matchesSearch && matchesIndustry && matchesPlan;
  });

  // Get unique industries for filter dropdown
  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))].sort();

  // Get unique plans for filter dropdown
  const plans = [...new Set(companies.map(c => c.subscription?.plan || "SILVER"))].sort();

  const handleDeleteClick = (company) => {
    setCompanyToDelete(company);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;
    
    try {
      await apiRequest(`/api/companies/${companyToDelete._id}`, "DELETE", null, token);
      setCompanies(companies.filter(c => c._id !== companyToDelete._id));
      toast.success("Company deleted successfully");
    } catch (err) {
      console.error("Delete company error:", err);
      toast.error(err.message || "Failed to delete company");
    } finally {
      setDeleteModalOpen(false);
      setCompanyToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="text-red-500 mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Companies</h3>
        <p className="text-slate-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        industries={industries}
        plans={plans}
        onCreateCompany={() => navigate("/super/companies/create")}
      />
      
      <CompanyTable
        companies={filteredCompanies}
        loading={loading}
        onViewCompany={(company) => navigate(`/super/companies/${company._id}`)}
        onEditCompany={(company) => navigate(`/super/companies/${company._id}/edit`)}
        onDeleteCompany={handleDeleteClick}
      />

      <DeleteCompanyModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCompanyToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        company={companyToDelete}
      />
    </div>
  );
}