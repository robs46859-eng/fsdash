import React from "react";

export const LoadingState = () => (
  <div className="animate-pulse space-y-4 p-8">
    <div className="h-8 w-1/4 bg-surface-container-high" />
    <div className="h-32 w-full bg-surface-container-high" />
    <div className="h-32 w-full bg-surface-container-high" />
  </div>
);
