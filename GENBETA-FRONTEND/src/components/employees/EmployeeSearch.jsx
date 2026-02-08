import { Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export const EmployeeSearch = ({ searchTerm, onSearchChange }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced search term change
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const debouncedSearch = useCallback(
    (value) => {
      const handler = setTimeout(() => {
        onSearchChange(value);
      }, 300); // 300ms debounce delay

      return () => {
        clearTimeout(handler);
      };
    },
    [onSearchChange]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSearch(value);
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50/50">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search employees..." 
          value={localSearchTerm} 
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
        />
      </div>
    </div>
  );
};