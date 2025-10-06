import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Billions Mask Studio - Try On Billions Masks",
  description:
    "Upload your photo and instantly try on exclusive Billions masks with automatic face detection and custom editing tools.",
  keywords: ["Billions", "mask", "photo editor", "face filter", "mask studio", "photo booth"],
  authors: [{ name: "Billions Mask Studio" }],
  creator: "Billions Mask Studio",
  publisher: "Billions Mask Studio",
  metadataBase: new URL("https://billions-mask-studio.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Billions Mask Studio - Try On Billions Masks",
    description:
      "Upload your photo and instantly try on exclusive Billions masks with automatic face detection and custom editing tools.",
    siteName: "Billions Mask Studio",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Billions Mask Studio Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Billions Mask Studio - Try On Billions Masks",
    description:
      "Upload your photo and instantly try on exclusive Billions masks with automatic face detection and custom editing tools.",
    images: ["/logo.png"],
    creator: "@BillionsMask",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
