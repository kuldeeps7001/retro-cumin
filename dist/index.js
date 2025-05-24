// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  wheelItems;
  spinHistory;
  currentUserId;
  currentWheelItemId;
  currentSpinId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.wheelItems = /* @__PURE__ */ new Map();
    this.spinHistory = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentWheelItemId = 1;
    this.currentSpinId = 1;
    this.initializeDefaultItems();
  }
  initializeDefaultItems() {
    const defaultItems = [
      { text: "PIZZA", color: "#FF1493" },
      { text: "BURGER", color: "#00FFFF" },
      { text: "SUSHI", color: "#FFB000" },
      { text: "TACOS", color: "#00FF41" }
    ];
    defaultItems.forEach((item, index) => {
      const wheelItem = {
        id: this.currentWheelItemId++,
        text: item.text,
        color: item.color,
        order: index
      };
      this.wheelItems.set(wheelItem.id, wheelItem);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getWheelItems() {
    return Array.from(this.wheelItems.values()).sort((a, b) => a.order - b.order);
  }
  async createWheelItem(item) {
    const id = this.currentWheelItemId++;
    const wheelItem = { ...item, id };
    this.wheelItems.set(id, wheelItem);
    return wheelItem;
  }
  async deleteWheelItem(id) {
    return this.wheelItems.delete(id);
  }
  async clearWheelItems() {
    this.wheelItems.clear();
    return true;
  }
  async getSpinHistory() {
    return Array.from(this.spinHistory.values()).sort(
      (a, b) => new Date(b.spunAt).getTime() - new Date(a.spunAt).getTime()
    );
  }
  async createSpinHistory(spin) {
    const id = this.currentSpinId++;
    const spinRecord = { ...spin, id };
    this.spinHistory.set(id, spinRecord);
    return spinRecord;
  }
  async getSpinStats() {
    const history = await this.getSpinHistory();
    return {
      totalSpins: history.length,
      lastWinner: history.length > 0 ? history[0].result : null
    };
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var wheelItems = pgTable("wheel_items", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  color: text("color").notNull(),
  order: integer("order").notNull().default(0)
});
var spinHistory = pgTable("spin_history", {
  id: serial("id").primaryKey(),
  result: text("result").notNull(),
  spunAt: text("spun_at").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertWheelItemSchema = createInsertSchema(wheelItems).pick({
  text: true,
  color: true,
  order: true
});
var insertSpinHistorySchema = createInsertSchema(spinHistory).pick({
  result: true,
  spunAt: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/wheel-items", async (req, res) => {
    try {
      const items = await storage.getWheelItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wheel items" });
    }
  });
  app2.post("/api/wheel-items", async (req, res) => {
    try {
      const validated = insertWheelItemSchema.parse(req.body);
      const item = await storage.createWheelItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid wheel item data" });
    }
  });
  app2.delete("/api/wheel-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWheelItem(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: "Wheel item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete wheel item" });
    }
  });
  app2.delete("/api/wheel-items", async (req, res) => {
    try {
      await storage.clearWheelItems();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear wheel items" });
    }
  });
  app2.post("/api/spins", async (req, res) => {
    try {
      const validated = insertSpinHistorySchema.parse(req.body);
      const spin = await storage.createSpinHistory(validated);
      res.status(201).json(spin);
    } catch (error) {
      res.status(400).json({ message: "Invalid spin data" });
    }
  });
  app2.get("/api/spin-stats", async (req, res) => {
    try {
      const stats = await storage.getSpinStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spin stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "localhost",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
