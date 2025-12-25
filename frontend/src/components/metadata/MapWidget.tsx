// src/components/MapWidget.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
// ... (imports)

// ... (L.Icon.Default fix)

interface MapWidgetProps {
    latitude: number | null;
    longitude: number | null;
    onChangeLocation: (lat: number, lng: number) => void;
}



function LocationMarker({
    lat,
    lng,
    onChange,
}: {
    lat: number | null;
    lng: number | null;
    onChange: (lat: number, lng: number) => void;
}) {
    const [position, setPosition] = useState<L.LatLng | null>(
        lat != null && lng != null ? new L.LatLng(lat, lng) : null
    );
    const markerRef = useRef<L.Marker>(null);

    useEffect(() => {
        if (lat != null && lng != null) setPosition(new L.LatLng(lat, lng));
        else setPosition(null);
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
                if (!marker) return;
                const newPos = marker.getLatLng();
                setPosition(newPos);
                onChange(newPos.lat, newPos.lng);
            },
        }),
        [onChange]
    );

    return position == null ? null : (
        <Marker draggable eventHandlers={eventHandlers} position={position} ref={markerRef} />
    );
}



export function MapWidget({ latitude, longitude, onChangeLocation }: MapWidgetProps) {
    const hasCoords = latitude != null && longitude != null;

    // Default center if none, but user can still click to set.
    const center = hasCoords
        ? ([latitude, longitude] as [number, number])
        : ([51.505, -0.09] as [number, number]);

    const zoom = hasCoords ? 13 : 2;

    return (
        <div
            style={{
                height: "300px",
                width: "100%",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                position: "relative",
                isolation: "isolate",
                zIndex: 10,
            }}
        >
            <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marker + click-to-set logic */}
                <LocationMarker lat={latitude} lng={longitude} onChange={onChangeLocation} />
            </MapContainer>

            {/* Overlay controls */}

        </div>
    );
}
