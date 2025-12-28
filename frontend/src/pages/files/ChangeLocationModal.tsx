import { useState, useEffect } from "react";
import { X, Check, MapPin, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./FilesPage.module.css";
import { FileItem } from "./FilesPage";

// Fix for Leaflet default icon issues in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface ChangeLocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileItem;
    siblings?: FileItem[];
    onSave: (id: string, location: { lat: number; lng: number }) => void;
}

// Component to handle map clicks and updates
const LocationMarker = ({ position, setPosition }: { position: { lat: number; lng: number }, setPosition: (pos: { lat: number; lng: number }) => void }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position, map]);

    const handleDragEnd = (e: any) => {
        const marker = e.target;
        const newPos = marker.getLatLng();
        setPosition(newPos);
    };

    return position === null ? null : (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: handleDragEnd,
            }}
        />
    );
};

const InitialFitBounds = ({ mainLocation, siblings }: { mainLocation: { lat: number, lng: number }, siblings: FileItem[] }) => {
    const map = useMap();
    useEffect(() => {
        const points = [mainLocation];
        siblings.forEach(s => {
            const loc = s.metadata?.location;
            if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
                points.push(loc);
            }
        });

        if (points.length > 0) {
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
            }
        }
    }, []);
    return null;
};

export const ChangeLocationModal = ({ isOpen, onClose, file, siblings = [], onSave }: ChangeLocationModalProps) => {
    // Default to London if no location, or file's location if available
    // In a real app, parse file.metadata.location
    const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: 51.505, lng: -0.09 });
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isOpen && file?.metadata?.location) {
            // Mock parsing logic or usage of existing metadata
            // For now start with default or previous
        }
    }, [isOpen, file]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSave = () => {
        onSave(file.id, position);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose} style={{ zIndex: 1100 }}> {/* Higher z-index for map */}
            <div className={`${styles.modalContent} ${styles.modalWide}`} onClick={e => e.stopPropagation()} style={{ width: 900, maxWidth: '95vw' }}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MapPin size={18} className={styles.modalTitleIcon} />
                        Change Location
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.modalBody} style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 600 }}>

                    {/* Map Area */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {siblings.map(sibling => {
                                const loc = sibling.metadata?.location;
                                if (sibling.id !== file.id && loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
                                    return (
                                        <CircleMarker
                                            key={sibling.id}
                                            center={loc}
                                            radius={8}
                                            pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 2 }}
                                            eventHandlers={{
                                                click: (e) => {
                                                    L.DomEvent.stopPropagation(e);
                                                    setPosition(loc);
                                                },
                                                mouseover: (e) => {
                                                    e.target.setStyle({ fillColor: '#2563eb', radius: 10 });
                                                },
                                                mouseout: (e) => {
                                                    e.target.setStyle({ fillColor: '#3b82f6', radius: 8 });
                                                }
                                            }}
                                        />
                                    );
                                }
                                return null;
                            })}
                            <LocationMarker position={position} setPosition={setPosition} />
                            <InitialFitBounds mainLocation={position} siblings={siblings} />
                        </MapContainer>

                        {/* Search Overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 10,
                            left: 60,
                            right: 10,
                            zIndex: 1000,
                            display: 'flex',
                            gap: 8,
                            maxWidth: 400
                        }}>
                            <div className={styles.selectWrapper} style={{ flex: 1, background: 'var(--bg-surface)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                                <input
                                    type="text"
                                    className={styles.inputNumber}
                                    placeholder="Search for a location..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    style={{ border: 'none' }}
                                />
                            </div>
                            <button
                                className={styles.saveBtn}
                                onClick={handleSearch}
                                disabled={isSearching}
                                style={{ padding: '0 12px', minWidth: 'auto' }}
                            >
                                <Search size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Footer / Inputs */}
                    <div className={styles.modalFooter} style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                                <label className={styles.controlLabel} style={{ fontSize: 11 }}>Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className={styles.inputNumber}
                                    value={position.lat}
                                    onChange={e => setPosition({ ...position, lat: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                                <label className={styles.controlLabel} style={{ fontSize: 11 }}>Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className={styles.inputNumber}
                                    value={position.lng}
                                    onChange={e => setPosition({ ...position, lng: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSave}>
                                <Check size={16} /> Save
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
