import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRANSLATE_ENDPOINTS = [
  "https://libretranslate.com/translate",
  "https://translate.argosopentech.com/translate",
];

// Function to provide context about searching sunnah.com
function getSunnahComContext(query: string): string {
  const searchUrl = `https://sunnah.com/search?q=${encodeURIComponent(query)}`;
  console.log("Query context for:", query);
  return `User is searching for: "${query}". Sunnah.com search URL: ${searchUrl}`;
}

const translateText = async (text: string, target: string) => {
  if (!text.trim() || target === "en") {
    return text;
  }

  for (const endpoint of TRANSLATE_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: "auto",
          target,
          format: "text",
        }),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      if (data?.translatedText) {
        return data.translatedText as string;
      }
    } catch (error) {
      console.warn("Translation request failed:", error);
    }
  }

  return text;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const targetLanguageLabel =
      typeof language?.label === "string" ? language.label : "English";
    const targetLanguageCode =
      typeof language?.translateCode === "string"
        ? language.translateCode
        : typeof language?.code === "string"
          ? language.code
          : "en";

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
      const greetingEnglish =
        "May peace, mercy, and blessings of Allah be upon you! Here are authentic hadiths about the virtue of greeting with Salam:\n\n💡 Important: These authentic sources are from sunnah.com and quran.com. For personal religious rulings (fatwas), please consult qualified Islamic scholars.";
      const translatedGreeting =
        targetLanguageCode === "en"
          ? greetingEnglish
          : await translateText(greetingEnglish, targetLanguageCode);
      const greetingMessage = `وعليكم السلام ورحمة الله وبركاته (Wa alaykumu as-salam wa rahmatullahi wa barakatuh)\n\n${translatedGreeting}`;
      return new Response(
        JSON.stringify({
          content: greetingMessage,
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
          quranCitations: []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchContext = getSunnahComContext(userQuestion);
    console.log("Search context:", searchContext);

    const systemPrompt = `You are an Islamic knowledge assistant. Answer questions about Islam using authentic hadiths from sunnah.com AND relevant Quran verses from quran.com.

LANGUAGE INSTRUCTIONS:
- Respond in ${targetLanguageLabel} for the main answer paragraphs.
- Do NOT translate any Arabic text.
- Do NOT translate Quran or Hadith citations into other languages. Keep citation translations in English.

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

EXAMPLE HADITHS BY TOPIC:
CHARITY: Bukhari 1442, Muslim 2588
PRAYER: Bukhari 528, Muslim 251  
PATIENCE: Bukhari 5645, Muslim 2999
PARENTS: Bukhari 5971, Muslim 2548
TRUTH: Bukhari 6094, Muslim 2607

EXAMPLE QURAN VERSES BY TOPIC:
CHARITY: 2:267, 57:18, 2:274
PRAYER: 2:238, 11:114, 29:45
PATIENCE: 2:153, 3:200, 16:127
PARENTS: 17:23-24, 31:14, 46:15
TRUTH: 3:17, 9:119, 33:35
MERCY: 21:107, 6:54, 7:156
GUIDANCE: 1:6-7, 2:2, 6:71
WORSHIP: 51:56, 1:5, 2:21
FAITH: 49:14-15, 2:285, 3:193
KNOWLEDGE: 20:114, 39:9, 58:11

CRITICAL RULES FOR HADITH CITATIONS:
1. Include HADITH_CITATIONS_START/END with valid JSON array
2. JSON must be on ONE line (no line breaks)
3. URL format: https://sunnah.com/bukhari:1442 (lowercase collection name)
4. Include 1-4 relevant citations
5. Only include: collection, hadithNumber, url, translation, arabic
6. The "translation" field MUST contain the EXACT English translation from the specific sunnah.com URL
7. The "arabic" field MUST contain the EXACT Arabic text from the specific sunnah.com URL

CRITICAL RULES FOR QURAN CITATIONS:
1. Include QURAN_CITATIONS_START/END with valid JSON array
2. JSON must be on ONE line (no line breaks)
3. URL format: https://quran.com/2/255 (surah/ayah)
4. Include 1-3 relevant Quran citations when applicable
5. Must include: surahNumber, ayahNumber, surahName, ayahName (if famous like Ayat al-Kursi), arabicText, translation, url
6. The "arabicText" field should contain the Arabic text of the ayah
7. The "translation" field should contain the English translation (Sahih International or similar)
8. If a question is specifically about Quran, prioritize Quran citations
9. If a question is specifically about Hadith, prioritize Hadith citations
10. For general Islamic questions, include BOTH Quran and Hadith citations

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
