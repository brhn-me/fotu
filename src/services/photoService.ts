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

export const generateDummyPhotos = (totalCount: number = 200): Photo[] => {
    const photos: Photo[] = [];
    const endDate = new Date();

    let photosGenerated = 0;
    let currentDate = new Date(endDate);

    while (photosGenerated < totalCount) {
        // Go back a few days to create some gaps, or stick to a few dates
        const daysToSkip = getRandomInt(0, 3);
        currentDate.setDate(currentDate.getDate() - daysToSkip);

        // Generate a cluster of photos for this specific date
        const photosInThisCluster = Math.min(getRandomInt(4, 12), totalCount - photosGenerated);

        for (let i = 0; i < photosInThisCluster; i++) {
            const id = uuidv4();
            const width = getRandomInt(800, 1600);
            const height = getRandomInt(600, 1200);
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

            // Create a specific timestamp for this day with random time
            const timestamp = new Date(currentDate);
            timestamp.setHours(getRandomInt(8, 20), getRandomInt(0, 59), getRandomInt(0, 59));

            photos.push({
                id,
                url: `https://picsum.photos/seed/${id}/1920/1080`,
                thumbnailUrl: `https://picsum.photos/seed/${id}/400/400`, // Make square thumbnails
                title: `Photo ${photosGenerated + 1}`,
                description: Math.random() > 0.5 ? `A beautiful shot from my travels.` : null,
                timestamp,
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
            photosGenerated++;
        }

        // Jump further back occasionally for older years
        if (Math.random() > 0.8) {
            currentDate.setMonth(currentDate.getMonth() - getRandomInt(1, 3));
        }
    }

    return photos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
