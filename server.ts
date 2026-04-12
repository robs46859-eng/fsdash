import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT ?? 3000);
  const isProduction = process.env.NODE_ENV === "production";

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/healthz", (_req, res) => {
    res.json({
      status: "ok",
      app: "fullstack-dashboard",
      timestamp: new Date().toISOString(),
    });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`FullStack dashboard listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start FullStack dashboard server", error);
  process.exit(1);
});
