export interface Frame {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  width_mm: number;
  lens_width_mm: number;
  bridge_mm: number;
  temple_mm: number;
  type: 'prescription' | 'sunglasses';
  gender: 'male' | 'female' | 'unisex';
  shape: 'round' | 'square' | 'cat-eye' | 'aviator' | 'rectangular';
  color: string;
  in_stock: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface FramePosition {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface DetectedFace {
  leftEye: Position;
  rightEye: Position;
  jawOutline: Position[];
}