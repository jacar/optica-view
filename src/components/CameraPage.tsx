import React, { useRef, useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Loader2, Camera as CameraIcon, Info } from 'lucide-react';

interface CameraPageProps {
  onCapture: (photoDataUrl: string) => void;
  onOpenAI: () => void;
}

const CameraPage: React.FC<CameraPageProps> = ({ onCapture, onOpenAI }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use a ref for the stream to ensure we can access it synchronously during cleanup
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isLoading, setIsLoading] = useState(true);

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
          track.stop();
          streamRef.current?.removeTrack(track);
      });
      streamRef.current = null;
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
    }
  };

  const startCamera = async () => {
    stopCamera(); // Ensure previous stream is closed
    setIsLoading(true);
    setError('');

    try {
      const constraints = {
        video: { 
            facingMode: facingMode,
            width: { ideal: 1280 }, 
            height: { ideal: 1280 },
            aspectRatio: 1
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Camera Error:", err);
      // specific error handling
      if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('La cámara está en uso. Por favor recarga la página.');
      } else if (err.name === 'NotAllowedError') {
          setError('Permiso denegado. Habilita el acceso a la cámara en tu navegador.');
      } else {
          setError('No se pudo acceder a la cámara.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startCamera();
    
    // Cleanup function to stop camera when component unmounts or dependency changes
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      // Set canvas size to match video resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally if using front camera for natural mirror effect
        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        
        // Stop camera before proceeding to next screen
        stopCamera();
        
        onCapture(dataUrl);
      }
    }
  };

  const switchCamera = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-accent" />
            <p className="font-medium tracking-wide">Iniciando OptiView...</p>
        </div>
      )}

      {error ? (
        <div className="text-white text-center p-6 z-50 max-w-sm">
            <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl">
                <p className="mb-4 text-red-200 text-sm">{error}</p>
                <button 
                    onClick={startCamera}
                    className="bg-red-500 px-6 py-2 rounded-full font-medium text-white hover:bg-red-600 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        </div>
      ) : (
        <>
          <div className="relative w-full h-full">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            
            {/* Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
                <svg viewBox="0 0 200 260" className="w-64 h-80 drop-shadow-lg">
                    <path 
                        d="M100,20 C55,20 20,60 20,110 V160 C20,210 55,240 100,240 C145,240 180,210 180,160 V110 C180,60 145,20 100,20" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2" 
                        strokeDasharray="10,5"
                    />
                    <path d="M70,100 Q100,100 130,100" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
                </svg>
                <div className="absolute bottom-32 text-white/80 text-sm font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    Alinea tu rostro aquí
                </div>
            </div>
          </div>
          
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
             <div className="text-white">
                <h1 className="font-bold text-xl tracking-tight">OptiView</h1>
                <p className="text-xs text-white/70">Espejo Virtual</p>
             </div>

             <button
                onClick={() => {
                    stopCamera();
                    onOpenAI();
                }}
                className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/20 transition-all border border-white/20 shadow-lg"
             >
                <Sparkles size={16} className="text-purple-300" />
                <span className="text-sm font-medium">Crear Avatar IA</span>
             </button>
          </div>
          
          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex items-center justify-center gap-10 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <button 
                onClick={switchCamera}
                className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10 transition-transform active:scale-95"
            >
                <RefreshCw className="w-6 h-6" />
            </button>

            <button
              onClick={takePhoto}
              className="group relative"
            >
              <div className="absolute inset-0 bg-accent blur-xl opacity-30 group-hover:opacity-50 transition-opacity rounded-full"></div>
              <div className="w-20 h-20 bg-white rounded-full border-4 border-transparent bg-clip-border relative z-10 flex items-center justify-center group-active:scale-95 transition-all shadow-xl">
                  <div className="w-16 h-16 border-2 border-slate-300 rounded-full"></div>
              </div>
            </button>

            <div className="w-12 h-12 flex items-center justify-center">
                <button className="text-white/50 hover:text-white transition-colors">
                    <Info size={24} />
                </button>
            </div>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraPage;