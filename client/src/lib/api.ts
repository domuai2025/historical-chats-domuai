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
  const response = await fetch(`/api/subs/${subId}/upload`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to upload video');
  }
  
  return response.json();
};
