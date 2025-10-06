"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ImageCapture } from "@/components/image-capture"
import { MaskEditor } from "@/components/mask-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function EditorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get("mode") || "upload"

  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageCapture = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target.result)
      console.log("[Billions Mask Studio] Image loaded for editing")
    }
    reader.readAsDataURL(file)
  }

  const handleReset = () => {
    setSelectedImage(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="Billions Mask Studio" className="w-10 h-10 object-contain" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Billions Mask Studio
              </h1>
            </Link>

            {selectedImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Photo
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!selectedImage ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {mode === "camera" ? "Take Your Photo" : "Upload Your Photo"}
              </h2>
              <p className="text-muted-foreground text-lg">We'll automatically detect your face and apply the mask</p>
            </div>
            <ImageCapture onImageCapture={handleImageCapture} mode={mode} />
          </div>
        ) : (
          <MaskEditor imageUrl={selectedImage} />
        )}
      </main>
    </div>
  )
}
