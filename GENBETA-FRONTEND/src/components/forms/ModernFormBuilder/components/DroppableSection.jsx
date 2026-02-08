import React from 'react';
import { useDroppable } from "@dnd-kit/core";

export function DroppableSection({ sectionId, isPreview, children, disabled }) {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
    disabled: disabled,
    data: {
      type: "section",
      sectionId
    }
  });

  if (isPreview) return <>{children}</>;

  return (
    <div 
      ref={setNodeRef}
      className={`transition-all duration-200 rounded-xl ${isOver ? "bg-indigo-50/50 ring-2 ring-indigo-100 ring-offset-4" : ""}`}
    >
      {children}
    </div>
  );
}
