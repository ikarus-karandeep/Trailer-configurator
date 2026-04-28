import { Suspense, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  useGLTF,
  ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  length: number;
  exteriorColor: string;
}

function ResponsiveCamera() {
  const { viewport, camera } = useThree();
  const isMobile = viewport.aspect < 1;

  useMemo(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = isMobile ? 55 : 40;
      camera.position.set(isMobile ? 12 : 8, isMobile ? 6 : 4, isMobile ? 12 : 8);
      camera.updateProjectionMatrix();
    }
  }, [isMobile, camera]);

  return null;
}

function TrailerModel({ length, exteriorColor }: SceneProps) {
  const { scene, materials } = useGLTF('/trailer.glb') as any;

  const colorMap: Record<string, string> = {
    'Matte Black': '#111111',
    'Arctic White': '#f0f0f0',
    'Charcoal': '#333333',
    'Silver Frost': '#c0c0c0',
    'Victory Red': '#b00000',
    'Royal Blue': '#000080',
    'Arizona Beige': '#d4b483',
    'Yellow Gold': '#ffa500',
    'Emerald Green': '#004000',
    'Grey': '#888888',
    'Copper': '#b87333',
    'Brushed Metal': '#a1a1aa',
    'Electric Lime': '#ccff00',
    'Cyan': '#00ffff'
  };

  const hexColor = useMemo(() => {
    const nameMatch = exteriorColor.match(/Color: (.*)/);
    const colorName = nameMatch ? nameMatch[1] : 'Arctic White';
    return colorMap[colorName] || '#f0f0f0';
  }, [exteriorColor]);

  useMemo(() => {
    if (materials.Body) {
      materials.Body.color = new THREE.Color(hexColor);
      materials.Body.roughness = 0.4;
      materials.Body.metalness = 0.2;
    }
    if (materials.Wheels) {
      materials.Wheels.color = new THREE.Color('#111111');
      materials.Wheels.roughness = 1.0;
    }
  }, [materials, hexColor]);

  const scaleZ = useMemo(() => {
    return length / 24;
  }, [length]);

  return (
    <group rotation={[0, -Math.PI / 4, 0]} position={[0, -1, 0]}>
      <primitive 
        object={scene} 
        scale={[1, 1, scaleZ]} 
      />
    </group>
  );
}

export default function TrailerScene({ length, exteriorColor }: SceneProps) {
  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas 
        dpr={1} 
        gl={{ 
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: true
        }}
        camera={{ position: [8, 4, 8], fov: 40 }}
      >
        <ResponsiveCamera />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, 5, -5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <TrailerModel length={length} exteriorColor={exteriorColor} />
          
          <ContactShadows 
            position={[0, -1, 0]} 
            opacity={0.6} 
            scale={20} 
            blur={2} 
            far={4.5} 
          />
          
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 2.1} 
          makeDefault
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/trailer.glb');
