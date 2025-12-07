export const getGeminiApiKey = (): string => {
    let key = '';
    
    // 1. Prioridad: Local Storage (Para pruebas rápidas o demos sin redeploy)
    if (typeof window !== 'undefined') {
        const localKey = localStorage.getItem('GEMINI_API_KEY');
        if (localKey && localKey.startsWith('AIza')) {
            return localKey;
        }
    }

    // 2. Intentar método estándar de Vite (import.meta.env) de forma segura
    try {
        // @ts-ignore
        const viteEnv = (import.meta as any).env;
        if (viteEnv && viteEnv.VITE_GOOGLE_API_KEY) {
            key = viteEnv.VITE_GOOGLE_API_KEY;
        }
    } catch (e) {
        // Ignorar error si import.meta falla
    }

    // 3. Fallback seguro para process.env (evita ReferenceError en navegador)
    if (!key) {
        try {
            if (typeof process !== 'undefined' && process.env) {
                key = process.env.VITE_GOOGLE_API_KEY || process.env.API_KEY || '';
            }
        } catch (e) {
            // Ignorar error de acceso a process
        }
    }

    if (!key) {
        console.warn("Falta la VITE_GOOGLE_API_KEY. Configúrala en Vercel o usa el botón de configuración en la Landing.");
    }
    
    return key;
};