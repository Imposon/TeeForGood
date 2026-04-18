'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

interface Ball {
  id: number
  x: number
  y: number
  scale: number
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [balls, setBalls] = useState<Ball[]>([])
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 400 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)
  
  const ballCount = 6
  const ballRefs = useRef<{ x: number; y: number }[]>(
    Array(ballCount).fill({ x: 0, y: 0 })
  )

  // Initialize balls
  useEffect(() => {
    setBalls(
      Array(ballCount)
        .fill(null)
        .map((_, i) => ({
          id: i,
          x: 0,
          y: 0,
          scale: 1 - i * 0.1,
        }))
    )
  }, [])

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e
    cursorX.set(clientX)
    cursorY.set(clientY)
    
    // Update ball positions with delay effect
    setBalls((prevBalls) => {
      const newBalls = [...prevBalls]
      
      for (let i = newBalls.length - 1; i >= 0; i--) {
        if (i === 0) {
          ballRefs.current[0] = { x: clientX, y: clientY }
          newBalls[0] = { ...newBalls[0], x: clientX, y: clientY }
        } else {
          const prev = ballRefs.current[i - 1]
          const current = ballRefs.current[i]
          
          // Smooth follow with easing
          const dx = prev.x - current.x
          const dy = prev.y - current.y
          
          ballRefs.current[i] = {
            x: current.x + dx * 0.3,
            y: current.y + dy * 0.3,
          }
          
          newBalls[i] = {
            ...newBalls[i],
            x: ballRefs.current[i].x,
            y: ballRefs.current[i].y,
          }
        }
      }
      
      return newBalls
    })
  }, [cursorX, cursorY])

  // Click handlers
  const handleMouseDown = useCallback(() => {
    setIsClicking(true)
  }, [])
  
  const handleMouseUp = useCallback(() => {
    setIsClicking(false)
  }, [])

  // Hover detection
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.dataset.hover === 'true'
      ) {
        setIsHovering(true)
      }
    }
    
    const handleMouseOut = () => {
      setIsHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [handleMouseMove, handleMouseDown, handleMouseUp])

  return (
    <>
      {/* Main cursor - Golf stick shape */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        {/* Golf stick cursor */}
        <motion.div
          className="relative -translate-x-1/2 -translate-y-1/2"
          animate={{
            rotate: isClicking ? 45 : 0,
            scale: isClicking ? 0.9 : isHovering ? 1.2 : 1,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          {/* Stick shaft */}
          <div 
            className="absolute w-0.5 h-8 bg-gradient-to-t from-white to-neon-green rounded-full"
            style={{ 
              transform: 'rotate(-30deg)',
              left: '2px',
              top: '-4px',
              boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
            }}
          />
          {/* Stick head */}
          <div 
            className="w-3 h-4 bg-gradient-to-br from-white to-gray-300 rounded-sm"
            style={{ 
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.6), inset 0 0 5px rgba(255,255,255,0.3)'
            }}
          />
        </motion.div>
      </motion.div>

      {/* Trailing golf balls */}
      {balls.map((ball, index) => (
        <motion.div
          key={ball.id}
          className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
          style={{
            x: ball.x,
            y: ball.y,
          }}
          animate={{
            scale: isHovering ? ball.scale * 1.3 : ball.scale,
            opacity: 1 - index * 0.12,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        >
          <div
            className="-translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: `${10 - index}px`,
              height: `${10 - index}px`,
              background: index % 2 === 0 
                ? 'radial-gradient(circle at 30% 30%, #ffffff, #00ff88)' 
                : 'radial-gradient(circle at 30% 30%, #ffffff, #00ffff)',
              boxShadow: `
                0 0 ${10 - index}px ${index % 2 === 0 ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 255, 255, 0.6)'},
                inset -2px -2px 4px rgba(0,0,0,0.2)
              `,
            }}
          />
        </motion.div>
      ))}

      {/* Click ripple effect */}
      {isClicking && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9997] rounded-full"
          style={{
            x: cursorX.get(),
            y: cursorY.get(),
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="-translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-neon-green"
            style={{ boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)' }}
          />
        </motion.div>
      )}
    </>
  )
}
