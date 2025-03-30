import { Sub, InsertSub, Message, InsertMessage, User, InsertUser } from "@shared/schema";
import { INITIAL_SUBS } from "../client/src/lib/data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
  private persistentVideoUrls: Map<number, string>; // Store video URLs persistently

  constructor() {
    this.users = new Map();
    this.subs = new Map();
    this.messages = new Map();
    this.userCurrentId = 1;
    this.subCurrentId = 1;
    this.messageCurrentId = 1;
    
    // Initialize persistent video URLs map
    this.persistentVideoUrls = new Map();
    
    // Get the path to the storage file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const storageFile = path.join(__dirname, '../data/video-urls.json');
    
    // Create data directory if it doesn't exist
    try {
      const dataDir = path.dirname(storageFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log(`Created data directory at: ${dataDir}`);
      }
      
      // Try to load previously saved video URLs
      if (fs.existsSync(storageFile)) {
        const stored = fs.readFileSync(storageFile, 'utf-8');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert object to Map with numeric keys
          Object.entries(parsed).forEach(([key, value]) => {
            this.persistentVideoUrls.set(parseInt(key), value as string);
          });
          console.log(`Loaded ${this.persistentVideoUrls.size} persisted video URLs from ${storageFile}`);
        }
      }
    } catch (error) {
      console.error("Error loading persisted video URLs:", error);
      this.persistentVideoUrls = new Map();
    }
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
    // Ensure isAdmin is always a boolean
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: insertUser.isAdmin ?? false 
    };
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
    // Ensure all required fields are present with proper types
    const sub: Sub = { 
      ...insertSub, 
      id, 
      createdAt,
      videoUrl: insertSub.videoUrl ?? null,
      avatarUrl: insertSub.avatarUrl ?? null,
      voiceFile: insertSub.voiceFile ?? null,
      bgColor: insertSub.bgColor ?? "#7D4F50"
    };
    this.subs.set(id, sub);
    return sub;
  }
  
  async updateSub(id: number, updateData: Partial<InsertSub>): Promise<Sub | undefined> {
    const sub = this.subs.get(id);
    if (!sub) return undefined;
    
    const updatedSub: Sub = { ...sub, ...updateData };
    this.subs.set(id, updatedSub);
    
    // If videoUrl is updated, save it to persistent storage
    if (updateData.videoUrl !== undefined) {
      // If videoUrl is null, remove from persistent storage, otherwise add it
      if (updateData.videoUrl === null) {
        this.persistentVideoUrls.delete(id);
      } else {
        this.persistentVideoUrls.set(id, updateData.videoUrl);
      }
      
      // Save to persistent storage
      try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const storageFile = path.join(__dirname, '../data/video-urls.json');
        
        const persistentObj = Object.fromEntries(this.persistentVideoUrls);
        fs.writeFileSync(storageFile, JSON.stringify(persistentObj, null, 2), 'utf-8');
        console.log(`Saved video URL for sub #${id} to persistent storage at ${storageFile}`);
      } catch (error) {
        console.error("Error saving video URL to persistent storage:", error);
      }
    }
    
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
    // Make sure to handle the optional audioUrl field
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt,
      audioUrl: (insertMessage as any).audioUrl || null // Handle the audioUrl field if it exists
    };
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
      
      // Apply any persisted video URLs to the subs
      let videoUrlsRestored = 0;
      
      // Manually iterate through Map keys and values
      this.persistentVideoUrls.forEach((videoUrl, id) => {
        const sub = this.subs.get(id);
        if (sub) {
          sub.videoUrl = videoUrl;
          this.subs.set(id, sub);
          videoUrlsRestored++;
        }
      });
      
      if (videoUrlsRestored > 0) {
        console.log(`Restored ${videoUrlsRestored} video URLs from persistent storage`);
      }
    }
  }
}

export const storage = new MemStorage();
