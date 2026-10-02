import { CharacterPersonaProfile } from "./types";

export const PERSONA_VISUAL_REGISTRY: Record<string, CharacterPersonaProfile> = {
  default: {
    personaId: "default",
    vrmUrl: "/models/Avatar.vrm",
    environment: { type: "generic" },
    baseExpression: "neutral"
  },
  nurse: {
    personaId: "nurse",
    vrmUrl: "/models/Lisa_Nurse.vrm", // Hypothetical asset path
    environment: { type: "hospital" },
    baseExpression: "supportive"
  },
  teacher: {
    personaId: "teacher",
    vrmUrl: "/models/Lisa_Teacher.vrm",
    environment: { type: "school" },
    baseExpression: "focused"
  },
  zoo_guide: {
    personaId: "zoo_guide",
    vrmUrl: "/models/Lisa_Safari.vrm",
    environment: { type: "zoo" },
    baseExpression: "happy"
  },
  scientist: {
    personaId: "scientist",
    vrmUrl: "/models/Lisa_Lab.vrm",
    environment: { type: "lab" },
    baseExpression: "analytical" as any // neutral but focused
  },
  astronaut: {
    personaId: "astronaut",
    vrmUrl: "/models/Lisa_Space.vrm",
    environment: { type: "space" },
    baseExpression: "focused"
  }
};

export function getPersonaVisualProfile(personaId: string): CharacterPersonaProfile {
  return PERSONA_VISUAL_REGISTRY[personaId] || PERSONA_VISUAL_REGISTRY.default;
}
