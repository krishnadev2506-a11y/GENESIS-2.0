import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll, Environment, MeshReflectorMaterial, CameraShake, Float } from '@react-three/drei'
import { EffectComposer, Bloom, Scanline, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { NeonButton } from '../components/ui/NeonButton'
import { GlitchText } from '../components/ui/GlitchText'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { motion } from 'framer-motion'

// ─── Data Generation ──────────────────────────────────────────────────────────
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
const BUILDING_COUNT = isMobile ? 80 : 180
const BUILDING_DATA = Array.from({ length: BUILDING_COUNT }, (_, i) => {
  const xSide = i % 2 === 0 ? 1 : -1
  const x = xSide * (18 + ((i * 137.5) % 50))
  const z = -(((i + 1) * 1.11) % 200) - 10
  const height = 6 + ((i * 73.1) % 22)
  const w = 1.2 + ((i * 31.7) % 5)
  const d = 1.2 + ((i * 19.3) % 5)
  const colorIdx = i % 3
  const color = colorIdx === 0 ? '#00F5FF' : colorIdx === 1 ? '#FF2D78' : '#7B61FF'
  return { position: [x, height / 2 - 4, z], scale: [w, height, d], color }
})

const JET_DATA = [
  { id: 0, x: -30, y: 18, z: -20,  speed: 28, dir:  1 },
  { id: 1, x:  40, y: 22, z: -55,  speed: 35, dir: -1 },
  { id: 2, x: -10, y: 14, z: -90,  speed: 22, dir:  1 },
  { id: 3, x:  20, y: 26, z: -130, speed: 40, dir: -1 },
  { id: 4, x: -50, y: 20, z: -170, speed: 30, dir:  1 },
]

// ─── Constants ──────────────────────────────────────────────────────────────
const CAR_START_Z = 20
const CAR_END_Z = -180
const TROPHY_Z = -185
const BUILDING_SPACING = 15

// ─── Instanced City (Massive Performance Boost) ───────────────────────────────
const InstancedCity = () => {
  const meshRef = useRef()
  const roofRef = useRef()
  
  useEffect(() => {
    const dummy = new THREE.Object3D()
    const roofDummy = new THREE.Object3D()
    const color = new THREE.Color()
    
    BUILDING_DATA.forEach((b, i) => {
      // Main Building
      dummy.position.set(b.position[0], b.position[1], b.position[2])
      dummy.scale.set(b.scale[0], b.scale[1], b.scale[2])
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      
      // Neon Roof
      roofDummy.position.set(b.position[0], b.position[1] + b.scale[1] / 2 + 0.02, b.position[2])
      roofDummy.scale.set(b.scale[0], 0.04, b.scale[2])
      roofDummy.updateMatrix()
      roofRef.current.setMatrixAt(i, roofDummy.matrix)
      roofRef.current.setColorAt(i, color.set(b.color))
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
    roofRef.current.instanceMatrix.needsUpdate = true
    roofRef.current.instanceColor.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh ref={meshRef} args={[null, null, BUILDING_COUNT]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#020205" metalness={0.9} roughness={0.1} />
      </instancedMesh>
      <instancedMesh ref={roofRef} args={[null, null, BUILDING_COUNT]} frustumCulled={false}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} color="#ffffff" />
      </instancedMesh>
    </group>
  )
}

// ─── Jets ─────────────────────────────────────────────────────────────────────
const Jet = ({ data }) => {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.position.x += data.dir * data.speed * delta
    if (data.dir ===  1 && groupRef.current.position.x >  120) groupRef.current.position.x = -120
    if (data.dir === -1 && groupRef.current.position.x < -120) groupRef.current.position.x =  120
  })
  return (
    <group ref={groupRef} position={[data.x, data.y, data.z]} rotation={[0, data.dir === 1 ? 0 : Math.PI, 0]}>
      <mesh><cylinderGeometry args={[0.12, 0.05, 3.5, 8]} /><meshStandardMaterial color="#0A0A15" metalness={1} roughness={0.1} /></mesh>
      <mesh position={[0, 0, -1.9]}><cylinderGeometry args={[0.08, 0.14, 0.2, 8]} /><meshBasicMaterial color="#FF2D78" toneMapped={false} /></mesh>
      <mesh position={[-1.7, -0.05, -0.2]}><sphereGeometry args={[0.05]} /><meshBasicMaterial color="#00F5FF" toneMapped={false} /></mesh>
    </group>
  )
}

// ─── Cyberpunk Car ────────────────────────────────────────────────────────────
const CyberCar = () => {
  const groupRef = useRef()
  const scroll = useScroll()
  const exhaustRef = useRef()
  const headlightsRef = useRef()

  useFrame((state, delta) => {
    const targetZ = THREE.MathUtils.lerp(CAR_START_Z, CAR_END_Z, scroll.offset)
    if (groupRef.current) {
      // Smooth gliding with slightly slower damping for a more "cinematic" feel
      THREE.MathUtils.damp(groupRef.current.position, 'z', targetZ, 6, delta)
      
      // Slight tilt based on movement speed
      const speed = (targetZ - groupRef.current.position.z)
      THREE.MathUtils.damp(groupRef.current.rotation, 'x', speed * 0.1, 3, delta)
    }
    if (exhaustRef.current) {
      exhaustRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.2
      exhaustRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, -2.8, CAR_START_Z]}>
      <Float speed={3} rotationIntensity={0.05} floatIntensity={0.5} floatingRange={[-0.04, 0.04]}>
        {/* Main Body */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[3.8, 0.5, 7.5]} />
          <meshStandardMaterial color="#05050A" metalness={1} roughness={0.1} />
        </mesh>
        
        {/* Cockpit / Cab */}
        <mesh position={[0, 0.9, 0.2]}>
          <boxGeometry args={[2.6, 0.6, 3.5]} />
          <meshStandardMaterial color="#0A0A15" metalness={1} roughness={0.05} />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, 1.1, 1.8]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[2.2, 0.8, 0.05]} />
          <meshStandardMaterial color="#00F5FF" emissive="#00F5FF" emissiveIntensity={1.5} transparent opacity={0.4} />
        </mesh>

        {/* Side Neon Strips */}
        {[-1.92, 1.92].map(x => (
          <mesh key={`strip-${x}`} position={[x, 0.3, 0]}>
            <boxGeometry args={[0.05, 0.2, 6.5]} />
            <meshBasicMaterial color="#00F5FF" />
          </mesh>
        ))}

        {/* Headlights */}
        {[-1.4, 1.4].map(x => (
          <group key={`headlight-${x}`} position={[x, 0.45, 3.76]}>
            <mesh>
              <boxGeometry args={[0.6, 0.15, 0.05]} />
              <meshBasicMaterial color="#00F5FF" />
            </mesh>
            <pointLight distance={5} intensity={5} color="#00F5FF" />
          </group>
        ))}

        {/* Taillights */}
        {[-1.2, 1.2].map(x => (
          <mesh key={`tail-${x}`} position={[x, 0.5, -3.76]}>
            <boxGeometry args={[0.8, 0.1, 0.05]} />
            <meshBasicMaterial color="#FF2D78" />
          </mesh>
        ))}

        {/* Underglow */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 7]} />
          <meshBasicMaterial color="#00F5FF" transparent opacity={0.3} />
        </mesh>

        {/* Exhausts */}
        {[-0.6, 0.6].map(x => (
          <mesh key={`exhaust-${x}`} ref={x === -0.6 ? exhaustRef : undefined} position={[x, 0.3, -3.8]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.05, 1.2, 8]} />
            <meshBasicMaterial color="#FF2D78" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}

        {/* Wheels */}
        {[[-2, 0, 2.4], [2, 0, 2.4], [-2, 0, -2.4], [2, 0, -2.4]].map((p, i) => (
          <group key={i} position={p} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.65, 0.65, 0.5, 24]} />
              <meshStandardMaterial color="#020205" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.26, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.05, 16]} />
              <meshBasicMaterial color={i < 2 ? "#00F5FF" : "#FF2D78"} />
            </mesh>
          </group>
        ))}
      </Float>
    </group>
  )
}

