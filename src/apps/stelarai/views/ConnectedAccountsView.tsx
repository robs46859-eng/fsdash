import React, { useEffect, useState } from "react";
import { WalletCards, Plus, Shield, ShieldAlert, Trash2, ExternalLink } from "lucide-react";
import { StatusBadge } from "../../admin/src/components/common/StatusBadge";
import { LoadingState } from "../../admin/src/components/common/LoadingState";
import { ErrorState } from "../../admin/src/components/common/ErrorState";
import { 
  fetchStelaraiWorkspaces, 
  fetchStelaraiWorkspaceAccounts,
  createStelaraiWorkspaceAccount,
  updateStelaraiAccount,
  deleteStelaraiAccount
} from "../api";
import type { StelaraiConnectedAccount, StelaraiWorkspace } from "../types";

export function ConnectedAccountsView() {
  const [workspaces, setWorkspaces] = useState<StelaraiWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [accounts, setAccounts] = useState<StelaraiConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStelaraiWorkspaces()
      .then(data => {
        setWorkspaces(data.workspaces);
        if (data.workspaces.length > 0) setSelectedWorkspaceId(data.workspaces[0].id);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) {
      setLoading(true);
      fetchStelaraiWorkspaceAccounts(selectedWorkspaceId)
        .then(data => setAccounts(data.accounts))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [selectedWorkspaceId]);

  async function handleAddAccount() {
    // Placeholder for real OAuth flow
    const label = prompt("Account Label (e.g. My Business Stripe):");
    if (!label) return;
    
    try {
      const newAcc = await createStelaraiWorkspaceAccount(selectedWorkspaceId, {
        provider_key: "stripe",
        account_label: label,
        connection_scope: "business",
        metadata: { placeholder: true }
      });
      setAccounts(prev => [newAcc, ...prev]);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function toggleStatus(acc: StelaraiConnectedAccount) {
    const nextStatus = acc.status === "active" ? "disabled" : "active";
    try {
      const updated = await updateStelaraiAccount(acc.id, { status: nextStatus });
      setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to disconnect this account?")) return;
    try {
      await deleteStelaraiAccount(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading && workspaces.length === 0) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-surface">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-on-surface">Connected Accounts</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Manage external business and personal account connections.</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="bg-surface-container-high px-4 py-2 rounded text-xs font-bold uppercase tracking-widest text-on-surface outline-none"
            >
              {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button 
              onClick={handleAddAccount}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} /> Connect Account
            </button>
          </div>
        </header>

        <div className="grid gap-6">
          {accounts.length === 0 ? (
            <div className="glass-panel p-20 text-center flex flex-col items-center justify-center opacity-50">
              <WalletCards size={48} strokeWidth={1} className="mb-4 text-on-surface-variant" />
              <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">No accounts connected yet.</p>
            </div>
          ) : (
            accounts.map(acc => (
              <div key={acc.id} className="glass-panel p-6 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                    acc.status === "active" ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"
                  )}>
                    {acc.connection_scope === "business" ? <Shield size={24} /> : <WalletCards size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-on-surface">{acc.account_label}</h3>
                      <StatusBadge status={acc.status} />
                    </div>
                    <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mt-1">
                      {acc.provider_key} • {acc.connection_scope} • {acc.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => toggleStatus(acc)}
                    className="px-4 py-2 rounded bg-surface-container-high text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
                  >
                    {acc.status === "active" ? "Disable" : "Enable"}
                  </button>
                  <button 
                    onClick={() => handleDelete(acc.id)}
                    className="p-2 text-on-surface-variant hover:text-error"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="w-[1px] h-4 bg-outline-variant/20 mx-1" />
                  <ExternalLink size={16} className="text-on-surface-variant cursor-not-allowed" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 p-6 bg-primary/5 border border-primary/10 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Auth Placeholder</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            In Phase 4, "Connect Account" creates a database record with a placeholder token. 
            Phase 5 will implement the full OAuth 2.0 / PKCE flow for each provider.
          </p>
        </div>
      </div>
    </div>
  );
}
