import React, { useState } from 'react';
import { Frame, FramePosition } from '../types';

interface FrameOverlayProps {
  frame: Frame;
  position: FramePosition;
  brightness: number;
  contrast: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

const FrameOverlay: React.FC<FrameOverlayProps> = ({
  frame,
  position,
  brightness,
  contrast,
  onMouseDown,
  onTouchStart,
}) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className={`absolute cursor-move select-none touch-none origin-center transition-opacity duration-200 ${isActive ? 'z-50' : 'z-10'}`}
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${position.scale}) rotate(${position.rotation}deg)`,
        width: '300px', // Base width for consistency
      }}
      onMouseDown={(e) => { setIsActive(true); onMouseDown(e); }}
      onTouchStart={(e) => { setIsActive(true); onTouchStart(e); }}
      onMouseUp={() => setIsActive(false)}
      onTouchEnd={() => setIsActive(false)}
      onMouseLeave={() => setIsActive(false)}
    >
      <div className={`relative group ${isActive ? 'scale-[1.02]' : ''} transition-transform`}>
          {/* Helper Bounding Box (Visible when active or hovered) */}
          <div className={`absolute -inset-4 border-2 border-indigo-500/50 rounded-xl pointer-events-none transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`}>
              {/* Corner Handles Visuals */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
          </div>

          <img
            src={frame.imageUrl}
            alt={frame.name}
            className="w-full h-auto pointer-events-none drop-shadow-xl block"
            draggable={false}
            style={{ 
                // Multiply blend mode makes white pixels transparent
                mixBlendMode: 'multiply', 
                // Dynamic contrast and brightness for blending
                filter: `contrast(${contrast}%) brightness(${brightness}%)` 
            }}
          />
      </div>
      
      {/* Center Pivot Point Helper */}
      <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-indigo-500/50 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default FrameOverlay;