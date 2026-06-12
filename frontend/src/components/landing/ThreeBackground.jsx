// frontend/src/components/landing/ThreeBackground.jsx
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const width = window.innerWidth
    const height = window.innerHeight

    // Create scene and setup projection metrics
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x050816, 0.015)

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000)
    camera.position.z = 250

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)

    // Geometry Generation: Compile Node Connections Array Matrices
    const particleCount = window.innerWidth < 768 ? 90 : 220
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 500     // X
      positions[i + 1] = (Math.random() - 0.5) * 500 // Y
      positions[i + 2] = (Math.random() - 0.5) * 500 // Z

      velocities[i] = (Math.random() - 0.5) * 0.3    // X Speed
      velocities[i + 1] = (Math.random() - 0.5) * 0.3// Y Speed
      velocities[i + 2] = (Math.random() - 0.5) * 0.3// Z Speed
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const pMaterial = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 2.5,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    const pointCloud = new THREE.Points(geometry, pMaterial)
    scene.add(pointCloud)

    // Mouse interactive tracking variables
    let mouseX = 0
    let mouseY = 0

    // ── FIXED: Stripped out the strict ": MouseEvent" type casting here ──
    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.05
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Window Viewport Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop Lifecycle
    const clock = new THREE.Clock()
    let animationFrameId

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const posAttr = geometry.getAttribute('position')
      const positionsArray = posAttr.array

      for (let i = 0; i < particleCount * 3; i += 3) {
        positionsArray[i] += velocities[i]
        positionsArray[i + 1] += velocities[i + 1]
        positionsArray[i + 2] += velocities[i + 2]

        if (Math.abs(positionsArray[i]) > 250) velocities[i] *= -1
        if (Math.abs(positionsArray[i + 1]) > 250) velocities[i + 1] *= -1
        if (Math.abs(positionsArray[i + 2]) > 250) velocities[i + 2] *= -1
      }

      posAttr.needsUpdate = true

      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY - camera.position.y) * 0.05
      camera.lookAt(scene.position)

      pointCloud.rotation.y += 0.001

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      geometry.dispose()
      pMaterial.dispose()
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#050816]"
    />
  )
}