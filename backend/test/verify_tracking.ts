
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const files = await prisma.file.findMany({
        where: {
            isDirectory: true
        },
        include: {
            children: true
        }
    });

    const allFiles = await prisma.file.findMany();
    console.log('Total files/dirs:', allFiles.length);

    const nested = allFiles.find(f => f.path.includes('nested'));
    console.log('Nested Dir found:', !!nested);
    if (nested) {
        console.log('Nested Path:', nested.path);
        console.log('Nested IsDir:', nested.isDirectory);
        console.log('Nested ParentId:', nested.parentId);

        const children = allFiles.filter(f => f.parentId === nested.id);
        console.log('Nested Children count:', children.length);
        children.forEach(c => console.log(' - Child:', c.name, c.extension));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
