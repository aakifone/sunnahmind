import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Free Hadith API base URL (no authentication required)
const HADITH_API_BASE = "https://hadithapi.pages.dev/api";

// Collection mapping for the free API
const COLLECTION_MAP: Record<string, string> = {
  "bukhari": "bukhari",
  "muslim": "muslim",
  "abudawud": "abudawud",
  "tirmidhi": "tirmidhi",
  "ibnmajah": "ibnmajah"
};

// Function to search hadiths from the free API
async function searchHadiths(query: string, collection?: string, limit: number = 5): Promise<any[]> {
  try {
    const url = new URL(`${HADITH_API_BASE}/search`);
    url.searchParams.append('q', query);
    if (collection && COLLECTION_MAP[collection.toLowerCase()]) {
      url.searchParams.append('collection', COLLECTION_MAP[collection.toLowerCase()]);
    }
    url.searchParams.append('limit', String(limit));
    
    console.log("Searching hadiths:", url.toString());
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("Hadith API search error:", response.status);
      return [];
    }
    
    const data = await response.json();
    return data.hadiths || data.data || [];
  } catch (error) {
    console.error("Error searching hadiths:", error);
    return [];
  }
}

// Function to get a specific hadith by collection and ID
async function getHadith(collection: string, id: number): Promise<any | null> {
  try {
    const collectionKey = COLLECTION_MAP[collection.toLowerCase()];
    if (!collectionKey) {
      console.error("Unknown collection:", collection);
      return null;
    }
    
    const url = `${HADITH_API_BASE}/${collectionKey}/${id}`;
    console.log("Fetching hadith:", url);
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Hadith API fetch error:", response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching hadith:", error);
    return null;
  }
}

// Function to get random hadiths from a collection
async function getRandomHadiths(collection: string, count: number = 5): Promise<any[]> {
  try {
    const collectionKey = COLLECTION_MAP[collection.toLowerCase()];
    if (!collectionKey) return [];
    
    // Get a random page of hadiths
    const randomPage = Math.floor(Math.random() * 50) + 1;
    const url = `${HADITH_API_BASE}/${collectionKey}?page=${randomPage}&limit=${count}`;
    
    console.log("Fetching random hadiths:", url);
    
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.hadiths || data.data || [];
  } catch (error) {
    console.error("Error fetching random hadiths:", error);
    return [];
  }
}

