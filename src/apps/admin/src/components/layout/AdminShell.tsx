import React from "react";

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Background is handled by body in index.css */}
      {children}
    </div>
  );
};
