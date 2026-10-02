import { LisaExpression, LisaAnimationState, CharacterState, CharacterEnvironment } from "./types";

export class CharacterManager {
  private static instance: CharacterManager;
  private state: CharacterState;
  private listeners: Set<(state: CharacterState) => void> = new Set();

  private constructor() {
    this.state = {
      expression: "neutral",
      animation: "idle",
      isSpeaking: false,
      speakingVolume: 0,
      environment: {
        type: "generic",
        lighting: {
          ambientColor: "#ffffff",
          ambientIntensity: 2,
          directionalColor: "#ffffff",
          directionalIntensity: 2
        }
      },
      currentPersonaId: "default"
    };
  }

  public static getInstance(): CharacterManager {
    if (!CharacterManager.instance) {
      CharacterManager.instance = new CharacterManager();
    }
    return CharacterManager.instance;
  }

  public getState(): CharacterState {
    return { ...this.state };
  }

  public setState(updates: Partial<CharacterState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  public setExpression(expression: LisaExpression) {
    this.setState({ expression });
  }

  public setAnimation(animation: LisaAnimationState) {
    this.setState({ animation });
  }

  public setSpeaking(isSpeaking: boolean, volume: number = 0) {
    this.setState({ isSpeaking, speakingVolume: volume });
  }

  public setEnvironment(environment: CharacterEnvironment) {
    this.setState({ environment });
  }

  public setPersona(personaId: string) {
    this.setState({ currentPersonaId: personaId });
  }

  public subscribe(listener: (state: CharacterState) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }
}

export const characterManager = CharacterManager.getInstance();
