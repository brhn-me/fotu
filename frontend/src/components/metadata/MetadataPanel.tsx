// src/components/MetadataPanel.tsx
import type { Photo } from "../../types";
import { MapWidget } from "./MapWidget";
import { InlineEditable } from "./InlineEditable";
import { InlineEditableDateTime } from "./InlineEditableDateTime";

interface MetadataPanelProps {
    photo: Photo;
    onChange: (updatedPhoto: Photo) => void;
}

export function MetadataPanel({ photo, onChange }: MetadataPanelProps) {
    const handleChange = <K extends keyof Photo>(field: K, value: Photo[K]) => {
        onChange({ ...photo, [field]: value });
    };

    const handleLocationChange = (lat: number, lng: number) => {
        onChange({
            ...photo,
            location: {
                latitude: lat,
                longitude: lng,
                name: photo.location?.name || "Custom Location",
            },
        });
    };



    return (
        <div
            style={{
                width: "360px",
                background: "var(--bg-surface)",
                borderLeft: "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflowY: "auto",
            }}
        >
            <div style={{ padding: "24px" }}>
                <h2 style={{ fontSize: "18px", marginBottom: "24px" }}>Info</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                    <InlineEditable
                        label="Title"
                        value={photo.title}
                        placeholder="Add a title"
                        onSave={(next) => handleChange("title", next)}
                    />

                    <InlineEditable
                        label="Description"
                        kind="textarea"
                        multiline
                        rows={3}
                        value={photo.description ?? ""}
                        placeholder="Add a description"
                        onSave={(next) => handleChange("description", next.length ? next : null)}
                        renderViewValue={(v) =>
                            v?.length ? v : <span style={{ color: "var(--text-muted)" }}>No description</span>
                        }
                    />
                </div>

                {/* Editable Date */}
                <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 20 }}>📅</div>
                        <div style={{ flex: 1 }}>
                            <InlineEditableDateTime
                                label="Date"
                                value={new Date(photo.timestamp)}
                                onSave={(next) => handleChange("timestamp", next)}
                            />
                        </div>
                    </div>
                </div>

                {/* Camera (still view-only for now) */}
                <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "20px" }}>📷</div>
                    <div>
                        <div style={{ fontSize: "14px" }}>{photo.metadata.cameraModel || "Unknown Camera"}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {photo.metadata.focalLength} • {photo.metadata.aperture} • {photo.metadata.iso}ISO
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={{ fontSize: "12px", color: "var(--text-muted)" }}>Location</label>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {photo.location ? (
                                `${photo.location.latitude.toFixed(4)}, ${photo.location.longitude.toFixed(4)}`
                            ) : (
                                <button
                                    onClick={() => handleLocationChange(51.505, -0.09)} // Default to London or map center if possible
                                    style={{
                                        background: "none",
                                        border: "none",
                                        padding: 0,
                                        color: "var(--primary)",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px"
                                    }}
                                >
                                    <span style={{ fontSize: "14px" }}>📍</span> Add location
                                </button>
                            )}
                        </span>
                    </div>
                    <MapWidget
                        latitude={photo.location?.latitude ?? null}
                        longitude={photo.location?.longitude ?? null}
                        onChangeLocation={handleLocationChange}
                    />
                </div>
            </div>
        </div>
    );
}
