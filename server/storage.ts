import { Sub, InsertSub, Message, InsertMessage, User, InsertUser } from "@shared/schema";
import { INITIAL_SUBS } from "../client/src/lib/data";

// Interface for storage operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Sub methods
  getSub(id: number): Promise<Sub | undefined>;
  getAllSubs(): Promise<Sub[]>;
  createSub(sub: InsertSub): Promise<Sub>;
  updateSub(id: number, sub: Partial<InsertSub>): Promise<Sub | undefined>;
  deleteSub(id: number): Promise<boolean>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBySubId(subId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Initialize data
  initializeData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subs: Map<number, Sub>;
  private messages: Map<number, Message>;
  private userCurrentId: number;
  private subCurrentId: number;
  private messageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.subs = new Map();
    this.messages = new Map();
    this.userCurrentId = 1;
    this.subCurrentId = 1;
    this.messageCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Sub methods
  async getSub(id: number): Promise<Sub | undefined> {
    return this.subs.get(id);
  }
  
  async getAllSubs(): Promise<Sub[]> {
    return Array.from(this.subs.values());
  }
  
  async createSub(insertSub: InsertSub): Promise<Sub> {
    const id = this.subCurrentId++;
    const createdAt = new Date();
    const sub: Sub = { ...insertSub, id, createdAt };
    this.subs.set(id, sub);
    return sub;
  }
  
  async updateSub(id: number, updateData: Partial<InsertSub>): Promise<Sub | undefined> {
    const sub = this.subs.get(id);
    if (!sub) return undefined;
    
    const updatedSub: Sub = { ...sub, ...updateData };
    this.subs.set(id, updatedSub);
    return updatedSub;
  }
  
  async deleteSub(id: number): Promise<boolean> {
    return this.subs.delete(id);
  }
  
  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesBySubId(subId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.subId === subId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const createdAt = new Date();
    const message: Message = { ...insertMessage, id, createdAt };
    this.messages.set(id, message);
    return message;
  }
  
  // Initialize with default data
  async initializeData(): Promise<void> {
    // Check if we already have subs
    if (this.subs.size === 0) {
      // Add initial subs
      for (const subData of INITIAL_SUBS) {
        await this.createSub(subData);
      }
      console.log(`Initialized storage with ${INITIAL_SUBS.length} subs`);
    }
  }
}

export const storage = new MemStorage();
