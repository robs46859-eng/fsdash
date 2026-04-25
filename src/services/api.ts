import { ReviewItem, Delivery } from "../types";

const API_BASE = "/api/v1";

export const api = {
  getReviewQueue: async (): Promise<ReviewItem[]> => {
    const res = await fetch(`${API_BASE}/review-queue`);
    return res.json();
  },
  execute: async (id: string): Promise<ReviewItem> => {
    const res = await fetch(`${API_BASE}/execution`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },
  deliver: async (id: string, dryRun: boolean = true): Promise<Delivery> => {
    const res = await fetch(`${API_BASE}/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, dryRun }),
    });
    return res.json();
  },
  getDeliveries: async (): Promise<Delivery[]> => {
    const res = await fetch(`${API_BASE}/deliveries`);
    return res.json();
  },
  triggerVertical: async (leadId: string, verticalId: string): Promise<any> => {
    // This calls the PapaBase integration endpoint I added to the Arkham repo
    const res = await fetch(`${API_BASE}/verticals/papabase/api/leads/${leadId}/trigger/${verticalId}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!res.ok) throw new Error("Failed to trigger vertical");
    return res.json();
  },
  getWebProject: async (leadId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/verticals/papabase/api/leads/${leadId}/web-project`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    return res.json();
  },
  approveBranding: async (projectId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/verticals/papabase/api/web-projects/${projectId}/approve-branding`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    return res.json();
  },
  getDadAIState: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/verticals/papabase/api/dad-ai/state`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    return res.json();
  },
  sendDadAICommand: async (text: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/verticals/papabase/api/dad-ai/command`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ text })
    });
    return res.json();
  },
  getChiefAIState: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/verticals/papabase/api/chief-ai/state`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });
    return res.json();
  },
  sendChiefAICommand: async (text: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/verticals/papabase/api/chief-ai/command`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ text })
    });
    return res.json();
  },
  getFamilyInsights: async (role: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/verticals/papabase/api/family/insights`, {
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "X-User-Role": role
      }
    });
    return res.json();
  },
  updateBusinessName: async (name: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/verticals/papabase/api/business/customize-name`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ name })
    });
    return res.json();
  },
  importWebData: async (leadId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/verticals/papabase/api/business/import-web-data`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ lead_id: leadId })
    });
    return res.json();
  },
};
