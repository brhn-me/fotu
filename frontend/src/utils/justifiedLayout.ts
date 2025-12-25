export interface ScaledPhoto {
    photo: any; // Using any to avoid circular deps, effectively Photo
    scaledWidth: number;
    scaledHeight: number;
}

export interface RowData {
    photos: ScaledPhoto[];
    height: number;
}

export function computeJustifiedLayout(
    photos: any[],
    containerWidth: number,
    targetRowHeight: number
): RowData[] {
    if (containerWidth <= 0) return [];

    const rows: RowData[] = [];
    let currentRow: any[] = [];
    let currentWidth = 0;

    for (const photo of photos) {
        // Fallback to metadata if hoisted properties are missing (e.g. stale HMR state)
        const w = photo.width ?? photo.metadata?.width ?? 800;
        const h = photo.height ?? photo.metadata?.height ?? 600;

        const aspectRatio = w / h;
        const scaledWidth = targetRowHeight * aspectRatio;

        currentRow.push({ ...photo, scaledWidth });
        currentWidth += scaledWidth;

        // Simplistic greedy approach: if adding this photo exceeds width significantly, break row
        // A better approach would be to check if we are closer to target with or without this photo
        // For now, let's just break if we exceed.
        if (currentWidth > containerWidth) {
            // Calculate how much we need to shrink this row to fit exactly in containerWidth
            // ratio = containerWidth / currentWidth
            // newHeight = targetRowHeight * ratio
            const ratio = containerWidth / currentWidth;
            const newHeight = Math.floor(targetRowHeight * ratio);

            // Create the row
            rows.push({
                photos: currentRow.map(p => ({
                    photo: p,
                    scaledWidth: p.scaledWidth * ratio,
                    scaledHeight: newHeight
                })),
                height: newHeight
            });

            currentRow = [];
            currentWidth = 0;
        }
    }

    // Handle last row (don't scale up, keep target height)
    if (currentRow.length > 0) {
        rows.push({
            photos: currentRow.map(p => ({
                photo: p,
                scaledWidth: p.scaledWidth,
                scaledHeight: targetRowHeight
            })),
            height: targetRowHeight
        });
    }

    return rows;
}
