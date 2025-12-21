import type { Photo } from '../types';
import { MapWidget } from './MapWidget';

interface MetadataPanelProps {
    photo: Photo;
    onChange: (updatedPhoto: Photo) => void;
}

export function MetadataPanel({ photo, onChange }: MetadataPanelProps) {
    const handleChange = (field: keyof Photo, value: any) => {
        onChange({
            ...photo,
            [field]: value
        });
    };

    const handleLocationChange = (lat: number, lng: number) => {
        onChange({
            ...photo,
            location: {
                latitude: lat,
                longitude: lng,
                name: photo.location?.name || 'Custom Location'
            }
        });
    };

    return (
        <div style={{
            width: '360px',
            background: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto'
        }}>
            <div style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Info</h2>

                {/* Title & Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Title</label>
                        <input
                            type="text"
                            value={photo.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            style={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-sm)',
                                outline: 'none',
                                fontSize: '14px'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Description</label>
                        <textarea
                            value={photo.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            style={{
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-sm)',
                                outline: 'none',
                                resize: 'none',
                                fontSize: '14px',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </div>

                {/* Date & Camera Info (Read-onlyish for now, but editable if needed) */}
                <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '20px' }}>📅</div>
                        <div>
                            <div style={{ fontSize: '14px' }}>{new Date(photo.timestamp).toLocaleString()}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{photo.timestamp.toISOString()}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '20px' }}>📷</div>
                        <div>
                            <div style={{ fontSize: '14px' }}>{photo.metadata.cameraModel || 'Unknown Camera'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {photo.metadata.focalLength} • {photo.metadata.aperture} • {photo.metadata.iso}ISO
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Location</label>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {photo.location ? `${photo.location.latitude.toFixed(4)}, ${photo.location.longitude.toFixed(4)}` : 'No location'}
                        </span>
                    </div>
                    <MapWidget
                        latitude={photo.location?.latitude || null}
                        longitude={photo.location?.longitude || null}
                        onChangeLocation={handleLocationChange}
                    />
                </div>

            </div>
        </div>
    );
}
