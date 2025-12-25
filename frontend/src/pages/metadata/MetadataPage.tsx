// src/components/MetadataPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { Photo } from "../../types";
import { PhotoGrid } from "../../components/gallery/PhotoGrid";
import { Save, RotateCcw, Image as ImageIcon, MapPin, CalendarClock, Info } from "lucide-react";
import { usePhotos } from "../../context/PhotoContext";

type Draft = {
    title: string;
    description: string;
    timestampIsoLocal: string; // "YYYY-MM-DDTHH:mm"
    locationEnabled: boolean;
    locationName: string;
    latitude: string;
    longitude: string;
    width: string;
    height: string;
    cameraModel: string;
    focalLength: string;
    iso: string;
    aperture: string;
    shutterSpeed: string;
};

function toLocalInputValue(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function safeNum(s: string): number | null {
    const v = Number(s);
    return Number.isFinite(v) ? v : null;
}

function clampInt(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.trunc(n)));
}

function buildDraft(photo: Photo): Draft {
    return {
        title: photo.title ?? "",
        description: photo.description ?? "",
        timestampIsoLocal: toLocalInputValue(new Date(photo.timestamp)),
        locationEnabled: Boolean(photo.location),
        locationName: photo.location?.name ?? "",
        latitude: photo.location ? String(photo.location.latitude) : "",
        longitude: photo.location ? String(photo.location.longitude) : "",
        width: photo.metadata?.width != null ? String(photo.metadata.width) : "",
        height: photo.metadata?.height != null ? String(photo.metadata.height) : "",
        cameraModel: photo.metadata?.cameraModel ?? "",
        focalLength: photo.metadata?.focalLength ?? "",
        iso: photo.metadata?.iso != null ? String(photo.metadata.iso) : "",
        aperture: photo.metadata?.aperture ?? "",
        shutterSpeed: photo.metadata?.shutterSpeed ?? "",
    };
}

