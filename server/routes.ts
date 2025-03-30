import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import OpenAI from "openai";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { fileURLToPath } from "url";
import { insertSubSchema, insertMessageSchema } from "@shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup video upload directory
const uploadDir = path.join(__dirname, '../uploads');
const ensureUploadDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`Upload directory created/verified at: ${uploadDir}`);
  } catch (error) {
    console.error("Error creating upload directory:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to create upload directory: ${errorMessage}`);
  }
};

// Setup OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-demo-key",
});

// Configure multer for video uploads
const storage_multer = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage_multer,
  // No file size limit - allow files of any size
  fileFilter: (_req, file, cb) => {
    // Check for MP4 specifically or any video type
    if (file.mimetype === 'video/mp4' || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure upload directory exists
  await ensureUploadDir();

  // GET all subs
  app.get('/api/subs', async (_req, res) => {
    try {
      const subs = await storage.getAllSubs();
      res.json(subs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subs" });
    }
  });

  // GET sub by ID
  app.get('/api/subs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sub = await storage.getSub(id);
      
      if (!sub) {
        return res.status(404).json({ message: "Sub not found" });
      }
      
      res.json(sub);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sub" });
    }
  });

  // POST create new sub
  app.post('/api/subs', async (req, res) => {
    try {
      const subData = insertSubSchema.parse(req.body);
      const sub = await storage.createSub(subData);
      res.status(201).json(sub);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sub data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sub" });
    }
  });

  // PATCH update sub
  app.patch('/api/subs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subData = insertSubSchema.partial().parse(req.body);
      const sub = await storage.updateSub(id, subData);
      
      if (!sub) {
        return res.status(404).json({ message: "Sub not found" });
      }
      
      res.json(sub);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sub data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sub" });
    }
  });

  // DELETE sub
  app.delete('/api/subs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSub(id);
      
      if (!success) {
        return res.status(404).json({ message: "Sub not found" });
      }
      
      res.json({ message: "Sub deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sub" });
    }
  });

  // GET messages for a sub
  app.get('/api/subs/:id/messages', async (req, res) => {
    try {
      const subId = parseInt(req.params.id);
      const messages = await storage.getMessagesBySubId(subId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // POST send message to sub
  app.post('/api/messages', async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Get the sub to access their prompt
      const sub = await storage.getSub(messageData.subId);
      if (!sub) {
        return res.status(404).json({ message: "Sub not found" });
      }

      // Enhance the prompt to make responses more conversational but still educational
      const enhancedPrompt = `${sub.prompt}

IMPORTANT CONVERSATION GUIDELINES:
1. Keep responses conversational, brief (2-3 short paragraphs max), and engaging
2. Use a warm, friendly tone that matches your historical personality
3. Start with a direct answer before elaborating
4. Include one interesting fact or perspective that demonstrates your expertise
5. Avoid lengthy explanations or academic-style responses
6. If you have a famous quote related to the question, consider including it briefly
7. Use analogies to make complex concepts accessible
8. End with a brief question or invitation to continue the conversation
9. Maintain an 8th-grade reading level for accessibility
10. Aim for responses that would work well in both text and spoken form

Remember: You are having a casual conversation, not delivering a lecture.`;

      // Generate AI response using OpenAI
      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: enhancedPrompt
          },
          {
            role: "user",
            content: messageData.userMessage
          }
        ],
        temperature: 0.8 // Slightly increased for more conversational variety
      });

      // Extract the AI response from OpenAI
      const aiResponse = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
      
      // Save the message with the AI response
      const completeMessage = {
        ...messageData,
        aiResponse
      };
      
      const savedMessage = await storage.createMessage(completeMessage);
      res.status(201).json(savedMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // POST upload video for a sub
  app.post('/api/subs/:id/upload', async (req, res) => {
    // Create a single instance of multer for this request
    const uploadHandler = upload.single('video');
    
    // Handle multer errors explicitly
    uploadHandler(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          return res.status(400).json({ message: `Upload error: ${err.message}` });
        }
        // An unknown error occurred
        return res.status(500).json({ message: `Unknown upload error: ${err.message}` });
      }
      
      try {
        const subId = parseInt(req.params.id);
        const file = req.file;
        
        if (!file) {
          return res.status(400).json({ message: "No video file uploaded" });
        }
        
        console.log(`File uploaded successfully: ${file.filename}, size: ${file.size} bytes`);
        
        // Get the sub
        const sub = await storage.getSub(subId);
        if (!sub) {
          return res.status(404).json({ message: "Sub not found" });
        }
        
        // Generate a relative URL to the video file
        const videoUrl = `/uploads/${file.filename}`;
        
        // Update the sub with the video URL
        const updatedSub = await storage.updateSub(subId, { videoUrl });
        
        if (!updatedSub) {
          return res.status(500).json({ message: "Failed to update sub with video URL" });
        }
        
        console.log(`Successfully updated Sub #${subId} with video URL: ${videoUrl}`);
        res.json(updatedSub);
      } catch (error) {
        console.error("Error processing video upload:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: `Upload processing error: ${errorMessage}` });
      }
    });
  });

  // Serve uploaded videos
  app.use('/uploads', express.static(uploadDir));

  // Initialize the storage with initial subs data if empty
  await storage.initializeData();

  const httpServer = createServer(app);
  return httpServer;
}
