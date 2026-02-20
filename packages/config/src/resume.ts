export interface ResumeExperience {
    id: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string | 'Present';
    description: string[];
}

export interface ResumeEducation {
    id: string;
    degree: string;
    school: string;
    location?: string;
    startDate: string;
    endDate: string;
    description?: string;
}

export interface ResumeSkillCategory {
    title: string;
    skills: { name: string; level?: number }[];
}

export interface ResumeConfig {
    name: string;
    title: string;
    email: string;
    phone?: string;
    website?: string;
    location?: string;
    summary: string;
    experience: ResumeExperience[];
    education: ResumeEducation[];
    skills: ResumeSkillCategory[];
}

export const defaultResumeConfig: ResumeConfig = {
    name: 'Your Name',
    title: 'Full Stack Developer',
    email: 'hello@example.com',
    website: 'https://example.com',
    location: 'City, Country',
    summary: 'A passionate developer with experience in building scalable web applications using React, Node.js, and modern web technologies. Specialized in crafting exceptional digital experiences with a focus on web accessibility, performance, and responsive design.',
    experience: [
        {
            id: 'exp-1',
            title: 'Senior Frontend Engineer',
            company: 'Tech Corp Inc.',
            startDate: '2022',
            endDate: 'Present',
            description: [
                'Lead the frontend development of the core product using Next.js and React.',
                'Mentored junior developers and established coding standards.',
                'Improved web performance score by 30% through code splitting and lazy loading.',
            ],
        },
        {
            id: 'exp-2',
            title: 'Software Developer',
            company: 'Digital Solutions LLC',
            startDate: '2019',
            endDate: '2022',
            description: [
                'Developed full-stack features using React, Node.js, and PostgreSQL.',
                'Integrated third-party APIs for payment processing and analytics.',
                'Participated in agile ceremonies and sprint planning.',
            ],
        },
    ],
    education: [
        {
            id: 'edu-1',
            degree: 'B.S. in Computer Science',
            school: 'University of Technology',
            startDate: '2015',
            endDate: '2019',
        },
    ],
    skills: [
        {
            title: 'Languages',
            skills: [{ name: 'JavaScript / TypeScript' }, { name: 'HTML / CSS' }, { name: 'Python' }, { name: 'SQL' }],
        },
        {
            title: 'Frameworks & Libraries',
            skills: [{ name: 'React' }, { name: 'Next.js' }, { name: 'Tailwind CSS' }, { name: 'Node.js' }, { name: 'Prisma' }],
        },
        {
            title: 'Tools',
            skills: [{ name: 'Git' }, { name: 'Docker' }, { name: 'VS Code' }, { name: 'Figma' }],
        },
    ],
};