function deepEqualDraft(a: Draft, b: Draft): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function MetadataPage(): React.ReactElement {
    const { photos, selectedPhotoId, setSelectedPhotoId, updatePhoto } = usePhotos();

    const selectedPhoto = useMemo(
        () => photos.find((p) => p.id === selectedPhotoId) ?? null,
        [photos, selectedPhotoId]
    );

    const [draft, setDraft] = useState<Draft | null>(null);
    const [baseline, setBaseline] = useState<Draft | null>(null);

    useEffect(() => {
        if (!selectedPhoto) {
            setDraft(null);
            setBaseline(null);
            return;
        }
        const d = buildDraft(selectedPhoto);
        setDraft(d);
        setBaseline(d);
    }, [selectedPhotoId, selectedPhoto]);

    const dirty = useMemo(() => {
        if (!draft || !baseline) return false;
        return !deepEqualDraft(draft, baseline);
    }, [draft, baseline]);

    const applyChanges = (): void => {
        if (!selectedPhoto || !draft) return;

        const nextTimestamp = new Date(draft.timestampIsoLocal);

        const width = safeNum(draft.width);
        const height = safeNum(draft.height);
        const isoN = safeNum(draft.iso);

        const lat = safeNum(draft.latitude);
        const lng = safeNum(draft.longitude);

        const next: Photo = {
            ...selectedPhoto,
            title: draft.title.trim() === "" ? selectedPhoto.title : draft.title,
            description: draft.description.trim() === "" ? null : draft.description,
            timestamp: Number.isNaN(nextTimestamp.getTime()) ? selectedPhoto.timestamp : nextTimestamp,
            location: draft.locationEnabled
                ? {
                    latitude: lat ?? selectedPhoto.location?.latitude ?? 0,
                    longitude: lng ?? selectedPhoto.location?.longitude ?? 0,
                    name: draft.locationName.trim() === "" ? (selectedPhoto.location?.name ?? "") : draft.locationName,
                }
                : null,
            metadata: {
                ...selectedPhoto.metadata,
                width: width == null ? selectedPhoto.metadata.width : clampInt(width, 1, 100000),
                height: height == null ? selectedPhoto.metadata.height : clampInt(height, 1, 100000),
                cameraModel: draft.cameraModel.trim() === "" ? null : draft.cameraModel,
                focalLength: draft.focalLength.trim() === "" ? selectedPhoto.metadata.focalLength : draft.focalLength,
                iso: isoN == null ? selectedPhoto.metadata.iso : clampInt(isoN, 1, 1000000),
                aperture: draft.aperture.trim() === "" ? selectedPhoto.metadata.aperture : draft.aperture,
                shutterSpeed: draft.shutterSpeed.trim() === "" ? selectedPhoto.metadata.shutterSpeed : draft.shutterSpeed,
            },
        };

        updatePhoto(next);
        const newBaseline = buildDraft(next);
        setBaseline(newBaseline);
        setDraft(newBaseline);
    };

    const resetChanges = (): void => {
        if (!baseline) return;
        setDraft(baseline);
    };

    return (
        <div style={{ height: "100%", width: "100%", display: "flex", overflow: "hidden" }}>
            {/* LEFT: metadata editor */}
            <div
                style={{
                    width: 520,
                    flexShrink: 0,
                    borderRight: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-primary)",
                    overflow: "auto",
                    padding: 20,
                    scrollbarWidth: "none",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Metadata</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        Click a photo in the grid (right) to load its metadata for editing.
                    </div>

                    {selectedPhoto ? (
                        <div
                            style={{
                                marginTop: 6,
                                borderRadius: 18,
                                border: "1px solid var(--border-subtle)",
                                backgroundColor: "var(--bg-secondary)",
                                overflow: "hidden",
                            }}
                        >
                            <div style={{ aspectRatio: "16/10", background: "var(--bg-placeholder)" }}>
                                <img
                                    src={selectedPhoto.thumbnailUrl}
                                    alt={selectedPhoto.title}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>
                            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>{selectedPhoto.title}</div>
                                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                    {new Date(selectedPhoto.timestamp).toLocaleString()}
                                </div>

                                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                                    <button
                                        onClick={resetChanges}
                                        disabled={!dirty}
                                        style={{
                                            height: 38,
                                            padding: "0 12px",
                                            borderRadius: 14,
                                            border: "1px solid var(--border-subtle)",
                                            backgroundColor: "transparent",
                                            color: dirty ? "var(--text-primary)" : "var(--text-secondary)",
                                            cursor: dirty ? "pointer" : "not-allowed",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            fontWeight: 800,
                                            fontSize: 13,
                                            opacity: dirty ? 1 : 0.6,
                                            flex: 1,
                                            justifyContent: "center",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (dirty) e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                                        }}
                                        onMouseLeave={(e) => {
                                            if (dirty) e.currentTarget.style.backgroundColor = "transparent";
                                        }}
                                        title="Reset changes"
                                    >
                                        <RotateCcw size={16} />
                                        Reset
                                    </button>

                                    <button
                                        onClick={applyChanges}
                                        disabled={!dirty}
                                        style={{
                                            height: 38,
                                            padding: "0 12px",
                                            borderRadius: 14,
                                            border: "none",
                                            backgroundColor: dirty ? "var(--accent-primary)" : "var(--border-subtle)",
                                            color: "white",
                                            cursor: dirty ? "pointer" : "not-allowed",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            fontWeight: 900,
                                            fontSize: 13,
                                            opacity: dirty ? 1 : 0.85,
                                            flex: 1,
                                            justifyContent: "center",
                                        }}
                                        title="Save"
                                    >
                                        <Save size={16} />
                                        Save
                                    </button>
                                </div>

                                <button
                                    onClick={() => setSelectedPhotoId(null)}
                                    style={{
                                        marginTop: 10,
                                        height: 36,
                                        borderRadius: 12,
                                        border: "1px solid var(--border-subtle)",
                                        backgroundColor: "transparent",
                                        color: "var(--text-primary)",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        fontSize: 13,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                    Clear selection
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                marginTop: 10,
                                borderRadius: 18,
                                border: "1px dashed var(--border-subtle)",
                                backgroundColor: "var(--bg-primary)",
                                padding: 14,
                                color: "var(--text-secondary)",
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 16,
                                    backgroundColor: "var(--bg-secondary)",
                                    border: "1px solid var(--border-subtle)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <ImageIcon size={18} />
                            </div>
                            <div style={{ fontSize: 13 }}>Select a photo from the grid to start editing.</div>
                        </div>
                    )}
                </div>

                <div style={{ height: 16 }} />

                {!selectedPhoto || !draft ? (
                    <div
                        style={{
                            borderRadius: 24,
                            border: "1px dashed var(--border-subtle)",
                            backgroundColor: "var(--bg-primary)",
                            padding: 16,
                            color: "var(--text-secondary)",
                            fontSize: 13,
                        }}
                    >
                        Select a photo to edit metadata.
                    </div>
                ) : (
                    <>
                        <Card
                            icon={<Info size={16} />}
                            title="Basic"
                            content={
                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                                    <Field label="Title">
                                        <TextInput value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
                                    </Field>
                                    <Field label="Timestamp">
                                        <TextInput
                                            type="datetime-local"
                                            value={draft.timestampIsoLocal}
                                            onChange={(v) => setDraft({ ...draft, timestampIsoLocal: v })}
                                        />
                                    </Field>
                                    <Field label="Description">
                                        <TextArea value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} />
                                    </Field>
                                </div>
                            }
                        />

                        <div style={{ height: 12 }} />

                        <Card
                            icon={<MapPin size={16} />}
                            title="Location"
                            content={
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    <ToggleRow
                                        checked={draft.locationEnabled}
                                        label="Enable location"
                                        onChange={(checked) => {
                                            setDraft({
                                                ...draft,
                                                locationEnabled: checked,
                                                locationName: checked ? draft.locationName : "",
                                                latitude: checked ? draft.latitude : "",
                                                longitude: checked ? draft.longitude : "",
                                            });
                                        }}
                                    />

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr",
                                            gap: 12,
                                            opacity: draft.locationEnabled ? 1 : 0.5,
                                        }}
                                    >
                                        <Field label="Name">
                                            <TextInput
                                                value={draft.locationName}
                                                onChange={(v) => setDraft({ ...draft, locationName: v })}
                                                disabled={!draft.locationEnabled}
                                            />
                                        </Field>
                                        <Field label="Latitude">
                                            <TextInput
                                                value={draft.latitude}
                                                onChange={(v) => setDraft({ ...draft, latitude: v })}
                                                disabled={!draft.locationEnabled}
                                            />
                                        </Field>
                                        <Field label="Longitude">
                                            <TextInput
                                                value={draft.longitude}
                                                onChange={(v) => setDraft({ ...draft, longitude: v })}
                                                disabled={!draft.locationEnabled}
                                            />
                                        </Field>
                                    </div>
                                </div>
                            }
                        />

                        <div style={{ height: 12 }} />

                        <Card
                            icon={<CalendarClock size={16} />}
                            title="Camera / EXIF"
                            content={
                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                                    <Field label="Width (px)">
                                        <TextInput value={draft.width} onChange={(v) => setDraft({ ...draft, width: v })} />
                                    </Field>
                                    <Field label="Height (px)">
                                        <TextInput value={draft.height} onChange={(v) => setDraft({ ...draft, height: v })} />
                                    </Field>
                                    <Field label="Camera model">
                                        <TextInput value={draft.cameraModel} onChange={(v) => setDraft({ ...draft, cameraModel: v })} />
                                    </Field>
                                    <Field label="Focal length">
                                        <TextInput value={draft.focalLength} onChange={(v) => setDraft({ ...draft, focalLength: v })} />
                                    </Field>
                                    <Field label="ISO">
                                        <TextInput value={draft.iso} onChange={(v) => setDraft({ ...draft, iso: v })} />
                                    </Field>
                                    <Field label="Aperture">
                                        <TextInput value={draft.aperture} onChange={(v) => setDraft({ ...draft, aperture: v })} />
                                    </Field>
                                    <Field label="Shutter speed">
                                        <TextInput value={draft.shutterSpeed} onChange={(v) => setDraft({ ...draft, shutterSpeed: v })} />
                                    </Field>
                                </div>
                            }
                        />
                    </>
                )}

                <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
            </div>

            {/* RIGHT: photo grid */}
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    backgroundColor: "var(--bg-primary)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Optional: subtle top padding to match other pages */}
                <div style={{ position: "absolute", inset: 0 }}>
                    <PhotoGrid
                        photos={photos}
                        onPhotoClick={(photo) => {
                            setSelectedPhotoId(photo.id);
                            // Ensure the editor side shows the newly selected photo immediately.
                            // No scrolling required here.
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

function Card({
    icon,
    title,
    content,
}: {
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
}): React.ReactElement {
    return (
        <div
            style={{
                borderRadius: 24,
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-primary)",
                boxShadow: "var(--shadow-sm)",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-secondary)",
                }}
            >
                <div style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text-primary)" }}>{title}</div>
            </div>
            <div style={{ padding: 16 }}>{content}</div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-secondary)" }}>{label}</div>
            {children}
        </div>
    );
}

