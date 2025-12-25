// src/components/MapWidget.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

interface MapWidgetProps {
    latitude: number | null;
    longitude: number | null;
    onChangeLocation: (lat: number, lng: number) => void;
    onClearLocation?: () => void; // NEW
}

function MapControls({
    hasLocation,
    onAddAtCenter,
    onClear,
}: {
    hasLocation: boolean;
    onAddAtCenter: () => void;
    onClear?: (() => void) | undefined;
}) {
    return (
        <div
            style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 1000,
                display: "flex",
                gap: 8,
            }}
        >
            {!hasLocation ? (
                <button
                    type="button"
                    onClick={onAddAtCenter}
                    style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontSize: 12,
                    }}
                >
                    Add location
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onClear}
                    style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        fontSize: 12,
                    }}
                >
                    Remove
                </button>
            )}
        </div>
    );
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

function MapInstanceBridge({ onReady }: { onReady: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
        onReady(map);
    }, [map, onReady]);
    return null;
}

export function MapWidget({ latitude, longitude, onChangeLocation, onClearLocation }: MapWidgetProps) {
    const hasCoords = latitude != null && longitude != null;

    // Default center if none, but user can still click to set.
    const center = hasCoords
        ? ([latitude, longitude] as [number, number])
        : ([51.505, -0.09] as [number, number]);

    const zoom = hasCoords ? 13 : 2;

    const [mapRef, setMapRef] = useState<L.Map | null>(null);

    const addAtCenter = () => {
        if (!mapRef) return;
        const c = mapRef.getCenter();
        onChangeLocation(c.lat, c.lng);
        mapRef.flyTo(c, Math.max(mapRef.getZoom(), 10));
    };

    return (
        <div
            style={{
                height: "300px",
                width: "100%",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                position: "relative",
                isolation: "isolate",
                zIndex: 0,
            }}
        >
            <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
                <MapInstanceBridge onReady={setMapRef} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marker + click-to-set logic */}
                <LocationMarker lat={latitude} lng={longitude} onChange={onChangeLocation} />
            </MapContainer>

            {/* Overlay controls */}
            <MapControls
                hasLocation={hasCoords}
                onAddAtCenter={addAtCenter}
                onClear={onClearLocation}
            />
        </div>
    );
}
