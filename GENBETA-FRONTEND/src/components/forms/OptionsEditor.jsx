import { useState, useEffect } from "react";

export default function OptionsEditor({ options = [], onChange }) {
  const [numberOfOptions, setNumberOfOptions] = useState(options.length || 2);

  useEffect(() => {
    if (numberOfOptions > options.length) {
      // Add empty options
      const newOptions = [...options];
      while (newOptions.length < numberOfOptions) {
        newOptions.push("");
      }
      onChange(newOptions);
    } else if (numberOfOptions < options.length) {
      // Remove excess options
      onChange(options.slice(0, numberOfOptions));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfOptions]);

  const updateOption = (i, value) => {
    const updated = [...options];
    updated[i] = value;
    onChange(updated);
  };

  return (
    <div className="ml-4 mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Number of Options:</label>
        <input
          type="number"
          min="1"
          max="20"
          value={numberOfOptions}
          onChange={(e) => setNumberOfOptions(parseInt(e.target.value) || 1)}
          className="border p-1 w-20 rounded"
        />
      </div>
      <div className="space-y-1">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="border p-2 flex-1 rounded"
              placeholder={`Option ${i + 1} label`}
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
            />
            <button
              onClick={() => {
                const filtered = options.filter((_, idx) => idx !== i);
                setNumberOfOptions(filtered.length);
                onChange(filtered);
              }}
              className="text-red-600 hover:text-red-800 px-2"
              type="button"
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
