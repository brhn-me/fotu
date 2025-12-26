// src/components/MetadataPanel.tsx
import type { Photo } from "../../types";
import { MapWidget } from "./MapWidget";
import { InlineEditable } from "./InlineEditable";
import { InlineEditableDateTime } from "./InlineEditableDateTime";

interface MetadataPanelProps {
    photo: Photo;
    onChange: (updatedPhoto: Photo) => void;
}

import styles from './MetadataPanel.module.css';

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
        <div className={styles.panel}>
            <div className={styles.content}>
                <h2 className={styles.header}>Info</h2>

                <div className={styles.section}>
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
                            v?.length ? v : <span className={styles.noDescription}>No description</span>
                        }
                    />
                </div>

                {/* Editable Date */}
                <div className={styles.sectionRow}>
                    <div className={styles.iconRow}>
                        <div className={styles.icon}>📅</div>
                        <div className={styles.flex1}>
                            <InlineEditableDateTime
                                label="Date"
                                value={new Date(photo.timestamp)}
                                onSave={(next) => handleChange("timestamp", next)}
                            />
                        </div>
                    </div>
                </div>

                {/* Camera (still view-only for now) */}
                <div className={styles.cameraInfo}>
                    <div className={styles.icon}>📷</div>
                    <div>
                        <div className={styles.cameraModel}>{photo.metadata.cameraModel || "Unknown Camera"}</div>
                        <div className={styles.cameraSettings}>
                            {photo.metadata.focalLength} • {photo.metadata.aperture} • {photo.metadata.iso}ISO
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className={styles.mapSection}>
                    <div className={styles.locationHeader}>
                        <label className={styles.locationLabel}>Location</label>
                        <span className={styles.locationCoordinates}>
                            {photo.location ? (
                                `${photo.location.latitude.toFixed(4)}, ${photo.location.longitude.toFixed(4)}`
                            ) : (
                                <button
                                    onClick={() => handleLocationChange(51.505, -0.09)} // Default to London or map center if possible
                                    className={styles.addLocationBtn}
                                >
                                    <span className={styles.addLocationIcon}>📍</span> Add location
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
