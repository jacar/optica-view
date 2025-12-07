import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ArrowLeft, Glasses, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // Login Logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLoginSuccess();
      } else {
        // Sign Up Logic
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // Si la confirmación de email está desactivada en Supabase, data.session existirá inmediatamente.
        if (data.session) {
             onLoginSuccess();
        } else {
             setMessage('Registro iniciado. Por favor revisa tu correo para confirmar la cuenta (revisa SPAM). Si eres el administrador, puedes desactivar "Confirm Email" en Supabase.');
             setIsLogin(true); // Switch back to login view to wait
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Invalid login credentials")) {
          setError("Correo o contraseña incorrectos.");
      } else if (err.message.includes("Rate limit")) {
          setError("Demasiados intentos. Espera un momento.");
      } else if (err.message.includes("Email not confirmed")) {
          setError("Tu correo no ha sido confirmado. Por favor verifica tu bandeja de entrada o SPAM.");
      } else {
          setError(err.message || 'Ocurrió un error de autenticación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="p-8 pb-6 bg-slate-50 border-b border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                <Glasses className="text-white w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
                {isLogin ? 'Bienvenido de nuevo' : 'Crear Cuenta'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
                {isLogin ? 'Ingresa tus credenciales para acceder' : 'Regístrate para usar el probador'}
            </p>
        </div>

        <div className="p-8">
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}
            
            {message && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100 leading-relaxed">
                    <strong>¡Casi listo!</strong><br/>
                    {message}
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Correo Electrónico</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                        <input 
                            type="email" 
                            required
                            placeholder="tucorreo@ejemplo.com"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                        <input 
                            type="password" 
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-800"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        isLogin ? <><LogIn className="w-5 h-5" /> Iniciar Sesión</> : <><UserPlus className="w-5 h-5" /> Registrarse</>
                    )}
                </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
                <button 
                    onClick={onBack}
                    className="flex items-center text-slate-400 hover:text-slate-600 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Volver
                </button>
                
                <button 
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError(null);
                        setMessage(null);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold"
                >
                    {isLogin ? 'Crear cuenta nueva' : 'Ya tengo cuenta'}
                </button>
            </div>
            
            {!isLogin && (
                <div className="text-[10px] text-slate-400 text-center mt-6 mx-auto max-w-xs space-y-1">
                    <p>Nota: Si no recibes el correo de confirmación:</p>
                    <p className="font-semibold">Revisa tu carpeta de SPAM.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;