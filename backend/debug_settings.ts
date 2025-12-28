import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findMany();
    console.log('Current Settings in Database:');
    settings.forEach(s => console.log(`${s.key}: ${s.value}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
