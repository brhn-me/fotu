import { PrismaClient } from '@prisma/client';
import { ScanJob } from '../src/jobs/scanJob';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Source
    const sourcePath = path.join(__dirname, 'test_photos');
    console.log('Adding source:', sourcePath);

    // Clean up
    await prisma.source.deleteMany({ where: { path: sourcePath } });

    const source = await prisma.source.create({
        data: {
            path: sourcePath,
            enabled: true,
            status: 'IDLE'
        }
    });
    console.log('Source created:', source.id);

    // 2. Mock Job
    const mockJob = {
        data: { sourceId: source.id, sourcePath },
        updateProgress: async (p: any) => console.log('Progress:', p),
        log: async (msg: string) => console.log('Log:', msg)
    } as any;

    // 3. Run Scan
    console.log('Starting manual scan...');
    const scanJob = new ScanJob();
    await scanJob.process(mockJob);
    console.log('Scan complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
