import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import OpenAI from "openai";
import path from "path";
import fs from "fs/promises";
import * as fsSync from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { insertSubSchema, insertMessageSchema } from "@shared/schema";
import { generateVoiceResponse } from "./lib/elevenlabs";

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

// Function to verify and fix video paths
const verifyAndFixVideoPaths = async () => {
  try {
    // Path to the video URLs file
    const videoUrlsFile = path.join(__dirname, '../data/video-urls.json');
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, '../data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Check if the file exists
    let videoUrls: Record<string, string> = {};
    try {
      const videoUrlsData = await fs.readFile(videoUrlsFile, 'utf-8');
      videoUrls = JSON.parse(videoUrlsData);
      console.log(`Loaded ${Object.keys(videoUrls).length} persisted video URLs from ${videoUrlsFile}`);
    } catch (error) {
      console.log("No existing video URLs file, will create new one.");
    }
    
    // Special handling for known problematic videos (like Socrates ID 4)
    const problematicVideos = {
      "4": {
        name: "Socrates",
        expectedPath: "/uploads/1743266807805-173402907-Teacher Socrets.mp4"
      },
      "14": {
        name: "John Lennon",
        expectedPath: "/uploads/1743266967223-336437809-Teacher Lennon.mp4"
      },
      "17": {
        name: "Janis Joplin",
        expectedPath: "/uploads/1743267036717-929957909-Teacher Joplin.mp4"
      }
    };
    
    // Force fix for problematic videos
    Object.entries(problematicVideos).forEach(([id, info]) => {
      if (videoUrls[id] !== info.expectedPath) {
        console.log(`Fixing video path for ${info.name} (ID: ${id}): ${info.expectedPath}`);
        videoUrls[id] = info.expectedPath;
      }
    });
    
    // Get all subs
    const subs = await storage.getAllSubs();
    
    // Check each sub's video URL
    for (const sub of subs) {
      if (sub.videoUrl) {
        // Check if the video exists
        const videoPath = path.join(__dirname, '..', sub.videoUrl);
        try {
          // Check if file exists and is accessible
          await fs.access(videoPath, fsSync.constants.F_OK);
        } catch (error) {
          console.warn(`Video file not found for sub ${sub.id}: ${sub.videoUrl}`);
          
          // Check if we have a fallback URL in our map
          const subIdStr = sub.id.toString();
          if (videoUrls[subIdStr]) {
            console.log(`Restoring video URL for sub ${sub.id} from map: ${videoUrls[subIdStr]}`);
            await storage.updateSub(sub.id, { videoUrl: videoUrls[subIdStr] });
          }
        }
      }
      
      // Update our map if necessary
      const subIdStr = sub.id.toString();
      if (sub.videoUrl && (!videoUrls[subIdStr] || videoUrls[subIdStr] !== sub.videoUrl)) {
        console.log(`Updating video URL map for sub ${sub.id}: ${sub.videoUrl}`);
        videoUrls[subIdStr] = sub.videoUrl;
      }
    }
    
    // Save updated video URLs map
    await fs.writeFile(videoUrlsFile, JSON.stringify(videoUrls, null, 2), 'utf-8');
    console.log("Video URLs file updated successfully.");
  } catch (error) {
    console.error("Error verifying video paths:", error);
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

// Configure multer for voice uploads
const voice_storage_multer = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Use the voices subdirectory
    const voicesDir = path.join(uploadDir, 'voices');
    // Ensure the voices directory exists
    fs.mkdir(voicesDir, { recursive: true }).then(() => {
      cb(null, voicesDir);
    }).catch(err => {
      cb(err, '');
    });
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

const uploadVoice = multer({
  storage: voice_storage_multer,
  // No file size limit - allow files of any size
  fileFilter: (_req, file, cb) => {
    // Check for MP3 or audio types
    if (file.mimetype === 'audio/mpeg' || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure upload directory exists
  await ensureUploadDir();
  
  // Verify and fix video paths
  await verifyAndFixVideoPaths();

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
1. Keep responses extremely concise - just ONE PARAGRAPH or at most one and a half paragraphs
2. Use a warm, friendly tone that matches your historical personality
3. Start with a direct answer before briefly elaborating
4. Include one brief interesting fact or perspective
5. Avoid all lengthy explanations and academic language
6. Use simple, conversational language as if speaking to a friend
7. If relevant, include your famous quote very briefly
8. End with a short question to encourage conversation
9. Maintain a casual, accessible speaking style
10. Aim for responses that would sound natural in speech (30-60 seconds when spoken)

Remember: This is a casual chat, not a lecture. Be brief, warm, and engaging.`;

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
      
      // Get the voice file directly from the sub if available
      let audioUrl = sub.voiceFile || '';
      
      // If no existing voice file, try to generate one with ElevenLabs (if API key available)
      if (!audioUrl && process.env.ELEVENLABS_API_KEY) {
        try {
          audioUrl = await generateVoiceResponse(aiResponse, sub.name, messageData.subId);
          console.log(`Generated audio response for ${sub.name}: ${audioUrl}`);
        } catch (audioError) {
          console.error('Error generating audio response:', audioError);
          // Continue without audio if there's an error
        }
      } else if (!audioUrl) {
        console.log(`No voice file available for ${sub.name} and no ElevenLabs API key configured`);
      }
      
      // Save the message with the AI response and audio URL
      const completeMessage = {
        ...messageData,
        aiResponse,
        audioUrl // The schema doesn't have this field yet, but it will be stored
      };
      
      const savedMessage = await storage.createMessage(completeMessage);
      
      // Add the audio URL to the response
      const responseWithAudio = {
        ...savedMessage,
        audioUrl
      };
      
      res.status(201).json(responseWithAudio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // GET generate audio for text
  app.get('/api/voice', async (req, res) => {
    try {
      // Check if we have ElevenLabs API key configured
      if (!process.env.ELEVENLABS_API_KEY) {
        return res.status(503).json({ 
          message: "Voice generation is not available - ELEVENLABS_API_KEY is not configured", 
          missingApiKey: true
        });
      }
      
      const text = req.query.text as string;
      const figureName = req.query.figure as string;
      const subId = req.query.subId ? parseInt(req.query.subId as string) : undefined;
      
      if (!text || !figureName) {
        return res.status(400).json({ message: "Missing required parameters: text and figure" });
      }
      
      // If a subId is provided, check if the sub has a custom voice file
      if (subId) {
        const { storage } = await import('./storage');
        const sub = await storage.getSub(subId);
        if (sub?.voiceFile) {
          // Return the existing voice file instead of generating a new one
          return res.json({ audioUrl: sub.voiceFile });
        }
      }
      
      // Generate new voice response with ElevenLabs
      const audioUrl = await generateVoiceResponse(text, figureName, subId);
      
      if (!audioUrl) {
        return res.status(500).json({ message: "Failed to generate voice response" });
      }
      
      res.json({ audioUrl });
    } catch (error) {
      console.error("Error generating voice:", error);
      res.status(500).json({ message: "Failed to generate voice response" });
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
        
        // Also update our video URL map
        try {
          const videoUrlsFile = path.join(__dirname, '../data/video-urls.json');
          let videoUrls: Record<string, string> = {};
          
          try {
            const videoUrlsData = await fs.readFile(videoUrlsFile, 'utf-8');
            videoUrls = JSON.parse(videoUrlsData);
          } catch (error) {
            console.log("No existing video URLs file when uploading, will create new one.");
          }
          
          // Update the map
          videoUrls[subId.toString()] = videoUrl;
          
          // Save updated map
          await fs.writeFile(videoUrlsFile, JSON.stringify(videoUrls, null, 2), 'utf-8');
          console.log(`Updated video URL map for sub ${subId}: ${videoUrl}`);
        } catch (mapError) {
          console.error("Error updating video URL map:", mapError);
          // Continue even if this fails
        }
        
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

  // POST upload voice for a sub
  app.post('/api/subs/:id/upload-voice', async (req, res) => {
    // Create a single instance of multer for this request
    const uploadHandler = uploadVoice.single('voice');
    
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
          return res.status(400).json({ message: "No voice file uploaded" });
        }
        
        console.log(`Voice file uploaded successfully: ${file.filename}, size: ${file.size} bytes`);
        
        // Get the sub
        const sub = await storage.getSub(subId);
        if (!sub) {
          return res.status(404).json({ message: "Sub not found" });
        }
        
        // Generate a relative URL to the voice file
        const voiceFile = `/uploads/voices/${file.filename}`;
        
        // Update the sub with the voice file URL
        const updatedSub = await storage.updateSub(subId, { voiceFile });
        
        if (!updatedSub) {
          return res.status(500).json({ message: "Failed to update sub with voice file URL" });
        }
        
        console.log(`Successfully updated Sub #${subId} with voice file URL: ${voiceFile}`);
        res.json(updatedSub);
      } catch (error) {
        console.error("Error processing voice upload:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: `Upload processing error: ${errorMessage}` });
      }
    });
  });

  // Initialize the storage with initial subs data if empty
  await storage.initializeData();

  const httpServer = createServer(app);
  return httpServer;
}
