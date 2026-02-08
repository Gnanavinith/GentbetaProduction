import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Download, X } from 'lucide-react';
import PropTypes from 'prop-types';

export const ActionBar = ({ 
  selectedCount = 0, 
  onClear, 
  onExport, 
  onAssign 
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-2xl flex items-center h-14 px-4 gap-6 pointer-events-auto min-w-[400px] max-w-fit">
            {/* Left Section: Count & Text */}
            <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-medium">
                {selectedCount}
              </div>
              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                {selectedCount === 1 ? 'Template selected' : 'Templates selected'}
              </span>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <X size={14} />
                Clear
              </button>
              
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <Download size={14} />
                Export
              </button>

              <button
                onClick={onAssign}
                className="ml-2 flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Assign
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ActionBar.propTypes = {
  selectedCount: PropTypes.number,
  onClear: PropTypes.func,
  onExport: PropTypes.func,
  onAssign: PropTypes.func,
};

export default ActionBar;
