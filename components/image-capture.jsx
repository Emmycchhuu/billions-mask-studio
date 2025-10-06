"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload } from "lucide-react"

export function ImageCapture({ onImageCapture }) {
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      onImageCapture(file)
    } else {
      alert("Please select a valid image file")
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-12 border-dashed border-2 hover:border-primary/50 transition-colors">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Upload className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Upload Your Photo
            </h3>
            <p className="text-sm text-muted-foreground text-pretty">Choose a clear photo showing your face</p>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-semibold"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      </Card>
    </div>
  )
}
