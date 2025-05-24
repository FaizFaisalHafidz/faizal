import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    Object_2: THREE.Mesh;
    Object_3: THREE.Mesh;
    Object_4: THREE.Mesh;
    Object_5: THREE.Mesh;
    Object_6: THREE.Mesh;
    Object_7: THREE.Mesh;
    Object_8: THREE.Mesh;
    Object_9: THREE.Mesh;
    Object_10: THREE.Mesh;
    Object_11: THREE.Mesh;
    Object_12: THREE.Mesh;
    Object_13: THREE.Mesh;
    Object_14: THREE.Mesh;
    Object_15: THREE.Mesh;
    Object_16: THREE.Mesh;
    Object_17: THREE.Mesh;
    Object_18: THREE.Mesh;
    Object_19: THREE.Mesh;
    Object_20: THREE.Mesh;
    Object_21: THREE.Mesh;
    Object_22: THREE.Mesh;
    Object_23: THREE.Mesh;
    Object_24: THREE.Mesh;
  };
  materials: {
    aluminium: THREE.MeshStandardMaterial;
    black_chrome: THREE.MeshStandardMaterial;
    black_mate: THREE.MeshStandardMaterial;
    black_plastic: THREE.MeshStandardMaterial;
    boby: THREE.MeshStandardMaterial;
    bolts: THREE.MeshStandardMaterial;
    brakedisc: THREE.MeshStandardMaterial;
    brakelight: THREE.MeshStandardMaterial;
    chrome: THREE.MeshStandardMaterial;
    front_wing: THREE.MeshStandardMaterial;
    front_wing_doubleside: THREE.MeshStandardMaterial;
    headlights: THREE.MeshStandardMaterial;
    hondabac: THREE.MeshStandardMaterial;
    hondaseat: THREE.MeshStandardMaterial;
    hondaside: THREE.MeshStandardMaterial;
    lines: THREE.MeshStandardMaterial;
    mirrors: THREE.MeshStandardMaterial;
    material: THREE.MeshStandardMaterial;
    material_18: THREE.MeshStandardMaterial;
    tex_chrome: THREE.MeshStandardMaterial;
    tex_plastic: THREE.MeshStandardMaterial;
    tex_seat: THREE.MeshStandardMaterial;
    tire: THREE.MeshStandardMaterial;
  };
};

type HondaCBModelProps = {
  color: string | { type: 'gradient'; colors: string[]; };
  metalness: number;
  autoRotate?: boolean;
} & JSX.IntrinsicElements['group'];

export function HondaCBModel({ color, metalness, autoRotate = true, ...props }: HondaCBModelProps) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF('/models/honda_cb.glb') as GLTFResult;
  
  // Clone materials to not affect other instances
  const bobyMaterial = materials.boby.clone();
  const frontWingMaterial = materials.front_wing.clone();
  
  // Set color from props
  if (typeof color === 'string') {
    // Solid color
    bobyMaterial.color = new THREE.Color(color);
    frontWingMaterial.color = new THREE.Color(color);
  } else if (color.type === 'gradient') {
    // Untuk gradasi, kita membuat texture gradient
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 512, 512);
      color.colors.forEach((colorHex, index) => {
        gradient.addColorStop(index / (color.colors.length - 1), colorHex);
      });
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);
      
      const texture = new THREE.CanvasTexture(canvas);
      bobyMaterial.map = texture;
      frontWingMaterial.map = texture;
      // Setel warna default putih agar texture terlihat jelas
      bobyMaterial.color = new THREE.Color("#ffffff");
      frontWingMaterial.color = new THREE.Color("#ffffff");
    }
  }
  
  bobyMaterial.metalness = metalness;
  frontWingMaterial.metalness = metalness;
  
  // Auto-rotate animation
  useFrame((state, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={1.111}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          material={materials.aluminium}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_3.geometry}
          material={materials.black_chrome}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_4.geometry}
          material={materials.black_mate}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials.black_plastic}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_6.geometry}
          material={bobyMaterial}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_7.geometry}
          material={materials.bolts}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_8.geometry}
          material={materials.brakedisc}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_9.geometry}
          material={materials.brakelight}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_10.geometry}
          material={materials.chrome}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_11.geometry}
          material={frontWingMaterial}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_12.geometry}
          material={materials.front_wing_doubleside}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_13.geometry}
          material={materials.headlights}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_14.geometry}
          material={materials.hondabac}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_15.geometry}
          material={materials.hondaseat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_16.geometry}
          material={materials.hondaside}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_17.geometry}
          material={materials.lines}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_18.geometry}
          material={materials.mirrors}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_19.geometry}
          material={materials.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_20.geometry}
          material={materials.material_18}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_21.geometry}
          material={materials.tex_chrome}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_22.geometry}
          material={materials.tex_plastic}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_23.geometry}
          material={materials.tex_seat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_24.geometry}
          material={materials.tire}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/models/honda_cb.glb');