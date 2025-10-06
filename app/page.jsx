"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { LoadingScreen } from "@/components/loading-screen"

export default function HomePage() {
  const [showLoading, setShowLoading] = useState(true)

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Billions Mask Studio" className="w-12 h-12 object-contain" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Billions Mask Studio
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
              Try On Your
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Billions Mask
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Upload a photo to see yourself with a Billions mask. Automatic face mapping with manual editing controls.
            </p>
          </div>

          <div className="flex justify-center pt-8">
            <Link href="/editor?mode=upload" className="block">
              <Card className="p-8 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/20 cursor-pointer group bg-gradient-to-br from-card to-orange-500/5 min-w-[300px]">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                      Upload Photo
                    </h3>
                    <p className="text-sm text-muted-foreground text-pretty">Choose a photo from your device</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Features */}
          <div className="pt-12 grid md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <div className="text-yellow-500 font-semibold">Auto Face Mapping</div>
              <p className="text-muted-foreground text-pretty">Intelligent face detection places masks perfectly</p>
            </div>
            <div className="space-y-2">
              <div className="text-orange-500 font-semibold">Manual Editing</div>
              <p className="text-muted-foreground text-pretty">Drag, resize, and rotate for perfect positioning</p>
            </div>
            <div className="space-y-2">
              <div className="text-red-500 font-semibold">14 Unique Masks</div>
              <p className="text-muted-foreground text-pretty">Choose from multiple Billions mask designs</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">© 2025 Billions Mask Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
