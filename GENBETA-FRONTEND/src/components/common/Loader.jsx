import React from 'react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8">
      <div className="relative w-20 h-20">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        {/* Spinning Ring */}
        <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        {/* Inner Pulsing Circle */}
        <div className="absolute inset-4 bg-indigo-50 rounded-full animate-pulse flex items-center justify-center">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
        </div>
      </div>
      <p className="mt-6 text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
        Loading Assets...
      </p>
    </div>
  );
}
