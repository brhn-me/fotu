import { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Default Icon in Vite
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Explicitly set the default icon
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});


interface MapWidgetProps {
    latitude: number | null;
    longitude: number | null;
    onChangeLocation: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onChange }: { lat: number | null, lng: number | null, onChange: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(lat && lng ? new L.LatLng(lat, lng) : null);
    const markerRef = useRef<L.Marker>(null);

    useEffect(() => {
        if (lat && lng) {
            setPosition(new L.LatLng(lat, lng));
        } else {
            setPosition(null);
        }
    }, [lat, lng]);

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onChange(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setPosition(newPos);
                    onChange(newPos.lat, newPos.lng);
                }
            },
        }),
        [onChange],
    );

    return position === null ? null : (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        >
        </Marker>
    );
}

export function MapWidget({ latitude, longitude, onChangeLocation }: MapWidgetProps) {
    // Default to London if no location, but don't show marker
    const center = latitude && longitude ? [latitude, longitude] as [number, number] : [51.505, -0.09] as [number, number];
    const zoom = latitude && longitude ? 13 : 2;

    return (
        <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', isolation: 'isolate', zIndex: 0 }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker lat={latitude} lng={longitude} onChange={onChangeLocation} />
            </MapContainer>
        </div>
    );
}
