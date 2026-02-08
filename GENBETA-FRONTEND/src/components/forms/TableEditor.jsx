import { useState, useEffect } from "react";

export default function TableEditor({ tableConfig = {}, onChange }) {
  const [rows, setRows] = useState(tableConfig.rows || 2);
  const [columns, setColumns] = useState(tableConfig.columns || 2);
  const [headings, setHeadings] = useState(tableConfig.headings || []);

  useEffect(() => {
    // Initialize headings array if needed
    if (headings.length < columns) {
      const newHeadings = [...headings];
      while (newHeadings.length < columns) {
        newHeadings.push("");
      }
      setHeadings(newHeadings);
    } else if (headings.length > columns) {
      setHeadings(headings.slice(0, columns));
    }
  }, [columns]);

  useEffect(() => {
    onChange({
      rows,
      columns,
      headings
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, columns, headings]);

  const updateHeading = (index, value) => {
    const updated = [...headings];
    updated[index] = value;
    setHeadings(updated);
  };

  return (
    <div className="ml-4 mt-2 space-y-3 p-3 bg-gray-50 rounded">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Number of Rows:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value) || 1)}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Columns:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={columns}
            onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
            className="border p-2 w-full rounded"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Column Headings:</label>
        <div className="space-y-2">
          {headings.map((heading, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Column ${index + 1} heading`}
              value={heading}
              onChange={(e) => updateHeading(index, e.target.value)}
              className="border p-2 w-full rounded"
            />
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Preview: {rows} rows × {columns} columns
      </div>
    </div>
  );
}

