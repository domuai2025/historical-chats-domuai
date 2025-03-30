# The Subs AI

An innovative AI-powered educational platform that transforms historical learning through immersive, interactive conversations with significant personalities from diverse backgrounds and eras.

## Deployment Instructions

When deploying this application, follow these steps to ensure videos and other assets are correctly served:

### Before Deploying

1. Make sure your build process completes successfully
2. Run the prepare-deploy script to ensure uploads are included:
   ```
   bash scripts/prepare-deploy.sh
   ```
   This will copy your uploads directory to the dist folder

### Troubleshooting Deployment Issues

If videos don't play in the deployed version:

1. Check that the `.deployignore` file doesn't exclude the uploads directory
2. Manually copy the uploads folder to the dist folder before deployment
3. Verify that video paths in the application use the correct format:
   ```html
   <video>
     <source src="/uploads/videos/video-name.mp4" type="video/mp4" />
   </video>
   ```
   
### Large Video Files

The application supports all size MP4 files. For optimal performance:

- Socrates: 47.8MB
- John Lennon: 36.1MB
- Janis Joplin: 55.8MB

These larger files are stored in both the `/uploads/videos` folder and linked in storage.

## Development

Run the application in development mode with:

```
npm run dev
```

## Features

- Chat with historical figures using AI technology
- View detailed bios and information about each Sub
- Responsive design that works on mobile and desktop
- MP3 voice responses for authentic character interactions

## Technologies Used

- React frontend with advanced animated interfaces
- Node.js backend with AI conversational engine
- OpenAI GPT integration for natural conversations
- Voice synthesis for authentic character voices