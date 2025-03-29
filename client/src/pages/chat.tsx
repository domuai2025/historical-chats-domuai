import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { fetchSub, fetchMessages, sendMessage } from "@/lib/api";
import { ChevronLeftIcon, MoreVerticalIcon, SendIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatMessage from "@/components/ui/chat-message";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [_, params] = useRoute("/chat/:id");
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
      <header className="bg-burgundy text-cream shadow-md py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <a className="mr-3">
                <ChevronLeftIcon className="w-6 h-6" />
              </a>
            </Link>
            <div>
              <h2 className="font-playfair text-xl">{sub.name}</h2>
              <p className="text-xs opacity-70">{sub.title}</p>
            </div>
          </div>
          <div>
            <button className="text-cream/90 hover:text-cream" title="More options">
              <MoreVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
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
              className="flex-grow py-3 px-4 bg-white rounded-md border border-gold/30 focus:outline-none focus:ring-1 focus:ring-burgundy/50"
              placeholder="Type your question here..."
              disabled={mutation.isPending}
            />
            <Button 
              type="submit"
              className="bg-burgundy hover:bg-burgundy/90 text-cream py-3 px-6 rounded-md font-lora transition-colors"
              disabled={mutation.isPending || !message.trim()}
            >
              <div className="flex items-center">
                <span>{mutation.isPending ? "Sending..." : "Send"}</span>
                <SendIcon className="w-4 h-4 ml-2" />
              </div>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
