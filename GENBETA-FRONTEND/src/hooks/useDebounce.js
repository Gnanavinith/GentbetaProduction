/**
 * useDebounce Hook
 * 
 * WHAT: Debounces a value to reduce API calls on search/input
 * WHY: Improves performance by preventing excessive API requests
 * 
 * Usage:
 * const debouncedSearch = useDebounce(searchTerm, 300);
 */
import { useState, useEffect } from "react";

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