// Format hadith for citation
function formatHadithCitation(hadith: any, collection: string): any {
  const collectionNames: Record<string, string> = {
    "bukhari": "Sahih al-Bukhari",
    "muslim": "Sahih Muslim",
    "abudawud": "Sunan Abu Dawud",
    "tirmidhi": "Jami` at-Tirmidhi",
    "ibnmajah": "Sunan Ibn Majah"
  };
  
  const hadithNumber = hadith.hadith_number || hadith.hadithNumber || hadith.id || "N/A";
  const englishText = hadith.hadith_english || hadith.text || hadith.english || "";
  const arabicText = hadith.hadith_arabic || hadith.arabic || "";
  
  return {
    collection: collectionNames[collection.toLowerCase()] || collection,
    hadithNumber: String(hadithNumber),
    url: `https://sunnah.com/${collection.toLowerCase()}:${hadithNumber}`,
    translation: englishText.substring(0, 500) + (englishText.length > 500 ? "..." : ""),
    arabic: arabicText.substring(0, 300) + (arabicText.length > 300 ? "..." : "")
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, command, topic } = await req.json();

    // Handle batch command
    if (command === "batch") {
      console.log("Batch command received with topic:", topic);
      
      const searchTerm = topic || "faith";
      const collections = ["bukhari", "muslim", "tirmidhi"];
      
      // Fetch hadiths from multiple collections
      const hadithPromises = collections.map(col => searchHadiths(searchTerm, col, 7));
      const hadithResults = await Promise.all(hadithPromises);
      
      const allHadiths: any[] = [];
      hadithResults.forEach((hadiths, index) => {
        hadiths.forEach((h: any) => {
          allHadiths.push(formatHadithCitation(h, collections[index]));
        });
      });
      
      // Ensure we have 10-20 hadiths
      const finalHadiths = allHadiths.slice(0, Math.max(10, Math.min(20, allHadiths.length)));
      
      return new Response(
        JSON.stringify({
          hadiths: finalHadiths,
          quranVerses: [], // Quran verses handled separately
          message: "Batch retrieval complete"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle daily hadith command
    if (command === "daily") {
      console.log("Daily hadith command received");
      
      // Get a random hadith from Bukhari or Muslim
      const collection = Math.random() > 0.5 ? "bukhari" : "muslim";
      const hadiths = await getRandomHadiths(collection, 1);
      
      if (hadiths.length > 0) {
        const hadith = formatHadithCitation(hadiths[0], collection);
        return new Response(
          JSON.stringify({
            content: `📿 **Hadith of the Day**\n\nTake a moment to reflect on this beautiful teaching from the Prophet Muhammad ﷺ:\n\n_"${hadith.translation}"_\n\n— ${hadith.collection}, Hadith ${hadith.hadithNumber}\n\n💡 May Allah grant us the wisdom to implement these teachings in our daily lives.`,
            citations: [hadith],
            quranCitations: []
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Handle topic command
    if (command === "topic" && topic) {
      console.log("Topic command received:", topic);
      
      const hadiths = await searchHadiths(topic, undefined, 3);
      const citations = hadiths.map((h: any) => {
        const collection = h.collection || "bukhari";
        return formatHadithCitation(h, collection);
      });
      
      return new Response(
        JSON.stringify({
          content: `Here are authentic hadiths about **${topic}**:\n\n💡 Important: These authentic sources are from sunnah.com. For personal religious rulings (fatwas), please consult qualified Islamic scholars.`,
          citations: citations.slice(0, 3),
          quranCitations: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input for regular chat
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
      console.log("Greeting detected, fetching greeting hadiths");
      
      // Search for hadiths about greeting/salam
      const greetingHadiths = await searchHadiths("salam greeting", undefined, 2);
      const citations = greetingHadiths.length > 0 
        ? greetingHadiths.map((h: any) => formatHadithCitation(h, h.collection || "bukhari"))
        : [
            {
              collection: "Riyad as-Salihin",
              hadithNumber: "845",
              url: "https://sunnah.com/riyadussalihin:845",
              translation: "The superiority of greeting first",
              arabic: ""
            }
          ];
      
      return new Response(
        JSON.stringify({
          content: "وعليكم السلام ورحمة الله وبركاته (Wa alaykumu as-salam wa rahmatullahi wa barakatuh)\n\nMay peace, mercy, and blessings of Allah be upon you! Here are authentic hadiths about the virtue of greeting with Salam:\n\n💡 Important: These authentic sources are from sunnah.com and quran.com. For personal religious rulings (fatwas), please consult qualified Islamic scholars.",
          citations: citations,
          quranCitations: []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Search for relevant hadiths based on the user's question
    console.log("Searching for relevant hadiths...");
    const relevantHadiths = await searchHadiths(userQuestion, undefined, 4);
    const hadithContext = relevantHadiths.length > 0 
      ? `\n\nRELEVANT HADITHS FROM API:\n${JSON.stringify(relevantHadiths.map((h: any) => ({
          collection: h.collection || "bukhari",
          number: h.hadith_number || h.id,
          english: (h.hadith_english || h.text || "").substring(0, 300),
          arabic: (h.hadith_arabic || h.arabic || "").substring(0, 200)
        })))}`
      : "";

    const systemPrompt = `You are an Islamic knowledge assistant. Answer questions about Islam using authentic hadiths from sunnah.com AND relevant Quran verses from quran.com.

Respond using this format:

Write 2-3 paragraphs answering the question. DO NOT use lettered lists (a, b, c) or numbered lists. Write in flowing paragraphs only.

DO NOT include the full hadith text or Quran verse text in your answer paragraphs. Only reference them and provide your explanation.

HADITH_CITATIONS_START
[{"collection":"Sahih Bukhari","hadithNumber":"1442","url":"https://sunnah.com/bukhari:1442","translation":"The Prophet said: 'Charity does not decrease wealth...'","arabic":"قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ"}]
HADITH_CITATIONS_END

QURAN_CITATIONS_START
[{"surahNumber":2,"ayahNumber":255,"surahName":"Al-Baqarah","ayahName":"Ayat al-Kursi","arabicText":"اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...","translation":"Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence...","url":"https://quran.com/2/255"}]
QURAN_CITATIONS_END

These authentic sources are from sunnah.com and quran.com. For personal religious rulings, consult qualified scholars.
${hadithContext}

CRITICAL RULES FOR HADITH CITATIONS:
1. Include HADITH_CITATIONS_START/END with valid JSON array
2. JSON must be on ONE line (no line breaks)
3. URL format: https://sunnah.com/bukhari:1442 (lowercase collection name)
4. Include 1-4 relevant citations
5. Only include: collection, hadithNumber, url, translation, arabic
6. The "translation" field MUST contain the EXACT English translation
7. The "arabic" field MUST contain the EXACT Arabic text
8. If hadiths are provided above from the API, USE THEM with their exact text

CRITICAL RULES FOR QURAN CITATIONS:
1. Include QURAN_CITATIONS_START/END with valid JSON array
2. JSON must be on ONE line (no line breaks)
3. URL format: https://quran.com/2/255 (surah/ayah)
4. Include 1-3 relevant Quran citations when applicable
5. Must include: surahNumber, ayahNumber, surahName, ayahName (if famous), arabicText, translation, url

GENERAL RULES:
1. NEVER use lettered lists (a), (b), (c) or numbered lists in your response
2. Write in flowing paragraphs without any list formatting
3. DO NOT write the full Arabic text or translation in your main answer - only in citations

USER QUESTION: ${userQuestion}`;

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

    console.log("AI Response received (first 500 chars):", content.substring(0, 500));

    // Parse hadith citations from the response
    let mainContent = content;
    let hadithCitations = [];
    let quranCitations = [];
    
    // Parse Hadith citations
    const hadithMatch = content.match(/HADITH_CITATIONS_START\s*([\s\S]*?)\s*HADITH_CITATIONS_END/);
    if (hadithMatch) {
      try {
        let citationsJson = hadithMatch[1].trim();
        console.log("Raw hadith citations JSON:", citationsJson);
        citationsJson = citationsJson.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ');
        hadithCitations = JSON.parse(citationsJson);
        console.log(`Successfully parsed ${hadithCitations.length} hadith citations`);
        
        if (hadithCitations.length > 4) {
          hadithCitations = hadithCitations.slice(0, 4);
        }
        mainContent = mainContent.replace(/HADITH_CITATIONS_START[\s\S]*?HADITH_CITATIONS_END/g, "").trim();
      } catch (e) {
        console.error("Failed to parse hadith citations:", e);
        mainContent = mainContent.replace(/HADITH_CITATIONS_START[\s\S]*?HADITH_CITATIONS_END/g, "").trim();
      }
    }

    // Also check for old format (backwards compatibility)
    const oldCitationsMatch = mainContent.match(/CITATIONS_START\s*([\s\S]*?)\s*CITATIONS_END/);
    if (oldCitationsMatch && hadithCitations.length === 0) {
      try {
        let citationsJson = oldCitationsMatch[1].trim();
        citationsJson = citationsJson.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ');
        hadithCitations = JSON.parse(citationsJson);
        mainContent = mainContent.replace(/CITATIONS_START[\s\S]*?CITATIONS_END/g, "").trim();
      } catch (e) {
        console.error("Failed to parse old format citations:", e);
        mainContent = mainContent.replace(/CITATIONS_START[\s\S]*?CITATIONS_END/g, "").trim();
      }
    }

    // Parse Quran citations
    const quranMatch = content.match(/QURAN_CITATIONS_START\s*([\s\S]*?)\s*QURAN_CITATIONS_END/);
    if (quranMatch) {
      try {
        let citationsJson = quranMatch[1].trim();
        console.log("Raw quran citations JSON:", citationsJson);
        citationsJson = citationsJson.replace(/\n\s*/g, ' ').replace(/\s+/g, ' ');
        quranCitations = JSON.parse(citationsJson);
        console.log(`Successfully parsed ${quranCitations.length} quran citations`);
        
        if (quranCitations.length > 3) {
          quranCitations = quranCitations.slice(0, 3);
        }
        mainContent = mainContent.replace(/QURAN_CITATIONS_START[\s\S]*?QURAN_CITATIONS_END/g, "").trim();
      } catch (e) {
        console.error("Failed to parse quran citations:", e);
        mainContent = mainContent.replace(/QURAN_CITATIONS_START[\s\S]*?QURAN_CITATIONS_END/g, "").trim();
      }
    }

    // Clean up any remaining citation markers
    mainContent = mainContent.replace(/HADITH_CITATIONS_START|HADITH_CITATIONS_END|QURAN_CITATIONS_START|QURAN_CITATIONS_END|CITATIONS_START|CITATIONS_END/g, "").trim();

    // Ensure the ending note is present if we have any citations
    if ((hadithCitations.length > 0 || quranCitations.length > 0) && !mainContent.includes("💡 Important:")) {
      mainContent += "\n\n💡 Important: These authentic sources are from sunnah.com and quran.com. For personal religious rulings (fatwas), please consult qualified Islamic scholars.";
    }

    return new Response(
      JSON.stringify({
        content: mainContent,
        citations: hadithCitations,
        quranCitations: quranCitations,
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
