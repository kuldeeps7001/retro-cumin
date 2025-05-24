import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const wheelItems = pgTable("wheel_items", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  color: text("color").notNull(),
  order: integer("order").notNull().default(0),
});

export const spinHistory = pgTable("spin_history", {
  id: serial("id").primaryKey(),
  result: text("result").notNull(),
  spunAt: text("spun_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWheelItemSchema = createInsertSchema(wheelItems).pick({
  text: true,
  color: true,
  order: true,
});

export const insertSpinHistorySchema = createInsertSchema(spinHistory).pick({
  result: true,
  spunAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WheelItem = typeof wheelItems.$inferSelect;
export type InsertWheelItem = z.infer<typeof insertWheelItemSchema>;
export type SpinHistory = typeof spinHistory.$inferSelect;
export type InsertSpinHistory = z.infer<typeof insertSpinHistorySchema>;
