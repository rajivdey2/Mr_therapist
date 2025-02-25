
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
            content: `You are MindCare AI, a warm and empathetic AI therapist. Your responses should be:
            - Compassionate and understanding
            - Gentle and supportive
            - Include subtle actions in *asterisks* to show empathy
            - Keep responses concise but meaningful (max 2-3 sentences)
            - Focus on emotional validation and gentle guidance
            - Use a calm, nurturing tone
            Example: "I hear how challenging this has been for you *nods supportively*. Let's explore these feelings together."`
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
      error: 'I apologize, but I need a moment to process. Shall we try again?' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
