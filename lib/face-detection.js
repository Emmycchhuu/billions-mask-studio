// Face detection utilities using face-api.js
let modelsLoaded = false

export const MASK_DATA = [
  { id: "green", name: "Classic Green", src: "/masks/mask-green.png" },
  { id: "gradient", name: "Sunset Gradient", src: "/masks/mask-gradient.png" },
  { id: "silver", name: "Silver Chrome", src: "/masks/mask-silver.png" },
  { id: "lava", name: "Lava Flow", src: "/masks/mask-lava.png" },
  { id: "gold", name: "Golden Shine", src: "/masks/mask-gold.png" },
  { id: "electric", name: "Electric Blue", src: "/masks/mask-electric.png" },
  { id: "rainbow", name: "Rainbow Drip", src: "/masks/mask-rainbow.png" },
  { id: "steampunk", name: "Steampunk Gears", src: "/masks/mask-steampunk.png" },
  { id: "fireice", name: "Fire & Ice", src: "/masks/mask-fireice.png" },
  { id: "red", name: "Red Chrome", src: "/masks/mask-red.png" },
  { id: "circuit-dark", name: "Dark Circuit", src: "/masks/mask-circuit-dark.png" },
  { id: "swirly", name: "Swirly Rainbow", src: "/masks/mask-swirly.png" },
  { id: "tech-cyan", name: "Tech Cyan", src: "/masks/mask-tech-cyan.png" },
  { id: "neon-blue", name: "Neon Blue", src: "/masks/mask-neon-blue.png" },
]

export async function loadFaceDetectionModels() {
  if (modelsLoaded) return true

  try {
    const faceapi = await import("@vladmandic/face-api")

    // Load models from CDN
    const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ])

    modelsLoaded = true
    return true
  } catch (error) {
    console.error("Error loading face detection models:", error)
    return false
  }
}

export async function detectFace(imageElement) {
  try {
    const faceapi = await import("@vladmandic/face-api")

    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()

    if (!detection) {
      return null
    }

    return detection
  } catch (error) {
    console.error("Error detecting face:", error)
    return null
  }
}

export function calculateMaskPosition(detection, imageWidth, imageHeight) {
  if (!detection) return null

  const landmarks = detection.landmarks
  const box = detection.detection.box

  // Get key facial landmarks
  const leftEye = landmarks.getLeftEye()
  const rightEye = landmarks.getRightEye()
  const nose = landmarks.getNose()

  // Calculate center point between eyes
  const leftEyeCenter = {
    x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
    y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length,
  }

  const rightEyeCenter = {
    x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
    y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length,
  }

  // Calculate mask center (slightly above eye line)
  const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2
  const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2 - box.height * 0.05

  // Calculate eye distance for mask width
  const eyeDistance = Math.sqrt(
    Math.pow(rightEyeCenter.x - leftEyeCenter.x, 2) + Math.pow(rightEyeCenter.y - leftEyeCenter.y, 2),
  )

  // Mask width should be about 2.5x the eye distance
  const maskWidth = eyeDistance * 2.5
  const maskHeight = maskWidth // Keep square aspect ratio

  // Calculate rotation angle based on eye alignment
  const angle = Math.atan2(rightEyeCenter.y - leftEyeCenter.y, rightEyeCenter.x - leftEyeCenter.x)

  return {
    x: centerX,
    y: centerY,
    width: maskWidth,
    height: maskHeight,
    rotation: angle * (180 / Math.PI), // Convert to degrees
  }
}
