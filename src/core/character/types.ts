export type LisaExpression =
  | "neutral"
  | "happy"
  | "excited"
  | "thinking"
  | "confused"
  | "supportive"
  | "surprised"
  | "focused"
  | "sad"
  | "angry"
  | "error"
  | "sleeping";

export type LisaAnimationState =
  | "idle"
  | "talking"
  | "listening"
  | "thinking"
  | "waving"
  | "dancing"
  | "clapping"
  | "nodding"
  | "shaking_head";

export interface CharacterEnvironment {
  type: "office" | "hospital" | "zoo" | "school" | "space" | "nature" | "lab" | "generic";
  backgroundUrl?: string;
  lighting?: {
    ambientColor: string;
    ambientIntensity: number;
    directionalColor: string;
    directionalIntensity: number;
  };
}

export interface CharacterPersonaProfile {
  personaId: string;
  vrmUrl: string; // URL to the .vrm file
  outfitId?: string;
  accessoryIds?: string[];
  environment: CharacterEnvironment;
  baseExpression: LisaExpression;
}

export interface CharacterState {
  expression: LisaExpression;
  animation: LisaAnimationState;
  isSpeaking: boolean;
  speakingVolume: number;
  environment: CharacterEnvironment;
  currentPersonaId: string;
}
