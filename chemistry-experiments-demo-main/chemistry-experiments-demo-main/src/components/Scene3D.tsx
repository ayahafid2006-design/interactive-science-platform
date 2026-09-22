import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Cylinder, Box, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

interface Scene3DProps {
  chapterId: string;
  color: string;
}

export function Scene3D({ chapterId, color }: Scene3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const renderModel = () => {
    switch (chapterId) {
      case 'thermodynamics':
        return (
          <Float speed={2} rotationIntensity={2} floatIntensity={2}>
            <Sphere args={[1.2, 64, 64]}>
              <MeshDistortMaterial 
                color={color} 
                envMapIntensity={1} 
                clearcoat={1} 
                clearcoatRoughness={0.1} 
                metalness={0.8} 
                roughness={0.2}
                distort={0.4}
                speed={3}
              />
            </Sphere>
            {/* Particles representing heat */}
            <pointLight color="#ff5722" intensity={2} distance={5} />
          </Float>
        );
      case 'chemical-equilibrium':
        return (
          <group ref={groupRef}>
            <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
              <Torus args={[1.5, 0.2, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} wireframe />
              </Torus>
              <Sphere args={[0.5, 32, 32]} position={[-1, 0, 0]}>
                 <meshStandardMaterial color="#4CAF50" metalness={0.8} roughness={0.2} />
              </Sphere>
              <Sphere args={[0.5, 32, 32]} position={[1, 0, 0]}>
                 <meshStandardMaterial color="#8BC34A" metalness={0.8} roughness={0.2} />
              </Sphere>
            </Float>
          </group>
        );
      case 'ionic-equilibrium':
        return (
          <group ref={groupRef}>
            <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
              <Icosahedron args={[1.2, 0]}>
                <meshStandardMaterial color={color} wireframe />
                </Icosahedron>
              <Sphere args={[0.3, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#2196F3" metalness={1} roughness={0} />
              </Sphere>
            </Float>
          </group>
        );
      case 'electrochemistry':
        return (
          <Float speed={1.5} rotationIntensity={2} floatIntensity={2}>
             <Cylinder args={[0.8, 0.8, 2, 32]}>
                <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
             </Cylinder>
             <Torus args={[0.9, 0.05, 16, 100]} position={[0, 0.8, 0]}>
                <meshStandardMaterial color="#FFC107" emissive="#FFC107" emissiveIntensity={2} />
             </Torus>
             <Torus args={[0.9, 0.05, 16, 100]} position={[0, -0.8, 0]}>
                <meshStandardMaterial color="#00BCD4" emissive="#00BCD4" emissiveIntensity={2} />
             </Torus>
          </Float>
        );
      case 'coordination':
        return (
          <group ref={groupRef}>
             <Float speed={2} rotationIntensity={3} floatIntensity={2}>
                <Sphere args={[0.6, 32, 32]}>
                  <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
                </Sphere>
                {/* Octahedral coordination */}
                {[...Array(6)].map((_, i) => {
                  const phi = Math.acos(-1 + (2 * i) / 6);
                  const theta = Math.sqrt(6 * Math.PI) * phi;
                  const x = 1.5 * Math.cos(theta) * Math.sin(phi);
                  const y = 1.5 * Math.sin(theta) * Math.sin(phi);
                  const z = 1.5 * Math.cos(phi);
                  return (
                    <group key={i}>
                      <Sphere args={[0.25, 16, 16]} position={[x, y, z]}>
                        <meshStandardMaterial color="#E040FB" metalness={0.5} roughness={0.5} />
                      </Sphere>
                      <Cylinder args={[0.05, 0.05, 1.5]} position={[x/2, y/2, z/2]} rotation={[
                        Math.atan2(z, y), 0, Math.atan2(x, y)
                      ]}>
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
                      </Cylinder>
                    </group>
                  )
                })}
             </Float>
          </group>
        );
      case 'analytical':
        return (
          <Float speed={1} rotationIntensity={1} floatIntensity={2}>
            {/* Erlenmeyer flask approximation */}
            <Cylinder args={[0.3, 1, 2, 32]} >
               <meshStandardMaterial color="#ffffff" transparent opacity={0.2} metalness={0.1} roughness={0.1} />
            </Cylinder>
            <Cylinder args={[0.3, 0.3, 0.8, 32]} position={[0, 1.4, 0]}>
               <meshStandardMaterial color="#ffffff" transparent opacity={0.2} metalness={0.1} roughness={0.1} />
            </Cylinder>
            {/* Liquid inside */}
            <Cylinder args={[0.25, 0.95, 1.5, 32]} position={[0, -0.2, 0]}>
               <MeshDistortMaterial color={color} distort={0.2} speed={2} transparent opacity={0.8} />
            </Cylinder>
          </Float>
        );
      case 'organic':
        return (
          <group ref={groupRef}>
             <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
                {/* Hexagon ring (Benzene) */}
                {[...Array(6)].map((_, i) => {
                  const angle = (i * Math.PI) / 3;
                  const x = Math.cos(angle) * 1.2;
                  const y = Math.sin(angle) * 1.2;
                  return (
                    <Sphere key={i} args={[0.3, 32, 32]} position={[x, y, 0]}>
                       <meshStandardMaterial color="#424242" metalness={0.5} roughness={0.2} />
                    </Sphere>
                  );
                })}
                {/* Bonds */}
                <Torus args={[1.2, 0.05, 16, 6]} rotation={[0, 0, Math.PI/6]}>
                  <meshStandardMaterial color={color} />
                </Torus>
             </Float>
          </group>
        );
      default:
        return (
          <Float>
            <Box args={[1, 1, 1]}>
              <meshStandardMaterial color={color} />
            </Box>
          </Float>
        );
    }
  };

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color={color} />
      {renderModel()}
    </group>
  );
}
