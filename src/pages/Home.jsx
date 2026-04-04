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
const BUILDING_COUNT = 180
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

const CAR_START_Z  =  10
const CAR_END_Z    = -78
const TROPHY_Z     = -82

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

  useFrame((_, delta) => {
    const targetZ = THREE.MathUtils.lerp(CAR_START_Z, CAR_END_Z, scroll.offset)
    if (groupRef.current) groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 5)
    if (exhaustRef.current) exhaustRef.current.scale.z = 0.9 + ((Math.sin(Date.now() * 0.02) + 1) * 0.15)
  })

  return (
    <group ref={groupRef} position={[0, -2.8, CAR_START_Z]}>
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5} floatingRange={[-0.02, 0.02]}>
        {/* Chassis */}
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[3.6, 0.35, 7]} /><meshStandardMaterial color="#05050A" metalness={1} roughness={0.05} /></mesh>
        {/* Cab */}
        <mesh position={[0, 0.75, 0.5]}><boxGeometry args={[2.4, 0.55, 3.2]} /><meshStandardMaterial color="#0A0A15" metalness={0.9} roughness={0.1} /></mesh>
        <mesh position={[0, 0.98, 2.1]} rotation={[0.35, 0, 0]}><boxGeometry args={[1.9, 0.65, 0.06]} /><meshStandardMaterial color="#00F5FF" emissive="#00F5FF" emissiveIntensity={0.2} transparent opacity={0.8} /></mesh>
        {/* Skirts */}
        <mesh position={[-1.82, 0.15, 0]}><boxGeometry args={[0.06, 0.18, 6.2]} /><meshBasicMaterial color="#00F5FF" toneMapped={false} /></mesh>
        <mesh position={[1.82, 0.15, 0]}><boxGeometry args={[0.06, 0.18, 6.2]} /><meshBasicMaterial color="#00F5FF" toneMapped={false} /></mesh>
        {/* Exhausts */}
        {[-0.5, 0.5].map(x => (
          <mesh key={x} ref={x === -0.5 ? exhaustRef : undefined} position={[x, 0.2, -3.95]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.1, 0.9, 8]} /><meshBasicMaterial color="#FF2D78" transparent opacity={0.6} toneMapped={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
        {/* Wheels */}
        {[[-1.9, -0.1, 2.2], [1.9, -0.1, 2.2], [-1.9, -0.1, -2.2], [1.9, -0.1, -2.2]].map((p, i) => (
          <group key={i} position={p} rotation={[0, 0, Math.PI / 2]}>
            <mesh><cylinderGeometry args={[0.55, 0.55, 0.4, 16]} /><meshStandardMaterial color="#030305" roughness={0.8} /></mesh>
            <mesh><cylinderGeometry args={[0.35, 0.35, 0.42, 8]} /><meshStandardMaterial color="#0A0A15" metalness={1} roughness={0} emissive="#7B61FF" emissiveIntensity={0.5} /></mesh>
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
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [pointer])

  useFrame((state, delta) => {
    const offset = scroll.offset
    // Z & Y Position based on scroll
    camZ.current = THREE.MathUtils.lerp(camZ.current, THREE.MathUtils.lerp(30, -72, offset), delta * 4)
    camY.current = THREE.MathUtils.lerp(camY.current, THREE.MathUtils.lerp(1.5, 4.5, offset), delta * 4)
    state.camera.position.z = camZ.current
    state.camera.position.y = camY.current
    
    // Smooth Mouse Parallax (looking slightly around based on mouse)
    const targetX = pointer.x * 2
    const targetYLook = 2 + pointer.y * 1.5
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, delta * 2)
    state.camera.lookAt(0, targetYLook, -150)
    
    // Dynamic FOV for speed effect (expands while scrolling fast)
    // We approximate speed by checking scroll difference, but simple offset mapping works well too.
    const fovTarget = 70 + (Math.sin(offset * Math.PI) * 15) // Widen fov in the middle of scroll
    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, fovTarget, delta * 3)
    state.camera.updateProjectionMatrix()
  })
  return <CameraShake maxPitch={0.01} maxRoll={0.01} maxYaw={0.01} frequency={1.5} />
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
          <h2 className="font-orbitron font-bold text-5xl mb-12 drop-shadow-[0_0_20px_rgba(245,230,66,0.3)]">THE LOOT</h2>
          <div className="flex flex-col md:flex-row justify-center gap-8 items-center">
            <div className="border border-[#00F5FF]/40 bg-black/50 p-8 pt-12 mt-8 md:mt-12 backdrop-blur-md relative transform hover:scale-105 transition-all w-full md:w-1/3">
               <div className="text-[#00F5FF] font-mono mb-2">2ND</div>
               <div className="text-3xl font-orbitron">₹25K</div>
            </div>
            <div className="border border-[#F5E642] bg-[#F5E642]/10 p-10 pt-16 backdrop-blur-md relative transform scale-110 hover:scale-125 transition-all w-full md:w-1/3 shadow-[0_0_40px_rgba(245,230,66,0.2)]">
               <div className="text-[#F5E642] font-mono mb-2 font-bold">1ST</div>
               <div className="text-4xl font-orbitron font-bold">₹50K</div>
            </div>
            <div className="border border-[#FF2D78]/40 bg-black/50 p-8 pt-12 mt-8 md:mt-12 backdrop-blur-md relative transform hover:scale-105 transition-all w-full md:w-1/3">
               <div className="text-[#FF2D78] font-mono mb-2">3RD</div>
               <div className="text-3xl font-orbitron">₹10K</div>
            </div>
          </div>
          <NeonButton variant="primary" onClick={() => window.location.href='/register'} className="text-xl px-12 py-4 mt-20">BOOT SEQUENCE</NeonButton>
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
          
          <ScrollControls pages={5} damping={0.2}>
            <DynamicCamera />
            <CyberCity />
            <Scroll html style={{ width: '100vw' }}><HTMLContent /></Scroll>
          </ScrollControls>

          <EffectComposer>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={2} mipmapBlur />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.001, 0.001]} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <Noise opacity={0.03} />
            <Scanline density={1.5} opacity={0.05} />
          </EffectComposer>
        </Canvas>
      </div>
    </main>
  )
}
