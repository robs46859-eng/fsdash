import React from "react";

export const ErrorState = ({ error }: { error: string }) => (
  <div className="border-l-[3px] border-l-rose-400 bg-rose-500/5 p-8 text-center">
    <p className="font-display text-xs font-bold uppercase tracking-widest text-rose-300">Error</p>
    <p className="mt-2 text-sm text-rose-200/90">{error}</p>
  </div>
);
