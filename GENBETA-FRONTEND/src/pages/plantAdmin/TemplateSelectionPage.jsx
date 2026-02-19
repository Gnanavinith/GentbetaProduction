import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, ArrowLeft } from "lucide-react";
import { templateApi } from "../../api/template.api";
import { formApi } from "../../api/form.api";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import { toast } from "react-hot-toast";

export default function TemplateSelectionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [templateFeatureEnabled, setTemplateFeatureEnabled] = useState(false);

  useEffect(() => {
    if (user?.role !== "PLANT_ADMIN") {
      toast.error("Access denied. Form creation is only available to plant admins.");
      navigate("/plant/forms");
      return;
    }
    checkTemplateFeatureStatus();
    fetchTemplates();
  }, []);

  const checkTemplateFeatureStatus = async () => {
    if (user?.role !== "PLANT_ADMIN" || !user?.plantId) {
      setTemplateFeatureEnabled(false);
      return;
    }
    
    try {
      const response = await api.get("/api/plants/my-plant");
      if (response && response.data) {
        const plant = response.data.plant;
        const company = response.data.company;
        
        let enabled = false;
        if (plant.templateFeatureEnabled !== null && plant.templateFeatureEnabled !== undefined) {
          enabled = plant.templateFeatureEnabled;
        } else {
          enabled = company?.templateFeatureEnabled || false;
        }
        
        setTemplateFeatureEnabled(enabled);
      }
    } catch (err) {
      console.error("Failed to check template feature status:", err);
      setTemplateFeatureEnabled(false);
      navigate("/plant/forms");
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const [templatesRes, formsRes] = await Promise.all([
        templateApi.getTemplates(),
        formApi.getForms()
      ]);

      const legacyTemplates = templatesRes.success ? templatesRes.data : (Array.isArray(templatesRes) ? templatesRes : []);
      const modernTemplates = formsRes.success 
        ? formsRes.data.filter(f => f.isTemplate && f.status === "PUBLISHED")
        : [];

      const allTemplates = [
        ...legacyTemplates.map(t => ({ ...t, isLegacy: true, name: t.templateName })),
        ...modernTemplates.map(t => ({ ...t, isLegacy: false, name: t.formName }))
      ];

      setTemplates(allTemplates);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t =>
    (t.name || t.templateName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = (template) => {
    if (template.isLegacy) {
      navigate(`/plant/forms/create?template=${template._id}&isTemplate=true`);
    } else {
      navigate(`/plant/forms/create?fromTemplate=${template._id}&isTemplate=true`);
    }
  };

  const [showNameModal, setShowNameModal] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);

  const handleCreateBlank = () => {
    setShowNameModal(true);
    setIsTemplate(false); // By default, creating a regular form
  };

  const handleCreateBlankAsTemplate = () => {
    setShowNameModal(true);
    setIsTemplate(true); // Creating as a template
  };

  const handleConfirmCreate = () => {
    if (!newFormName.trim()) {
      toast.error("Please enter a form name");
      return;
    }
    
    const encodedName = encodeURIComponent(newFormName.trim());
    navigate(`/plant/forms/create?name=${encodedName}${isTemplate ? '&isTemplate=true' : ''}`);
    setShowNameModal(false);
    setNewFormName("");
  };

  const handleCancelCreate = () => {
    setShowNameModal(false);
    setNewFormName("");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/plant/forms")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Forms
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">New</h1>
            <p className="text-gray-600">
              {templateFeatureEnabled 
                ? "Choose a new form design or start from an existing template." 
                : "Choose a new form design to get started."}
            </p>
          </div>

          {/* New form design - Blank */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">New form design</h2>
            <button
              onClick={handleCreateBlank}
              className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <FileText className="w-8 h-8 text-gray-400 group-hover:text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Blank form</h2>
                <p className="text-sm text-gray-500">Start from scratch</p>
              </div>
            </button>
          </div>

          {/* Create as Template */}
          {templateFeatureEnabled && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">New template</h2>
              <button
                onClick={handleCreateBlankAsTemplate}
                className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-purple-500 hover:bg-purple-50/30 transition-all group"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <FileText className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Blank template</h2>
                  <p className="text-sm text-gray-500">Create as a reusable template</p>
                </div>
              </button>
            </div>
          )}

          {/* Existing template design */}
          {templateFeatureEnabled && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Existing template design</h2>
              <>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for saved templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                        <div className="h-12 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved templates found</h3>
                    <p className="text-gray-500">
                      {searchTerm ? "Try adjusting your search" : "No saved templates are available yet"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTemplates.map((template) => (
                      <button
                        key={template._id}
                        onClick={() => handleSelectTemplate(template)}
                        className="bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-500 hover:shadow-lg transition-all text-left group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                            <FileText className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 truncate">
                              {template.name || template.templateName}
                            </h3>
                            {template.description && (
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            </div>
          )}
        </div>
      </div>

      {/* Name Input Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isTemplate ? "Create New Template" : "Create New Form"}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {isTemplate 
                  ? "Enter a name for your new template"
                  : "Enter a name for your new form"}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isTemplate ? "Template Name" : "Facility"}
                  </label>
                  <input
                    type="text"
                    value={newFormName}
                    onChange={(e) => setNewFormName(e.target.value)}
                    placeholder={isTemplate ? "e.g., Safety Inspection Template" : "e.g., Daily Safety Checklist"}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleConfirmCreate()}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancelCreate}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmCreate}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Create {isTemplate ? "Template" : "Form"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
