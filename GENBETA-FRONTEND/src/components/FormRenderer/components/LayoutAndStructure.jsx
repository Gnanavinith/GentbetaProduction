export default function LayoutAndStructure({ 
  field, 
  customKey, 
  renderField 
}) {
  switch (field.type) {
    case "section-header":
      return (
        <div key={customKey} className="pt-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              {field.description}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent"></div>
          </div>
        </div>
      );

    case "section-divider":
      return (
        <div key={customKey} className="my-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
      );

    case "spacer":
      return (
        <div key={customKey} style={{ height: field.height || "20px" }}></div>
      );

    case "columns-2":
      return (
        <div key={customKey} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {field.fields?.map((subField, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
              {renderField(subField, `${customKey}-sub-${idx}`)}
            </div>
          ))}
        </div>
      );

    case "columns-3":
      return (
        <div key={customKey} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {field.fields?.map((subField, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
              {renderField(subField, `${customKey}-sub-${idx}`)}
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}