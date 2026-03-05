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

VOCABULARY RESTRICTION: You MUST ONLY use the following words/phrases:
- Pronouns: أَنَا, أَنْتَ, أَنْتِ, هُوَ, هِيَ, نَحْنُ, أَنْتُمْ, أَنْتُنَّ, هُمْ, هُنَّ
- Suffixes/Possessives: نِي, لِي, ي, كَ, لَكَ, هُ, لَهُ, نَا, لَنَا, كُمْ, لَكُمْ, هُمْ, لَهُمْ
- Demonstratives/Indefinites: هَذَا, هَؤُلَاءِ, ذَلِكَ, أُولَئِكَ, الْجَمِيعُ, لَا أَحَدَ, شَخْصٌ مَا, كُلُّ شَيْءٍ, لَا شَيْءَ
- Interrogatives: مَاذَا, مَا, مَنْ, أَيْنَ, إِلَى أَيْنَ, مَتَى, كَيْفَ, لِمَاذَا, أَيُّ, كَمْ, هَلْ, أَ
- Time: الْيَوْمَ, أَمْسِ, غَداً, الْآنَ, بَعْدَ, قَبْلَ, دَائِماً, أَحْيَاناً, أَبَداً, صَبَاحاً, ظُهْراً, مَسَاءً, لَيْلاً
- Prepositions: فِي, دَاخِلَ, عَلَى, فَوْقَ, تَحْتَ, بِجَانِبِ, خَلْفَ, وَرَاءَ, مُقَابِلَ, أَمَامَ, إِلَى, مِنْ, مَعَ, لِـ, مِنْ أَجْلِ, عَنْ, حَوْلَ
- Conjunctions/Particles: وَ, لَكِنْ, لِأَنَّ, أَوْ, إِذَا, لَوْ, مِثْلَ, كَـ, رَغْمَ, رُبَّمَا, مِنْ فَضْلِكَ, شُكْراً, نَعَمْ, لَا, حَسَناً, تَمَام, يُوجَدُ, عِنْدِي, لَا يُوجَدُ, لَيْسَ عِنْدِي
- Verbs: يَكُونُ, يَمْلِكُ, يَفْعَلُ, يَذْهَبُ, يَأْتِي, يَأْخُذُ, يُعْطِي, يَقُولُ, يَعْرِفُ, يُرِيدُ, يُفَكِّرُ, يَظُنُّ, يَرَى, يَنْظُرُ, يَجِدُ, يَسْتَخْدِمُ, يَعْمَلُ, يَتَحَدَّثُ, يَفْهَمُ, يُحِبُّ, يَقْرَأُ, يَكْتُبُ, يَسْتَمِعُ
- Modals/Tenses: يَسْتَطِيعُ أَنْ, يَجِبُ أَنْ, الْمُضَارِعُ, الْمُسْتَقْبَلُ, الْمَاضِي
- Adjectives: كَبِيرٌ, صَغِيرٌ, طَوِيلٌ, قَصِيرٌ, قَرِيبٌ, بَعِيدٌ, جَيِّدٌ, سَيِّئٌ, جَمِيلٌ, قَبِيحٌ, جَدِيدٌ, قَدِيمٌ, نَظِيفٌ, مُتَّسِخٌ, صَحِيحٌ, خَاطِئٌ, حَارٌّ, بَارِدٌ, ثَقِيلٌ, خَفِيفٌ, صُلْبٌ, نَاعِمٌ, سَرِيعٌ, بَطِيءٌ, مُبَكِّرٌ, مُتَأَخِّرٌ, كَثِيرٌ, قَلِيلٌ, سَهْلٌ, صَعْبٌ, غَالٍ, رَخِيصٌ, مُمْتَلِئٌ, فَارِغٌ, سَعِيدٌ, حَزِينٌ, مَفْتُوحٌ, مُغْلَقٌ

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
