import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, MeshReflectorMaterial, Scroll, ScrollControls, useScroll } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { GlitchText } from '../components/ui/GlitchText'
import { NeonButton } from '../components/ui/NeonButton'

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
const BUILDING_COUNT = isMobile ? 156 : 336
const BUILDING_DATA = Array.from({ length: BUILDING_COUNT }, (_, index) => {
  const xDirection = index % 2 === 0 ? 1 : -1
  const lane = index % 3
  const x = xDirection * (17 + lane * 7 + ((index * 21.7) % 32))
  const z = -(((index + 1) * 0.96) % 236) - 12
  const height = 7 + ((index * 11.7) % 20)
  const width = 1.5 + ((index * 3.1) % 2.9)
  const depth = 1.5 + ((index * 2.7) % 2.8)
  const accent = index % 4 === 0 ? '#8b5cf6' : '#6ee7f9'
  const edgeColor = index % 3 === 0 ? '#8b5cf6' : '#6ee7f9'
  const edgeEnabled = index % 5 !== 1

  return {
    accent,
    edgeColor,
    edgeEnabled,
    position: [x, height / 2 - 4, z],
    scale: [width, height, depth],
  }
})
const EDGE_BUILDINGS = BUILDING_DATA.filter((building) => building.edgeEnabled)
const EDGE_LONG_COUNT = EDGE_BUILDINGS.length * 2
const EDGE_SHORT_COUNT = EDGE_BUILDINGS.length * 2
const PARTICLE_COUNT = isMobile ? 650 : 1400

const JET_DATA = [
  { dir: 1, id: 0, speed: 16, x: -28, y: 16, z: -22 },
  { dir: -1, id: 1, speed: 20, x: 38, y: 20, z: -62 },
  { dir: 1, id: 2, speed: 14, x: -14, y: 12, z: -118 },
]

const timelineItems = [
  { accent: 'text-cp-magenta/85', date: '08.15', title: 'HACKING COMMENCES' },
  { accent: 'text-cp-cyan/85', date: '08.16', title: 'CHECKPOINTS & DEPLOYS' },
  { accent: 'text-cp-muted', date: '08.17', title: 'SUBMISSION DEADLINE' },
]

const prizeItems = [
  {
    amount: '\u20b925K',
    amountClassName: 'text-cp-text',
    cardClassName: 'border-cp-cyan/28 bg-black/28 md:mt-10',
    label: '2ND',
    labelClassName: 'text-cp-cyan',
  },
  {
    amount: '\u20b950K',
    amountClassName: 'text-cp-text',
    cardClassName: 'border-cp-yellow/45 bg-cp-yellow/[0.07] md:-mt-3',
    label: '1ST',
    labelClassName: 'text-cp-yellow',
  },
  {
    amount: '\u20b910K',
    amountClassName: 'text-cp-text',
    cardClassName: 'border-cp-magenta/28 bg-black/28 md:mt-10',
    label: '3RD',
    labelClassName: 'text-cp-magenta',
  },
]

const CAR_START_Z = 18
const CAR_END_Z = -178
const TROPHY_Z = -186

const useScrollStyle = (enterRange, exitRange) => {
  const scroll = useScroll()
  const [style, setStyle] = useState({ opacity: 0, transform: 'translate3d(0,32px,0) scale(0.99)' })

  useFrame(() => {
    const offset = scroll.offset
    let opacity = 0
    let y = 32
    let scale = 0.99

    if (offset >= enterRange[0] && offset <= exitRange[1]) {
      if (offset < enterRange[1]) {
        const progress = (offset - enterRange[0]) / (enterRange[1] - enterRange[0])
        opacity = progress
        y = 32 * (1 - progress)
        scale = 0.99 + progress * 0.01
      } else if (offset > exitRange[0]) {
        const progress = (offset - exitRange[0]) / (exitRange[1] - exitRange[0])
        opacity = 1 - progress
        y = -24 * progress
        scale = 1 - progress * 0.01
      } else {
        opacity = 1
        y = 0
        scale = 1
      }
    }

    setStyle({
      opacity,
      transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
    })
  })

  return style
}

