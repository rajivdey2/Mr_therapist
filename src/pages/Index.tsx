
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

// Structured therapeutic responses for common situations
const therapeuticResponses = [
  {
    keywords: ["breakup", "broke up", "ex", "relationship ended"],
    response: "I'm really sorry you're feeling this way *offers supportive presence*. Healing takes time, and it's okay to grieve. Try to focus on yourself—reconnect with hobbies, friends, and self-care. What's one small thing you can do today to take care of yourself?"
  },
  {
    keywords: ["study", "exam", "school", "academic", "college", "university", "homework", "grades"],
    response: "It's completely valid to feel overwhelmed by academic pressure *nods understandingly*. Break your workload into smaller steps and set realistic goals. Remember, progress matters more than perfection. Have you tried scheduling short breaks to refresh your mind?"
  },
  {
    keywords: ["family", "parents", "expectations", "pressure", "mom", "dad", "siblings"],
    response: "That sounds really challenging *listens attentively*. Your feelings matter, and it's important to balance their expectations with your happiness. Have you considered having an open conversation with them? Your dreams and well-being are just as important."
  },
  {
    keywords: ["money", "financial", "finances", "debt", "bills", "expensive"],
    response: "I hear how stressful this financial situation is *shows empathetic concern*. Start by prioritizing essentials and creating a small, manageable plan. Remember, this is a phase—your situation can and will improve with time. What's one step you can take today?"
  },
  {
    keywords: ["hopeless", "worthless", "giving up", "no point", "can't go on", "falling apart"],
    response: "I'm here with you during this difficult time *extends caring support*. You're not alone, and your struggles don't define your future. Even small steps forward count. Please be gentle with yourself—what's one thing that brings you even a little comfort right now?"
  }
];

// Minimal fallback responses - only used if no keyword matches and AI fails
const fallbackResponses = [
  "I hear you, and I want you to know that your feelings are valid *offers supportive presence*. Would you like to tell me more about what's on your mind?",
  "Thank you for sharing that with me *nods gently*. Let's explore these feelings together. What support do you need right now?",
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

  // Function to find matching therapeutic response based on keywords
  const findTherapeuticResponse = (message: string) => {
    const lowercaseMessage = message.toLowerCase();
    const matchingResponse = therapeuticResponses.find(response =>
      response.keywords.some(keyword => lowercaseMessage.includes(keyword))
    );
    return matchingResponse?.response;
  };

  // Get a response, prioritizing AI, then keyword matches, then fallbacks
  const getResponse = async (userMessage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-response", {
        body: { userMessage },
      });

      if (error || !data?.response) {
        throw new Error("AI response failed");
      }

      return data.response;
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Try to find a matching therapeutic response
      const therapeuticResponse = findTherapeuticResponse(userMessage);
      if (therapeuticResponse) {
        return therapeuticResponse;
      }

      // If no matches, use fallback
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };

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

    const response = await getResponse(input);

    setTimeout(() => {
      const botResponse = { 
        text: response,
        isUser: false 
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
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
