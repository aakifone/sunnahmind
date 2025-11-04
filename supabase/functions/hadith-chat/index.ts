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

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content || 
        typeof lastMessage.content !== 'string' ||
        lastMessage.content.length > 2000 ||
        lastMessage.content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid message content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the user's latest question
    const userQuestion = messages[messages.length - 1]?.content || "";
    console.log("User question:", userQuestion);

    // Check if the message is a greeting
    const greetingPatterns = /^(hi|hello|hey|salam|salaam|assalam|assalamu alaikum|as-salamu alaykum|wa alaikum salam|hola|bonjour|salut|ciao|hallo|namaste|greetings|good morning|good afternoon|good evening)\b/i;
    const isGreeting = greetingPatterns.test(userQuestion.trim());

    if (isGreeting) {
      console.log("Greeting detected, returning specific hadiths");
      return new Response(
        JSON.stringify({
          content: "وعليكم السلام ورحمة الله وبركاته (Wa alaykumu as-salam wa rahmatullahi wa barakatuh)\n\nMay peace, mercy, and blessings of Allah be upon you! Here are authentic hadiths about the virtue of greeting with Salam:\n\n💡 Important: These authentic hadiths are sourced from sunnah.com. For personal religious rulings (fatwas), please consult qualified Islamic scholars.",
          citations: [
            {
              collection: "Riyad as-Salihin",
              hadithNumber: "845",
              url: "https://sunnah.com/riyadussalihin:845",
              translation: "The superiority of greeting first",
              arabic: ""
            },
            {
              collection: "Riyad as-Salihin",
              hadithNumber: "844",
              url: "https://sunnah.com/riyadussalihin:844",
              translation: "The excellence of spreading Salam",
              arabic: ""
            }
          ],
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchContext = getSunnahComContext(userQuestion);
    console.log("Search context:", searchContext);


[Write 2-3 paragraphs answering the question]

CITATIONS_START
[{"collection":"Sahih Bukhari","hadithNumber":"1442","url":"https://sunnah.com/bukhari:1442","translation":"The Prophet (ﷺ) said: 'Charity does not decrease wealth...'","arabic":"قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ"}]
CITATIONS_END

💡 These authentic hadiths are from sunnah.com. For personal religious rulings, consult qualified scholars.

EXAMPLE HADITHS BY TOPIC:

CHARITY: Bukhari 1442, Muslim 2588
PRAYER: Bukhari 528, Muslim 251  
PATIENCE: Bukhari 5645, Muslim 2999
PARENTS: Bukhari 5971, Muslim 2548
TRUTH: Bukhari 6094, Muslim 2607

RULES FOR ISLAMIC QUESTIONS:
1. Include CITATIONS_START/END with valid JSON array
2. JSON must be on ONE line (no line breaks)
3. URL format: https://sunnah.com/bukhari:1442 (lowercase collection name)
4. Include 1-4 relevant citations
5. DO NOT include "narrator" field in JSON - narrators are visible on sunnah.com directly
6. Only include: collection, hadithNumber, url, translation, arabic

USER QUESTION: "${userQuestion}"`;

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

    // Ensure the ending note is present only if we have citations
    if (citations.length > 0 && !mainContent.includes("💡 Important:")) {
      mainContent += "\n\n💡 Important: These authentic hadiths are sourced from sunnah.com. For personal religious rulings (fatwas), please consult qualified Islamic scholars.";
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
      JSON.stringify({ error: 'Unable to process request. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
