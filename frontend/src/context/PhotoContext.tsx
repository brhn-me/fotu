import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Photo } from "../types";
import { generateDummyPhotos } from "../services/photoService";

interface PhotoContextType {
    photos: Photo[];
    loading: boolean;
    selectedPhotoId: string | null;
    setSelectedPhotoId: (id: string | null) => void;
    updatePhoto: (updatedPhoto: Photo) => void;
    // Navigation
    scrollToGroupId: string | null;
    setScrollToGroupId: (groupId: string | null) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export function PhotoProvider({ children }: { children: ReactNode }) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
    const [scrollToGroupId, setScrollToGroupId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate async load
        const load = async () => {
            setLoading(true);
            const data = generateDummyPhotos();
            setPhotos(data);
            setLoading(false);
        };
        load();
    }, []);

    const updatePhoto = (updatedPhoto: Photo) => {
        setPhotos((prev) => prev.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p)));
    };

    return (
        <PhotoContext.Provider value={{
            photos,
            loading,
            selectedPhotoId,
            setSelectedPhotoId,
            updatePhoto,
            scrollToGroupId,
            setScrollToGroupId
        }}>
            {children}
        </PhotoContext.Provider>
    );
}

export function usePhotos() {
    const context = useContext(PhotoContext);
    if (context === undefined) {
        throw new Error("usePhotos must be used within a PhotoProvider");
    }
    return context;
}
