
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const files = await prisma.file.findMany({
        where: { isDirectory: false },
        select: { path: true, hash: true }
    });

    console.log(`Found ${files.length} files.`);
    const hashed = files.filter(f => f.hash !== null);
    console.log(`Hashed files: ${hashed.length}`);

    if (hashed.length === files.length && files.length > 0) {
        console.log('SUCCESS: All files have hashes.');
        hashed.slice(0, 3).forEach(f => console.log(`${f.path} -> ${f.hash ? f.hash.substring(0, 10) + '...' : 'null'}`));
    } else {
        console.error('FAILURE: Some files are missing hashes.');
        files.filter(f => f.hash === null).slice(0, 3).forEach(f => console.log(`Missing hash: ${f.path}`));
        process.exit(1);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