function TextInput({
    value,
    onChange,
    type,
    disabled,
}: {
    value: string;
    onChange: (v: string) => void;
    type?: string;
    disabled?: boolean;
}): React.ReactElement {
    return (
        <input
            type={type ?? "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
                height: 42,
                borderRadius: 14,
                border: "1px solid var(--border-subtle)",
                backgroundColor: disabled ? "var(--bg-secondary)" : "var(--bg-primary)",
                color: "var(--text-primary)",
                padding: "0 12px",
                outline: "none",
                fontSize: 14,
            }}
        />
    );
}

function TextArea({ value, onChange }: { value: string; onChange: (v: string) => void }): React.ReactElement {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            style={{
                borderRadius: 14,
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                padding: 12,
                outline: "none",
                fontSize: 14,
                resize: "vertical",
            }}
        />
    );
}

function ToggleRow({
    checked,
    label,
    onChange,
}: {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}): React.ReactElement {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            style={{
                width: "fit-content",
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-primary)",
                padding: "10px 12px",
                borderRadius: 14,
                cursor: "pointer",
                color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-primary)")}
            aria-pressed={checked}
        >
            <span
                style={{
                    width: 40,
                    height: 22,
                    borderRadius: 999,
                    backgroundColor: checked ? "var(--accent-primary)" : "var(--border-subtle)",
                    position: "relative",
                    display: "inline-block",
                    transition: "background-color 0.15s ease",
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        top: 3,
                        left: checked ? 21 : 3,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: "white",
                        transition: "left 0.15s ease",
                    }}
                />
            </span>
            <span style={{ fontSize: 13, fontWeight: 900 }}>{label}</span>
        </button>
    );
}