// ─── Trophy ───────────────────────────────────────────────────────────────────
const CyberTrophy = () => {
  const trophyRef = useRef()
  useFrame((state) => {
    if (trophyRef.current) trophyRef.current.rotation.y = state.clock.elapsedTime * 0.5
  })
  return (
    <group ref={trophyRef} position={[0, -1.5, TROPHY_Z]}>
      <mesh position={[0, 0, 0]}><boxGeometry args={[3, 0.5, 3]} /><meshStandardMaterial color="#050510" metalness={1} roughness={0.1} /></mesh>
      <mesh position={[0, 0.9, 0]}><boxGeometry args={[1.8, 0.8, 1.8]} /><meshStandardMaterial color="#050510" metalness={1} roughness={0.1} emissive="#00F5FF" emissiveIntensity={0.2} /></mesh>
      <mesh position={[0, 3.55, 0]}><octahedronGeometry args={[0.35]} /><meshBasicMaterial color="#00F5FF" toneMapped={false} /></mesh>
      <mesh position={[0, -0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[2.0, 2.3, 32]} /><meshBasicMaterial color="#00F5FF" toneMapped={false} side={THREE.DoubleSide} transparent opacity={0.6} /></mesh>
    </group>
  )
}

// ─── Environment & Scene ──────────────────────────────────────────────────────
const CyberCity = () => {
  const gridRef = useRef()
  useFrame((_, delta) => {
    if (gridRef.current) gridRef.current.position.z = (gridRef.current.position.z + delta * 15) % 2.5
  })

  return (
    <group>
      <fog attach="fog" args={['#020205', 10, 100]} />
      
      {/* High Quality Wet Road with Realistic Reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[300, 300]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={15}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#020205"
          metalness={0.9}
          roughness={1}
          mirror={1}
        />
      </mesh>

      {/* Moving Grid Lines layered over the reflection */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.99, 0]}>
        <planeGeometry args={[300, 300, 120, 120]} />
        <meshBasicMaterial color="#00F5FF" wireframe transparent opacity={0.05} />
      </mesh>

      <InstancedCity />
      {JET_DATA.map(j => <Jet key={`jet-${j.id}`} data={j} />)}
      <CyberCar />
      <CyberTrophy />
    </group>
  )
}