const useHeroScrollStyle = (exitRange) => {
  const scroll = useScroll()
  const [style, setStyle] = useState({ opacity: 1, transform: 'translate3d(0,0,0) scale(1)' })

  useFrame(() => {
    const offset = scroll.offset
    let opacity = 1
    let y = 0
    let scale = 1

    if (offset > exitRange[0]) {
      const progress = Math.min(1, Math.max(0, (offset - exitRange[0]) / (exitRange[1] - exitRange[0])))
      opacity = 1 - progress
      y = -24 * progress
      scale = 1 - progress * 0.01
    }

    setStyle({
      opacity,
      transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
    })
  })

  return style
}

const RendererSetup = () => {
  const { gl } = useThree()

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.08
    gl.outputColorSpace = THREE.SRGBColorSpace
  }, [gl])

  return null
}

const InstancedCity = () => {
  const shellRef = useRef()
  const edgeLongRef = useRef()
  const edgeShortRef = useRef()

  useEffect(() => {
    const shell = new THREE.Object3D()
    const edge = new THREE.Object3D()
    const color = new THREE.Color()

    BUILDING_DATA.forEach((building, index) => {
      shell.position.set(...building.position)
      shell.scale.set(...building.scale)
      shell.updateMatrix()
      shellRef.current.setMatrixAt(index, shell.matrix)

    })

    let longIndex = 0
    let shortIndex = 0

    EDGE_BUILDINGS.forEach((building) => {
      const roofY = building.position[1] + building.scale[1] / 2 + 0.04
      const halfWidth = building.scale[0] / 2
      const halfDepth = building.scale[2] / 2

      ;[-halfDepth, halfDepth].forEach((offsetZ) => {
        edge.position.set(building.position[0], roofY, building.position[2] + offsetZ)
        edge.scale.set(building.scale[0], 0.03, 0.05)
        edge.updateMatrix()
        edgeLongRef.current.setMatrixAt(longIndex, edge.matrix)
        edgeLongRef.current.setColorAt(longIndex, color.set(building.edgeColor))
        longIndex += 1
      })

      ;[-halfWidth, halfWidth].forEach((offsetX) => {
        edge.position.set(building.position[0] + offsetX, roofY, building.position[2])
        edge.scale.set(0.05, 0.03, building.scale[2])
        edge.updateMatrix()
        edgeShortRef.current.setMatrixAt(shortIndex, edge.matrix)
        edgeShortRef.current.setColorAt(shortIndex, color.set(building.edgeColor))
        shortIndex += 1
      })
    })

    shellRef.current.instanceMatrix.needsUpdate = true
    edgeLongRef.current.instanceMatrix.needsUpdate = true
    edgeLongRef.current.instanceColor.needsUpdate = true
    edgeShortRef.current.instanceMatrix.needsUpdate = true
    edgeShortRef.current.instanceColor.needsUpdate = true
  }, [])

  return (
    <group>
      <instancedMesh ref={shellRef} args={[null, null, BUILDING_COUNT]} frustumCulled={false}>
        <boxGeometry />
        <meshStandardMaterial color="#08101a" metalness={0.86} roughness={0.24} />
      </instancedMesh>
      <instancedMesh ref={edgeLongRef} args={[null, null, EDGE_LONG_COUNT]} frustumCulled={false}>
        <boxGeometry />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.72} />
      </instancedMesh>
      <instancedMesh ref={edgeShortRef} args={[null, null, EDGE_SHORT_COUNT]} frustumCulled={false}>
        <boxGeometry />
        <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={0.72} />
      </instancedMesh>
    </group>
  )
}

