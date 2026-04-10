import React, { useState } from "react";
import { Users, Shield, Globe, MoreVertical, Plus, Search } from "lucide-react";
import { StatusBadge } from "../components/common/StatusBadge";

const mockTenants = [
  { id: "acme-corp", name: "Acme Corp", domain: "acme.com", status: "active", users: 124, region: "US-East" },
  { id: "globex", name: "Globex", domain: "globex.io", status: "active", users: 89, region: "EU-West" },
  { id: "soylent", name: "Soylent Corp", domain: "soylent.com", status: "pending", users: 12, region: "US-West" },
  { id: "initech", name: "Initech", domain: "initech.net", status: "active", users: 45, region: "US-East" },
];

export const TenantsView = () => {
  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold tracking-tighter mb-3 text-midnight">Tenants</h1>
            <p className="text-pastel-purple font-medium">Manage organizational isolation and governance boundaries.</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Provision Tenant
          </button>
        </header>

        <div className="grid grid-cols-3 gap-8 mb-12">
          {[
            { label: "Total Tenants", value: "42", icon: Users, color: "text-midnight" },
            { label: "Active Nodes", value: "156", icon: Globe, color: "text-emerald-500" },
            { label: "Security Audits", value: "100%", icon: Shield, color: "text-indigo-500" },
          ].map((m, i) => (
            <div key={i} className="glass-panel p-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">{m.label}</p>
                <m.icon size={16} className="text-slate-300" />
              </div>
              <p className={`text-xl font-display font-semibold tracking-tighter ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="p-5 border-b border-slate-200/50 flex items-center justify-between bg-white/20">
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search tenants..." 
                className="pl-11 pr-5 py-2 bg-white/20 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-pastel-purple/10 w-64 text-midnight placeholder:text-slate-200"
              />
            </div>
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-8 py-4 text-[10px] font-bold text-pink-300 uppercase tracking-[0.2em]">Organization</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pink-300 uppercase tracking-[0.2em]">Domain</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pink-300 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pink-300 uppercase tracking-[0.2em]">Users</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pink-300 uppercase tracking-[0.2em]">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {mockTenants.map((tenant) => (
                  <tr key={tenant.id} className="group hover:bg-white/40 transition-all cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-100">
                          {tenant.name[0]}
                        </div>
                        <span className="text-sm font-bold text-midnight">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm text-pastel-purple font-mono">{tenant.domain}</span>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-semibold text-midnight">{tenant.users}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-pastel-pink font-bold uppercase tracking-widest">{tenant.region}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
