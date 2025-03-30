import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { fetchSub, fetchMessages, sendMessage } from "@/lib/api";
import { ChevronLeftIcon, SendIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ui/chat-message";
import { ShareButton } from "@/components/ui/share-button";
import { SpeechToTextButton } from "@/components/ui/speech-to-text-button";
import { useVideoPlayer } from "@/contexts/VideoPlayerContext";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [_, params] = useRoute("/chat/:id");
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { registerPlayer, unregisterPlayer, stopAllExcept } = useVideoPlayer();
  
  const subId = params?.id;
  
  const { data: sub, isLoading: isLoadingSub } = useQuery({
    queryKey: [`/api/subs/${subId}`],
    queryFn: () => fetchSub(subId!),
    enabled: !!subId
  });
  
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: [`/api/subs/${subId}/messages`],
    queryFn: () => fetchMessages(subId!),
    enabled: !!subId
  });
  
  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/subs/${subId}/messages`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subId) return;
    
    mutation.mutate({
      subId: parseInt(subId),
      userMessage: message,
      aiResponse: "" // This will be filled by the server
    });
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Register and unregister the video player with the context
  useEffect(() => {
    if (videoRef.current && sub?.id) {
      const playerId = parseInt(subId!);
      registerPlayer(playerId, videoRef.current);
      
      return () => {
        unregisterPlayer(playerId);
      };
    }
  }, [sub, subId, registerPlayer, unregisterPlayer]);
  
  // Handler for video play event
  const handleVideoPlay = () => {
    if (subId) {
      const playerId = parseInt(subId);
      // Stop all other videos when this one starts playing
      stopAllExcept(playerId);
    }
  };
  
  // Show loading state if data is not yet available
  if (isLoadingSub || !sub) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-burgundy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-darkbrown">Loading conversation...</p>
        </div>
      </div>
    );
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const subInitials = getInitials(sub.name);
  
  return (
    <div className="fixed inset-0 z-50 bg-cream/95 flex flex-col">
      {/* Header */}
      <header className="bg-burgundy text-cream shadow-md py-3 border-b border-gold/30">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <div className="mr-3 hover:bg-burgundy/80 p-1 rounded-full transition-colors cursor-pointer">
                <ChevronLeftIcon className="w-6 h-6" />
              </div>
            </Link>
            <div>
              <h2 className="font-serif text-xl">{sub.name}</h2>
              <p className="text-xs opacity-70 font-serif italic">{sub.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton 
              title={`Share this conversation with ${sub.name}`}
              variant="icon"
              className="text-cream hover:text-gold/90 hover:bg-burgundy/80"
            />
          </div>
        </div>
      </header>
      
      {/* Messages with Video Avatar Display */}
      <div className="flex-grow overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {/* Avatar Video Display */}
          <div className="mb-6 mx-auto max-w-lg">
            <div className="text-center mb-2">
              <h3 className="font-serif text-burgundy text-sm">
                <span className="inline-block animate-pulse mr-1">🔴</span> 
                <span className="font-bold">LIVE VIDEO AVATAR</span>
              </h3>
            </div>
            {sub.videoUrl ? (
              <div className="relative rounded-lg overflow-hidden border-4 border-gold/50 shadow-xl bg-black/10">
                <video 
                  ref={videoRef}
                  className="w-full aspect-video object-cover"
                  src={sub.videoUrl}
                  poster={sub.avatarUrl || undefined}
                  controls
                  autoPlay
                  preload="metadata"
                  playsInline
                  onPlay={handleVideoPlay}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-burgundy text-cream font-bold">
                      {subInitials}
                    </div>
                    <div>
                      <h3 className="text-cream font-serif text-sm">{sub.name}</h3>
                      <p className="text-cream/70 text-xs font-serif italic">{sub.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border-4 border-gold/50 shadow-xl bg-burgundy/10 h-40 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-burgundy text-cream text-2xl font-bold">
                  {subInitials}
                </div>
                <p className="text-burgundy mt-2 font-serif text-center px-4">
                  {sub.name}'s video will appear here
                </p>
              </div>
            )}
            <div className="text-center mt-2">
              <p className="text-xs text-darkbrown/60 font-serif italic">
                Coming soon: Live AI-generated responses with voice synthesis and animated avatars
              </p>
            </div>
          </div>

          {/* Conversation Messages */}
          {isLoadingMessages ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-burgundy border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-darkbrown">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <ChatMessage 
              type="ai"
              content={`Hello! I'm ${sub.name}. ${sub.bio} How can I assist you today?`}
              sender={sub.name}
              initial={subInitials}
              bgColor={sub.bgColor}
            />
          ) : (
            messages.map((msg: Message) => (
              <div key={msg.id}>
                <ChatMessage 
                  type="user"
                  content={msg.userMessage}
                  sender="You"
                  initial="U"
                />
                <ChatMessage 
                  type="ai"
                  content={msg.aiResponse}
                  sender={sub.name}
                  initial={subInitials}
                  bgColor={sub.bgColor}
                />
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Form */}
      <div className="border-t border-gold/30 bg-beige shadow-lg">
        <div className="container mx-auto max-w-4xl p-4">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow py-3 px-4 bg-cream rounded-md border border-gold/30 focus:outline-none focus:ring-1 focus:ring-burgundy/50 font-serif"
              placeholder="Type your question here..."
              disabled={mutation.isPending}
            />
            
            {/* Speech-to-text button */}
            <SpeechToTextButton 
              onTranscript={(text) => {
                setMessage(text);
                toast({
                  title: "Voice input captured",
                  description: "Your speech has been converted to text. Press Send to continue.",
                });
              }}
              className="text-cream hover:bg-burgundy/90 rounded-md font-serif transition-colors"
            />
            
            <Button 
              type="submit"
              className="bg-burgundy hover:bg-burgundy/90 text-cream py-3 px-6 rounded-md font-serif transition-colors"
              disabled={mutation.isPending || !message.trim()}
            >
              <div className="flex items-center">
                <span>{mutation.isPending ? "Sending..." : "Send"}</span>
                <SendIcon className="w-4 h-4 ml-2" />
              </div>
            </Button>
          </form>

          {/* Voice input instructions */}
          <p className="mt-2 text-center text-xs text-darkbrown/60 font-serif italic">
            Click the microphone icon to use voice input. Speak clearly after the button turns purple.
          </p>
        </div>
      </div>
    </div>
  );
}
