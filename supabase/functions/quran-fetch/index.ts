import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Available reciters with their IDs for the audio API
const RECITERS = {
  "mishary": { id: 7, name: "Mishary Rashid Al Afasy" },
  "shuraim": { id: 4, name: "Abdurrahman Al Sudais & Saud Al-Shuraim" },
  "minshawi": { id: 9, name: "Mohamed Siddiq Al-Minshawi" },
  "husary": { id: 5, name: "Mahmoud Khalil Al-Husary" },
  "abdulbasit": { id: 1, name: "Abdul Basit Abdul Samad" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { surahNumber, ayahNumber, type, reciterId } = await req.json();

    console.log(`Fetching ${type} for Surah ${surahNumber}, Ayah ${ayahNumber}`);

    if (!surahNumber || !ayahNumber) {
      return new Response(
        JSON.stringify({ error: "surahNumber and ayahNumber are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch translation
    if (type === "translation") {
      try {
        // Use quran.com API for translation
        const response = await fetch(
          `https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayahNumber}?translations=131`,
          { headers: { "Accept": "application/json" } }
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const translation = data.verse?.translations?.[0]?.text || "Translation not available";
        
        // Clean HTML tags from translation
        const cleanTranslation = translation.replace(/<[^>]*>/g, '');
        
        return new Response(
          JSON.stringify({ translation: cleanTranslation }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.error("Error fetching translation:", e);
        return new Response(
          JSON.stringify({ error: "Failed to fetch translation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch tafsir
    if (type === "tafsir") {
      try {
        // Use quran.com tafsir API (Ibn Kathir English - ID 169)
        const response = await fetch(
          `https://api.quran.com/api/v4/tafsirs/169/by_ayah/${surahNumber}:${ayahNumber}`,
          { headers: { "Accept": "application/json" } }
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const tafsirText = data.tafsir?.text || "Tafsir not available";
        
        // Clean HTML tags from tafsir
        const cleanTafsir = tafsirText.replace(/<[^>]*>/g, '');
        
        return new Response(
          JSON.stringify({ tafsir: cleanTafsir }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.error("Error fetching tafsir:", e);
        return new Response(
          JSON.stringify({ error: "Failed to fetch tafsir" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch audio
    if (type === "audio") {
      try {
        const selectedReciter = RECITERS[reciterId as keyof typeof RECITERS] || RECITERS.mishary;
        
        // Use quran.com audio API
        const response = await fetch(
          `https://api.quran.com/api/v4/recitations/${selectedReciter.id}/by_ayah/${surahNumber}:${ayahNumber}`,
          { headers: { "Accept": "application/json" } }
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const audioFile = data.audio_files?.[0];
        
        if (!audioFile) {
          throw new Error("No audio file found");
        }
        
        // Construct full audio URL
        const audioUrl = audioFile.url.startsWith('http') 
          ? audioFile.url 
          : `https://verses.quran.com/${audioFile.url}`;
        
        return new Response(
          JSON.stringify({ 
            audioUrl,
            reciterName: selectedReciter.name 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.error("Error fetching audio:", e);
        return new Response(
          JSON.stringify({ error: "Failed to fetch audio" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get reciters list
    if (type === "reciters") {
      return new Response(
        JSON.stringify({ 
          reciters: Object.entries(RECITERS).map(([id, data]) => ({
            id,
            name: data.name
          }))
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid type. Use 'translation', 'tafsir', 'audio', or 'reciters'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in quran-fetch function:", error);
    return new Response(
      JSON.stringify({ error: "Unable to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
