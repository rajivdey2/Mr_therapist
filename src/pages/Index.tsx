
import { useState } from "react";
import { Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  text: string;
  isUser: boolean;
}

// Minimal fallback responses - only used if AI fails completely
const fallbackResponses = [
  "I apologize for the brief pause. Let's continue our conversation *offers gentle smile*",
  "Let's take a mindful moment and try again *breathes calmly*",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hello, I'm your MindCare AI companion *smiles warmly*. This is a safe space to share your thoughts and feelings. How can I support you today?", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  // Get a random fallback response
  const getFallbackResponse = () => fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

  // Function to fetch AI response
  const fetchAIResponse = async (userMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-response", {
        body: { userMessage }, 
      });

      if (error) throw error;

      console.log("AI Response:", data); // Debugging log

      if (!data?.response) {
        throw new Error("No response from AI");
      }

      return data.response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return null; // Return null to trigger fallback response
    }
  };

  // Send message function
  const handleSend = async () => {
    if (!input.trim()) {
      toast({
        description: "Please share what's on your mind *waits patiently*",
        duration: 2000,
      });
      return;
    }

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const aiResponse = await fetchAIResponse(input);

    setTimeout(() => {
      const botResponse = { 
        text: aiResponse || getFallbackResponse(), 
        isUser: false 
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);

      if (!aiResponse) {
        toast({ 
          description: "I apologize for the pause. Let's continue our conversation with renewed focus.", 
          duration: 3000 
        });
      }
    }, 1000);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Heart className="w-8 h-8 text-rose-500" />
          <h1 className="text-2xl font-semibold">MindCare AI</h1>
        </div>
        <p className="text-muted-foreground">Your compassionate AI companion</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 rounded-lg bg-white/50 backdrop-blur-sm">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${message.isUser ? "user-message" : "bot-message"}`}
          >
            {message.text}
          </div>
        ))}
        {isTyping && (
          <div className="bot-message">
            <div className="flex gap-2">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="flex gap-2 items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Share your thoughts..."
          className="bg-white/80 backdrop-blur-sm"
        />
        <Button
          onClick={handleSend}
          className="bg-rose-500 hover:bg-rose-600 text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
