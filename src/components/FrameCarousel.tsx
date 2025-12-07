import React from 'react';
import { Frame } from '../types';

interface FrameCarouselProps {
  frames: Frame[];
  selectedFrameId: string | null;
  onSelectFrame: (frame: Frame) => void;
}

const FrameCarousel: React.FC<FrameCarouselProps> = ({
  frames,
  selectedFrameId,
  onSelectFrame,
}) => {
  return (
    <div className="w-full bg-white pb-6 pt-2">
      <div className="flex gap-3 overflow-x-auto px-6 pb-2 snap-x scrollbar-hide">
        {frames.map((frame) => {
          const isSelected = selectedFrameId === frame.id;
          return (
            <button
              key={frame.id}
              onClick={() => onSelectFrame(frame)}
              className={`
                flex-shrink-0 snap-center flex flex-col items-center w-28 p-2 rounded-xl transition-all duration-300 relative
                ${isSelected 
                  ? 'bg-indigo-50 ring-2 ring-indigo-500 shadow-md translate-y-[-4px]' 
                  : 'bg-white border border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }
              `}
            >
              {isSelected && (
                  <div className="absolute -top-2 bg-indigo-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                      SELECTED
                  </div>
              )}
              
              <div className="h-12 flex items-center justify-center w-full mb-2">
                  <img 
                      src={frame.imageUrl} 
                      alt={frame.name} 
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
              </div>
              <div className="text-center w-full">
                  <p className={`text-[11px] font-bold truncate w-full ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {frame.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{frame.brand}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FrameCarousel;