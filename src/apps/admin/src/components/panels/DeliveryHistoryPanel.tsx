import React from "react";
import { ReviewItem } from "../../../../../types";
import { Play, Send, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";

export const DeliveryHistoryPanel = ({ item }: { item: ReviewItem }) => {
  const history = [...item.history];

  const hasExecuted = history.some((h) => h.action === "executed");
  const hasDelivered = history.some((h) => h.action === "delivered");

  if (item.status === "executed" && !hasExecuted) {
    history.push({
      action: "executed",
      actor: "System Engine",
      timestamp: item.timestamp,
    });
  }

  if (item.status === "delivered" && !hasDelivered) {
    if (!hasExecuted && item.status === "delivered") {
      history.push({
        action: "executed",
        actor: "System Engine",
        timestamp: item.timestamp,
      });
    }
    history.push({
      action: "delivered",
      actor: "Governance Service",
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <div className="space-y-8">
      {history.map((h, i) => {
        let Icon = Clock;
        let iconColor = "text-on-surface-variant";
        let bgColor = "bg-surface-container-low";
        let borderColor = "border-outline-variant/20";

        const action = h.action.toLowerCase();
        if (action === "approved") {
          Icon = CheckCircle2;
          iconColor = "text-emerald-400";
          bgColor = "bg-emerald-500/10";
          borderColor = "border-emerald-500/25";
        }
        if (action === "rejected") {
          Icon = XCircle;
          iconColor = "text-rose-400";
          bgColor = "bg-rose-500/10";
          borderColor = "border-rose-500/25";
        }
        if (action === "executed") {
          Icon = Play;
          iconColor = "text-amber-400";
          bgColor = "bg-amber-500/10";
          borderColor = "border-amber-500/25";
        }
        if (action === "delivered") {
          Icon = Send;
          iconColor = "text-primary";
          bgColor = "bg-primary/10";
          borderColor = "border-primary/25";
        }
        if (action === "created") {
          Icon = ShieldCheck;
          iconColor = "text-indigo-300";
          bgColor = "bg-indigo-500/10";
          borderColor = "border-indigo-500/25";
        }

        return (
          <div key={i} className="relative flex gap-6">
            {i !== history.length - 1 && (
              <div className="absolute bottom-[-32px] left-[13px] top-8 w-px bg-outline-variant/30" />
            )}
            <div
              className={`z-10 flex h-7 w-7 items-center justify-center border ${borderColor} ${bgColor} outline outline-1 -outline-offset-1 outline-outline-variant/10`}
            >
              <Icon size={14} className={iconColor} />
            </div>
            <div>
              <p className="text-sm font-bold capitalize text-on-surface">{h.action}</p>
              <p className="mt-0.5 text-[11px] font-medium text-primary">
                {h.actor} • {new Date(h.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
