import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Mock Data
  let reviewQueue = [
    {
      id: "1",
      workflowName: "fullstack_outreach",
      stage: "first_touch",
      score: 92,
      status: "pending",
      preview: "Hi there, I noticed your company is growing rapidly and...",
      subject: "Growth opportunities for your team",
      messageBody: "Hi there,\n\nI noticed your company is growing rapidly and wanted to reach out regarding our fullstack solutions. We've helped similar teams scale their outbound operations by 40%.\n\nBest,\nFullStack Team",
      actor: "System AI",
      timestamp: new Date().toISOString(),
      tenant: "Acme Corp",
      decisionTrace: "reason_path: high_intent_signal -> positive_growth_metrics -> outreach_triggered",
      metadata: {
        workflowContext: "q2_outbound_campaign",
        priority: "high",
        dryRunFlag: true
      },
      history: [
        { action: "created", actor: "System AI", timestamp: new Date(Date.now() - 3600000).toISOString() }
      ]
    },
    {
      id: "2",
      workflowName: "fullstack_outreach",
      stage: "follow_up",
      score: 85,
      status: "approved",
      preview: "Just following up on my previous message about...",
      subject: "Re: Growth opportunities for your team",
      messageBody: "Hi again,\n\nJust following up on my previous message. I'd love to chat about how we can support your growth.\n\nBest,\nFullStack Team",
      actor: "robs46859@gmail.com",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      tenant: "Globex",
      decisionTrace: "reason_path: no_response_3d -> follow_up_sequence",
      metadata: {
        workflowContext: "q2_outbound_campaign",
        priority: "medium",
        dryRunFlag: false
      },
      history: [
        { action: "created", actor: "System AI", timestamp: new Date(Date.now() - 10000000).toISOString() },
        { action: "approved", actor: "robs46859@gmail.com", timestamp: new Date(Date.now() - 7200000).toISOString() }
      ]
    }
  ];

  let deliveries: any[] = [];

  // API Routes
  app.get("/api/review-queue", (req, res) => {
    res.json(reviewQueue);
  });

  app.post("/api/execution", (req, res) => {
    const { id } = req.body;
    const item = reviewQueue.find(i => i.id === id);
    if (item) {
      item.status = "executed";
      item.history.push({ action: "executed", actor: "robs46859@gmail.com", timestamp: new Date().toISOString() });
      res.json(item);
    } else {
      res.status(404).json({ error: "Item not found" });
    }
  });

  app.post("/api/deliver", (req, res) => {
    const { id, dryRun } = req.body;
    const item = reviewQueue.find(i => i.id === id);
    if (item && item.status === "executed") {
      const delivery = {
        id: Math.random().toString(36).substr(2, 9),
        itemId: id,
        status: "delivered",
        provider: "SendGrid",
        timestamp: new Date().toISOString(),
        dryRun: !!dryRun
      };
      deliveries.push(delivery);
      item.status = "delivered";
      item.history.push({ action: "delivered", actor: "robs46859@gmail.com", timestamp: new Date().toISOString() });
      res.json(delivery);
    } else {
      res.status(400).json({ error: "Item must be executed before delivery" });
    }
  });

  app.get("/api/deliveries", (req, res) => {
    res.json(deliveries);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
