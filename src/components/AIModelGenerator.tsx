import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Loader2, Image as ImageIcon, Palette, Info } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey } from '../utils/apiKey';

interface AIModelGeneratorProps {
  onImageGenerated: (dataUrl: string) => void;
  onBack: () => void;
}

const ASPECT_RATIOS = [
  "1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"
];

const RESOLUTIONS = ["1K", "2K", "4K"];

const AVATAR_STYLES = [
  { value: 'studio', label: 'Retrato de Estudio' },
  { value: 'fantasy', label: 'Fantasía' },
  { value: 'cartoon', label: 'Cartoon 3D' },
  { value: 'anime', label: 'Anime / Manga' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'sketch', label: 'Dibujo Artístico' },
];

const AIModelGenerator: React.FC<AIModelGeneratorProps> = ({ onImageGenerated, onBack }) => {
  const [prompt, setPrompt] = useState("Un retrato de una persona mirando al frente, expresión neutral, iluminación suave");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1K");
  const [selectedStyle, setSelectedStyle] = useState("studio");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      // Check for API Key selection (Required for Veo/Pro Image models)
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey && win.aistudio.openSelectKey) {
         const hasKey = await win.aistudio.hasSelectedApiKey();
         if (!hasKey) {
             await win.aistudio.openSelectKey();
         }
      }

      const apiKey = getGeminiApiKey();
      if (!apiKey) throw new Error("MISSING_KEY");

      const ai = new GoogleGenAI({ apiKey });
      
      // Construct prompt with style
      const styleObj = AVATAR_STYLES.find(s => s.value === selectedStyle);
      const stylePrompt = styleObj ? `Art Style: ${styleObj.label}. ` : "";
      const fullPrompt = `${stylePrompt}${prompt}. Ensure the face is clearly visible and facing forward to allow for virtual glasses try-on. High quality, detailed.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: resolution,
          },
        },
      });

      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        onImageGenerated(imageUrl);
      } else {
        setError("No se pudo generar la imagen. Intenta con otra descripción.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "MISSING_KEY") {
          setError("Error: Falta la VITE_GOOGLE_API_KEY en las variables de entorno de Vercel.");
      } else if (err.message && err.message.includes("Requested entity was not found")) {
          setError("Error de autenticación. Intenta seleccionar la clave de nuevo.");
          const win = window as any;
          if (win.aistudio && win.aistudio.openSelectKey) {
              await win.aistudio.openSelectKey();
          }
      } else {
          setError(err.message || "Error al generar imagen.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white p-4 shadow-sm z-20 flex items-center justify-between">
        <div className="flex items-center">
            <button 
                onClick={onBack}
                className="flex items-center text-slate-600 hover:text-slate-900 font-medium"
            >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Volver
            </button>
            <h1 className="font-bold text-lg text-slate-800 ml-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Estudio IA
            </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 text-blue-600" />
            <p>Describe cómo quieres que se vea tu modelo virtual. La IA generará un rostro único para que puedas probarte las gafas.</p>
        </div>

        {/* Style Selection */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-600" />
                Estilo del Avatar
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVATAR_STYLES.map((style) => (
                    <button
                        key={style.value}
                        onClick={() => setSelectedStyle(style.value)}
                        className={`
                            px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left border relative overflow-hidden group
                            ${selectedStyle === style.value 
                                ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200 hover:bg-slate-50'
                            }
                        `}
                    >
                        <span className="relative z-10">{style.label}</span>
                        {selectedStyle === style.value && (
                            <div className="absolute top-0 right-0 w-3 h-3 bg-purple-500 rounded-bl-lg" />
                        )}
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descripción Visual
            </label>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-h-[100px] text-slate-800 placeholder:text-slate-400"
                placeholder="Ej: Una mujer joven con cabello rubio corto, estilo profesional, iluminación de estudio suave..."
            />
            <p className="text-xs text-slate-400 mt-2 text-right">
                Sé específico para mejores resultados.
            </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Relación de Aspecto
                </label>
                <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500 bg-white"
                >
                    {ASPECT_RATIOS.map(ratio => (
                        <option key={ratio} value={ratio}>{ratio}</option>
                    ))}
                </select>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Resolución
                </label>
                <select 
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500 bg-white"
                >
                    {RESOLUTIONS.map(res => (
                        <option key={res} value={res}>{res}</option>
                    ))}
                </select>
            </div>
        </div>

        {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
            </div>
        )}

        <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white shadow-lg transition-all ${
                loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:scale-[1.02]'
            }`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando Modelo...
                </>
            ) : (
                <>
                    <ImageIcon className="w-5 h-5" />
                    Generar y Probar
                </>
            )}
        </button>
        
        <p className="text-xs text-center text-slate-400 mt-4">
            Potenciado por Gemini 3 Pro Image Preview. 
        </p>
      </div>
    </div>
  );
};

export default AIModelGenerator;