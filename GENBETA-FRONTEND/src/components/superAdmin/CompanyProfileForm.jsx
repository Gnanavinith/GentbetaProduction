import { Building2, Briefcase, Mail, MapPin, FileText, Image } from "lucide-react";

export default function CompanyProfileForm({ formData, setFormData, company }) {
  const logoUrl = formData.logoUrl ? `${formData.logoUrl}` : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Company Profile
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Logo Preview */}
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            {logoUrl ? (
              <div className="w-20 h-20 rounded-xl border-2 border-slate-200 bg-white p-2">
                <img 
                  src={logoUrl} 
                  alt={company.name} 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                <Image className="w-8 h-8" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Image size={12} className="text-indigo-500" />
              Logo URL
            </label>
            <input
              type="text"
              value={formData.logoUrl}
              onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
              placeholder="Enter logo image URL"
            />
            <p className="text-xs text-slate-500 mt-1">Paste the direct URL to your company logo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={12} className="text-indigo-500" />
              Company Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
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
              value={formData.industry}
              onChange={(e) => setFormData({...formData, industry: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300 appearance-none"
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
            value={formData.contactEmail}
            onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300"
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
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-semibold hover:border-slate-300 resize-none"
            placeholder="Enter full company address"
          />
        </div>

      </div>
    </div>
  );
}