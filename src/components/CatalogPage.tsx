import React, { useState, useRef } from 'react';
import { Plus, Trash2, Image as ImageIcon, Save, Database, Home, Eraser, Glasses, Camera, LogOut, Loader2, UploadCloud } from 'lucide-react';
import { Frame } from '../types';
import { saveFrame, deleteFrame, seedFrames } from '../utils/frameStorage';

interface CatalogPageProps {
  frames: Frame[];
  onUpdateFrames: (frames: Frame[]) => void;
  onBack: () => void;
  onGoToCamera: () => void;
  onSignOut?: () => void;
}

const CatalogPage: React.FC<CatalogPageProps> = ({ frames, onUpdateFrames, onBack, onGoToCamera, onSignOut }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [newFrame, setNewFrame] = useState<Partial<Frame>>({
    name: '',
    brand: '',
    price: 0,
    imageUrl: '',
    width_mm: 140,
    shape: 'rectangular',
    color: 'black',
    type: 'prescription',
    gender: 'unisex'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFrame.name || !newFrame.imageUrl) return;
    setIsSubmitting(true);

    try {
        const frameToAdd: Frame = {
            ...newFrame as Frame,
            id: '', // DB generates ID
            lens_width_mm: 50,
            bridge_mm: 18,
            temple_mm: 140,
            in_stock: true
        };

        const updated = await saveFrame(frameToAdd);
        onUpdateFrames(updated);
        handleClearForm();
        alert('Montura guardada correctamente.');
    } catch (error) {
        alert('Error al guardar en base de datos. Verifica tu conexión.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setNewFrame({
        name: '',
        brand: '',
        price: 0,
        imageUrl: '',
        width_mm: 140,
        shape: 'rectangular',
        color: 'black',
        type: 'prescription',
        gender: 'unisex'
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Simple compression/resizing logic
      const reader = new FileReader();
      reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 800;
              const scaleSize = MAX_WIDTH / img.width;
              
              // Only resize if bigger than max width
              if (scaleSize < 1) {
                  canvas.width = MAX_WIDTH;
                  canvas.height = img.height * scaleSize;
              } else {
                  canvas.width = img.width;
                  canvas.height = img.height;
              }

              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Convert to Base64 JPEG
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              setNewFrame(prev => ({ ...prev, imageUrl: dataUrl }));
          };
          img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string) => {
      if (confirm('¿Estás seguro de eliminar esta montura?')) {
          setIsSubmitting(true);
          try {
              const updated = await deleteFrame(id);
              onUpdateFrames(updated);
          } catch (e) {
              alert('Error al eliminar.');
          } finally {
              setIsSubmitting(false);
          }
      }
  };

  const handleSeed = async () => {
      if (confirm('Esto inyectará el catálogo inicial en la base de datos (si está vacía). ¿Continuar?')) {
          setIsSubmitting(true);
          try {
              const updated = await seedFrames();
              onUpdateFrames(updated);
          } catch (e) {
              alert('Error al poblar la base de datos.');
          } finally {
              setIsSubmitting(false);
          }
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Menu Superior (Top Navigation) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <Glasses size={20} />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-slate-900">OptiView</span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Admin Panel</span>
            </div>
          </div>
          
          {/* Navigation Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
                onClick={onBack} 
                className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
            >
              <Home size={18} />
              Inicio
            </button>
            
            <button 
                onClick={onGoToCamera}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full transition-colors font-bold text-sm border border-indigo-200"
            >
              <Camera size={18} />
              <span className="hidden sm:inline">Ir al Probador</span>
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

            <button 
                onClick={handleSeed}
                className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors hidden sm:block"
                title="Poblar Base de Datos (Seed)"
                disabled={isSubmitting}
            >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
            </button>
            
            <button 
                onClick={onSignOut}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
            >
                <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid lg:grid-cols-12 gap-8">
        
        {/* Form Section (Sidebar) */}
        <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        Agregar Montura
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nombre del Modelo</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Ej: Ray-Ban Aviator"
                            value={newFrame.name}
                            onChange={e => setNewFrame({...newFrame, name: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Marca</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Ej: Ray-Ban"
                            value={newFrame.brand}
                            onChange={e => setNewFrame({...newFrame, brand: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Imagen (Archivo o URL)</label>
                        
                        {/* File Upload Trigger */}
                        <div className="flex gap-2 mb-2">
                             <input 
                                type="file" 
                                ref={fileInputRef}
                                accept="image/*" 
                                className="hidden"
                                onChange={handleFileSelect}
                             />
                             <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200"
                             >
                                <UploadCloud size={16} />
                                Subir desde Dispositivo
                             </button>
                        </div>
                        
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <input 
                                type="url" 
                                className="w-full border border-slate-300 rounded-lg pl-9 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="O pega una URL de imagen..."
                                value={newFrame.imageUrl?.startsWith('data:') ? '' : newFrame.imageUrl}
                                onChange={e => setNewFrame({...newFrame, imageUrl: e.target.value})}
                            />
                        </div>

                        {newFrame.imageUrl && (
                            <div className="mt-3 p-2 border border-slate-200 rounded-lg bg-slate-50 text-center">
                                <p className="text-[10px] text-slate-400 mb-1">Vista Previa:</p>
                                <img src={newFrame.imageUrl} alt="Preview" className="h-20 mx-auto object-contain mix-blend-multiply" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Precio ($)</label>
                            <input 
                                type="number" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={newFrame.price}
                                onChange={e => setNewFrame({...newFrame, price: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Ancho (mm)</label>
                            <input 
                                type="number" 
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={newFrame.width_mm}
                                onChange={e => setNewFrame({...newFrame, width_mm: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Forma</label>
                        <select 
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
                            value={newFrame.shape}
                            onChange={e => setNewFrame({...newFrame, shape: e.target.value as any})}
                        >
                            <option value="rectangular">Rectangular</option>
                            <option value="round">Redonda</option>
                            <option value="cat-eye">Cat-Eye</option>
                            <option value="aviator">Aviador</option>
                            <option value="square">Cuadrada</option>
                        </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button 
                            type="button"
                            onClick={handleClearForm}
                            className="px-4 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                            title="Limpiar formulario"
                        >
                            <Eraser size={20} />
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Guardar Montura
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* List Section (Main Content) */}
        <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Inventario Cloud</h2>
                    <p className="text-sm text-slate-500">Monturas sincronizadas en tiempo real con Supabase.</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 border border-slate-200">
                    {frames.length} Modelos
                </span>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
                {frames.map((frame) => (
                    <div key={frame.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 hover:shadow-lg hover:border-indigo-100 transition-all group">
                        <div className="w-24 h-16 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 flex-shrink-0 relative">
                             {/* Mini background pattern for transparency check */}
                             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:8px_8px]"></div>
                            <img src={frame.imageUrl} alt={frame.name} className="relative z-10 max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{frame.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <span className="bg-slate-100 px-2 py-0.5 rounded-full">{frame.brand}</span>
                                <span>{frame.shape}</span>
                            </div>
                            <p className="text-sm font-bold text-indigo-600 mt-1">${frame.price.toLocaleString()}</p>
                        </div>
                        <button 
                            onClick={() => handleDelete(frame.id)}
                            disabled={isSubmitting}
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title="Eliminar montura"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
            
            {frames.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Database className="text-slate-300 w-8 h-8" />
                    </div>
                    <p className="font-bold text-slate-600">Base de datos vacía.</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs mb-4">Usa el botón "Poblar" en el menú o agrega monturas manualmente.</p>
                    <button onClick={handleSeed} className="text-indigo-600 text-sm font-bold hover:underline">
                        Poblar con datos de prueba
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default CatalogPage;