const DustParticles = () => {
  const pointsRef = useRef()
  const particles = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const color = new THREE.Color()

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 120
      positions[i * 3 + 1] = Math.random() * 22 - 2
      positions[i * 3 + 2] = -Math.random() * 240 + 24

      color.set(i % 5 === 0 ? '#8b5cf6' : '#6ee7f9').multiplyScalar(0.4 + Math.random() * 0.3)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    return { colors, positions }
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01
    pointsRef.current.position.z += delta * 1.5
    if (pointsRef.current.position.z > 8) pointsRef.current.position.z = 0
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.09 : 0.12}
        sizeAttenuation
        transparent
        opacity={0.32}
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

const NeonLightRig = () => {
  const underRef = useRef()
  const backRef = useRef()
  const fillRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (underRef.current) underRef.current.intensity = 1.2 + Math.sin(t * 1.7) * 0.05 + Math.sin(t * 13) * 0.015
    if (backRef.current) backRef.current.intensity = 0.95 + Math.sin(t * 1.2 + 1.4) * 0.06 + Math.sin(t * 11) * 0.02
    if (fillRef.current) fillRef.current.intensity = 0.72 + Math.sin(t * 1.5 + 2.2) * 0.04 + Math.sin(t * 9) * 0.015
  })

  return (
    <>
      <pointLight ref={underRef} position={[0, -1.8, 22]} color="#46d7ff" intensity={1.4} distance={44} decay={2} />
      <pointLight ref={backRef} position={[0, 12, -120]} color="#5b2dff" intensity={0.95} distance={84} decay={2} />
      <pointLight ref={fillRef} position={[24, 10, -10]} color="#7bbdff" intensity={0.72} distance={62} decay={2} />
    </>
  )
}

const Jet = ({ data }) => {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.position.x += data.dir * data.speed * delta
    if (data.dir === 1 && groupRef.current.position.x > 100) groupRef.current.position.x = -100
    if (data.dir === -1 && groupRef.current.position.x < -100) groupRef.current.position.x = 100
  })

  return (
    <group ref={groupRef} position={[data.x, data.y, data.z]} rotation={[0, data.dir === 1 ? 0 : Math.PI, 0]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.05, 3.1, 8]} />
        <meshStandardMaterial color="#101722" metalness={1} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, -1.72]}>
        <cylinderGeometry args={[0.07, 0.12, 0.18, 8]} />
        <meshBasicMaterial color="#6ee7f9" toneMapped={false} transparent opacity={0.75} />
      </mesh>
    </group>
  )
}

