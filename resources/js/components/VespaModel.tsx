import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Vespa_Main_0: THREE.Mesh
    Vespa_Wheel_0: THREE.Mesh
    Vespa_Glass_0: THREE.Mesh
    Vespa_Light_0: THREE.Mesh
  }
  materials: {
    Main: THREE.MeshStandardMaterial
    Wheel: THREE.MeshStandardMaterial
    Glass: THREE.MeshStandardMaterial
    Light: THREE.MeshStandardMaterial
  }
}

type VespaModelProps = {
  color: string | { type: 'gradient'; colors: string[]; };
  metalness: number
  autoRotate?: boolean
} & JSX.IntrinsicElements['group']

export function VespaModel({ color, metalness, autoRotate = true, ...props }: VespaModelProps) {
  const group = useRef<THREE.Group>(null)
  const { nodes, materials } = useGLTF('/models/vespa.glb') as GLTFResult
  
  // Clone original material to not affect other instances
  const mainMaterial = materials.Main.clone()
  
  // Set color from props
  if (typeof color === 'string') {
    // Solid color
    mainMaterial.color = new THREE.Color(color)
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
      mainMaterial.map = texture;
      // Setel warna default putih agar texture terlihat jelas
      mainMaterial.color = new THREE.Color("#ffffff");
    }
  }
  
  mainMaterial.metalness = metalness
  
  // Auto-rotate animation
  useFrame((state, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Ukuran skala yang sudah disesuaikan */}
      <group scale={0.0020}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Vespa_Main_0.geometry}
            material={mainMaterial}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Vespa_Wheel_0.geometry}
            material={materials.Wheel}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Vespa_Glass_0.geometry}
            material={materials.Glass}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Vespa_Light_0.geometry}
            material={materials.Light}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/vespa.glb')