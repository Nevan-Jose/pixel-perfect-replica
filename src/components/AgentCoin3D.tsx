import { memo, Suspense, useMemo, useRef } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

interface AgentCoin3DProps {
  size?: number;
  seed?: string;
}

const COIN_PALETTES = [
  { color: "#c8cdd2", metalness: 0.98, roughness: 0.03 },
];

// Pre-create material instances to avoid GC pressure
const materialCache = new Map<number, THREE.MeshStandardMaterial>();
function getMaterial(idx: number) {
  if (materialCache.has(idx)) return materialCache.get(idx)!;
  const p = COIN_PALETTES[idx];
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.color),
    metalness: p.metalness,
    roughness: p.roughness,
    envMapIntensity: 1.5,
  });
  materialCache.set(idx, mat);
  return mat;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function CoinModel({ seed = "default" }: { seed?: string }) {
  const palIdx = hashSeed(seed) % COIN_PALETTES.length;
  const mat = getMaterial(palIdx);
  const gltf = useLoader(GLTFLoader, "/models/diamond_coin.glb");
  const ref = useRef<THREE.Group>(null);

  const scene = useMemo(() => {
    const s = gltf.scene.clone(true);
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = mat;
      }
    });
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const scale = 2.0 / maxDim;
      s.scale.setScalar(scale);
      s.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    }
    return s;
  }, [gltf, mat]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.8;
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

const AgentCoin3D = memo(({ size = 140, seed }: AgentCoin3DProps) => (
  <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Canvas
      camera={{ position: [0, 0, 5], fov: 30 }}
      gl={{
        antialias: false,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.6,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.5]}
      style={{ width: size, height: size }}
      frameloop="always"
    >
      <ambientLight intensity={2} />
      <directionalLight position={[3, 4, 5]} intensity={5} />
      <directionalLight position={[-3, -1, 3]} intensity={3} />
      <Suspense fallback={null}>
        <CoinModel seed={seed} />
      </Suspense>
    </Canvas>
  </div>
));

AgentCoin3D.displayName = "AgentCoin3D";
export default AgentCoin3D;
