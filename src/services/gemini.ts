import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PhraseBlock {
  functionAr: string;
  verbAr: string;
  timeAr: string;
  turkish: string;
  transliteration: string;
  imageKeyword: string;
}

export async function generatePhrases(lastPhrase?: PhraseBlock): Promise<PhraseBlock[]> {
  let prompt = `You are an expert Arabic language teacher. Generate a sequence of 5 Arabic sentences for a language learning app.
Each sentence MUST consist of exactly 3 distinct blocks in this order:
1. Function (e.g., "I want to", "I must", "Can you")
2. Verb (e.g., "go", "eat", "sleep")
3. Time/Context (e.g., "today", "tomorrow", "now", "quickly")

CRITICAL RULE: Each sentence in the sequence MUST change EXACTLY ONE of these three blocks compared to the previous sentence. The other two blocks MUST remain identical.
Example of valid sequence:
1. I want to + go + today
2. I want to + eat + today (Verb changed)
3. I must + eat + today (Function changed)
4. I must + eat + tomorrow (Time changed)

Use Modern Standard Arabic (Fusha) with full diacritics (Tashkeel).
`;

  if (lastPhrase) {
    prompt += `\nThe sequence must start by changing exactly one block from this previous sentence:
Function: ${lastPhrase.functionAr}
Verb: ${lastPhrase.verbAr}
Time: ${lastPhrase.timeAr}
`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            functionAr: { type: Type.STRING, description: "Arabic function block with diacritics, e.g., أُرِيدُ أَنْ" },
            verbAr: { type: Type.STRING, description: "Arabic verb block with diacritics, e.g., أَذْهَبَ" },
            timeAr: { type: Type.STRING, description: "Arabic time block with diacritics, e.g., غَداً" },
            turkish: { type: Type.STRING, description: "Full Turkish translation, e.g., Yarın gitmek istiyorum." },
            transliteration: { type: Type.STRING, description: "Latin alphabet transliteration of the full Arabic sentence." },
            imageKeyword: { type: Type.STRING, description: "A single English keyword for a background image, based on the verb (e.g., 'road', 'food', 'sleep')." }
          },
          required: ["functionAr", "verbAr", "timeAr", "turkish", "transliteration", "imageKeyword"]
        }
      }
    }
  });

  try {
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as PhraseBlock[];
  } catch (e) {
    console.error("Failed to parse phrases", e);
    return [];
  }
}