// ─── Camera Dynamics ──────────────────────────────────────────────────────────
const DynamicCamera = () => {
  const scroll = useScroll()
  const camZ = useRef(30)
  const camY = useRef(2)
  const pointer = useMemo(() => new THREE.Vector2(), [])

  useEffect(() => {
    const handleMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX
      const y = e.touches ? e.touches[0].clientY : e.clientY
      pointer.x = (x / window.innerWidth) * 2 - 1
      pointer.y = -(y / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('touchmove', handleMove)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
    }
  }, [pointer])

  useFrame((state, delta) => {
    const offset = scroll.offset
    // Camera moves behind the car with a longer path
    const targetZ = THREE.MathUtils.lerp(45, -170, offset)
    const targetY = THREE.MathUtils.lerp(1.5, 4.5, offset)
    
    // Synchronized damping with the car
    THREE.MathUtils.damp(state.camera.position, 'z', targetZ, 6, delta)
    THREE.MathUtils.damp(state.camera.position, 'y', targetY, 6, delta)
    
    // Smooth Mouse Parallax
    const targetX = pointer.x * 1.5
    const targetYLook = 2 + pointer.y * 1
    THREE.MathUtils.damp(state.camera.position, 'x', targetX, 3, delta)
    
    // Look ahead of the car, focusing on the trophy at the end
    const lookAtZ = THREE.MathUtils.lerp(CAR_START_Z - 50, TROPHY_Z, offset)
    state.camera.lookAt(0, targetYLook, lookAtZ)
    
    // Dynamic FOV for speed effect
    const fovTarget = 70 + (Math.sin(offset * Math.PI) * 10)
    THREE.MathUtils.damp(state.camera, 'fov', fovTarget, 3, delta)
    state.camera.updateProjectionMatrix()
  })
  return null // Removed CameraShake for smoother gliding
}

