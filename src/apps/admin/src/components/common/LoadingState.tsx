import React from "react";

export const LoadingState = () => (
  <div className="animate-pulse space-y-4 p-8">
    <div className="h-8 bg-slate-100/50 rounded-xl w-1/4" />
    <div className="h-32 bg-slate-100/50 rounded-2xl w-full" />
    <div className="h-32 bg-slate-100/50 rounded-2xl w-full" />
  </div>
);
