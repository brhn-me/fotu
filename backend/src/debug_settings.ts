
import { PrismaClient } from '@prisma/client';
import { DEFAULT_SETTINGS } from './config/defaultSettings';

const prisma = new PrismaClient();

async function check() {
    console.log("--- DEFAULT_SETTINGS.jobsConcurrency ---");
    console.log(DEFAULT_SETTINGS.jobsConcurrency);

    console.log("\n--- DB Settings ---");
    const setting = await prisma.settings.findUnique({ where: { key: 'jobsConcurrency' } });
    console.log(setting);

    await prisma.$disconnect();
}

check();
