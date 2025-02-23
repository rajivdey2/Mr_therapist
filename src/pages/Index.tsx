
import { useState } from "react";
import { Send, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  text: string;
  isUser: boolean;
}

const therapistResponses = [
  "Ah, fascinating. Tell me more about how you think that's working out for you *adjusts imaginary glasses*",
  "And how does that make you feel? *pretends to write in notepad*",
  "Have you considered that maybe, just maybe, you're overthinking this? *raises eyebrow dramatically*",
  "Let's unpack that... right after I unpack my lunch *rustles paper bag*",
  "Interesting choice. I mean, who am I to judge? *clearly judging*",
  "You know what Freud would say about that... absolutely nothing, he's dead.",
  "That's completely normal! Well, define normal... *smirks*",
  "Sounds like someone needs a hug. Not from me though, I'm a professional.",
  "Have you tried turning yourself off and on again?",
  "That's... unique. Like a snowflake. A very confused snowflake.",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Welcome! I'm Dr. Sarcasm, your totally qualified* digital therapist. How can I pretend to help you today? (*terms and conditions apply)", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const getRandomResponse = () => {
    const randomIndex = Math.floor(Math.random() * therapistResponses.length);
    return therapistResponses[randomIndex];
  };

  const handleSend = async () => {
    if (!input.trim()) {
      toast({
        description: "Come on, give me something to work with here!",
        duration: 2000,
      });
      return;
    }

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = { text: getRandomResponse(), isUser: false };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 h-screen flex flex-col">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-2">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-semibold">Dr. Sarcasm</h1>
        </div>
        <p className="text-muted-foreground">Your sassiest virtual therapist</p>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 rounded-lg bg-white/50 backdrop-blur-sm">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${
              message.isUser ? "user-message" : "bot-message"
            }`}
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
