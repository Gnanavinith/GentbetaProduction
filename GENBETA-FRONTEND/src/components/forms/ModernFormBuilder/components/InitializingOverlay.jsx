import React from 'react';
import { Layout } from "lucide-react";

export function InitializingOverlay() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Layout className="text-indigo-600" size={24} />
        </div>
      </div>
      <p className="mt-6 text-slate-500 font-bold tracking-tight animate-pulse uppercase text-xs">Initializing Form Engine...</p>
    </div>
  );
}
