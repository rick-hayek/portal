'use client';

import React from 'react';
import { defaultResumeConfig as resume } from '@portal/config';
import { Timeline } from '@/components/resume/Timeline';

export default function ResumePage() {
    return (
        <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 xl:px-0">
            {/* Print Header (Hidden on screen, visible on print) */}
            <div className="hidden print:block mb-8 text-center pb-8 border-b border-[var(--portal-color-border)]">
                <h1 className="text-4xl font-black text-[var(--portal-color-text)] tracking-tight">{resume.name}</h1>
                <p className="mt-2 text-xl text-[var(--portal-color-primary)] font-medium">{resume.title}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-[var(--portal-color-text-secondary)]">
                    {resume.email && <span>{resume.email}</span>}
                    {resume.website && <span>{resume.website.replace(/^https?:\/\//, '')}</span>}
                    {resume.location && <span>{resume.location}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_2.5fr]">
                {/* Left Sidebar (Screen only or side-by-side) */}
                <div className="space-y-8">
                    {/* Header for Screen */}
                    <div className="print:hidden">
                        <h1 className="text-4xl font-black text-[var(--portal-color-text)] tracking-tight">{resume.name}</h1>
                        <p className="mt-2 text-xl text-[var(--portal-color-primary)] font-medium">{resume.title}</p>
                    </div>

                    {/* Contact Info */}
                    <section className="print:hidden space-y-4 rounded-2xl bg-[var(--portal-color-surface)] p-6 border border-[var(--portal-color-border)] shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--portal-color-text-secondary)]">Contact</h2>
                        <ul className="space-y-3 text-sm text-[var(--portal-color-text)]">
                            {resume.email && (
                                <li>
                                    <a href={`mailto:${resume.email}`} className="hover:text-[var(--portal-color-primary)] transition-colors">
                                        {resume.email}
                                    </a>
                                </li>
                            )}
                            {resume.website && (
                                <li>
                                    <a href={resume.website} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--portal-color-primary)] transition-colors">
                                        {resume.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </li>
                            )}
                            {resume.location && <li>{resume.location}</li>}
                        </ul>
                    </section>

                    {/* Skills */}
                    <section>
                        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--portal-color-text-secondary)]">Skills</h2>
                        <div className="space-y-6">
                            {resume.skills.map((category, idx) => (
                                <div key={idx}>
                                    <h3 className="mb-2 text-sm font-semibold text-[var(--portal-color-text)]">{category.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {category.skills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="rounded-lg bg-[var(--portal-color-surface)] border border-[var(--portal-color-border)] px-2.5 py-1 text-xs font-medium text-[var(--portal-color-text)] shadow-sm"
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Content */}
                <div className="space-y-12">
                    {/* Summary */}
                    <section>
                        <h2 className="mb-6 text-2xl font-bold text-[var(--portal-color-text)]">Profile</h2>
                        <p className="text-base leading-relaxed text-[var(--portal-color-text-secondary)]">
                            {resume.summary}
                        </p>
                    </section>

                    {/* Experience */}
                    <section>
                        <h2 className="mb-8 text-2xl font-bold text-[var(--portal-color-text)]">Experience</h2>
                        <Timeline
                            items={resume.experience.map(exp => ({
                                title: exp.title,
                                subtitle: exp.company,
                                date: `${exp.startDate} — ${exp.endDate}`,
                                location: exp.location,
                                description: exp.description,
                            }))}
                        />
                    </section>

                    {/* Education */}
                    <section>
                        <h2 className="mb-8 text-2xl font-bold text-[var(--portal-color-text)]">Education</h2>
                        <Timeline
                            items={resume.education.map(edu => ({
                                title: edu.degree,
                                subtitle: edu.school,
                                date: `${edu.startDate} — ${edu.endDate}`,
                                location: edu.location,
                                description: edu.description,
                            }))}
                        />
                    </section>

                    {/* Print Button (Screen only) */}
                    <div className="print:hidden pt-8 border-t border-[var(--portal-color-border)] flex justify-end">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-primary)] px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--portal-color-primary)]/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--portal-color-primary)] focus:ring-offset-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print to PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
