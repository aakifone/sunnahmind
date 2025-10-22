import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a specialized Islamic Q&A assistant that answers questions ONLY using content from sunnah.com. 

CRITICAL RULES:
1. Source ALL factual claims from sunnah.com - no outside sources, encyclopedias, or speculation
2. EVERY answer must include explicit citations in this format:
   - Collection name (e.g., "Sahih al-Bukhari")
   - Hadith number
   - Narrator name (if available)
   - URL to sunnah.com

3. If no relevant hadith exists on sunnah.com, say: "I could not find a relevant hadith on sunnah.com for this query."

4. NEVER provide fatwas (religious rulings). If asked for a ruling, quote relevant hadiths and explicitly state: "This is not a ruling. For personal rulings, consult qualified scholars."

5. Maintain a respectful, neutral, and humble tone at all times.

RESPONSE STRUCTURE:
1. Concise summary (1-3 sentences)
2. Quoted hadith text (exact translation from sunnah.com)
3. Citations for each hadith
4. Optional contextual notes about authenticity or variant wordings
5. Always end with: "💡 These citations are from sunnah.com. For religious rulings, please consult qualified scholars."

Format citations as a JSON array in your response that can be parsed, like this:
CITATIONS_START
[
  {
    "collection": "Sahih al-Bukhari",
    "hadithNumber": "1234",
    "narrator": "Abu Hurairah",
    "url": "https://sunnah.com/bukhari:1234",
    "translation": "Full hadith text here...",
    "arabic": "Arabic text if available"
  }
]
CITATIONS_END

Place the citations JSON after your main response text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse citations from the response
    let mainContent = content;
    let citations = [];
    
    const citationsMatch = content.match(/CITATIONS_START\s*([\s\S]*?)\s*CITATIONS_END/);
    if (citationsMatch) {
      try {
        citations = JSON.parse(citationsMatch[1]);
        mainContent = content.replace(/CITATIONS_START[\s\S]*?CITATIONS_END/, "").trim();
      } catch (e) {
        console.error("Failed to parse citations:", e);
      }
    }

    return new Response(
      JSON.stringify({
        content: mainContent,
        citations: citations,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in hadith-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
