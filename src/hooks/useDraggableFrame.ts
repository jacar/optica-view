import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FramePosition } from '../types';

interface UseDraggableFrameProps {
  initialScale?: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useDraggableFrame = ({ initialScale = 1, containerRef }: UseDraggableFrameProps) => {
  const [position, setPosition] = useState<FramePosition>({
    x: 0,
    y: 0,
    scale: initialScale,
    rotation: 0,
  });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const resetPosition = useCallback(() => {
    if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setPosition({
            x: clientWidth / 2,
            y: clientHeight / 2,
            scale: 1,
            rotation: 0
        });
    }
  }, [containerRef]);

  // Handle Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: position.x, y: position.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    setPosition(prev => ({
      ...prev,
      x: initialPos.current.x + dx,
      y: initialPos.current.y + dy,
    }));
  }, []);

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Handle Touch Events (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    initialPos.current = { x: position.x, y: position.y };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.x;
    const dy = touch.clientY - dragStart.current.y;

    setPosition(prev => ({
      ...prev,
      x: initialPos.current.x + dx,
      y: initialPos.current.y + dy,
    }));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Global event listeners for smooth dragging outside element
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove]);

  const updateScale = (newScale: number) => {
    setPosition(prev => ({ ...prev, scale: newScale }));
  };
  
  const updateRotation = (newRot: number) => {
      setPosition(prev => ({ ...prev, rotation: newRot }));
  };

  return {
    position,
    setPosition,
    handleMouseDown,
    handleTouchStart,
    updateScale,
    updateRotation,
    resetPosition
  };
};