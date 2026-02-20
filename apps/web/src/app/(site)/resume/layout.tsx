import { defaultResumeConfig as resume } from '@portal/config';

export const metadata = {
    title: `Resume | ${resume.name}`,
    description: resume.summary,
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
