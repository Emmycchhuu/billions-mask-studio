"use client"

import { useEffect, useState } from "react"

const LOADING_MASKS = [
  "/masks/mask-gradient.png",
  "/masks/mask-gold.png",
  "/masks/mask-electric.png",
  "/masks/mask-lava.png",
  "/masks/mask-rainbow.png",
  "/masks/mask-neon-blue.png",
  "/masks/mask-tech-cyan.png",
  "/masks/mask-red.png",
]

export function LoadingScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)
  const [currentMaskIndex, setCurrentMaskIndex] = useState(0)

  useEffect(() => {
    const maskInterval = setInterval(() => {
      setCurrentMaskIndex((prev) => (prev + 1) % LOADING_MASKS.length)
    }, 1400)

    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 6000)

    return () => {
      clearInterval(maskInterval)
      clearTimeout(timer)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="text-center space-y-8">
        <div className="relative w-48 h-48 mx-auto">
          <img
            key={currentMaskIndex}
            src={LOADING_MASKS[currentMaskIndex] || "/placeholder.svg"}
            alt="Billions Mask"
            className="absolute inset-0 w-full h-full object-contain animate-[slideInOut_1.4s_ease-in-out]"
          />
        </div>

        {/* Studio Text */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
            Billions Mask Studio
          </h1>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce [animation-delay:0ms]"></div>
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:150ms]"></div>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce [animation-delay:300ms]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
