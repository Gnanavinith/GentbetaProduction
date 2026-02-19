import { useState, useEffect } from "react";
import { 
  AlertTriangle,
  FileText,
  Upload,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import SignaturePad from "../../forms/ModernFacilityBuilder/components/SignaturePad";
import { uploadImage, uploadFile } from "../../../api/upload.api";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { useAuth } from "../../../context/AuthContext";

export default function SpecialFields({ 
  field, 
  customKey, 
  value, 
  error, 
  inputClasses,
  readOnly,
  update,
  files,
  setFiles,
  uploadProgress,
  setUploadProgress
}) {
  const fieldId = field.fieldId || field.id || field.name;
  const { user } = useAuth();

  // Ensure auto-user fields are populated on initial render
  useEffect(() => {
    if (field.type === "auto-user" && (!value || Object.keys(value).length === 0)) {
      // Create user data object
      const userFields = field.fields || ["name", "email", "role"];
      const userData = {};
      userFields.forEach(f => {
        switch(f) {
          case "name":
            userData.name = user?.name || "";
            break;
          case "email":
            userData.email = user?.email || "";
            break;
          case "role":
            userData.role = user?.role || "";
            break;
          case "id":
            userData.id = user?._id || "";
            break;
          case "employeeID":
            userData.employeeID = user?.employeeID || user?._id || "";
            break;
          case "department":
            userData.department = user?.department || "";
            break;
          case "phoneNumber":
            userData.phoneNumber = user?.phoneNumber || "";
            break;
          case "position":
            userData.position = user?.position || "";
            break;
          default:
            userData[f] = user?.[f] || "";
        }
      });
      
      console.log('[SpecialFields] Initial auto-user population:', fieldId, userData, 'user:', user);
      update(fieldId, userData);
      
      // Also trigger a manual update to ensure parent components get notified
      setTimeout(() => {
        console.log('[SpecialFields] Manual trigger of update for:', fieldId);
        // The update function should handle notifying parent components
      }, 100);
    }
  }, [field.type, field.fields, user, fieldId, value, update]);

  // File upload handlers
  const addFile = async (id, file) => {
    try {
      setUploadProgress(prev => ({ ...prev, [id]: 0 }));
      
      const reader = new FileReader();
      reader.onloadstart = () => {
        setUploadProgress(prev => ({ ...prev, [id]: 10 }));
      };
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.min(30 + (e.loaded / e.total) * 40, 70);
          setUploadProgress(prev => ({ ...prev, [id]: progress }));
        }
      };
      
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result;
          setUploadProgress(prev => ({ ...prev, [id]: 75 }));
          
          // Use appropriate upload function based on field type
          const uploadFunction = field.type === 'image' ? uploadImage : uploadFile;
          const uploadResponse = await uploadFunction(base64, 'submissions');
          
          // Debug: Log the upload response structure
          console.log('[SpecialFields] Upload response:', uploadResponse);
          
          setUploadProgress(prev => ({ ...prev, [id]: 100 }));
          
          setFiles(prev => ({ ...prev, [id]: { ...file, url: uploadResponse.url } }));
          update(id, uploadResponse.url);
          
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[id];
              return newProgress;
            });
          }, 1500);
          
          toast.success('File uploaded successfully!');
        } catch (error) {
          console.error('Upload error:', error);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[id];
            return newProgress;
          });
          toast.error('Failed to upload file');
        }
      };
      
      reader.onerror = () => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[id];
          return newProgress;
        });
        toast.error('Failed to read file');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file');
    }
  };

  const removeFile = (id) => {
    const newFiles = { ...files };
    delete newFiles[id];
    setFiles(newFiles);
    update(id, "");
  };

  switch (field.type) {
    case "auto-date":
      // Auto-date fields should display current date and be non-editable
      const currentDate = dayjs().format(field.format || "YYYY-MM-DD");
      
      // Auto-fill the value if it's not already set
      if (!value) {
        setTimeout(() => {
          update(fieldId, currentDate);
        }, 0);
      }
      
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              value={value || currentDate}
              readOnly
              className={`${inputClasses} bg-gray-100 cursor-not-allowed`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              Auto-filled
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "file":
    case "image":
      const isUploading = uploadProgress[fieldId] !== undefined;
      const progress = uploadProgress[fieldId] || 0;
      
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          {isUploading ? (
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="text-sm font-semibold text-indigo-900">Uploading...</span>
                </div>
                <span className="text-sm font-bold text-indigo-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-xs text-indigo-700 font-medium">
                {progress < 30 && "Reading file..."}
                {progress >= 30 && progress < 75 && "Processing..."}
                {progress >= 75 && progress < 100 && "Uploading to server..."}
                {progress === 100 && "Complete!"}
              </p>
            </div>
          ) : value ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-900 truncate max-w-xs">
                        {value.split("/").pop()}
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">Upload complete</p>
                    </div>
                  </div>
                  {!readOnly && (
                    <button
                      onClick={() => removeFile(fieldId)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {readOnly && (
                <a 
                  href={value.includes('cloudinary.com') && value.toLowerCase().includes('.pdf')
                    ? value.replace('/upload/', '/upload/f_auto/')
                    : value}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-xs text-indigo-600 hover:text-indigo-700 font-medium truncate bg-indigo-50 p-3 rounded-lg border border-indigo-200"
                >
                  View file →
                </a>
              )}
            </div>
          ) : (
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all
              ${error ? 'border-red-300 bg-red-50/30' : 'border-gray-300 bg-gray-50/50 hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="flex justify-center text-sm text-gray-600 mb-2">
                <label className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500">
                  <span>Choose {field.type === "image" ? "an image" : "a file"}</span>
                  <input
                    type="file"
                    accept={field.type === "image" ? "image/*" : "*/*"}
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        addFile(fieldId, e.target.files[0]);
                      }
                    }}
                    disabled={readOnly}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                {field.maxFileSize ? `Max ${field.maxFileSize}MB` : (field.type === "image" ? "PNG, JPG, GIF up to 10MB" : "PDF, PNG, JPG up to 10MB")}
              </p>
            </div>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "signature":
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          {readOnly && value ? (
            <div className="space-y-3">
              <div className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
                <img 
                  src={value} 
                  alt="Signature" 
                  className="max-h-32 mx-auto border-2 border-gray-300 rounded-lg bg-white p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center justify-center text-gray-500 text-sm py-8">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Unable to load signature
                </div>
              </div>
              <a 
                href={value.includes('cloudinary.com') && value.toLowerCase().includes('.pdf')
                  ? value.replace('/upload/', '/upload/f_auto/')
                  : value}
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-xs text-indigo-600 hover:text-indigo-700 font-medium truncate bg-indigo-50 p-3 rounded-lg border border-indigo-200"
              >
                View signature →
              </a>
            </div>
          ) : (
            <div className={error ? 'ring-2 ring-red-300 rounded-xl' : ''}>
              <SignaturePad
                value={value}
                onChange={(newValue) => update(fieldId, newValue)}
                disabled={readOnly}
              />
            </div>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );



    case "auto-user":
      // Auto-user fields should display user information and be non-editable
      const userFields = field.fields || ["name", "email", "role"];
      
      // Create user data object based on requested fields
      const userData = {};
      userFields.forEach(f => {
        switch(f) {
          case "name":
            userData.name = user?.name || "";
            break;
          case "email":
            userData.email = user?.email || "";
            break;
          case "role":
            userData.role = user?.role || "";
            break;
          case "id":
            userData.id = user?._id || "";
            break;
          case "employeeID":
            userData.employeeID = user?.employeeID || user?._id || "";
            break;
          case "department":
            userData.department = user?.department || "";
            break;
          case "phoneNumber":
            userData.phoneNumber = user?.phoneNumber || "";
            break;
          case "position":
            userData.position = user?.position || "";
            break;
          default:
            userData[f] = user?.[f] || "";
        }
      });
      
      console.log('[SpecialFields] Processing auto-user field:', { fieldId, userFields, userData, user });
      
      // Auto-fill the value if it's not already set or if this is the initial render
      const shouldAutoFill = !value || Object.keys(value).length === 0 || 
                            (typeof value === 'object' && Object.keys(value).length === 0);
      
      if (shouldAutoFill) {
        setTimeout(() => {
          console.log('[SpecialFields] Auto-filling auto-user field:', fieldId, userData);
          update(fieldId, userData);
          // Also notify parent directly to ensure data propagation
          if (typeof update === 'function') {
            // This should trigger the FacilityRenderer's handleChange which calls onDataChange
          }
        }, 0);
      }
      
      return (
        <div key={customKey} className="group">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
          </label>
          <div className="relative">
            <div className="p-3 bg-gray-100 rounded-lg border border-gray-200">
              <div className="space-y-1 text-sm">
                {userFields
                  .filter(f => userData[f] && userData[f] !== "")
                  .map((f, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="font-medium text-gray-600 capitalize">{f}:</span>
                      <span className="text-gray-800">{userData[f]}</span>
                    </div>
                  ))
                }
                {userFields.every(f => !userData[f] || userData[f] === "") && (
                  <div className="text-gray-500 italic">No user information available</div>
                )}
              </div>
            </div>
            <div className="absolute top-2 right-2 text-xs text-gray-500">
              Auto-filled
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "terms":
      return (
        <div key={customKey} className="group">
          <div className={`flex items-start p-4 rounded-lg border-2 ${
            value ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => update(fieldId, e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={readOnly}
            />
            <div className="ml-3">
              <label className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 text-lg leading-none">*</span>}
              </label>
              {field.content && (
                <div className="mt-2 text-sm text-gray-600 prose prose-sm max-w-none">
                  {field.content}
                </div>
              )}
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}