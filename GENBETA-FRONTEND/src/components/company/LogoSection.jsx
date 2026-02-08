import { Upload, X } from "lucide-react";

export default function LogoSection({ logoPreview, handleLogoChange, removeLogo, fileInputRef }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
          <Upload size={20} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">Company Identity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Upload your company logo</p>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-200 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-100/50 hover:via-purple-100/30 hover:to-white transition-all group">
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Logo</span>
          </div>
        </div>
        {logoPreview ? (
          <div className="relative group/logo">
            <div className="p-6 bg-white rounded-2xl border-2 border-slate-200 shadow-xl group-hover/logo:shadow-2xl group-hover/logo:border-indigo-300 transition-all">
              <img 
                src={logoPreview} 
                alt="Preview" 
                className="w-48 h-48 object-contain" 
              />
            </div>
            <button 
              onClick={removeLogo}
              className="absolute -top-3 -right-3 p-2.5 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-110 transition-all"
            >
              <X size={20} />
            </button>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover/logo:opacity-100 transition-opacity">
              Current Logo
            </div>
          </div>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-5 text-slate-500 hover:text-indigo-600 transition-all w-full"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-300 group-hover:border-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <Upload size={40} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">+</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-lg font-black block text-slate-800 mb-2">Click to Upload Logo</span>
              <span className="text-sm text-slate-500 block mb-1">or drag and drop</span>
              <span className="text-xs text-slate-400">PNG, JPG or SVG • Max 2MB</span>
            </div>
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
    </div>
  );
}