// ─── Next-Gen HTML Overlay ────────────────────────────────────────────────────
const HTMLContent = () => {
  const scroll = useScroll()
  
  // Custom hook to tie Framer Motion to R3F Scroll offset
  const useScrollTransform = (rangeIn, rangeOut) => {
    const [style, setStyle] = React.useState({ opacity: 0, y: 50, scale: 0.9 })
    useFrame(() => {
      const o = scroll.offset
      let opacity = 0, y = 50, scale = 0.9
      if (o >= rangeIn[0] && o <= rangeOut[1]) {
        if (o < rangeIn[1]) {
          // fades in
          const p = (o - rangeIn[0]) / (rangeIn[1] - rangeIn[0])
          opacity = p; y = 50 * (1 - p); scale = 0.9 + 0.1 * p
        } else if (o > rangeOut[0]) {
          // fades out
          const p = (o - rangeOut[0]) / (rangeOut[1] - rangeOut[0])
          opacity = 1 - p; y = -50 * p; scale = 1 - 0.1 * p
        } else {
          // fully visible
          opacity = 1; y = 0; scale = 1
        }
      }
      setStyle({ opacity, transform: `translateY(${y}px) scale(${scale})` })
    })
    return style
  }

  const sHero = useScrollTransform([-0.1, 0.0], [0.1, 0.2])
  const sAbout = useScrollTransform([0.15, 0.25], [0.4, 0.5])
  const sTimeline = useScrollTransform([0.45, 0.55], [0.75, 0.85])
  const sPrizes = useScrollTransform([0.75, 0.85], [1.1, 1.2])

  return (
    <div className="w-full pointer-events-none text-white">
      {/* HERO */}
      <section className="h-[100vh] flex flex-col justify-center items-center text-center px-4 pointer-events-auto">
        <motion.div style={sHero} className="will-change-transform">
          <p className="font-mono text-xs tracking-[0.4em] text-[#00F5FF]/60 mb-4 uppercase">[ GENESIS 2.0 :: SYSTEM BOOT ]</p>
          <h1 className="font-orbitron font-black text-6xl md:text-8xl lg:text-9xl tracking-[0.2em] text-[#E0E0FF] mb-4 mix-blend-screen drop-shadow-[0_0_30px_rgba(0,245,255,0.5)]">
            <GlitchText text="GENESIS" />
          </h1>
          <p className="font-mono text-sm md:text-lg tracking-widest text-[#00F5FF] mb-10">THE 48-HOUR HACKATHON THAT REWRITES THE FUTURE</p>
          <div className="flex justify-center gap-6">
            <NeonButton variant="primary" onClick={() => window.location.href='/register'} className="text-xl px-10 py-4">REGISTER</NeonButton>
          </div>
        </motion.div>
      </section>

      {/* ABOUT */}
      <section className="h-[100vh] flex flex-col justify-center items-start px-8 md:px-24 pointer-events-auto">
        <motion.div style={sAbout} className="max-w-xl bg-black/60 p-8 border-l-2 border-[#00F5FF] backdrop-blur-xl relative will-change-transform">
          <p className="font-mono text-xs text-[#00F5FF] tracking-widest mb-3">// BRIEFING</p>
          <h2 className="font-orbitron font-bold text-4xl mb-5">ENTER THE MATRIX</h2>
          <p className="font-mono text-gray-300 leading-relaxed text-sm">
            Genesis is a high-octane 48-hour development marathon. Build decentralized apps, train AI models, and secure your place in the neo-future.
          </p>
        </motion.div>
      </section>

      {/* TIMELINE */}
      <section className="h-[100vh] flex flex-col justify-center items-end px-8 md:px-24 pointer-events-auto">
        <motion.div style={sTimeline} className="max-w-xl bg-black/60 p-8 border-r-2 border-[#FF2D78] backdrop-blur-xl relative will-change-transform text-right">
          <p className="font-mono text-xs text-[#FF2D78] tracking-widest mb-3">// TIMELINE</p>
          <h2 className="font-orbitron font-bold text-4xl mb-5">LOGISTICS</h2>
          <div className="font-mono space-y-4">
            <div className="border-b border-white/10 pb-2"><div className="text-[#FF2D78] text-xs">08.15</div><div>HACKING COMMENCES</div></div>
            <div className="border-b border-white/10 pb-2"><div className="text-[#00F5FF] text-xs">08.16</div><div>CHECKPOINTS & DEPLOYS</div></div>
            <div className="border-b border-white/10 pb-2"><div className="text-gray-400 text-xs">08.17</div><div>SUBMISSION DEADLINE</div></div>
          </div>
        </motion.div>
      </section>

      {/* PRIZES */}
      <section className="h-[100vh] flex flex-col justify-center items-center px-4 pointer-events-auto pb-40">
        <motion.div style={sPrizes} className="text-center w-full max-w-3xl will-change-transform">
          <h2 className="font-orbitron font-bold text-3xl md:text-5xl mb-12 drop-shadow-[0_0_20px_rgba(245,230,66,0.3)]">THE LOOT</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8 items-center px-4">
            <div className="border border-[#00F5FF]/40 bg-black/50 p-6 pt-10 mt-8 md:mt-12 backdrop-blur-md relative transform hover:scale-105 transition-all w-full md:w-1/3">
               <div className="text-[#00F5FF] font-mono mb-2 text-xs">2ND</div>
               <div className="text-2xl md:text-3xl font-orbitron">₹25K</div>
            </div>
            <div className="border border-[#F5E642] bg-[#F5E642]/10 p-8 pt-14 backdrop-blur-md relative transform scale-105 md:scale-110 hover:scale-125 transition-all w-full md:w-1/3 shadow-[0_0_40px_rgba(245,230,66,0.2)]">
               <div className="text-[#F5E642] font-mono mb-2 font-bold text-xs">1ST</div>
               <div className="text-3xl md:text-4xl font-orbitron font-bold">₹50K</div>
            </div>
            <div className="border border-[#FF2D78]/40 bg-black/50 p-6 pt-10 mt-8 md:mt-12 backdrop-blur-md relative transform hover:scale-105 transition-all w-full md:w-1/3">
               <div className="text-[#FF2D78] font-mono mb-2 text-xs">3RD</div>
               <div className="text-2xl md:text-3xl font-orbitron">₹10K</div>
            </div>
          </div>
          <NeonButton variant="primary" onClick={() => window.location.href='/register'} className="text-lg md:text-xl px-12 py-4 mt-16 md:mt-20">BOOT SEQUENCE</NeonButton>
        </motion.div>
      </section>

      {/* FOOTER CTA */}
      <section className="h-[100vh] flex flex-col justify-end pointer-events-auto bg-gradient-to-t from-transparent to-[#020205] relative z-10 pt-40">
        <div className="flex flex-col items-center mb-32 mix-blend-screen px-4 text-center">
          <p className="font-mono text-xs text-white/40 tracking-[0.3em] mb-4 uppercase">// READY TO COMPILE YOUR LEGACY?</p>
          <h2 className="font-orbitron font-black text-3xl md:text-5xl mb-8 text-[#00F5FF]/80 drop-shadow-[0_0_20px_rgba(0,245,255,0.3)]">
            <GlitchText text="GENESIS" />
          </h2>
          <NeonButton variant="primary" onClick={() => window.location.href='/register'} className="text-xl px-10 py-5 bg-black/50 backdrop-blur-md">
            JOIN GENESIS 2.0
          </NeonButton>
        </div>
        <Footer />
      </section>
    </div>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export const Home = () => {
  return (
    <main className="w-full h-screen bg-[#020205] relative cursor-crosshair overflow-hidden">
      <Navbar />
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 30], fov: 70 }} dpr={[1, 2]}>
          <color attach="background" args={['#020205']} />
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 10, 10]} color="#00F5FF" intensity={2} decay={2} distance={30} />
          
          <ScrollControls pages={5} damping={0.5}>
            <DynamicCamera />
            <CyberCity />
            <Scroll html style={{ width: '100vw' }}><HTMLContent /></Scroll>
          </ScrollControls>

          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0005, 0.0005]} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <Noise opacity={0.02} />
            <Scanline density={1.2} opacity={0.03} />
          </EffectComposer>
        </Canvas>
      </div>
    </main>
  )
}
