import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMExpressionPresetName } from "@pixiv/three-vrm";
import { characterManager } from "../core/character/CharacterManager";
import { CharacterState } from "../core/character/types";
import { getPersonaVisualProfile } from "../core/character/PersonaVisualRegistry";
import { LisaEnvironment } from "./LisaEnvironment";

export default function VRMAvatar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const vrmRef = useRef<VRM | null>(null);
  const [characterState, setCharacterState] = useState<CharacterState>(characterManager.getState());

  useEffect(() => {
    const unsubscribe = characterManager.subscribe(state => {
      setCharacterState(state);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, 320 / 380, 0.1, 1000);
    camera.position.set(0, 1.45, 1.8); // Focus more on the face

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(320, 380);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(1, 2, 3);
    scene.add(dirLight);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    const visualProfile = getPersonaVisualProfile(characterState.currentPersonaId);

    // In a real app, we'd check if the file exists or use a fallback
    // For this implementation, we'll use the default /models/Avatar.vrm if others fail
    const modelUrl = visualProfile.vrmUrl;

    loader.load(
      "/models/Avatar.vrm", // Using default for now to ensure it loads in this environment
      (gltf: any) => {
        const vrm = gltf.userData.vrm as VRM;
        vrmRef.current = vrm;
        scene.add(vrm.scene);
        vrm.scene.rotation.y = Math.PI; // Face the camera
        vrm.scene.scale.setScalar(1.0);

        // Position character
        vrm.scene.position.set(0, 0, 0);

        const clock = new THREE.Clock();

        function animate() {
          requestAnimationFrame(animate);
          const delta = clock.getDelta();
          const elapsed = clock.getElapsedTime();

          if (vrm) {
            // Update VRM
            vrm.update(delta);

            // 1. Idle breathing / swaying
            vrm.humanoid?.getRawBoneNode("chest")?.rotation.set(
              Math.sin(elapsed * 0.5) * 0.02,
              0,
              0
            );

            // 2. Eye Blinking (natural)
            const blinkValue = Math.max(0, Math.sin(elapsed * 0.3) > 0.98 ? 1 : 0);
            vrm.expressionManager?.setValue("blink", blinkValue);

            // 3. Lip Sync (Approximation)
            if (characterManager.getState().isSpeaking) {
              const mouthOpen = 0.2 + Math.random() * 0.5;
              vrm.expressionManager?.setValue("aa", mouthOpen);
            } else {
              vrm.expressionManager?.setValue("aa", 0);
            }

            // 4. Expressions
            const currentExpr = characterManager.getState().expression;
            applyExpression(vrm, currentExpr);
          }

          renderer.render(scene, camera);
        }

        animate();
      },
      undefined,
      (error) => console.error("VRM Loading Error:", error)
    );

    return () => {
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [characterState.currentPersonaId]);

  function applyExpression(vrm: VRM, expr: string) {
    if (!vrm.expressionManager) return;

    // Reset major expressions
    const presets: VRMExpressionPresetName[] = ["happy", "relaxed", "surprised", "angry", "sad"];
    presets.forEach(p => vrm.expressionManager?.setValue(p, 0));

    switch (expr) {
      case "happy":
      case "excited":
        vrm.expressionManager.setValue("happy", 0.8);
        break;
      case "surprised":
        vrm.expressionManager.setValue("surprised", 0.7);
        break;
      case "sad":
      case "confused":
        vrm.expressionManager.setValue("sad", 0.4);
        break;
      case "supportive":
        vrm.expressionManager.setValue("relaxed", 0.6);
        break;
      case "focused":
        vrm.expressionManager.setValue("relaxed", 0.3);
        break;
      case "thinking":
        vrm.expressionManager.setValue("relaxed", 0.2);
        // Look slightly away?
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 backdrop-blur-md"
      style={{ width: "320px", height: "380px" }}
    >
      {/* Dynamic Environment */}
      <LisaEnvironment environment={getPersonaVisualProfile(characterState.currentPersonaId).environment} />

      {/* Environment Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent z-10" />

      {/* State Label */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${characterState.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-400 opacity-50'}`} />
        <span className="text-[10px] font-bold tracking-widest uppercase text-white/40">
          LISA_{characterState.expression.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
