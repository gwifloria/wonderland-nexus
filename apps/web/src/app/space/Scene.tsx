// components/RoomScene.tsx
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";

export default function RoomScene() {
  const { scene } = useGLTF("/models/room.glb"); // 替换成你的模型名

  return (
    <div className="h-screen w-full bg-gradient-to-b from-black to-gray-900">
      <Canvas
        gl={{ antialias: true }}
        shadows
        camera={{ position: [25, 25, 25], near: 0.1, far: 1000, fov: 45 }}
      >
        <color attach="background" args={["rgba(143, 144, 123, 1)"]} />

        <ambientLight intensity={0.5} color="#faf3e0" />
        <spotLight
          position={[5, 5, 5]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <pointLight position={[-5, 3, -5]} intensity={0.3} color="#e6f3ff" />
        <OrbitControls />
        <directionalLight position={[5, 5, 5]} />
        <Environment preset="warehouse" />
        <primitive object={scene} />
      </Canvas>
    </div>
  );
}
