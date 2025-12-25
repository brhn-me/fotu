import { z } from 'zod';

export const LocationSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    name: z.string().nullable(),
});

export const PhotoMetadataSchema = z.object({
    width: z.number(),
    height: z.number(),
    cameraModel: z.string().nullable(),
    focalLength: z.string().nullable(),
    iso: z.number().nullable(),
    aperture: z.string().nullable(),
    shutterSpeed: z.string().nullable(),
});

export const PhotoSchema = z.object({
    id: z.string(),
    url: z.string(),
    thumbnailUrl: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    timestamp: z.date(),
    location: LocationSchema.nullable(),
    metadata: PhotoMetadataSchema,
});

export type Location = z.infer<typeof LocationSchema>;
export type PhotoMetadata = z.infer<typeof PhotoMetadataSchema>;
export type Photo = z.infer<typeof PhotoSchema>;
