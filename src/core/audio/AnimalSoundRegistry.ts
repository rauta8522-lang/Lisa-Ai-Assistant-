export interface AnimalSoundEntry {
  species: string;
  aliases: string[];
  soundType: string;
  synthesizerType: "roar" | "trumpet" | "howl" | "bark" | "meow" | "chirp" | "hiss" | "chatter";
  licenseMetadata: string;
  durationMs: number;
}

export const ANIMAL_SOUND_REGISTRY: AnimalSoundEntry[] = [
  { species: "tiger", aliases: ["tiger", "tigers", "bagh", "panthera tigris"], soundType: "roar", synthesizerType: "roar", licenseMetadata: "Public Domain / Synthesized Bioacoustic Model", durationMs: 2500 },
  { species: "lion", aliases: ["lion", "lions", "simha", "panthera leo"], soundType: "roar", synthesizerType: "roar", licenseMetadata: "Public Domain / Synthesized Bioacoustic Model", durationMs: 3000 },
  { species: "elephant", aliases: ["elephant", "elephants", "gaj", "hathi"], soundType: "trumpet", synthesizerType: "trumpet", licenseMetadata: "Public Domain / Synthesized Bioacoustic Model", durationMs: 2000 },
  { species: "wolf", aliases: ["wolf", "wolves", "bhediya"], soundType: "howl", synthesizerType: "howl", licenseMetadata: "Public Domain / Synthesized Bioacoustic Model", durationMs: 3500 },
  { species: "dog", aliases: ["dog", "dogs", "puppy", "kutta"], soundType: "bark", synthesizerType: "bark", licenseMetadata: "Public Domain / Synthesized Bioacoustic Model", durationMs: 1000 },
  { species: "cat", aliases: ["cat", "cats", "kitten", "billi"], soundType: "meow", synthesizerType: "meow", licenseMetadata: "Public Domain / Synthesized Bioacoustic Model", durationMs: 1000 },
  { species: "bird", aliases: ["bird", "birds", "eagle", "parrot", "pigeon", "chirp", "chidiya"], soundType: "chirp", synthesizerType: "chirp", licenseMetadata: "Public Domain / Synthesized Bioacoustic Model", durationMs: 1500 },
  { species: "snake", aliases: ["snake", "snakes", "python", "cobra", "viper", "saamp"], soundType: "hiss", synthesizerType: "hiss", licenseMetadata: "Public Domain / Synthesized Bioacoustic Model", durationMs: 1500 },
  { species: "monkey", aliases: ["monkey", "monkeys", "ape", "chimpanzee", "bandar"], soundType: "chatter", synthesizerType: "chatter", licenseMetadata: "Public Domain / Synthesized Bioacoustic Model", durationMs: 2000 }
];

export class AnimalSoundSystem {
  public static detectAnimalMention(text: string): AnimalSoundEntry | null {
    if (!text) return null;
    const lower = text.toLowerCase();
    for (const entry of ANIMAL_SOUND_REGISTRY) {
      if (entry.aliases.some(alias => new RegExp(`\\b${alias}\\b`, "i").test(lower))) {
        return entry;
      }
    }
    return null;
  }

  public static async playAnimalSound(entry: AnimalSoundEntry): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (entry.synthesizerType === "roar") {
        // Deep roaring frequency sweep with noise/distortion effect approximation
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 1.2);
        osc.frequency.exponentialRampToValueAtTime(70, now + 2.0);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + entry.durationMs / 1000);
        osc.start(now);
        osc.stop(now + entry.durationMs / 1000);
      } else if (entry.synthesizerType === "trumpet") {
        // High brassy elephant trumpet sweep
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(550, now + 0.8);
        osc.frequency.linearRampToValueAtTime(350, now + 1.8);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + entry.durationMs / 1000);
        osc.start(now);
        osc.stop(now + entry.durationMs / 1000);
      } else if (entry.synthesizerType === "howl") {
        // Rising and falling wolf howl
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(750, now + 1.5);
        osc.frequency.linearRampToValueAtTime(450, now + 3.0);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + entry.durationMs / 1000);
        osc.start(now);
        osc.stop(now + entry.durationMs / 1000);
      } else if (entry.synthesizerType === "bark") {
        osc.type = "square";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (entry.synthesizerType === "meow") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.3);
        osc.frequency.linearRampToValueAtTime(400, now + 0.8);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        osc.start(now);
        osc.stop(now + 0.9);
      } else if (entry.synthesizerType === "chirp") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.linearRampToValueAtTime(2400, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (entry.synthesizerType === "hiss") {
        // White noise hiss approximation using buffer or short bursts
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.0);
      } else {
        // Default chatter
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }

      await new Promise(r => setTimeout(r, entry.durationMs));
    } catch (e) {
      console.warn("[ANIMAL SOUND] Error playing sound:", e);
    }
  }
}
