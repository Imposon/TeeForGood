'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Float, Stars, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Floating particles component
function FloatingParticles({ count = 50 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null)
  
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        ],
        scale: Math.random() * 0.05 + 0.02,
        speed: Math.random() * 0.5 + 0.2,
      })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.y = state.clock.elapsedTime * 0.05
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={new Float32Array(particles.flatMap(p => p.position))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ff88"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

// Abstract golf-inspired orb - represents the dimple pattern of a golf ball
function GolfInspiredOrb() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
  })

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
    >
      <mesh ref={meshRef} position={[4, 2, -5]}>
        <icosahedronGeometry args={[1.5, 2]} />
        <MeshDistortMaterial
          color="#00ff88"
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
          emissive="#00ff88"
          emissiveIntensity={0.1}
        />
      </mesh>
    </Float>
  )
}

// Abstract ring structure
function FloatingRings() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })

  return (
    <group ref={groupRef} position={[-5, -2, -3]}>
      {[1, 1.5, 2].map((radius, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={i === 0 ? '#00ffff' : i === 1 ? '#00ff88' : '#ffd700'}
            emissive={i === 0 ? '#00ffff' : i === 1 ? '#00ff88' : '#ffd700'}
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

// Main scene component
function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#00ff88" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#00ffff" />
      <pointLight position={[10, 10, 10]} intensity={0.3} color="#ffd700" />
      
      <FloatingParticles count={80} />
      <GolfInspiredOrb />
      <FloatingRings />
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
    </>
  )
}

// Wrapper with lazy loading
export function ThreeBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="fixed inset-0 bg-dark-bg" />
  }

  return (
    <div className="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
