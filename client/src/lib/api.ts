import { apiRequest } from "./queryClient";
import { InsertSub, InsertMessage } from "@shared/schema";

// Sub endpoints
export const fetchSubs = async () => {
  const response = await fetch('/api/subs');
  if (!response.ok) {
    throw new Error('Failed to fetch subs');
  }
  return response.json();
};

export const fetchSub = async (id: string) => {
  const response = await fetch(`/api/subs/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sub');
  }
  return response.json();
};

export const createSub = async (sub: InsertSub) => {
  return apiRequest('POST', '/api/subs', sub);
};

export const updateSub = async (id: string, sub: Partial<InsertSub>) => {
  return apiRequest('PATCH', `/api/subs/${id}`, sub);
};

export const deleteSub = async (id: string) => {
  return apiRequest('DELETE', `/api/subs/${id}`);
};

// Message endpoints
export const fetchMessages = async (subId: string) => {
  const response = await fetch(`/api/subs/${subId}/messages`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
};

export const sendMessage = async (message: InsertMessage) => {
  return apiRequest('POST', '/api/messages', message);
};

// Video upload endpoint
export const uploadVideo = async (subId: string, formData: FormData) => {
  try {
    console.log(`Uploading video for sub ID: ${subId}`);
    
    const response = await fetch(`/api/subs/${subId}/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to upload video';
      
      try {
        // Try to parse as JSON first
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If not JSON, try to get as text
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (e2) {
          // Use default error message if both fail
        }
      }
      
      console.error(`Upload failed with status ${response.status}: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    console.log('Upload successful, parsing response');
    return response.json();
  } catch (error: any) {
    console.error('Video upload error:', error);
    throw new Error(error.message || 'Failed to upload video');
  }
};

// Admin endpoints
export const optimizeAllVideos = async () => {
  try {
    const response = await fetch('/api/admin/optimize-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to start video optimization';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (e2) {
          // Use default error message if both fail
        }
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error: any) {
    console.error('Video optimization error:', error);
    throw new Error(error.message || 'Failed to optimize videos');
  }
};
