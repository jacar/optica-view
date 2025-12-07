import { GoogleGenAI, Type } from "@google/genai";
import { DetectedFace } from '../types';

/**
 * Helper to resize image base64 to a manageable size for API (max 600px for speed/safety)
 */
const resizeImageForApi = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
        // Ensure we have the prefix for the Image object
        const src = base64Str.includes('base64,') ? base64Str : `data:image/png;base64,${base64Str}`;
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const MAX_DIM = 600; // Reduced to 600 to avoid 400 Invalid Argument / Payload Too Large
            let width = img.width;
            let height = img.height;
            
            // Downscale if too large
            if (width > MAX_DIM || height > MAX_DIM) {
                const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Return raw base64 without prefix for the API
            const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(resizedDataUrl.split('base64,')[1]);
        };
        img.onerror = () => {
            // If resize fails, return original stripped
            resolve(base64Str.includes('base64,') ? base64Str.split('base64,')[1] : base64Str);
        };
    });
};

/**
 * Detects eye positions using Gemini 2.5 Flash ("Nano Banana").
 * Returns normalized coordinates (0-1000 scale).
 */
export const detectEyesFromImage = async (base64Image: string): Promise<DetectedFace | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Resize image to prevent 400 Payload Invalid Argument errors
    const optimizedData = await resizeImageForApi(base64Image);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: optimizedData } },
          { 
            text: `Analyze this image and identify the precise center location of the left eye (the person's left eye, appearing on the right side of the image usually) and the right eye. 
            
            Return a JSON object with normalized coordinates on a scale of 0 to 1000 (where 0,0 is top-left and 1000,1000 is bottom-right).
            
            Schema:
            {
              "left_eye": { "x": number, "y": number },
              "right_eye": { "x": number, "y": number }
            }` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            left_eye: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.INTEGER },
                y: { type: Type.INTEGER }
              }
            },
            right_eye: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.INTEGER },
                y: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    const result = JSON.parse(jsonText);
    
    // Normalize to 0-1 range for the app to consume
    return {
      leftEye: { x: result.left_eye.x / 1000, y: result.left_eye.y / 1000 },
      rightEye: { x: result.right_eye.x / 1000, y: result.right_eye.y / 1000 },
      jawOutline: [] // Not needed for this step
    };

  } catch (error: any) {
    // Log detailed error for debugging
    console.error("Nano Banana Face Detection Failed:", JSON.stringify(error));
    return null;
  }
};

/**
 * Calculates frame position based on eye coordinates and specific frame dimensions.
 */
export const calculateAutoPosition = (
    leftEye: { x: number, y: number },
    rightEye: { x: number, y: number },
    containerWidth: number,
    containerHeight: number,
    frameWidthMm: number = 140 // Default to 140mm if not provided
) => {
    // Convert normalized coords to pixels
    const lx = leftEye.x * containerWidth;
    const ly = leftEye.y * containerHeight;
    const rx = rightEye.x * containerWidth;
    const ry = rightEye.y * containerHeight;

    // 1. Center Point (Midpoint between eyes)
    const centerX = (lx + rx) / 2;
    const centerY = (ly + ry) / 2;

    // 2. Rotation (Angle between eyes)
    const dy = ry - ly;
    const dx = rx - lx;
    const rotationRad = Math.atan2(dy, dx);
    const rotationDeg = rotationRad * (180 / Math.PI);

    // 3. Scale Calculation
    // Distance between eyes in pixels
    const eyeDistancePx = Math.sqrt(dx * dx + dy * dy);
    
    // Average IPD (Interpupillary Distance) is approx 63mm.
    // We calculate the pixels-per-mm ratio for this specific face.
    const averageIPDmm = 63; 
    const pixelsPerMm = eyeDistancePx / averageIPDmm;
    
    // Calculate how wide the glasses should be in pixels on this face
    const targetGlassesWidthPx = frameWidthMm * pixelsPerMm;

    // The frame overlay base width is hardcoded to 300px in FrameOverlay.tsx CSS.
    // So the scale factor is Target / Base.
    const scale = targetGlassesWidthPx / 300; 

    return {
        x: centerX,
        y: centerY,
        scale: scale,
        rotation: rotationDeg
    };
};