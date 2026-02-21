import { Building2, Briefcase, Mail, MapPin, FileText, AlertCircle } from "lucide-react";
import { IoMdCloudUpload as Upload } from "react-icons/io";
import { useEffect } from "react";

export default function CompanyInfoStep({ company, setCompany, onNext }) {
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (company.logoUrl && company.logoFile) {
        URL.revokeObjectURL(company.logoUrl);
      }
    };
  }, [company.logoUrl, company.logoFile]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 px-8 md:px-10 py-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Company Information</h2>
            <p className="text-sm text-slate-600">Tell us about your organization</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={12} className="text-indigo-500" />
              Company Name *
            </label>
            <input
              type="text"
              value={company.companyName}
              onChange={(e) => setCompany({...company, companyName: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={12} className="text-indigo-500" />
              Industry *
            </label>
            <select
              value={company.industry}
              onChange={(e) => setCompany({...company, industry: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300 appearance-none"
              required
            >
              <option value="">Select industry</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Retail">Retail</option>
              <option value="Construction">Construction</option>
              <option value="Energy">Energy</option>
              <option value="Transportation">Transportation</option>
              <option value="Education">Education</option>
              <option value="Government">Government</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Mail size={12} className="text-indigo-500" />
            Contact Email *
          </label>
          <input
            type="email"
            value={company.contactEmail}
            onChange={(e) => setCompany({...company, contactEmail: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
            placeholder="company@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12} className="text-indigo-500" />
            Headquarters Address
          </label>
          <textarea
            value={company.address}
            onChange={(e) => setCompany({...company, address: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300 resize-none"
            placeholder="Enter full company address"
          />
        </div>


        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Building2 size={12} className="text-indigo-500" />
            Company Logo
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Revoke the previous object URL if it exists to prevent memory leaks
                      if (company.logoUrl && company.logoFile) {
                        URL.revokeObjectURL(company.logoUrl);
                      }
                      // Create a preview URL for the uploaded image
                      const previewUrl = URL.createObjectURL(file);
                      setCompany({...company, logoFile: file, logoUrl: previewUrl});
                    }
                  }}
                />
                <span className="flex flex-col items-center justify-center gap-2">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                  <span className="text-sm font-semibold text-slate-600">Click to upload logo</span>
                  <span className="text-xs text-slate-500">PNG, JPG, GIF (Max 5MB)</span>
                </span>
              </label>
            </div>
            
            {company.logoUrl && company.logoFile && (
              <div className="sm:w-32 sm:h-32 flex items-center justify-center border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <img 
                  src={company.logoUrl} 
                  alt="Logo Preview" 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden absolute items-center justify-center">
                  <span className="text-sm text-slate-500">Preview unavailable</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Upload your company logo image (optional)</p>
        </div>

        <div className="pt-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-800">Required Information</p>
              <p className="text-xs text-blue-600 mt-1">Fields marked with * are required to proceed to the next step.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 px-8 md:px-10 py-6 border-t-2 border-slate-200">
        <div className="flex justify-end">
          <button
            onClick={onNext}
            disabled={!company.companyName || !company.industry || !company.contactEmail}
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              company.companyName && company.industry && company.contactEmail
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white hover:from-indigo-700 hover:via-indigo-800 hover:to-purple-800 shadow-indigo-500/40 hover:shadow-indigo-500/50'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Next: Plant Setup
          </button>
        </div>
      </div>
    </div>
  );
}