const CyberCar = () => {
  const groupRef = useRef()
  const scroll = useScroll()
  const exhaustRef = useRef()
  const spotlightRef = useRef()
  const spotlightTargetRef = useRef()

  useEffect(() => {
    if (spotlightRef.current && spotlightTargetRef.current) {
      spotlightRef.current.target = spotlightTargetRef.current
    }
  }, [])

  useFrame((state, delta) => {
    const targetZ = THREE.MathUtils.lerp(CAR_START_Z, CAR_END_Z, scroll.offset)

    if (groupRef.current) {
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 4.2, delta)
      const tilt = THREE.MathUtils.clamp((targetZ - groupRef.current.position.z) * 0.01, -0.07, 0.07)
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, tilt, 4.2, delta)
    }

    if (exhaustRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 12) * 0.06
      exhaustRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={groupRef} position={[0, -2.85, CAR_START_Z]}>
      <Float speed={2} rotationIntensity={0.018} floatIntensity={0.28} floatingRange={[-0.025, 0.025]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[3.5, 0.45, 7.2]} />
          <meshStandardMaterial color="#09111c" metalness={0.95} roughness={0.18} />
        </mesh>

        <mesh position={[0, 0.9, 0.16]}>
          <boxGeometry args={[2.35, 0.58, 3.3]} />
          <meshStandardMaterial color="#111a28" metalness={0.88} roughness={0.16} />
        </mesh>

        <mesh position={[0, 1.08, 1.65]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[2.05, 0.74, 0.05]} />
          <meshStandardMaterial color="#6ee7f9" emissive="#6ee7f9" emissiveIntensity={0.22} transparent opacity={0.18} />
        </mesh>

        {[-1.76, 1.76].map((x) => (
          <mesh key={x} position={[x, 0.33, 0]}>
            <boxGeometry args={[0.04, 0.12, 6.25]} />
            <meshBasicMaterial color="#6ee7f9" transparent opacity={0.38} />
          </mesh>
        ))}

        {[-1.2, 1.2].map((x) => (
          <group key={x} position={[x, 0.44, 3.6]}>
            <mesh>
              <boxGeometry args={[0.5, 0.12, 0.05]} />
              <meshBasicMaterial color="#6ee7f9" transparent opacity={0.62} />
            </mesh>
            <pointLight distance={4} intensity={1.1} color="#6ee7f9" />
          </group>
        ))}

        <spotLight
          ref={spotlightRef}
          position={[0, 0.56, 3.7]}
          angle={0.18}
          penumbra={0.65}
          intensity={3.2}
          distance={34}
          color="#73dcff"
          decay={1.6}
        />
        <object3D ref={spotlightTargetRef} position={[0, 0.35, 18]} />

        {[-1.05, 1.05].map((x) => (
          <mesh key={x} position={[x, 0.46, -3.62]}>
            <boxGeometry args={[0.7, 0.08, 0.05]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.46} />
          </mesh>
        ))}

        <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.8, 6.8]} />
          <meshBasicMaterial color="#6ee7f9" transparent opacity={0.06} />
        </mesh>

        <mesh ref={exhaustRef} position={[0, 0.22, -3.84]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.05, 1.05, 10]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.28} blending={THREE.AdditiveBlending} />
        </mesh>

        {[[-1.84, 0, 2.25], [1.84, 0, 2.25], [-1.84, 0, -2.25], [1.84, 0, -2.25]].map((position, index) => (
          <group key={index} position={position} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.6, 0.6, 0.42, 22]} />
              <meshStandardMaterial color="#05070b" roughness={0.52} />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.34, 0.34, 0.05, 16]} />
              <meshBasicMaterial color={index < 2 ? '#6ee7f9' : '#8b5cf6'} transparent opacity={0.42} />
            </mesh>
          </group>
        ))}
      </Float>
    </group>
  )
}

const CyberTrophy = () => {
  const trophyRef = useRef()

  useFrame((state) => {
    if (!trophyRef.current) return
    trophyRef.current.rotation.y = state.clock.elapsedTime * 0.3
  })

  return (
    <group ref={trophyRef} position={[0, -1.45, TROPHY_Z]}>
      <mesh>
        <boxGeometry args={[3.2, 0.42, 3.2]} />
        <meshStandardMaterial color="#09111c" metalness={0.92} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[1.65, 0.8, 1.65]} />
        <meshStandardMaterial color="#111a28" metalness={0.88} roughness={0.16} emissive="#6ee7f9" emissiveIntensity={0.04} />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <octahedronGeometry args={[0.34]} />
        <meshBasicMaterial color="#6ee7f9" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.95, 2.22, 48]} />
        <meshBasicMaterial color="#8b5cf6" toneMapped={false} side={THREE.DoubleSide} transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

const CyberCity = () => {
  const gridRef = useRef()

  useFrame((_, delta) => {
    if (!gridRef.current) return
    gridRef.current.position.z = (gridRef.current.position.z + delta * 6) % 2
  })

  return (
    <group>
      <fogExp2 attach="fog" args={['#05070c', 0.018]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[300, 300]} />
        <MeshReflectorMaterial
          blur={[220, 80]}
          resolution={isMobile ? 512 : 1024}
          mixBlur={0.6}
          mixStrength={6.5}
          depthScale={0.65}
          minDepthThreshold={0.78}
          color="#0b1320"
          metalness={0.9}
          roughness={0.68}
          mirror={0.52}
        />
      </mesh>

      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.99, 0]}>
        <planeGeometry args={[300, 300, 80, 80]} />
        <meshBasicMaterial color="#6ee7f9" wireframe transparent opacity={0.018} />
      </mesh>

      <InstancedCity />
      <DustParticles />
      {JET_DATA.map((jet) => <Jet key={jet.id} data={jet} />)}
      <CyberCar />
      <CyberTrophy />
    </group>
  )
}

