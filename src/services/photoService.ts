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

function getRandomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArrayElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export const generateDummyPhotos = (count: number = 50): Photo[] => {
    const photos: Photo[] = [];
    const startDate = new Date(2020, 0, 1);
    const endDate = new Date();

    for (let i = 0; i < count; i++) {
        const id = uuidv4();
        const width = getRandomInt(800, 1600);
        const height = getRandomInt(600, 1200);
        const hasLocation = Math.random() > 0.2; // 80% have location

        let location: Location | null = null;
        if (hasLocation) {
            const city = getRandomArrayElement(CITIES);
            // Add some jitter
            location = {
                latitude: city.lat + (Math.random() - 0.5) * 0.1,
                longitude: city.lng + (Math.random() - 0.5) * 0.1,
                name: city.name,
            };
        }

        photos.push({
            id,
            url: `https://picsum.photos/seed/${id}/1920/1080`,
            thumbnailUrl: `https://picsum.photos/seed/${id}/400/300`,
            title: `Photo ${i + 1}`,
            description: Math.random() > 0.5 ? `A beautiful shot from my travels.` : null,
            timestamp: getRandomDate(startDate, endDate),
            location,
            metadata: {
                width,
                height,
                cameraModel: Math.random() > 0.3 ? getRandomArrayElement(CAMERAS) : null,
                focalLength: `${getRandomInt(16, 200)}mm`,
                iso: getRandomInt(100, 3200),
                aperture: `f/${(getRandomInt(14, 56) / 10).toFixed(1)}`,
                shutterSpeed: `1/${getRandomInt(60, 8000)}`,
            },
        });
    }

    return photos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
