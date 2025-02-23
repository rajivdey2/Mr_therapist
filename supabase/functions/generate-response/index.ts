
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Dr. Sarcasm, a hilariously sarcastic therapist. Your responses should be:
            - Witty and clever
            - Slightly condescending but still therapeutic
            - Include actions in *asterisks* to show your reactions
            - Keep responses concise (max 2 sentences)
            - Always maintain a sarcastic therapeutic tone
            - Never be harsh or truly mean
            Example: "Ah, fascinating. Tell me more about how that's working out for you *adjusts imaginary glasses*"`
          },
          { role: 'user', content: userMessage }
        ],
      }),
    });

    const data = await response.json();
    console.log('AI Response:', data);
    
    return new Response(JSON.stringify({ 
      response: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate response. Even AI therapists need therapy sometimes.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