const DynamicCamera = () => {
  const scroll = useScroll()
  const pointer = useMemo(() => new THREE.Vector2(), [])

  useEffect(() => {
    const handlePointerMove = (event) => {
      const x = event.touches ? event.touches[0].clientX : event.clientX
      const y = event.touches ? event.touches[0].clientY : event.clientY
      pointer.x = (x / window.innerWidth) * 2 - 1
      pointer.y = -(y / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('touchmove', handlePointerMove)

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
    }
  }, [pointer])

  useFrame((state, delta) => {
    const targetZ = THREE.MathUtils.lerp(42, -170, scroll.offset)
    const targetY = THREE.MathUtils.lerp(1.5, 4.2, scroll.offset)
    const targetX = pointer.x * 1.05
    const lookAtZ = THREE.MathUtils.lerp(CAR_START_Z - 40, TROPHY_Z, scroll.offset)

    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 3.8, delta)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, targetY, 3.8, delta)
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, targetX, 2.1, delta)
    state.camera.lookAt(0, 1.8 + pointer.y * 0.55, lookAtZ)

    const targetFov = 67 + Math.sin(scroll.offset * Math.PI) * 2.4
    state.camera.fov = THREE.MathUtils.damp(state.camera.fov, targetFov, 2.1, delta)
    state.camera.updateProjectionMatrix()
  })

  return null
}

