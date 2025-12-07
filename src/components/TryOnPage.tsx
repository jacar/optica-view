import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, RotateCcw, ScanFace, Wand2, X, Loader2, Sparkles, ZoomIn, RotateCw, Sun, Contrast } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Frame } from '../types';
import { useDraggableFrame } from '../hooks/useDraggableFrame';
import FrameOverlay from './FrameOverlay';
import FrameCarousel from './FrameCarousel';
import { detectEyesFromImage, calculateAutoPosition } from '../services/faceDetectionService';

interface TryOnPageProps {
  userPhoto: string;
  frames: Frame[];
  onBack: () => void;
}

const TryOnPage: React.FC<TryOnPageProps> = ({ userPhoto: initialUserPhoto, frames, onBack }) => {
  const [userPhoto, setUserPhoto] = useState(initialUserPhoto);
  const [selectedFrame, setSelectedFrame] = useState<Frame>(frames.length > 0 ? frames[0] : {} as Frame);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const [isAutoAdjusting, setIsAutoAdjusting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  
  // Image Blending States
  const [frameBrightness, setFrameBrightness] = useState(105);
  const [frameContrast, setFrameContrast] = useState(110);
  
  // Cache for eye detection to avoid re-calling API for same photo
  const [cachedEyes, setCachedEyes] = useState<any>(null);

  const { 
    position, 
    setPosition,
    handleMouseDown, 
    handleTouchStart,
    updateScale,
    updateRotation,
    resetPosition
  } = useDraggableFrame({ 
    initialScale: 1,
    containerRef 
  });

  // AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isGeneratingEdit, setIsGeneratingEdit] = useState(false);
  const [isGenerativeTryOn, setIsGenerativeTryOn] = useState(false);

  // Fallback if no frames exist
  if (frames.length === 0 && !selectedFrame.id) {
      return <div className="p-10 text-white text-center">No hay monturas disponibles. Sube alguna en el catálogo. <button onClick={onBack} className="underline">Volver</button></div>;
  }

  // Update selected frame if the list changes (e.g. from catalog) and current selection is invalid
  useEffect(() => {
      if (frames.length > 0 && !frames.find(f => f.id === selectedFrame.id)) {
          setSelectedFrame(frames[0]);
      }
  }, [frames, selectedFrame.id]);


  // Auto-Run Face Detection (Nano Banana) logic
  const performAutoAdjustment = async () => {
    if (!containerRef.current || !photoRef.current) return;
    
    // If we haven't detected eyes yet, do it now
    let eyes = cachedEyes;
    
    if (!eyes) {
        setIsAutoAdjusting(true);
        // Brief delay to ensure image is rendered
        await new Promise(r => setTimeout(r, 100));
        eyes = await detectEyesFromImage(userPhoto);
        if (eyes) setCachedEyes(eyes);
        setIsAutoAdjusting(false);
    }

    if (eyes && containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        
        // Recalculate based on current container size AND selected frame width
        const newPos = calculateAutoPosition(
            eyes.leftEye, 
            eyes.rightEye, 
            clientWidth, 
            clientHeight,
            selectedFrame.width_mm
        );
        
        setPosition({
            x: newPos.x,
            y: newPos.y,
            scale: newPos.scale,
            rotation: newPos.rotation
        });
    }
  };

  // Run auto-adjustment when dependencies change
  useEffect(() => {
    if (showOverlay) {
        performAutoAdjustment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPhoto, showOverlay, selectedFrame.id]); 

  // Handle frame selection
  const handleSelectFrame = (frame: Frame) => {
    setSelectedFrame(frame);
    setShowOverlay(true); 
    // Effect above triggers adjustment automatically
  };

  const handleDownload = () => {
    if (!containerRef.current || !photoRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const photo = photoRef.current;
    
    canvas.width = photo.naturalWidth;
    canvas.height = photo.naturalHeight;
    
    if (ctx) {
        ctx.drawImage(photo, 0, 0);
        
        if (showOverlay) {
            const rect = containerRef.current.getBoundingClientRect();
            const domToImgScaleX = photo.naturalWidth / rect.width;
            const domToImgScaleY = photo.naturalHeight / rect.height;
            
            const frameImg = new Image();
            frameImg.crossOrigin = "anonymous";
            frameImg.src = selectedFrame.imageUrl;
            
            frameImg.onload = () => {
                const frameX = position.x * domToImgScaleX;
                const frameY = position.y * domToImgScaleY;
                
                ctx.save();
                ctx.translate(frameX, frameY);
                ctx.rotate((position.rotation * Math.PI) / 180);
                ctx.scale(position.scale * domToImgScaleX, position.scale * domToImgScaleY);
                
                // Aplicar filtros en canvas para descarga
                ctx.filter = `contrast(${frameContrast}%) brightness(${frameBrightness}%)`;
                
                // Simulación de transparencia (simple para download)
                ctx.drawImage(frameImg, -150, -((150 * frameImg.height) / frameImg.width), 300, (300 * frameImg.height) / frameImg.width);
                ctx.restore();
                
                downloadCanvas(canvas);
            };
        } else {
            downloadCanvas(canvas);
        }
    }
  };

  const downloadCanvas = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = `optiview-prueba-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleAnalyzeFace = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Data = userPhoto.includes('base64,') ? userPhoto.split('base64,')[1] : userPhoto;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Data } },
                    { text: "Analiza el rostro en esta imagen. Describe la forma de la cara y el tono de piel en español. Recomienda 2 formas de lentes específicas. Mantén la respuesta breve (menos de 40 palabras)." }
                ]
            }
        });
        setAnalysisResult(response.text || "No se pudo analizar la imagen.");
    } catch (e) {
        console.error(e);
        setAnalysisResult("Falló el análisis. Intenta nuevamente.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
      // Helper to convert blob to base64
      const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                resolve(base64.split(',')[1]); // Remove header
            };
            reader.readAsDataURL(blob);
        });
      };

      try {
          // Attempt 1: Direct fetch with cors mode
          const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
          if (!response.ok) throw new Error('Direct fetch failed');
          const blob = await response.blob();
          return await blobToBase64(blob);
      } catch (error) {
          console.warn("Direct fetch failed (likely CORS), trying fallback proxy 1...", error);
          try {
              // Attempt 2: Public CORS Proxy (AllOrigins)
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
              const response = await fetch(proxyUrl);
              if (!response.ok) throw new Error('Proxy 1 failed');
              const blob = await response.blob();
              return await blobToBase64(blob);
          } catch (proxyError) {
              console.warn("Proxy 1 failed, trying proxy 2...", proxyError);
              try {
                  // Attempt 3: CorsProxy.io (Alternative)
                  const proxyUrl2 = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                  const response = await fetch(proxyUrl2);
                  if (!response.ok) throw new Error('Proxy 2 failed');
                  const blob = await response.blob();
                  return await blobToBase64(blob);
              } catch (proxyError2) {
                  console.error("All image fetch attempts failed:", proxyError2);
                  return null;
              }
          }
      }
  };

  const handleGenerativeTryOn = async () => {
    if (!containerRef.current) return;
    setIsGenerativeTryOn(true);
    
    try {
        // 1. First ensure we have the best position (Nano Banana)
        let eyes = cachedEyes;
        if (!eyes) {
             eyes = await detectEyesFromImage(userPhoto);
        }
        
        // Calculate Rotation angle specifically
        let rotationAngle = 0;
        let eyeCenterX = 0.5;
        let eyeCenterY = 0.5;
        
        if (eyes) {
             const dy = eyes.rightEye.y - eyes.leftEye.y;
             const dx = eyes.rightEye.x - eyes.leftEye.x;
             const rad = Math.atan2(dy, dx);
             rotationAngle = rad * (180 / Math.PI);
             eyeCenterX = (eyes.leftEye.x + eyes.rightEye.x) / 2;
             eyeCenterY = (eyes.leftEye.y + eyes.rightEye.y) / 2;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const userBase64 = userPhoto.includes('base64,') ? userPhoto.split('base64,')[1] : userPhoto;
        
        // Fetch product image - CRITICAL STEP
        const frameBase64 = await fetchImageAsBase64(selectedFrame.imageUrl);

        if (!frameBase64) {
            alert("No se pudo descargar la imagen de los lentes debido a restricciones de seguridad (CORS). Intenta subir una imagen a un servicio diferente o usa una imagen local.");
            setIsGenerativeTryOn(false);
            return;
        }
        
        // Construct strict prompt
        const parts: any[] = [
             { inlineData: { mimeType: 'image/png', data: userBase64 } },
             { inlineData: { mimeType: 'image/png', data: frameBase64 } }, // Force PNG type interpretation for better transparency handling
             { 
               text: `
               ROLE: Expert Product Photographer and Editor.
               
               TASK: STRICT VIRTUAL TRY-ON (COMPOSITING).
               
               INPUTS:
               - Image 1: User Face.
               - Image 2: EYEWEAR PRODUCT REFERENCE (The Glasses).
               
               INSTRUCTIONS:
               1. You MUST use the glasses from Image 2. COPY THE PIXELS.
               2. DO NOT GENERATE NEW GLASSES. DO NOT HALLUCINATE A DIFFERENT DESIGN.
               3. Composite the glasses from Image 2 onto the face in Image 1.
               4. PRESERVE BRANDING: The shape, rim thickness, and color must match Image 2 exactly.
               
               GEOMETRY & FIT:
               - Center of glasses bridge should be at approx normalized coordinates X=${eyeCenterX.toFixed(2)}, Y=${eyeCenterY.toFixed(2)}.
               - Rotate glasses by ${rotationAngle.toFixed(1)} degrees to align with eyes.
               - Ensure the glasses sit realistically on the nose bridge.
               
               BACKGROUND HANDLING:
               - If Image 2 has a white background, treat white (#FFFFFF) as 100% TRANSPARENT.
               - Do NOT render a white box around the glasses.
               - Add subtle drop shadows on the face for realism.
               
               OUTPUT:
               - Return only the final composited image. High realism.
               ` 
             }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts }
        });

        let newImageUrl = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    newImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }

        if (newImageUrl) {
            setUserPhoto(newImageUrl);
            setShowOverlay(false); // Hide the draggable overlay since it's now baked in
        } else {
            alert("La IA no devolvió una imagen válida. Intenta de nuevo.");
        }

    } catch (e) {
        console.error(e);
        alert("Ocurrió un error al conectar con la IA.");
    } finally {
        setIsGenerativeTryOn(false);
    }
  };

  const handleEditImage = async () => {
      if (!editPrompt.trim()) return;
      setIsGeneratingEdit(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const base64Data = userPhoto.includes('base64,') ? userPhoto.split('base64,')[1] : userPhoto;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Data } },
                    { text: editPrompt }
                ]
            }
        });

        let newImageUrl = null;
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    newImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
            }
        }
        if (newImageUrl) {
            setUserPhoto(newImageUrl);
            setIsEditing(false);
            setEditPrompt('');
        }
      } catch (e) {
          console.error(e);
          alert("Falló la edición. Intenta de nuevo.");
      } finally {
          setIsGeneratingEdit(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 relative">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <button 
            onClick={onBack}
            className="pointer-events-auto flex items-center bg-white/10 backdrop-blur-md text-white px-3 py-2 rounded-full hover:bg-white/20 font-medium text-sm transition-all"
        >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Volver</span>
        </button>
        <div className="flex gap-3 pointer-events-auto">
            <button
                onClick={handleAnalyzeFace}
                disabled={isAnalyzing}
                className="p-2 rounded-full bg-indigo-600/90 text-white shadow-lg hover:bg-indigo-500 transition-all border border-indigo-400/30"
                title="Analizar Rostro (IA)"
            >
                {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanFace className="w-5 h-5" />}
            </button>
            <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white shadow-lg hover:bg-white/20 transition-all"
                title="Editor Mágico (IA)"
            >
                <Wand2 className="w-5 h-5" />
            </button>
            <button 
                onClick={handleDownload}
                className="p-2 rounded-full bg-white text-slate-900 shadow-lg hover:bg-gray-100 transition-all"
                title="Descargar Foto"
            >
                <Download className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Analysis Overlay */}
      {isAnalyzing && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] absolute animate-scan opacity-70"></div>
              <div className="absolute bottom-32 left-0 right-0 text-center text-white/80 font-mono text-sm">
                  Analizando facciones...
              </div>
          </div>
      )}

      {/* Analysis Result Card */}
      {analysisResult && (
          <div className="absolute top-20 left-4 right-4 md:left-auto md:right-8 md:w-80 z-30 bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> Recomendación IA
                  </h3>
                  <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-slate-600 p-1">
                      <X size={16} />
                  </button>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{analysisResult}</p>
          </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-indigo-500" /> 
                          Editor Mágico
                      </h3>
                      <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="space-y-4">
                      <textarea 
                          className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none placeholder:text-slate-400"
                          rows={3}
                          placeholder="Ej: 'Agrega un filtro vintage', 'Elimina el fondo', 'Pon un atardecer de fondo'..."
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                      />
                      <button 
                          onClick={handleEditImage}
                          disabled={isGeneratingEdit || !editPrompt.trim()}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2 transition-colors"
                      >
                          {isGeneratingEdit ? <Loader2 className="animate-spin" /> : 'Aplicar Cambios'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center w-full">
        <div 
            ref={containerRef}
            className="relative shadow-2xl max-w-full max-h-full overflow-hidden"
            style={{ touchAction: 'none' }} 
        >
            <img 
                ref={photoRef}
                src={userPhoto} 
                alt="User" 
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain select-none pointer-events-none block"
            />
            
            {/* Auto-Adjusting Indicator */}
            {isAutoAdjusting && (
                <div className="absolute top-4 right-4 z-40 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Ajustando...
                </div>
            )}

            {/* Generative Loading Indicator */}
            {isGenerativeTryOn && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse mb-4" />
                    <p className="font-bold text-lg">Procesando Imagen Realista...</p>
                    <p className="text-sm text-white/70">Composicion IA en progreso...</p>
                </div>
            )}
            
            {showOverlay && selectedFrame && (
                <FrameOverlay 
                    frame={selectedFrame}
                    position={position}
                    brightness={frameBrightness}
                    contrast={frameContrast}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                />
            )}
        </div>
      </div>

      {/* Bottom Control Panel */}
      <div className="z-20 bg-white rounded-t-3xl md:rounded-2xl md:mb-6 md:mx-auto md:max-w-4xl w-full shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
         {/* Adjustment Bar */}
         <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
            {showOverlay ? (
                <>
                    {/* Scale Control */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                        <ZoomIn size={14} className="text-slate-400" />
                        <input 
                            type="range" 
                            min="0.5" 
                            max="2.5" 
                            step="0.05" 
                            value={position.scale}
                            onChange={(e) => updateScale(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                    
                    {/* Rotate Control */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                        <RotateCw size={14} className="text-slate-400" />
                        <input 
                            type="range" 
                            min="-45" 
                            max="45" 
                            step="1" 
                            value={position.rotation}
                            onChange={(e) => updateRotation(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                    
                    {/* Brightness Control */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                        <Sun size={14} className="text-slate-400" />
                        <input 
                            type="range" 
                            min="50" 
                            max="150" 
                            step="5" 
                            value={frameBrightness}
                            onChange={(e) => setFrameBrightness(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            title="Brillo"
                        />
                    </div>

                    {/* Contrast Control */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                        <Contrast size={14} className="text-slate-400" />
                        <input 
                            type="range" 
                            min="50" 
                            max="150" 
                            step="5" 
                            value={frameContrast}
                            onChange={(e) => setFrameContrast(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
                            title="Contraste"
                        />
                    </div>
                    
                    {/* Generative Try-On Button */}
                    <button
                        onClick={handleGenerativeTryOn}
                        disabled={isGenerativeTryOn}
                        className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                    >
                        <Sparkles size={12} />
                        Fusión IA
                    </button>
                    
                    <button
                        onClick={() => {
                            resetPosition();
                            performAutoAdjustment();
                            setFrameBrightness(105);
                            setFrameContrast(110);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0"
                        title="Resetear todo"
                    >
                        <RotateCcw size={18} />
                    </button>
                </>
            ) : (
                <div className="w-full flex items-center justify-between px-4">
                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-500"/>
                        Modo Generado por IA
                    </span>
                    <button
                        onClick={() => setShowOverlay(true)}
                        className="text-xs font-bold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-full hover:bg-indigo-50"
                    >
                        Cambiar a Manual
                    </button>
                </div>
            )}
         </div>

         {/* Carousel */}
         <FrameCarousel 
            frames={frames} 
            selectedFrameId={selectedFrame.id}
            onSelectFrame={handleSelectFrame}
        />
      </div>
    </div>
  );
};

export default TryOnPage;