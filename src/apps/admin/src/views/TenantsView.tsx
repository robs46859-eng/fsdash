import React from "react";
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
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">Tenants</h1>
            <p className="font-medium text-on-surface-variant">Manage organizational isolation and governance boundaries.</p>
          </div>
          <button type="button" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Provision Tenant
          </button>
        </header>

        <div className="mb-12 grid grid-cols-3 gap-8">
          {[
            { label: "Total Tenants", value: "42", icon: Users, color: "text-on-surface" },
            { label: "Active Nodes", value: "156", icon: Globe, color: "text-emerald-400" },
            { label: "Security Audits", value: "100%", icon: Shield, color: "text-indigo-300" },
          ].map((m, i) => (
            <div key={i} className="glass-panel p-8">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{m.label}</p>
                <m.icon size={16} className="text-on-surface-variant" />
              </div>
              <p className={`font-display text-xl font-semibold tracking-tight ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-low p-5">
            <div className="group relative">
              <Search size={16} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search tenants..."
                className="w-64 border-0 border-b-2 border-outline/40 bg-transparent py-2 pl-8 text-xs text-on-surface outline-none transition-colors duration-150 placeholder:text-on-surface-variant/50 focus:border-primary"
              />
            </div>
            <button
              type="button"
              className="p-2.5 text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high"
            >
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Organization</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Domain</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Users</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {mockTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="group cursor-pointer transition-colors duration-150 hover:bg-surface-container-low/60"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center border border-outline-variant/15 bg-surface-container-high text-xs font-bold text-on-surface-variant">
                          {tenant.name[0]}
                        </div>
                        <span className="text-sm font-bold text-on-surface">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono text-sm text-primary">{tenant.domain}</span>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={tenant.status} />
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-semibold text-on-surface">{tenant.users}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">{tenant.region}</span>
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
