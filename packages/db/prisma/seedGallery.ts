import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const images = [
        { url: 'https://picsum.photos/id/10', width: 2500, height: 1667, alt: 'Forest' },
        { url: 'https://picsum.photos/id/11', width: 2500, height: 1667, alt: 'Landscape' },
        { url: 'https://picsum.photos/id/12', width: 2500, height: 1667, alt: 'Beach' },
        { url: 'https://picsum.photos/id/13', width: 2500, height: 1667, alt: 'River' },
        { url: 'https://picsum.photos/id/14', width: 2500, height: 1667, alt: 'Ocean' },
        { url: 'https://picsum.photos/id/15', width: 2500, height: 1667, alt: 'Waterfall' },
        { url: 'https://picsum.photos/id/16', width: 2500, height: 1667, alt: 'Valley' },
        { url: 'https://picsum.photos/id/17', width: 2500, height: 1667, alt: 'Path' },
        { url: 'https://picsum.photos/id/18', width: 2500, height: 1667, alt: 'Meadow' },
        { url: 'https://picsum.photos/id/19', width: 2500, height: 1667, alt: 'Hills' },
    ];

    console.log('Seeding gallery media...');

    // Clear existing images for a clean slate
    await prisma.media.deleteMany({ where: { type: 'image' } });

    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await prisma.media.create({
            data: {
                url: `${img.url}/${img.width}/${img.height}`,
                filename: `photo-${i + 1}.jpg`,
                type: 'image',
                size: 1024 * 500, // mock size 500kb
                width: img.width,
                height: img.height,
                alt: img.alt,
            },
        });
    }

    console.log('Gallery seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
