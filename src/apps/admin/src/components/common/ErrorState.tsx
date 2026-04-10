import React from "react";

export const ErrorState = ({ error }: { error: string }) => (
  <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center">
    <p className="text-rose-600 font-bold uppercase tracking-widest text-xs">Error</p>
    <p className="text-rose-500 text-sm mt-2">{error}</p>
  </div>
);
