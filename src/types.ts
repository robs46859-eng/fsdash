export interface HistoryItem {
  action: string;
  actor: string;
  timestamp: string;
}

export interface ReviewItem {
  id: string;
  workflowName: string;
  stage: string;
  score: number;
  status: "pending" | "approved" | "rejected" | "needs_fix" | "executed" | "delivered";
  preview: string;
  subject: string;
  messageBody: string;
  actor: string;
  timestamp: string;
  tenant: string;
  decisionTrace: string;
  metadata: {
    workflowContext: string;
    priority: string;
    [key: string]: any;
  };
  history: HistoryItem[];
}

export interface Delivery {
  id: string;
  itemId: string;
  status: string;
  provider: string;
  timestamp: string;
  dryRun: boolean;
}
