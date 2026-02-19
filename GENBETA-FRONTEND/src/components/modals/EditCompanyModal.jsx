import { useState, useRef } from "react";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Modal, Input, Section } from "./Modal";
import { Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditCompanyModal({ company, onClose, onSaved }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);

    const [form, setForm] = useState({
      name: company.name || "",
      industry: company.industry || "",
      contactEmail: company.contactEmail || "",
      contactPhone: company.contactPhone || "",
      gstNumber: company.gstNumber || "",
      address: company.address || "",
    });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    company.logoUrl ? `${company.logoUrl}` : null
  );
  const [loading, setLoading] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const save = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      // Append logo if changed
      if (logo) {
        formData.append("logo", logo);
      }

      // We use fetch directly or update apiRequest to handle FormData
      const response = await fetch(`/api/companies/${company._id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to update company");
      }

      toast.success("Company profile updated successfully");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Company Profile" onClose={onClose}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        
        {/* LOGO SECTION */}
        <Section title="Company Identity">
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            {logoPreview ? (
              <div className="relative group">
                <img 
                  src={logoPreview} 
                  alt="Preview" 
                  className="w-24 h-24 object-contain bg-white rounded-lg border shadow-sm" 
                />
                <button 
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center shadow-sm">
                  <Upload size={20} />
                </div>
                <span className="text-xs font-medium">Upload Company Logo</span>
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
        </Section>

          {/* BASIC DETAILS */}
          <Section title="General Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={form.name}
                onChange={v => setForm({ ...form, name: v })}
              />
              <Input
                label="Industry Type"
                value={form.industry}
                placeholder="e.g. Manufacturing, IT"
                onChange={v => setForm({ ...form, industry: v })}
              />
            </div>
          </Section>
  
          {/* COMPLIANCE & ADDRESS */}
          <Section title="Compliance & Location">
            <div className="space-y-4">
              <Input
                label="GST Number"
                value={form.gstNumber}
                placeholder="22AAAAA0000A1Z5"
                onChange={v => setForm({ ...form, gstNumber: v })}
              />
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Office Address</label>
                <textarea
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm min-h-[80px]"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Street address, Building, Suite..."
                />
              </div>
            </div>
          </Section>
  
          {/* CONTACT DETAILS */}
          <Section title="Primary Contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                value={form.contactPhone}
                onChange={v => setForm({ ...form, contactPhone: v })}
              />
              <div className="md:col-span-2">
                <Input
                  label="Official Email"
                  value={form.contactEmail}
                  onChange={v => setForm({ ...form, contactEmail: v })}
                />
              </div>
            </div>
          </Section>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100">
        <button
          onClick={save}
          disabled={loading}
          className={`w-full ${loading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Save Profile Changes'
          )}
        </button>
      </div>
    </Modal>
  );
}
