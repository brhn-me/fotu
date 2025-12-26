import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { usePhotos } from '../../context/PhotoContext';

export function MapPage() {
    const { photos, setSelectedPhotoId } = usePhotos();

    // Filter photos with location data
    const locatedPhotos = useMemo(() => {
        return photos.filter(p => p.location && p.location.latitude && p.location.longitude);
    }, [photos]);

    // Calculate center based on photos or default to a world view
    const center: [number, number] = useMemo(() => {
        if (locatedPhotos.length === 0) return [20, 0];
        // Simple average center
        const lat = locatedPhotos.reduce((sum, p) => sum + p.location!.latitude, 0) / locatedPhotos.length;
        const lng = locatedPhotos.reduce((sum, p) => sum + p.location!.longitude, 0) / locatedPhotos.length;
        return [lat, lng];
    }, [locatedPhotos]);

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <MapContainer
                center={center}
                zoom={3}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {locatedPhotos.map(photo => (
                    <CircleMarker
                        key={photo.id}
                        center={[photo.location!.latitude, photo.location!.longitude]}
                        pathOptions={{
                            fillColor: '#FF4500',
                            fillOpacity: 0.6,
                            color: 'transparent'
                        }}
                        radius={8}
                        eventHandlers={{
                            click: () => setSelectedPhotoId(photo.id)
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <img
                                    src={photo.thumbnailUrl}
                                    alt=""
                                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 12 }}>{photo.location?.name || "Unknown Location"}</div>
                                    <div style={{ fontSize: 11, color: "#666" }}>{new Date(photo.timestamp).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </Tooltip>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
}
