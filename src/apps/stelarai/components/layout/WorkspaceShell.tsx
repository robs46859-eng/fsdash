import React from "react";

export const WorkspaceShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden relative bg-surface">
      {children}
    </div>
  );
};
