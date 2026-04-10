import React from "react";
import { ReviewItem } from "../../../../../types";
import { Play, Send, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";

export const DeliveryHistoryPanel = ({ item }: { item: ReviewItem }) => {
  const history = [...item.history];
  
  // Ensure execution and delivery are represented if status reached
  const hasExecuted = history.some(h => h.action === "executed");
  const hasDelivered = history.some(h => h.action === "delivered");
  
  if (item.status === "executed" && !hasExecuted) {
    history.push({
      action: "executed",
      actor: "System Engine",
      timestamp: item.timestamp // Fallback timestamp
    });
  }
  
  if (item.status === "delivered" && !hasDelivered) {
    if (!hasExecuted && item.status === "delivered") {
      history.push({
        action: "executed",
        actor: "System Engine",
        timestamp: item.timestamp
      });
    }
    history.push({
      action: "delivered",
      actor: "Governance Service",
      timestamp: new Date().toISOString()
    });
  }

  return (
    <div className="space-y-8">
      {history.map((h, i) => {
        let Icon = Clock;
        let iconColor = "text-slate-400";
        let bgColor = "bg-slate-50";
        
        const action = h.action.toLowerCase();
        if (action === "approved") { Icon = CheckCircle2; iconColor = "text-emerald-500"; bgColor = "bg-emerald-50"; }
        if (action === "rejected") { Icon = XCircle; iconColor = "text-rose-500"; bgColor = "bg-rose-50"; }
        if (action === "executed") { Icon = Play; iconColor = "text-amber-500"; bgColor = "bg-amber-50"; }
        if (action === "delivered") { Icon = Send; iconColor = "text-pastel-purple"; bgColor = "bg-pastel-purple/5"; }
        if (action === "created") { Icon = ShieldCheck; iconColor = "text-indigo-500"; bgColor = "bg-indigo-50"; }

        return (
          <div key={i} className="flex gap-6 relative">
            {i !== history.length - 1 && (
              <div className="absolute left-[13px] top-8 bottom-[-32px] w-[1px] bg-pink-100" />
            )}
            <div className={`w-7 h-7 rounded-xl ${bgColor} border border-pink-100 shadow-sm flex items-center justify-center z-10`}>
              <Icon size={14} className={iconColor} />
            </div>
            <div>
              <p className="text-sm font-bold capitalize text-midnight">{h.action}</p>
              <p className="text-[11px] text-pastel-pink mt-0.5 font-medium">{h.actor} • {new Date(h.timestamp).toLocaleString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
