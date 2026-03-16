import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { useGameStore } from '../store'

const THEMES: Record<string, { light: number; dark: number; board: number }> = {
  default: { light: 0x2E4055, dark: 0x1E2D40, board: 0x0A0C10 },
  classic: { light: 0xE8EDF2, dark: 0x769656, board: 0x2D3436 },
  wood: { light: 0xDEAC70, dark: 0x8B4513, board: 0x3E2723 },
  forest: { light: 0xA3D160, dark: 0x4B7336, board: 0x1B5E20 },
  ocean: { light: 0xB1E4B9, dark: 0x70A2A3, board: 0x006064 },
  midnight: { light: 0x4B5563, dark: 0x1F2937, board: 0x111827 },
}

const COLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export default function Board3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { game, user, boardTheme, reviewMode, reviewBoardData, selectedSquare, legalMoves, selectSquare, isSpectator } = useGameStore()
  
  const stateRef = useRef({ selectedSquare, legalMoves, isSpectator, reviewMode })
  useEffect(() => {
    stateRef.current = { selectedSquare, legalMoves, isSpectator, reviewMode }
  }, [selectedSquare, legalMoves, isSpectator, reviewMode])

  useEffect(() => {
    if (!containerRef.current || !game) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x080808)

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000)
    camera.position.set(0, 10, 10)

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Limit for performance
    containerRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.enablePan = false
    controls.minDistance = 7
    controls.maxDistance = 15
    controls.maxPolarAngle = Math.PI / 2.2

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const sun = new THREE.DirectionalLight(0xffffff, 0.8)
    sun.position.set(5, 10, 7)
    scene.add(sun)

    const activeBoard = (reviewMode && reviewBoardData) ? reviewBoardData.board : game.board
    const activeLastMove = (reviewMode && reviewBoardData) ? reviewBoardData.last_move : game.last_move
    const theme = THEMES[boardTheme] || THEMES.default
    const isFlipped = game.game_mode === 'Person' && user?.id === game.black_player_id

    const boardGroup = new THREE.Group()
    if (isFlipped) boardGroup.rotation.y = Math.PI
    scene.add(boardGroup)

    const clickableObjects: THREE.Object3D[] = []
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    // Reuse Geometries for Performance
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.1, 16)
    const squareGeo = new THREE.BoxGeometry(0.98, 0.08, 0.98)

    function createSleekPiece(type: string, color: string, x: number, z: number) {
      const group = new THREE.Group()
      const isWhite = color === 'white'
      const pColor = isWhite ? 0xffffff : 0x4DD9E8
      const mat = new THREE.MeshLambertMaterial({ 
        color: pColor,
        emissive: isWhite ? 0x000000 : 0x4DD9E8,
        emissiveIntensity: isWhite ? 0 : 0.2
      })

      // Standard Base
      const base = new THREE.Mesh(baseGeo, mat)
      group.add(base)

      // Modern Minimalist Shapes
      if (type === 'P') {
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), mat)
        body.position.y = 0.3
        group.add(body)
      } else if (type === 'R' || type === 'S') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.6, 16), mat)
        body.position.y = 0.35
        group.add(body)
      } else if (type === 'N') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.28, 0.7, 16), mat)
        body.position.y = 0.35
        body.rotation.z = 0.3
        group.add(body)
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.4), mat)
        head.position.set(0.1, 0.6, 0.1)
        group.add(head)
      } else if (type === 'B') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.28, 0.8, 16), mat)
        body.position.y = 0.4
        group.add(body)
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), mat)
        head.scale.y = 1.4
        head.position.y = 0.8
        group.add(head)
      } else if (type === 'Q') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 1.0, 16), mat)
        body.position.y = 0.5
        group.add(body)
        const crown = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.08, 8, 16), mat)
        crown.rotation.x = Math.PI / 2
        crown.position.y = 1.0
        group.add(crown)
      } else if (type === 'K') {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.32, 1.1, 16), mat)
        body.position.y = 0.55
        group.add(body)
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), mat)
        top.position.y = 1.1
        group.add(top)
      }

      group.position.set(x, 0.05, z)
      return group
    }

    // Board and Interaction
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 8; c++) {
        const x = c - 3.5
        const z = -(r - 4.5)
        const square = COLS[c] + (r + 1)
        const isLight = (r + c) % 2 !== 0
        
        const isSelected = selectedSquare === square
        const isLegal = (legalMoves || []).includes(square)
        
        let isLastMove = false
        if (activeLastMove) {
          const fromSq = COLS[activeLastMove.from[1]] + (activeLastMove.from[0] + 1)
          const toSq = COLS[activeLastMove.to[1]] + (activeLastMove.to[0] + 1)
          isLastMove = square === fromSq || square === toSq
        }

        let sqColor = isLight ? theme.light : theme.dark
        if (isSelected) sqColor = 0xF5C518
        else if (isLegal) sqColor = 0x4DD9E8
        else if (isLastMove) sqColor = 0xBC9E12

        const sqMat = new THREE.MeshLambertMaterial({ 
          color: sqColor,
          transparent: isLegal || isLastMove,
          opacity: isLegal ? 0.6 : isLastMove ? 0.5 : 1
        })
        
        const sq = new THREE.Mesh(squareGeo, sqMat)
        sq.position.set(x, 0, z)
        sq.userData = { square }
        boardGroup.add(sq)
        clickableObjects.push(sq)

        const piece = activeBoard[r]?.[c]
        if (piece) {
          boardGroup.add(createSleekPiece(piece.type, piece.color, x, z))
        }
      }
    }

    function onMouseDown(event: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(clickableObjects)
      if (intersects.length > 0) {
        const { isSpectator, reviewMode } = stateRef.current
        if (!isSpectator && !reviewMode) selectSquare(intersects[0].object.userData.square)
      }
    }

    renderer.domElement.addEventListener('mousedown', onMouseDown)

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.dispose()
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [game, boardTheme, reviewMode, reviewBoardData, selectedSquare, legalMoves])

  return (
    <div className="w-full h-[600px] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative bg-[#050505]">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-6 left-6 pointer-events-none flex flex-col gap-1">
        <div className="text-[10px] font-black text-accentCyan uppercase tracking-[0.4em]">Nexus 3D Engine</div>
        <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">v3.5 - High Performance</div>
      </div>
    </div>
  )
}
