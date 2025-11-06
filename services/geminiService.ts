
import { GoogleGenAI, GroundingChunk } from "@google/genai";
import { Source } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseSources = (groundingChunks: GroundingChunk[] | undefined): Source[] => {
    if (!groundingChunks) return [];
    
    const sources: Source[] = [];
    groundingChunks.forEach(chunk => {
      if (chunk.web) {
        sources.push({
          uri: chunk.web.uri || '',
          title: chunk.web.title || 'Untitled Source'
        });
      }
    });

    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(sources.map(item => [item['uri'], item])).values());
    return uniqueSources;
}

export async function* streamResponse(prompt: string) {
  const model = 'gemini-2.5-pro';

  try {
    const stream = await ai.models.generateContentStream({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }, { codeExecution: {} }],
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      const sources = parseSources(groundingMetadata?.groundingChunks);
      
      yield { text, sources };
    }
  } catch (error) {
    console.error("Error in streamResponse:", error);
    throw error;
  }
}
