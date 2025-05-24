import { users, wheelItems, spinHistory, type User, type InsertUser, type WheelItem, type InsertWheelItem, type SpinHistory, type InsertSpinHistory } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wheel Items
  getWheelItems(): Promise<WheelItem[]>;
  createWheelItem(item: InsertWheelItem): Promise<WheelItem>;
  deleteWheelItem(id: number): Promise<boolean>;
  clearWheelItems(): Promise<boolean>;
  
  // Spin History
  getSpinHistory(): Promise<SpinHistory[]>;
  createSpinHistory(spin: InsertSpinHistory): Promise<SpinHistory>;
  getSpinStats(): Promise<{ totalSpins: number; lastWinner: string | null }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wheelItems: Map<number, WheelItem>;
  private spinHistory: Map<number, SpinHistory>;
  private currentUserId: number;
  private currentWheelItemId: number;
  private currentSpinId: number;

  constructor() {
    this.users = new Map();
    this.wheelItems = new Map();
    this.spinHistory = new Map();
    this.currentUserId = 1;
    this.currentWheelItemId = 1;
    this.currentSpinId = 1;
    
    // Initialize with some default items
    // this.initializeDefaultItems();
  }

  // private initializeDefaultItems() {
  //   const defaultItems = [
  //     { text: "PIZZA", color: "#FF1493" },
  //     { text: "BURGER", color: "#00FFFF" },
  //     { text: "SUSHI", color: "#FFB000" },
  //     { text: "TACOS", color: "#00FF41" }
  //   ];
    
  //   defaultItems.forEach((item, index) => {
  //     const wheelItem: WheelItem = {
  //       id: this.currentWheelItemId++,
  //       text: item.text,
  //       color: item.color,
  //       order: index
  //     };
  //     this.wheelItems.set(wheelItem.id, wheelItem);
  //   });
  // }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWheelItems(): Promise<WheelItem[]> {
    return Array.from(this.wheelItems.values()).sort((a, b) => a.order - b.order);
  }

  async createWheelItem(item: InsertWheelItem): Promise<WheelItem> {
    const id = this.currentWheelItemId++;
    const wheelItem: WheelItem = { ...item, id, order: item.order ?? 0 };
    this.wheelItems.set(id, wheelItem);
    return wheelItem;
  }

  async deleteWheelItem(id: number): Promise<boolean> {
    return this.wheelItems.delete(id);
  }

  async clearWheelItems(): Promise<boolean> {
    this.wheelItems.clear();
    return true;
  }

  async getSpinHistory(): Promise<SpinHistory[]> {
    return Array.from(this.spinHistory.values()).sort((a, b) => 
      new Date(b.spunAt).getTime() - new Date(a.spunAt).getTime()
    );
  }

  async createSpinHistory(spin: InsertSpinHistory): Promise<SpinHistory> {
    const id = this.currentSpinId++;
    const spinRecord: SpinHistory = { ...spin, id };
    this.spinHistory.set(id, spinRecord);
    return spinRecord;
  }

  async getSpinStats(): Promise<{ totalSpins: number; lastWinner: string | null }> {
    const history = await this.getSpinHistory();
    return {
      totalSpins: history.length,
      lastWinner: history.length > 0 ? history[0].result : null
    };
  }
}

export const storage = new MemStorage();
