import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { plantApi } from "../../api/plant.api";
import PlantInfoForm from "./PlantInfoForm";
import PlantAdminForm from "./PlantAdminForm";

export default function AddPlantContainer() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    plantName: "",
    location: "",
    plantNumber: ""
  });

  const [adminData, setAdminData] = useState({
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!token) return;
    
    // Validation
    if (!formData.plantName.trim()) {
      toast.error("Plant name is required");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Location is required");
      return;
    }
    if (!adminData.adminEmail.trim()) {
      toast.error("Admin email is required");
      return;
    }
    if (!adminData.adminPassword.trim()) {
      toast.error("Admin password is required");
      return;
    }
    if (adminData.adminPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const toastId = toast.loading("Adding plant...");
    try {
      setSaving(true);
      
      const payload = {
        name: formData.plantName,
        location: formData.location,
        plantNumber: formData.plantNumber || undefined,
        adminName: adminData.adminName || adminData.adminEmail.split('@')[0],
        adminEmail: adminData.adminEmail,
        adminPassword: adminData.adminPassword
      };

      await plantApi.createPlant(companyId, payload);
      toast.success("Plant added successfully!", { id: toastId });
      navigate(`/super/companies/${companyId}`);
    } catch (err) {
      console.error("Add plant error:", err);
      toast.error(err.response?.data?.message || "Failed to add plant", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-full mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate(`/super/companies/${companyId}`)}
            className="flex items-center text-slate-600 hover:text-indigo-600 transition-all font-semibold gap-2.5 group"
          >
            <div className="p-2 rounded-xl group-hover:bg-indigo-50 transition-all group-hover:shadow-sm">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-sm">Back to Company</span>
          </button>
          
          <h1 className="text-xl font-black text-slate-900 hidden md:block">Add New Plant</h1>
          
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold text-sm shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Plant
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <PlantInfoForm 
            formData={formData}
            setFormData={setFormData}
          />
          
          <PlantAdminForm 
            adminData={adminData}
            setAdminData={setAdminData}
          />
        </div>
      </div>
    </div>
  );
}