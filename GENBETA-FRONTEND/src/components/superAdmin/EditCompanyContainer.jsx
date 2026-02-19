import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { companyApi } from "../../api/company.api";
import CompanyProfileFacility from "./CompanyProfileForm";
import CompanyAdminsFacility from "./CompanyAdminsForm";
import CompanySubscriptionFacility from "./CompanySubscriptionForm";

export default function EditCompanyContainer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [FacilityData, setFacilityData] = useState({
    name: "",
    industry: "",
    contactEmail: "",
    address: "",
    gstNumber: "",
    logoUrl: ""
  });

  const [adminData, setAdminData] = useState({
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCompany();
  }, [id, token]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const data = await companyApi.getCompanyById(id);
      setCompany(data);
      
      // Initialize form data
      setFacilityData({
        name: data.name || "",
        industry: data.industry || "",
        contactEmail: data.contactEmail || "",
        address: data.address || "",
        gstNumber: data.gstNumber || "",
        logoUrl: data.logoUrl || ""
      });

      // Initialize admin data (first admin if exists)
      if (data.admins && data.admins.length > 0) {
        const firstAdmin = data.admins[0];
        setAdminData({
          adminName: firstAdmin.name || "",
          adminEmail: firstAdmin.email || "",
          adminPassword: ""
        });
      }
    } catch (err) {
      setError(err?.message || "Failed to load company");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    
    const toastId = toast.loading("Updating company...");
    try {
      setSaving(true);
      
      // Prepare update payload
      const updatePayload = {
        name: formData.name,
        industry: formData.industry,
        contactEmail: formData.contactEmail,
        address: formData.address,
        gstNumber: formData.gstNumber,
        logoUrl: formData.logoUrl,
        admin: {
          name: adminData.adminName,
          email: adminData.adminEmail,
          password: adminData.adminPassword || undefined
        }
      };

      await companyApi.updateCompany(id, updatePayload);
      toast.success("Company updated successfully!", { id: toastId });
      navigate(`/super/companies/${id}`);
    } catch (err) {
      console.error("Update company error:", err);
      toast.error(err.response?.data?.message || "Failed to update company", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error || "Company not found"}</p>
          <button
            onClick={() => navigate("/super/companies")}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all font-semibold"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-full mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate(`/super/companies/${id}`)}
            className="flex items-center text-slate-600 hover:text-indigo-600 transition-all font-semibold gap-2.5 group"
          >
            <div className="p-2 rounded-xl group-hover:bg-indigo-50 transition-all group-hover:shadow-sm">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm">Back to Company</span>
          </button>
          
          <h1 className="text-xl font-black text-slate-900 hidden md:block">Edit Company Profile</h1>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="space-y-8">
          <CompanyProfileFacility 
            formData={formData}
            setFacilityData={setFacilityData}
            company={company}
          />
          
          <CompanyAdminsFacility 
            adminData={adminData}
            setAdminData={setAdminData}
            company={company}
          />
          
          <CompanySubscriptionFacility company={company} />
        </div>
      </div>
    </div>
  );
}