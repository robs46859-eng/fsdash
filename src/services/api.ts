import { ReviewItem, Delivery } from "../types";

const API_BASE = "/api";

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
};
