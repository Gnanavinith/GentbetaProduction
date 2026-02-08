import { useRef, useEffect, useState } from "react";
import SignaturePadLib from "signature_pad";
import { RotateCcw, Check, User, Loader2 } from "lucide-react";
import { uploadSignature } from "../../../../api/upload.api";

export default function SignaturePad({ value, onChange, readOnly, label }) {
  const canvasRef = useRef(null);
  const sigPadRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const onChangeRef = useRef(onChange);

  // Handle various possible formats of signature data
  // Check if value is an object and try to extract URL from common properties
  let displayValue = '';
  
  console.log('SignaturePad value prop:', value, 'Type:', typeof value, 'ReadOnly:', readOnly);
  
  if (value) {
    if (typeof value === 'string') {
      displayValue = value.trim();
    } else if (typeof value === 'object') {
      // Try different possible property names for the URL
      displayValue = value.url || value.secure_url || value.data || value.value || 
                   value.link || value.image || value.signature || '';
      // If displayValue is still an object, try to extract from it
      if (typeof displayValue === 'object' && displayValue !== null) {
        displayValue = displayValue.url || displayValue.secure_url || displayValue.data || '';
      }
    }
  }
  
  // Additional handling for potential nested structures
  if (displayValue && typeof displayValue === 'object' && displayValue !== null) {
    displayValue = displayValue.url || displayValue.secure_url || displayValue.data || '';
  } else if (typeof displayValue === 'string' && displayValue.startsWith('{')) {
    // Handle case where value is a stringified object
    try {
      const parsed = JSON.parse(displayValue);
      displayValue = parsed.url || parsed.secure_url || parsed.data || '';
    } catch (e) {
      console.warn('Could not parse signature value as JSON:', e);
    }
  }
  
  console.log('SignaturePad final displayValue:', displayValue, 'For readOnly:', readOnly, 'Full value:', value);
  
  // If in read-only mode and we have a display value, check if it looks like a valid URL
  if (readOnly && displayValue) {
    const isValidUrl = displayValue.startsWith('http') || displayValue.startsWith('data:image');
    if (!isValidUrl) {
      console.warn('Potential invalid signature URL:', displayValue);
    } else {
      console.log('Valid-looking signature URL:', displayValue);
    }
  }

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (canvasRef.current && !readOnly) {
      const canvas = canvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d").scale(ratio, ratio);
      
      sigPadRef.current = new SignaturePadLib(canvas, {
        penColor: "#1e293b",
        backgroundColor: "rgba(255, 255, 255, 0)",
      });

      const handleEndStroke = async () => {
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
          try {
            setUploading(true);
            const dataUrl = sigPadRef.current.toDataURL("image/png");
            const result = await uploadSignature(dataUrl);
            onChangeRef.current?.(result.url); // Store the URL in form data
          } catch (error) {
            // Error handled silently - user can retry by clearing and redrawing
          } finally {
            setUploading(false);
          }
        }
      };

      sigPadRef.current.addEventListener("endStroke", handleEndStroke);

      return () => {
        if (sigPadRef.current) {
          sigPadRef.current.removeEventListener("endStroke", handleEndStroke);
          sigPadRef.current.off();
        }
      };
    }
  }, [readOnly]);

  const clear = () => {
    sigPadRef.current?.clear();
    onChange?.(null);
  };

  return (
    <div className="space-y-3">
      <div className={`
        relative w-full h-48 bg-white border-2 rounded-2xl overflow-hidden transition-all
        ${readOnly ? "border-slate-100 bg-slate-50/50" : "border-slate-200 focus-within:border-indigo-500 hover:border-slate-300"}
      `}>
        {readOnly && displayValue ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img 
              src={displayValue} 
              alt="Signature" 
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                console.error('Error loading signature image:', displayValue);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
              Could not load signature
            </div>
          </div>
        ) : readOnly ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
            No signature
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className={`w-full h-full cursor-crosshair ${uploading ? 'opacity-50' : ''}`}
              style={{ touchAction: "none" }}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Uploading...</span>
                </div>
              </div>
            )}
          </>
        )}

        {!readOnly && !uploading && (
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={clear}
              className="p-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
              title="Clear Signature"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}

        {displayValue && !readOnly && !uploading && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-[10px] font-bold uppercase rounded-full shadow-lg shadow-green-100 animate-in fade-in zoom-in">
            <Check size={10} /> Signed
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
        <div className="flex items-center gap-1.5">
          <User size={10} />
          {label || "Authorized Signature"}
        </div>
        {!readOnly && <span>Draw signature above</span>}
      </div>
    </div>
  );
}
