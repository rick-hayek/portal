import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const links = [
        {
            name: 'John Doe',
            url: 'https://johndoe.example.com',
            avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=John',
            description: 'Full-stack developer and open source enthusiast.',
            category: 'friend',
            sortOrder: 1,
        },
        {
            name: 'Jane Smith',
            url: 'https://janesmith.example.com',
            avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jane',
            description: 'UI/UX Designer who loves typography.',
            category: 'friend',
            sortOrder: 2,
        },
        {
            name: 'Tailwind CSS',
            url: 'https://tailwindcss.com',
            avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=Tailwind',
            description: 'A utility-first CSS framework for rapid UI development.',
            category: 'tool',
            sortOrder: 1,
        },
        {
            name: 'Next.js',
            url: 'https://nextjs.org',
            avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=NextJS',
            description: 'The React Framework for the Web.',
            category: 'tool',
            sortOrder: 2,
        },
        {
            name: 'Prisma',
            url: 'https://prisma.io',
            avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=Prisma',
            description: 'Next-generation Node.js and TypeScript ORM.',
            category: 'tool',
            sortOrder: 3,
        },
        {
            name: 'Vercel',
            url: 'https://vercel.com',
            avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=Vercel',
            description: 'Develop. Preview. Ship. For the best frontend teams.',
            category: 'inspiration',
            sortOrder: 1,
        },
        {
            name: 'Linear',
            url: 'https://linear.app',
            avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=Linear',
            description: 'A better way to build products.',
            category: 'inspiration',
            sortOrder: 2,
        },
    ];

    console.log('Seeding links data...');
    await prisma.link.deleteMany({});

    for (const link of links) {
        await prisma.link.create({
            data: {
                ...link,
                isAlive: true,
            },
        });
    }

    console.log('Links seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
