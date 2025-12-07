import { supabase } from '../lib/supabase';
import { Frame } from '../types';
import { frames as defaultFrames } from '../data/frames';

// Mapper to convert DB snake_case to App camelCase
const mapFromDb = (dbFrame: any): Frame => ({
    id: dbFrame.id,
    name: dbFrame.name,
    brand: dbFrame.brand,
    price: dbFrame.price,
    imageUrl: dbFrame.image_url, // Mapped
    width_mm: dbFrame.width_mm,
    lens_width_mm: dbFrame.lens_width_mm,
    bridge_mm: dbFrame.bridge_mm,
    temple_mm: dbFrame.temple_mm,
    type: dbFrame.type,
    gender: dbFrame.gender,
    shape: dbFrame.shape,
    color: dbFrame.color,
    in_stock: dbFrame.in_stock
});

// Mapper to convert App camelCase to DB snake_case
const mapToDb = (frame: Frame) => ({
    // id: Let DB generate ID if new, or pass it if existing
    name: frame.name,
    brand: frame.brand,
    price: frame.price,
    image_url: frame.imageUrl, // Mapped
    width_mm: frame.width_mm,
    lens_width_mm: frame.lens_width_mm,
    bridge_mm: frame.bridge_mm,
    temple_mm: frame.temple_mm,
    type: frame.type,
    gender: frame.gender,
    shape: frame.shape,
    color: frame.color,
    in_stock: frame.in_stock
});

export const getStoredFrames = async (): Promise<Frame[]> => {
    try {
        const { data, error } = await supabase
            .from('frames')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error fetching frames:', error);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        return data.map(mapFromDb);
    } catch (e) {
        console.error("Unexpected error fetching frames", e);
        return [];
    }
};

export const saveFrame = async (newFrame: Frame): Promise<Frame[]> => {
    try {
        const dbPayload = mapToDb(newFrame);
        const { error } = await supabase.from('frames').insert(dbPayload);
        
        if (error) throw error;
        
        return await getStoredFrames();
    } catch (e) {
        console.error("Error saving frame to Supabase", e);
        throw e;
    }
};

export const deleteFrame = async (frameId: string): Promise<Frame[]> => {
    try {
        const { error } = await supabase.from('frames').delete().eq('id', frameId);
        if (error) throw error;
        return await getStoredFrames();
    } catch (e) {
        console.error("Error deleting frame from Supabase", e);
        throw e;
    }
}

export const seedFrames = async (): Promise<Frame[]> => {
    try {
        // Only seed if empty to avoid duplicates
        const current = await getStoredFrames();
        if (current.length > 0) return current;

        const payload = defaultFrames.map(f => {
            // Remove the static ID to let DB generate UUIDs
            const { id, ...rest } = f; 
            return mapToDb(rest as Frame);
        });

        const { error } = await supabase.from('frames').insert(payload);
        if (error) throw error;

        return await getStoredFrames();
    } catch (e) {
        console.error("Error seeding frames", e);
        throw e;
    }
}