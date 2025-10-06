"use client"

import { Suspense } from "react"
import { EditorContent } from "@/components/editor-content"

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <EditorContent />
    </Suspense>
  )
}
