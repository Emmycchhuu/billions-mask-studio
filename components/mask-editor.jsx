"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Download, RotateCw, ZoomIn, ZoomOut, Maximize2, Loader2 } from "lucide-react"
import { loadFaceDetectionModels, detectFace, calculateMaskPosition, MASK_DATA } from "@/lib/face-detection"

export function MaskEditor({ imageUrl }) {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMask, setSelectedMask] = useState(MASK_DATA[0])
  const [maskTransform, setMaskTransform] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    rotation: 0,
    opacity: 100,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [touchStart, setTouchStart] = useState(null)
  const [initialPinchDistance, setInitialPinchDistance] = useState(null)
  const [initialSize, setInitialSize] = useState(null)
  const [initialRotation, setInitialRotation] = useState(0)

  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const maskImageRef = useRef(null)
  const containerRef = useRef(null)

  const isTouchOnMask = (canvasX, canvasY) => {
    const dx = canvasX - maskTransform.x
    const dy = canvasY - maskTransform.y

    // Rotate the point back to check if it's within the mask bounds
    const angle = (-maskTransform.rotation * Math.PI) / 180
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle)
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle)

    // Check if within mask rectangle
    return Math.abs(rotatedX) <= maskTransform.width / 2 && Math.abs(rotatedY) <= maskTransform.height / 2
  }

  // Load face detection models and detect face
  useEffect(() => {
    const initFaceDetection = async () => {
      setIsLoading(true)

      const modelsPromise = loadFaceDetectionModels()

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = imageUrl

      img.onload = async () => {
        imageRef.current = img

        // Wait for models to load
        await modelsPromise

        const detection = await detectFace(img)

        if (detection) {
          const position = calculateMaskPosition(detection, img.width, img.height)
          if (position) {
            setMaskTransform((prev) => ({
              ...prev,
              x: position.x,
              y: position.y,
              width: position.width,
              height: position.width,
            }))
          }
        } else {
          setMaskTransform((prev) => ({
            ...prev,
            x: img.width / 2,
            y: img.height / 2,
          }))
        }

        setIsLoading(false)
        drawCanvas()
      }
    }

    initFaceDetection()
  }, [imageUrl])

  // Load mask image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = selectedMask.src
    img.onload = () => {
      maskImageRef.current = img
      drawCanvas()
    }
  }, [selectedMask])

  // Redraw canvas when transform changes
  useEffect(() => {
    drawCanvas()
  }, [maskTransform])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    const maskImage = maskImageRef.current

    if (!canvas || !image) return

    const ctx = canvas.getContext("2d")

    canvas.width = image.width
    canvas.height = image.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0)

    if (maskImage) {
      ctx.save()
      ctx.globalAlpha = maskTransform.opacity / 100
      ctx.translate(maskTransform.x, maskTransform.y)
      ctx.rotate((maskTransform.rotation * Math.PI) / 180)

      ctx.drawImage(
        maskImage,
        -maskTransform.width / 2,
        -maskTransform.height / 2,
        maskTransform.width,
        maskTransform.height,
      )

      ctx.restore()
    }
  }

  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchAngle = (touch1, touch2) => {
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * (180 / Math.PI)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const rect = canvasRef.current.getBoundingClientRect()
      const scaleX = canvasRef.current.width / rect.width
      const scaleY = canvasRef.current.height / rect.height
      const touch = e.touches[0]
      const x = (touch.clientX - rect.left) * scaleX
      const y = (touch.clientY - rect.top) * scaleY

      if (isTouchOnMask(x, y)) {
        setIsDragging(true)
        setDragStart({ x: x - maskTransform.x, y: y - maskTransform.y })
        setTouchStart({ x: touch.clientX, y: touch.clientY })
      }
    } else if (e.touches.length === 2) {
      // Two touches - pinch and rotate
      setIsDragging(false)
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      const angle = getTouchAngle(e.touches[0], e.touches[1])
      setInitialPinchDistance(distance)
      setInitialSize(maskTransform.width)
      setInitialRotation(maskTransform.rotation - angle)
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      // Single touch drag - only prevent default when dragging the mask
      e.preventDefault()
      const rect = canvasRef.current.getBoundingClientRect()
      const scaleX = canvasRef.current.width / rect.width
      const scaleY = canvasRef.current.height / rect.height
      const touch = e.touches[0]
      const x = (touch.clientX - rect.left) * scaleX
      const y = (touch.clientY - rect.top) * scaleY

      setMaskTransform((prev) => ({
        ...prev,
        x: x - dragStart.x,
        y: y - dragStart.y,
      }))
    } else if (e.touches.length === 2 && initialPinchDistance) {
      // Pinch to zoom and rotate - prevent default when using two fingers
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1])
      const currentAngle = getTouchAngle(e.touches[0], e.touches[1])
      const scale = currentDistance / initialPinchDistance
      const newSize = Math.max(50, Math.min(800, initialSize * scale))
      const newRotation = initialRotation + currentAngle

      setMaskTransform((prev) => ({
        ...prev,
        width: newSize,
        height: newSize,
        rotation: newRotation,
      }))
    }
    // If not dragging or pinching, allow normal scrolling (no preventDefault)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setInitialPinchDistance(null)
    setInitialSize(null)
    setTouchStart(null)
  }

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (isTouchOnMask(x, y)) {
      setIsDragging(true)
      setDragStart({ x: x - maskTransform.x, y: y - maskTransform.y })
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setMaskTransform((prev) => ({
      ...prev,
      x: x - dragStart.x,
      y: y - dragStart.y,
    }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -20 : 20
    adjustSize(delta)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `billions-mask-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    }, "image/png")
  }

  const adjustSize = (delta) => {
    setMaskTransform((prev) => ({
      ...prev,
      width: Math.max(50, Math.min(800, prev.width + delta)),
      height: Math.max(50, Math.min(800, prev.height + delta)),
    }))
  }

  const adjustRotation = (delta) => {
    setMaskTransform((prev) => ({
      ...prev,
      rotation: prev.rotation + delta,
    }))
  }

  const resetTransform = () => {
    setMaskTransform((prev) => ({
      ...prev,
      rotation: 0,
      opacity: 100,
    }))
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Canvas Area */}
      <div className="space-y-4">
        <Card className="p-4 bg-black/50 relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                <p className="text-sm text-muted-foreground">Detecting face...</p>
              </div>
            </div>
          )}

          <div
            ref={containerRef}
            className="relative flex items-center justify-center min-h-[400px] cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg" />
          </div>
        </Card>

        {/* Quick Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustSize(-20)}
            className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
          >
            <ZoomOut className="w-4 h-4 mr-2" />
            Smaller
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustSize(20)}
            className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
          >
            <ZoomIn className="w-4 h-4 mr-2" />
            Larger
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustRotation(-5)}
            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
          >
            <RotateCw className="w-4 h-4 mr-2 scale-x-[-1]" />
            Rotate Left
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => adjustRotation(5)}
            className="border-pink-500/50 text-pink-500 hover:bg-pink-500/10"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Rotate Right
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetTransform}
            className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10 bg-transparent"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleDownload}
            className="ml-auto bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="space-y-6">
        {/* Mask Library */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 text-orange-500">Choose Mask</h3>
          <div className="grid grid-cols-3 gap-2">
            {MASK_DATA.map((mask) => (
              <button
                key={mask.id}
                onClick={() => setSelectedMask(mask)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  selectedMask.id === mask.id
                    ? "border-orange-500 shadow-lg shadow-orange-500/30"
                    : "border-border hover:border-orange-500/50"
                }`}
              >
                <img
                  src={mask.src || "/placeholder.svg"}
                  alt={mask.name}
                  className="w-full h-full object-contain bg-muted/50"
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">{selectedMask.name}</p>
        </Card>

        {/* Fine Controls */}
        <Card className="p-4 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-yellow-500">Size</label>
            <Slider
              value={[maskTransform.width]}
              onValueChange={([value]) =>
                setMaskTransform((prev) => ({
                  ...prev,
                  width: value,
                  height: value,
                }))
              }
              min={50}
              max={800}
              step={5}
              className="[&_[role=slider]]:bg-yellow-500"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-orange-500">Rotation</label>
            <Slider
              value={[maskTransform.rotation]}
              onValueChange={([value]) => setMaskTransform((prev) => ({ ...prev, rotation: value }))}
              min={-180}
              max={180}
              step={1}
              className="[&_[role=slider]]:bg-orange-500"
            />
            <p className="text-xs text-muted-foreground text-center">{maskTransform.rotation.toFixed(0)}°</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-red-500">Opacity</label>
            <Slider
              value={[maskTransform.opacity]}
              onValueChange={([value]) => setMaskTransform((prev) => ({ ...prev, opacity: value }))}
              min={0}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-red-500"
            />
            <p className="text-xs text-muted-foreground text-center">{maskTransform.opacity}%</p>
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <h4 className="text-sm font-semibold mb-2 text-orange-500">Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Drag with one finger/mouse to move</li>
            <li>• Pinch with two fingers to resize</li>
            <li>• Rotate with two fingers</li>
            <li>• Scroll wheel to zoom in/out</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
