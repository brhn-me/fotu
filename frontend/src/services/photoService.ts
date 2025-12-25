// src/services/photoService.ts

import { v4 as uuidv4 } from 'uuid';
import type { Photo, Location } from '../types';

const CITIES: { name: string; lat: number; lng: number }[] = [
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
];

const CAMERAS = ['Canon EOS R5', 'Sony A7IV', 'Fujifilm X-T4', 'iPhone 13 Pro', 'Leica Q2'];


function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArrayElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export const generateDummyPhotos = (): Photo[] => {
    const photos: Photo[] = [];
    const endDate = new Date();

    // Helper to generate a photo object
    const createPhoto = (date: Date, index: number): Photo => {
        const id = uuidv4();
        // Generate distinct aspect ratios: Landscape (4:3, 16:9), Portrait (3:4, 9:16)
        const isLandscape = Math.random() > 0.4;
        const aspectRatio = isLandscape
            ? (Math.random() > 0.5 ? 4 / 3 : 16 / 9)
            : (Math.random() > 0.5 ? 3 / 4 : 9 / 16);

        const baseSize = 800;
        const width = Math.round(isLandscape ? baseSize * aspectRatio : baseSize);
        const height = Math.round(isLandscape ? baseSize : baseSize / aspectRatio);

        const hasLocation = Math.random() > 0.2;
        let location: Location | null = null;

        if (hasLocation) {
            const city = getRandomArrayElement(CITIES);
            location = {
                latitude: city.lat + (Math.random() - 0.5) * 0.1,
                longitude: city.lng + (Math.random() - 0.5) * 0.1,
                name: city.name,
            };
        }

        return {
            id,
            // Use 'seed' instead of 'id' because random integer IDs (1-500) might have gaps/404s
            url: `https://picsum.photos/seed/${id}/${width}/${height}`,
            thumbnailUrl: `https://picsum.photos/seed/${id}/400/${Math.round(400 / aspectRatio)}`,
            title: `Photo ${index}`,
            description: Math.random() > 0.5 ? `A beautiful shot from my travels.` : null,
            timestamp: date,
            location,
            width,     // Hoisted
            height,    // Hoisted
            metadata: {
                width,
                height,
                cameraModel: Math.random() > 0.3 ? getRandomArrayElement(CAMERAS) : null,
                focalLength: `${getRandomInt(16, 200)}mm`,
                iso: getRandomInt(100, 3200),
                aperture: `f/${(getRandomInt(14, 56) / 10).toFixed(1)}`,
                shutterSpeed: `1/${getRandomInt(60, 8000)}`,
            },
        };
    };

    let photoIndex = 1;

    // --- PART 1: 2024 and 2025 High Density ---
    let currentDate = new Date(endDate);
    while (currentDate.getFullYear() >= 2024) {
        // Generate a cluster of 4-12 photos
        const clusterSize = getRandomInt(4, 12);
        for (let i = 0; i < clusterSize; i++) {
            const date = new Date(currentDate);
            date.setHours(getRandomInt(8, 20), getRandomInt(0, 59));
            photos.push(createPhoto(date, photoIndex++));
        }
        // Skip 1-4 days
        currentDate.setDate(currentDate.getDate() - getRandomInt(1, 4));
    }

    // --- PART 2: 2015-2023 Sparse Data ---
    for (let year = 2023; year >= 2015; year--) {
        // Pick 1-5 random months
        const numMonths = getRandomInt(1, 5);
        const months = Array.from({ length: 12 }, (_, i) => i)
            .sort(() => 0.5 - Math.random())
            .slice(0, numMonths);

        months.forEach(month => {
            const day = getRandomInt(1, 28);
            const dateBase = new Date(year, month, day);

            // Generate one row (1-5 photos)
            const rowSize = getRandomInt(1, 5);
            for (let i = 0; i < rowSize; i++) {
                const date = new Date(dateBase);
                date.setHours(getRandomInt(8, 20), getRandomInt(0, 59));
                photos.push(createPhoto(date, photoIndex++));
            }
        });
    }

    return photos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
