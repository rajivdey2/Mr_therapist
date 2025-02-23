import { useState } from "react";
import { Send, Brain } from "lucide-react";
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
  "Oh great, my circuits are acting up again. *taps head dramatically*",
  "Technical difficulties... how ironic for a digital therapist *rolls virtual eyes*",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Well, well, well... *adjusts virtual therapy couch* I'm Dr. Sarcasm, your AI therapist with a PhD in eye-rolling. How shall we unpack your emotional baggage today?", 
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
        body: { prompt: userMessage }, // Fix: Ensure it correctly sends 'prompt'
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
        description: "Silent treatment, really? *taps notepad impatiently*",
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
        toast({ description: "Even AI therapists need a coffee break sometimes. *sips virtual espresso*", duration: 3000 });
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
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-semibold">Dr. Sarcasm</h1>
        </div>
        <p className="text-muted-foreground">Your sassiest virtual therapist</p>
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
          placeholder="Tell me about your problems..."
          className="bg-white/80 backdrop-blur-sm"
        />
        <Button
          onClick={handleSend}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
