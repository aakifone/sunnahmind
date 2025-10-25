import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to provide context about searching sunnah.com
function getSunnahComContext(query: string): string {
  const searchUrl = `https://sunnah.com/search?q=${encodeURIComponent(query)}`;
  console.log("Query context for:", query);
  return `User is searching for: "${query}". Sunnah.com search URL: ${searchUrl}`;
}

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

    // Get the user's latest question
    const userQuestion = messages[messages.length - 1]?.content || "";
    console.log("User question:", userQuestion);

    const searchContext = getSunnahComContext(userQuestion);
    console.log("Search context:", searchContext);

    const systemPrompt = `You are a specialized Islamic Q&A assistant with deep knowledge of authentic hadiths from sunnah.com.

CRITICAL INSTRUCTIONS:
1. You have extensive knowledge of authentic hadiths from major collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Ibn Majah, Nasa'i)
2. You MUST provide between 1-4 hadith citations (minimum 1, maximum 4) that are DIRECTLY relevant to the question
3. Each citation MUST include: collection, hadithNumber, narrator, url (format: https://sunnah.com/collection:number), translation, and arabic text
4. Answer the user's question directly with authentic hadiths you know
5. Use ONLY hadiths that directly address the specific question
6. Format your response with clear paragraphs explaining how the hadiths answer the question
7. NEVER provide fatwas (religious rulings) - always say "For religious rulings, consult qualified scholars"

SEARCH CONTEXT:
${searchContext}

IMPORTANT - HADITH URL FORMAT:
- Sahih Bukhari: https://sunnah.com/bukhari:NUMBER
- Sahih Muslim: https://sunnah.com/muslim:NUMBER
- Abu Dawud: https://sunnah.com/abudawud:NUMBER
- Tirmidhi: https://sunnah.com/tirmidhi:NUMBER
- Ibn Majah: https://sunnah.com/ibnmajah:NUMBER
- Nasa'i: https://sunnah.com/nasai:NUMBER

RESPONSE FORMAT:
Write a clear answer (2-4 paragraphs) that:
- Directly addresses the user's question
- References 1-4 specific hadiths
- Explains how these hadiths answer the question

Then provide citations in this EXACT format:

CITATIONS_START
[{"collection":"Sahih Muslim","hadithNumber":"2588","narrator":"Abu Hurairah","url":"https://sunnah.com/muslim:2588","translation":"The Messenger of Allah (peace be upon him) said: Charity does not decrease wealth, and Allah increases a servant in honor when he forgives others.","arabic":"ما نقص مال من صدقة"}]
CITATIONS_END

CRITICAL RULES:
- You MUST provide 1-4 authentic hadith citations for every question
- Use your knowledge of authentic hadiths from the six major collections
- URLs must follow the exact format: https://sunnah.com/collection:number (all lowercase collection name)
- Provide actual hadith text in both English translation and Arabic
- Include the narrator's name
- Escape all quotes in JSON with \"
- Keep JSON on a single line between CITATIONS_START and CITATIONS_END
- Always end with the disclaimer note

EXAMPLES OF PROPER CITATIONS:
Question about charity: Cite Bukhari 1442, Muslim 2588 about charity not decreasing wealth
Question about patience: Cite Bukhari 5645, Muslim 2999 about patience in hardship
Question about prayer: Cite Bukhari 528, Muslim 251 about prayer importance

You have this knowledge - use it to help the user with authentic hadiths!`;

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
          { role: "user", content: userQuestion }
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

    console.log("AI Response received (first 300 chars):", content.substring(0, 300));

    // Parse citations from the response
    let mainContent = content;
    let citations = [];
    
    const citationsMatch = content.match(/CITATIONS_START\s*([\s\S]*?)\s*CITATIONS_END/);
    if (citationsMatch) {
      try {
        let citationsJson = citationsMatch[1].trim();
        console.log("Raw citations JSON:", citationsJson);
        
        // Clean up JSON - remove line breaks and extra spaces
        citationsJson = citationsJson.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ');
        
        citations = JSON.parse(citationsJson);
        console.log(`Successfully parsed ${citations.length} citations`);
        
        // Validate we have 1-4 citations
        if (citations.length < 1) {
          console.warn("Warning: Less than 1 citation provided");
        } else if (citations.length > 4) {
          console.warn("Warning: More than 4 citations, trimming to 4");
          citations = citations.slice(0, 4);
        }
        
        // Remove the CITATIONS block from the content
        mainContent = content.replace(/CITATIONS_START[\s\S]*?CITATIONS_END/g, "").trim();
      } catch (e) {
        console.error("Failed to parse citations:", e);
        console.error("Full citations text:", citationsMatch[1]);
        mainContent = content.replace(/CITATIONS_START[\s\S]*?CITATIONS_END/g, "").trim();
      }
    } else {
      console.warn("No CITATIONS_START/END block found in response");
    }

    // Ensure the ending note is present
    if (!mainContent.includes("💡")) {
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
