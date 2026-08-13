import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";

export default function VRMAvatar() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("VRMAvatar Mounted");
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      35,
      300 / 400,
      0.1,
      1000
    );
    camera.position.set(0, 1.4, 2.3);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setSize(320, 380);
    containerRef.current.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff,2));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(2, 2, 2);
    scene.add(light);

   const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

loader.load(
  "/models/Avatar.vrm",

  (gltf: any) => {
    console.log("VRM Loaded", gltf);

    const vrm = gltf.userData.vrm;

    scene.add(vrm.scene);

    // Scale
    vrm.scene.scale.setScalar(0.8);
    // Ya agar bada chahiye to 1.2 ya 1.4 kar sakte ho

    function animate() {
      requestAnimationFrame(animate);

      vrm.scene.rotation.y += 0.003;

      renderer.render(scene, camera);
    }

    animate();
  },

  undefined,

  (error) => {
    console.error("VRM Error", error);
  }
);

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
  <div
    ref={containerRef}
    style={{
      width: "320px",
      height: "380px",
      border: "3px solid red",
      background: "#111"
    }}
  />
);
}