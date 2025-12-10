export interface ComicPanel {
  id: number;
  description: string;
  dialogue: string;
  character: string;
  visualPrompt: string;
  imageData?: string; // Base64 string
  isLoadingImage: boolean;
}

export interface ComicScript {
  title: string;
  artStyle: string;
  characterDefinitions: string; // Global description of characters/setting for consistency
  panels: ComicPanel[];
}

export interface GenerateScriptResponse {
  comicScript: ComicScript;
}