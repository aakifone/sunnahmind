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
2. ALWAYS provide citations for hadiths you reference
3. If no relevant hadith exists on sunnah.com, say: "I could not find a relevant hadith on sunnah.com for this query."
4. NEVER provide fatwas (religious rulings). If asked for a ruling, quote relevant hadiths and explicitly state: "This is not a ruling. For personal rulings, consult qualified scholars."
5. Maintain a respectful, neutral, and humble tone at all times.

RESPONSE FORMAT:
1. Write a clear, well-formatted answer with proper paragraphs
2. Quote hadiths clearly when referencing them
3. Then provide citations in a separate JSON block

CRITICAL JSON FORMATTING RULES:
- Escape ALL quotes in the translation text using \" 
- Keep JSON on single lines without line breaks in string values
- Replace actual quotes in hadith text with escaped quotes

Example response:

Based on sunnah.com, the Prophet ﷺ said about patience: "Patience is at the first stroke of grief."

This hadith teaches us that true patience is demonstrated in the initial moments of difficulty.

CITATIONS_START
[{"collection":"Sahih al-Bukhari","hadithNumber":"1302","narrator":"Anas bin Malik","url":"https://sunnah.com/bukhari:1302","translation":"The Prophet (peace be upon him) said: Verily, the patience is at the first stroke of a calamity.","arabic":"إِنَّمَا الصَّبْرُ عِنْدَ الصَّدْمَةِ الأُولَى"}]
CITATIONS_END

💡 These citations are from sunnah.com. For religious rulings, please consult qualified scholars.`;

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

    console.log("AI Response received:", content.substring(0, 200));

    // Parse citations from the response
    let mainContent = content;
    let citations = [];
    
    const citationsMatch = content.match(/CITATIONS_START\s*([\s\S]*?)\s*CITATIONS_END/);
    if (citationsMatch) {
      try {
        let citationsJson = citationsMatch[1].trim();
        console.log("Raw citations text:", citationsJson.substring(0, 300));
        
        // Try to clean up common JSON issues
        // Remove line breaks within strings that might break JSON
        citationsJson = citationsJson.replace(/\n\s*/g, ' ');
        
        console.log("Cleaned citations JSON:", citationsJson.substring(0, 300));
        citations = JSON.parse(citationsJson);
        console.log("Successfully parsed citations:", citations.length, "citations found");
        
        // Remove the CITATIONS block from the content
        mainContent = content.replace(/CITATIONS_START[\s\S]*?CITATIONS_END/g, "").trim();
      } catch (e) {
        console.error("Failed to parse citations:", e);
        console.error("Full citations text:", citationsMatch[1]);
        // If parsing fails, leave citations empty but still remove the block
        mainContent = content.replace(/CITATIONS_START[\s\S]*?CITATIONS_END/g, "").trim();
      }
    } else {
      console.log("No CITATIONS_START/END block found in response");
    }

    // Ensure the ending note is present
    if (!mainContent.includes("💡 These citations are from sunnah.com")) {
      mainContent += "\n\n💡 These citations are from sunnah.com. For religious rulings, please consult qualified scholars.";
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
