import React, { useState, useEffect } from 'react';
import CameraPage from './components/CameraPage';
import TryOnPage from './components/TryOnPage';
import AIModelGenerator from './components/AIModelGenerator';
import LandingPage from './components/LandingPage';
import CatalogPage from './components/CatalogPage';
import AuthPage from './components/AuthPage';
import { Frame } from './types';
import { getStoredFrames } from './utils/frameStorage';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Home, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'catalog' | 'camera' | 'tryon' | 'aigen' | 'auth'>('landing');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isLoadingFrames, setIsLoadingFrames] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  
  // Track where the user wanted to go before being forced to login
  const [pendingView, setPendingView] = useState<'catalog' | 'camera' | null>(null);

  // Load frames on mount
  useEffect(() => {
    const loadFrames = async () => {
        setIsLoadingFrames(true);
        const data = await getStoredFrames();
        setFrames(data);
        setIsLoadingFrames(false);
    };
    loadFrames();

    // Check auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCapture = (photoDataUrl: string) => {
    setUserPhoto(photoDataUrl);
    setView('tryon');
  };

  const handleBack = () => {
    setView('camera');
  };

  const handleOpenAI = () => {
      setView('aigen');
  };

  const handleAIGenerated = (photoDataUrl: string) => {
      setUserPhoto(photoDataUrl);
      setView('tryon');
  };

  // Logic to protect the Try On experience
  const handleStartTryOn = () => {
      if (session) {
          setView('camera');
      } else {
          setPendingView('camera');
          setView('auth');
      }
  };

  const handleOpenCatalog = () => {
      if (session) {
          setView('catalog');
      } else {
          setPendingView('catalog');
          setView('auth');
      }
  };

  const handleLoginSuccess = () => {
      // Redirect to the view the user originally wanted
      if (pendingView === 'camera') {
          setView('camera');
      } else {
          setView('catalog'); // Default or explicit catalog request
      }
      setPendingView(null);
  };

  // Sign out handler
  const handleSignOut = async () => {
      await supabase.auth.signOut();
      setView('landing');
      setPendingView(null);
  };

  // Views that naturally take full page
  if (view === 'landing') {
      return (
        <LandingPage 
            onStartTryOn={handleStartTryOn} 
            onOpenCatalog={handleOpenCatalog}
        />
      );
  }

  if (view === 'auth') {
      return (
          <AuthPage 
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setView('landing')}
          />
      );
  }

  if (view === 'catalog') {
      // Basic route protection
      if (!session) {
          setView('auth');
          return null;
      }
      return (
          <CatalogPage 
            frames={frames}
            onUpdateFrames={setFrames}
            onBack={() => setView('landing')}
            onGoToCamera={() => setView('camera')}
            onSignOut={handleSignOut}
          />
      );
  }

  // App Functional Views (Camera, TryOn, AI Gen)
  return (
    <div className="h-screen w-screen bg-slate-900 relative overflow-hidden">
        
        {view === 'camera' && (
            <CameraPage 
                onCapture={handleCapture} 
                onOpenAI={handleOpenAI}
            />
        )}
        
        {view === 'aigen' && (
            <AIModelGenerator 
                onImageGenerated={handleAIGenerated}
                onBack={() => setView('camera')}
            />
        )}
        
        {view === 'tryon' && userPhoto && (
            <>
                {isLoadingFrames ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                        <p>Cargando Catálogo...</p>
                    </div>
                ) : (
                    <TryOnPage 
                        userPhoto={userPhoto} 
                        frames={frames}
                        onBack={handleBack} 
                    />
                )}
            </>
        )}
        
        {/* Navigation Home Button (Floating) */}
        <button 
            onClick={() => setView('landing')}
            className="absolute top-6 left-6 z-50 p-3 bg-black/20 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/40 rounded-full transition-all border border-white/10 hidden md:flex items-center gap-2 group"
            title="Volver al Inicio"
        >
             <Home size={20} />
             <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-sm font-medium whitespace-nowrap">Inicio</span>
        </button>
    </div>
  );
};

export default App;