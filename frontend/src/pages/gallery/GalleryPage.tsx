
import { PhotoGrid } from "../../components/gallery/PhotoGrid";
import { TimelineScroller } from "../../components/gallery/TimelineScroller";
import { usePhotos } from "../../context/PhotoContext";

export function GalleryPage() {
    const { photos, setSelectedPhotoId } = usePhotos();

    return (
        <>
            <PhotoGrid photos={photos} onPhotoClick={(p) => setSelectedPhotoId(p.id)} />
            <TimelineScroller photos={photos} />
        </>
    );
}
