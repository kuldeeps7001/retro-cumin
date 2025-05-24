import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWheelItemSchema, insertSpinHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Wheel Items API
  app.get("/api/wheel-items", async (req, res) => {
    try {
      const items = await storage.getWheelItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wheel items" });
    }
  });

  app.post("/api/wheel-items", async (req, res) => {
    try {
      const validated = insertWheelItemSchema.parse(req.body);
      const item = await storage.createWheelItem(validated);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid wheel item data" });
    }
  });

  app.delete("/api/wheel-items/:id", async (req, res) => {
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

  app.delete("/api/wheel-items", async (req, res) => {
    try {
      await storage.clearWheelItems();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear wheel items" });
    }
  });

  // Spin History API
  app.post("/api/spins", async (req, res) => {
    try {
      const validated = insertSpinHistorySchema.parse(req.body);
      const spin = await storage.createSpinHistory(validated);
      res.status(201).json(spin);
    } catch (error) {
      res.status(400).json({ message: "Invalid spin data" });
    }
  });

  app.get("/api/spin-stats", async (req, res) => {
    try {
      const stats = await storage.getSpinStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
