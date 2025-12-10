import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ComicScript, ComicPanel } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates the structure, dialogue, and visual prompts for the comic.
 */
export const generateComicScript = async (
  prompt: string,
  base64Image?: string,
  mimeType?: string,
  previousContext?: string,
  existingArtStyle?: string
): Promise<ComicScript> => {
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A catchy title for the comic strip." },
      artStyle: { type: Type.STRING, description: "The visual art style (e.g., Noir, Manga, Pixel Art, Watercolor)." },
      characterDefinitions: { type: Type.STRING, description: "A highly detailed, consistent visual description of the main character(s) and setting. (e.g., 'Protagonist: A young woman with pink hair wearing a silver flight suit. Setting: A dusty red mars colony'). This will be used to keep images consistent." },
      panels: {
        type: Type.ARRAY,
        description: "A list of 3 to 6 panels for the comic.",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            description: { type: Type.STRING, description: "A brief description of the action." },
            dialogue: { type: Type.STRING, description: "The dialogue bubble text. Keep it short." },
            character: { type: Type.STRING, description: "Who is speaking." },
            visualPrompt: { type: Type.STRING, description: "A description of the specific scene action, camera angle, and lighting. Do NOT repeat character details here, focus on the action." },
          },
          required: ["id", "description", "dialogue", "character", "visualPrompt"],
        },
      },
    },
    required: ["title", "artStyle", "characterDefinitions", "panels"],
  };

  const parts: any[] = [];
  
  if (base64Image && mimeType) {
    parts.push({
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    });
  }

  let promptText = `Create a short, engaging comic strip script based on this idea: "${prompt}".`;

  if (existingArtStyle) {
    promptText += `\nMaintain the existing art style: "${existingArtStyle}".`;
  }
  
  if (previousContext) {
    promptText += `\nThis is a continuation of a previous story. Here is the context of what happened so far: \n${previousContext}\n. Continue the story naturally.`;
  } else {
    promptText += `\nEnsure the visual prompts are descriptive enough for an AI image generator to create consistent scenes. Define the characters visually first in 'characterDefinitions'.`;
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert comic book writer and director. You create engaging micro-stories.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini.");
    
    // Parse JSON
    return JSON.parse(text) as ComicScript;

  } catch (error) {
    console.error("Error generating script:", error);
    throw error;
  }
};

/**
 * Generates an image for a specific panel.
 */
export const generatePanelImage = async (
  panel: ComicPanel,
  style: string,
  characterDefinitions: string
): Promise<string> => {
  try {
    // We compose a prompt that includes the style AND character definitions to maintain consistency
    const fullPrompt = `
      Art Style: ${style}
      Consistent Character/Setting Details: ${characterDefinitions}
      Current Scene Action: ${panel.visualPrompt}
      
      Generate a high-quality comic book panel. 
      Framing: Cinematic. 
      Ratio: Square (1:1).
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        // Nano banana models don't support responseMimeType or Schema
        // We rely on extracting inlineData
      },
    });

    // Extract image from parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }

    throw new Error("No image data found in response.");

  } catch (error) {
    console.error(`Error generating image for panel ${panel.id}:`, error);
    throw error;
  }
};