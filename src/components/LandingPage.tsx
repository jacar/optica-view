import React from 'react';
import { Camera, Upload, Sparkles, Glasses, ShieldCheck, CheckCircle, ArrowRight, User, ScanFace, MousePointerClick, Lock, FileText, Eye } from 'lucide-react';

interface LandingPageProps {
  onStartTryOn: () => void;
  onOpenCatalog: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartTryOn, onOpenCatalog }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Glasses size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">OptiView<span className="text-indigo-600">.AI</span></span>
          </div>
          <div className="flex gap-4 items-center">
             <button 
                onClick={onOpenCatalog}
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2 hover:bg-slate-50 rounded-lg"
             >
                <Upload size={18} />
                Área de Ópticas
             </button>
             <button 
                onClick={onStartTryOn}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
             >
                Probar Ahora
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-indigo-300/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8 shadow-sm">
               <Sparkles size={14} />
               Tecnología Gemini 2.5 Flash Image
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 text-slate-900 tracking-tight">
              Encuentra tus <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                gafas perfectas
              </span> <br/>
              sin salir de casa.
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              La experiencia de prueba virtual más realista del mercado. Utiliza nuestra IA avanzada para analizar tu rostro y probar cientos de monturas en segundos.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={onStartTryOn}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-indigo-700 transition-all hover:scale-105 shadow-xl shadow-indigo-500/30"
              >
                <Camera size={24} />
                Iniciar Espejo Virtual
              </button>
              <button 
                onClick={onOpenCatalog}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition-all hover:border-indigo-200"
              >
                <User size={20} />
                Soy Vendedor
              </button>
            </div>
          </div>

          <div className="relative mx-auto lg:ml-auto w-full max-w-md order-1 lg:order-2">
             <div className="relative bg-slate-900 rounded-[3rem] border-[10px] border-slate-900 shadow-2xl overflow-hidden aspect-[3/4] group">
                <img 
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="Demo User" 
                    className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay Elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-8">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl mb-4 transform transition-all hover:scale-105 cursor-default">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
                            <span className="text-white font-bold text-sm tracking-wide">MATCH DE ESTILO</span>
                        </div>
                        <p className="text-white/90 text-sm font-medium">Rostro Cuadrado detectado.</p>
                        <p className="text-indigo-200 text-xs mt-1">Recomendación: Monturas Redondas u Ovaladas.</p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Gallery Showcase */}
      <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-sm font-bold text-indigo-600 tracking-wider uppercase mb-2">Galería de Estilos</h2>
                  <h3 className="text-3xl md:text-4xl font-bold text-slate-900">Resultados Hiperrealistas</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {[
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
                      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
                      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80",
                      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=500&q=80"
                  ].map((img, i) => (
                      <div key={i} className="relative group overflow-hidden rounded-2xl aspect-[3/4] shadow-lg cursor-pointer">
                          <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-colors z-10"></div>
                          <img src={img} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                              <span className="bg-white/90 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                                  Ver Estilo
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">¿Cómo funciona?</h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">Tres pasos simples para encontrar tu look ideal usando inteligencia artificial.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 -z-10"></div>

                {[
                    { icon: <ScanFace className="w-8 h-8 text-white"/>, step: "01", title: "Escanea tu Rostro", desc: "Usa tu cámara o sube una foto. Nuestra IA detectará tus facciones clave en milisegundos." },
                    { icon: <MousePointerClick className="w-8 h-8 text-white"/>, step: "02", title: "Elige la Montura", desc: "Navega por nuestro catálogo digital. Selecciona entre cientos de marcas y estilos." },
                    { icon: <Sparkles className="w-8 h-8 text-white"/>, step: "03", title: "Ajuste Mágico", desc: "La tecnología Nano Banana adapta los lentes a tu rostro con iluminación realista." }
                ].map((item, idx) => (
                    <div key={idx} className="relative flex flex-col items-center text-center group">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 relative border border-slate-100 group-hover:border-indigo-200 group-hover:scale-110 transition-all duration-300">
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-4 border-slate-50">
                                {item.step}
                            </div>
                            <div className="bg-indigo-600 p-4 rounded-xl shadow-lg shadow-indigo-500/30">
                                {item.icon}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                        <p className="text-slate-600 leading-relaxed px-4">{item.desc}</p>
                    </div>
                ))}
            </div>
          </div>
      </section>

      {/* Detailed Description */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                     <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-lg opacity-30"></div>
                     <div className="relative bg-slate-900 rounded-2xl p-8 text-white shadow-2xl">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                            <Glasses className="w-10 h-10 text-indigo-400" />
                            <div>
                                <h4 className="font-bold text-lg">Catálogo Inteligente</h4>
                                <p className="text-slate-400 text-sm">Gestión de inventario en tiempo real</p>
                            </div>
                        </div>
                        <ul className="space-y-4">
                            {[
                                "Carga de productos ilimitada",
                                "Sincronización con base de datos Cloud",
                                "Medidas precisas (mm) para ajuste real",
                                "Filtrado por forma, marca y género"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-slate-200">{item}</span>
                                </li>
                            ))}
                        </ul>
                     </div>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Para Ópticas y Usuarios</h2>
                    <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                        OptiView no es solo un probador, es una plataforma completa. Para las ópticas, ofrece un panel de administración robusto donde digitalizar su inventario. Para los usuarios, elimina la incertidumbre de comprar online.
                    </p>
                    <div className="flex gap-4">
                         <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex-1">
                             <h4 className="font-bold text-indigo-600 mb-1">98% Precisión</h4>
                             <p className="text-xs text-slate-500">En detección de medidas faciales</p>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex-1">
                             <h4 className="font-bold text-indigo-600 mb-1">&lt; 2 Segundos</h4>
                             <p className="text-xs text-slate-500">Tiempo de procesamiento IA</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Policy & Terms Section */}
      <section className="py-16 bg-slate-900 text-slate-300">
          <div className="max-w-4xl mx-auto px-6">
              <div className="flex flex-col items-center text-center mb-12">
                  <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Compromiso de Privacidad y Uso</h2>
                  <p className="text-slate-400">Tu seguridad biométrica es nuestra prioridad.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 text-sm">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3 text-white font-bold">
                          <Lock className="w-5 h-5 text-indigo-400" />
                          <h3>Manejo de Datos</h3>
                      </div>
                      <p className="leading-relaxed">
                          Las imágenes capturadas para el "Probador Virtual" se procesan en tiempo real y no se almacenan permanentemente en nuestros servidores sin tu consentimiento explícito. La detección facial se realiza para calcular puntos de anclaje (ojos, nariz) y no para identificación personal.
                      </p>
                  </div>

                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 mb-3 text-white font-bold">
                          <FileText className="w-5 h-5 text-indigo-400" />
                          <h3>Uso de IA Generativa</h3>
                      </div>
                      <p className="leading-relaxed">
                          Utilizamos modelos avanzados (Gemini 2.5) para generar previsualizaciones. Aunque buscamos el máximo realismo, los colores y texturas pueden variar ligeramente del producto físico debido a condiciones de iluminación.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 text-white mb-4">
                        <Glasses size={24} />
                        <span className="font-bold text-xl">OptiView</span>
                    </div>
                    <p className="text-sm max-w-xs">
                        Transformando la industria óptica con inteligencia artificial y realidad aumentada accesible para todos.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Plataforma</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="hover:text-indigo-400 cursor-pointer">Catálogo</li>
                        <li className="hover:text-indigo-400 cursor-pointer">Probador Virtual</li>
                        <li className="hover:text-indigo-400 cursor-pointer">Tecnología</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="hover:text-indigo-400 cursor-pointer">Términos de Servicio</li>
                        <li className="hover:text-indigo-400 cursor-pointer">Política de Privacidad</li>
                        <li className="hover:text-indigo-400 cursor-pointer">Cookies</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
                <p>© 2024 OptiView AI Technologies. Todos los derechos reservados.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <span>Hecho con ❤️ y Gemini API</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;