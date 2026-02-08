import React from 'react';
import WorkflowBuilder from "../WorkflowBuilder";

export function WorkflowView({ workflow, setWorkflow }) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 p-4">
        <WorkflowBuilder workflow={workflow} setWorkflow={setWorkflow} />
      </div>
    );
}