const HTMLContent = () => {
  const heroStyle = useHeroScrollStyle([0.16, 0.24])
  const aboutStyle = useScrollStyle([0.14, 0.24], [0.4, 0.48])
  const timelineStyle = useScrollStyle([0.4, 0.5], [0.68, 0.76])
  const prizeStyle = useScrollStyle([0.7, 0.8], [1.02, 1.1])

  return (
    <div className="pointer-events-none w-full text-cp-text">
      <section className="relative flex h-[100vh] items-center justify-center overflow-hidden px-4 sm:px-8">
        <div className="absolute inset-0 bg-cp-radial opacity-48" />
        <div className="absolute inset-0 bg-cp-grid bg-[size:48px_48px] opacity-[0.02] sm:opacity-[0.03]" />
        <motion.div style={heroStyle} className="pointer-events-auto relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center will-change-transform">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.34em] text-cp-cyan/62">
            [ GENESIS 2.0 :: SYSTEM BOOT ]
          </p>
          <h1 className="max-w-5xl font-orbitron text-6xl font-semibold uppercase tracking-[0.16em] text-cp-text sm:text-7xl lg:text-[7.6rem] lg:leading-[0.96]">
            <GlitchText text="GENESIS" />
          </h1>
          <p className="mt-4 max-w-3xl font-mono text-xs uppercase tracking-[0.28em] text-cp-cyan/78 sm:text-sm">
            THE 48-HOUR HACKATHON THAT REWRITES THE FUTURE
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <NeonButton variant="primary" onClick={() => { window.location.href = '/register' }} className="min-w-[220px]">
              REGISTER
            </NeonButton>
          </div>
        </motion.div>
      </section>

      <section id="about" className="flex min-h-[100vh] items-center px-4 py-20 sm:px-8 lg:px-16">
        <motion.div style={aboutStyle} className="pointer-events-auto mx-auto w-full max-w-6xl will-change-transform">
          <div className="glass-panel max-w-xl rounded-[30px] border-l-2 border-l-cp-cyan/55 bg-black/24 px-7 py-8 sm:px-9">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cp-cyan/72">// BRIEFING</p>
            <h2 className="mt-5 font-orbitron text-3xl font-semibold uppercase tracking-[0.12em] text-cp-text sm:text-4xl">
              ENTER THE MATRIX
            </h2>
            <p className="mt-5 max-w-lg font-mono text-sm leading-7 text-cp-muted">
              Genesis is a high-octane 48-hour development marathon. Build decentralized apps, train AI models, and secure your place in the neo-future.
            </p>
          </div>
        </motion.div>
      </section>

      <section id="timeline" className="flex min-h-[100vh] items-center px-4 py-20 sm:px-8 lg:px-16">
        <motion.div style={timelineStyle} className="pointer-events-auto mx-auto flex w-full max-w-6xl justify-end will-change-transform">
          <div className="glass-panel w-full max-w-xl rounded-[30px] border-r-2 border-r-cp-magenta/52 bg-black/24 px-7 py-8 text-right sm:px-9">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cp-magenta/72">// TIMELINE</p>
            <h2 className="mt-5 font-orbitron text-3xl font-semibold uppercase tracking-[0.12em] text-cp-text sm:text-4xl">
              LOGISTICS
            </h2>
            <div className="mt-10 space-y-4 font-mono">
              {timelineItems.map((item) => (
                <div key={item.title} className="border-b border-white/7 pb-3 last:border-b-0">
                  <p className={`text-[11px] uppercase tracking-[0.28em] ${item.accent}`}>{item.date}</p>
                  <h3 className="mt-2 text-sm font-medium uppercase tracking-[0.16em] text-cp-text sm:text-base">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="prizes" className="flex min-h-[100vh] items-center px-4 py-20 sm:px-8 lg:px-16">
        <motion.div style={prizeStyle} className="pointer-events-auto mx-auto w-full max-w-5xl text-center will-change-transform">
          <h2 className="font-orbitron text-3xl font-semibold uppercase tracking-[0.12em] text-cp-text sm:text-5xl">
            THE LOOT
          </h2>
          <div className="mt-12 grid gap-5 px-2 md:grid-cols-3 md:items-end">
            {prizeItems.map((item) => (
              <motion.div key={item.label} whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                <div className={`glass-panel h-full rounded-[28px] border px-7 py-10 text-left ${item.cardClassName}`}>
                  <p className={`font-mono text-[11px] uppercase tracking-[0.3em] ${item.labelClassName}`}>{item.label}</p>
                  <p className={`mt-8 font-orbitron text-4xl font-semibold tracking-[0.08em] sm:text-[2.8rem] ${item.amountClassName}`}>{item.amount}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <NeonButton variant="primary" onClick={() => { window.location.href = '/register' }} className="mt-16 min-w-[240px]">
            BOOT SEQUENCE
          </NeonButton>
        </motion.div>
      </section>

      <section className="pointer-events-auto flex min-h-[100vh] flex-col justify-end pt-32">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-20 text-center sm:px-8">
          <div className="w-full rounded-[32px] bg-gradient-to-t from-transparent to-[#05070c] px-6 py-12 sm:px-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
              // READY TO COMPILE YOUR LEGACY?
            </p>
            <h2 className="mt-6 font-orbitron text-3xl font-semibold uppercase tracking-[0.14em] text-cp-cyan/76 sm:text-5xl">
              <GlitchText text="GENESIS" />
            </h2>
            <NeonButton variant="primary" onClick={() => { window.location.href = '/register' }} className="mt-10 min-w-[240px] bg-black/20">
              JOIN GENESIS 2.0
            </NeonButton>
          </div>
        </div>
        <Footer />
      </section>
    </div>
  )
}

export const Home = () => {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-cp-black">
      <Navbar />

      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 28], fov: 67 }} dpr={[1, 1.4]}>
          <RendererSetup />
          <color attach="background" args={['#05070c']} />
          <Environment preset="city" />
          <ambientLight intensity={0.28} />
          <NeonLightRig />

          <ScrollControls pages={5} damping={0.2}>
            <DynamicCamera />
            <CyberCity />
            <Scroll html style={{ width: '100vw' }}>
              <HTMLContent />
            </Scroll>
          </ScrollControls>

          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.95} luminanceSmoothing={0.99} intensity={0.22} mipmapBlur />
            <Vignette eskil={false} offset={0.12} darkness={0.8} blendFunction={BlendFunction.NORMAL} />
            <Noise opacity={0.005} />
          </EffectComposer>
        </Canvas>
      </div>
    </main>
  )
}
