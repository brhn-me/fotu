import prisma from '../db/client';
import { DEFAULT_SETTINGS } from '../config/defaultSettings';

export const seedDefaultSettings = async () => {
    console.log('Seeding default settings...');

    const operations = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => {
        return prisma.settings.upsert({
            where: { key },
            update: {}, // Do nothing if it exists
            create: { key, value },
        });
    });

    try {
        await prisma.$transaction(operations);
        console.log('Default settings seeded successfully.');
    } catch (error) {
        console.error('Failed to seed default settings:', error);
    }
};
