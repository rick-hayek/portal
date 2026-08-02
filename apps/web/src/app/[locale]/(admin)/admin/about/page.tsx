'use client';

import { trpc } from '@/lib/api/client';
import { defaultAboutConfig } from '@portal/config';
import { Dropdown, DropdownOption } from '@/components/ui/Dropdown';
import { Plus, Trash2, User, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
}

interface SocialLinkItem {
  label: string;
  href: string;
  icon?: string;
  displayMode?: 'icon' | 'text' | 'both';
}

const displayModeOptions: DropdownOption<'both' | 'icon' | 'text'>[] = [
  { value: 'both', label: 'Both (Icon & Text)' },
  { value: 'icon', label: 'Icon Only' },
  { value: 'text', label: 'Text Only' },
];

export default function AdminAboutPage() {
  const { data: aboutData, isLoading, refetch } = trpc.about.getAbout.useQuery();
  const updateMutation = trpc.about.updateAbout.useMutation();

  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');

  // Author Profile (Homepage Code Card) State
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [authorRoleEn, setAuthorRoleEn] = useState('');
  const [authorStack, setAuthorStack] = useState('');
  const [authorStatus, setAuthorStatus] = useState('');

  // Email state (stored in a single object/JSON field)
  const [emailAddress, setEmailAddress] = useState('');
  const [emailIcon, setEmailIcon] = useState('');
  const [emailDisplayMode, setEmailDisplayMode] = useState<'icon' | 'text' | 'both'>('both');

  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (aboutData) {
      setTitle(aboutData.title ?? 'The Developer');
      setTitleEn(aboutData.title_en ?? '');
      setSubtitle(aboutData.subtitle ?? 'ABOUT ME');
      setSubtitleEn(aboutData.subtitle_en ?? '');
      setDescription(aboutData.description ?? '');
      setDescriptionEn(aboutData.description_en ?? '');
      setExperiences(aboutData.experiences ?? []);
      setSocialLinks(aboutData.socialLinks ?? []);

      // Author JSON object parsing
      const authorObj = aboutData.author as any;
      if (authorObj && typeof authorObj === 'object') {
        setAuthorName(authorObj.name ?? '');
        setAuthorRole(authorObj.role ?? '');
        setAuthorRoleEn(authorObj.role_en ?? '');
        setAuthorStack(
          Array.isArray(authorObj.stack)
            ? authorObj.stack.join(', ')
            : authorObj.stack ?? ''
        );
        setAuthorStatus(authorObj.status ?? '');
      } else {
        setAuthorName('Rick');
        setAuthorRole('全栈开发者');
        setAuthorRoleEn('Full-Stack Developer');
        setAuthorStack('Next.js, TypeScript, Vue, Python, AI Agent');
        setAuthorStatus('Building');
      }

      // Parse Email JSON object or fallback
      const rawEmail = aboutData.email;
      if (typeof rawEmail === 'object' && rawEmail !== null && 'address' in rawEmail) {
        const eObj = rawEmail as { address: string; icon?: string; displayMode?: 'icon' | 'text' | 'both' };
        setEmailAddress(eObj.address ?? '');
        setEmailIcon(eObj.icon ?? '');
        setEmailDisplayMode(eObj.displayMode ?? 'both');
      } else if (typeof rawEmail === 'string') {
        setEmailAddress(rawEmail);
        setEmailIcon(defaultAboutConfig.email?.icon ?? '');
        setEmailDisplayMode('both');
      } else {
        setEmailAddress(defaultAboutConfig.email?.address ?? '');
        setEmailIcon(defaultAboutConfig.email?.icon ?? '');
        setEmailDisplayMode('both');
      }
    }
  }, [aboutData]);

  // Handle adding experience
  const handleAddExperience = () => {
    setExperiences([...experiences, { role: '', company: '', period: '' }]);
  };

  // Handle removing experience
  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  // Handle experience field change
  const handleExperienceChange = (index: number, field: keyof ExperienceItem, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  // Handle adding social link
  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { label: '', href: '', icon: '', displayMode: 'both' }]);
  };

  // Handle removing social link
  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Handle social link change
  const handleSocialLinkChange = (index: number, field: keyof SocialLinkItem, value: any) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    try {
      await updateMutation.mutateAsync({
        title: title.trim() || 'The Developer',
        title_en: titleEn.trim() || null,
        subtitle: subtitle.trim() || 'ABOUT ME',
        subtitle_en: subtitleEn.trim() || null,
        description: description.trim(),
        description_en: descriptionEn.trim() || null,
        experiences: experiences.filter((exp) => exp.role.trim() || exp.company.trim()),
        socialLinks: socialLinks.filter((link) => link.label.trim() && link.href.trim()),
        email: emailAddress.trim()
          ? {
            address: emailAddress.trim(),
            icon: emailIcon.trim() || undefined,
            displayMode: emailDisplayMode,
          }
          : null,
        author: {
          name: authorName.trim() || undefined,
          role: authorRole.trim() || undefined,
          role_en: authorRoleEn.trim() || undefined,
          stack: authorStack.trim() || undefined,
          status: authorStatus.trim() || undefined,
        },
      });

      setFeedback({ type: 'success', message: 'About page & author settings updated successfully!' });
      refetch();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save changes.' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--portal-color-surface-alt)]" />
        <div className="h-64 animate-pulse rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--portal-color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--portal-color-text)] flex items-center gap-2">
            <User className="h-6 w-6 text-[var(--portal-color-primary)]" />
            About Page Settings
          </h1>
          <p className="text-xs text-[var(--portal-color-text-secondary)] mt-1">
            Manage profile intro, work experiences, and social links displayed on the /about page
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-sm font-medium ${feedback.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300'
              : 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-300'
            }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Information Section */}
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 space-y-4">
          <h2 className="text-base font-semibold text-[var(--portal-color-text)] border-b border-[var(--portal-color-border-soft)] pb-3">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Subtitle (ZH / Default)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="ABOUT ME"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Subtitle (EN)
              </label>
              <input
                type="text"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                placeholder="ABOUT ME (EN fallback)"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Title (ZH / Default)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Developer"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Title (EN)
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="The Developer (EN fallback)"
                className="input-base"
              />
            </div>
          </div>

          {/* Email Settings */}
          <div className="space-y-3 pt-2 border-t border-[var(--portal-color-border-soft)]">
            <h3 className="text-xs font-semibold text-[var(--portal-color-text-secondary)] uppercase tracking-wider">
              Email Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--portal-color-text-secondary)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="your-email@example.com"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--portal-color-text-secondary)] mb-1">
                  Display Mode
                </label>
                <Dropdown
                  value={emailDisplayMode}
                  onChange={(val) => setEmailDisplayMode(val)}
                  options={displayModeOptions}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--portal-color-text-secondary)] mb-1">
                Email SVG Icon
              </label>
              <div className="flex items-center gap-3">
                {emailIcon ? (
                  <div
                    className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text)]"
                    dangerouslySetInnerHTML={{ __html: emailIcon }}
                    title="Email SVG Preview"
                  />
                ) : (
                  <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-dashed border-[var(--portal-color-border)] text-[10px] text-[var(--portal-color-text-tertiary)] font-mono">
                    SVG
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Email SVG Code: <svg>...</svg>"
                  value={emailIcon}
                  onChange={(e) => setEmailIcon(e.target.value)}
                  className="input-base flex-1 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Description (ZH / Default)
              </label>
              <p className="text-[11px] text-[var(--portal-color-text-tertiary)] mb-1.5">
                Supports multiple paragraphs (separated by blank lines)
              </p>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hello! I'm Rick..."
                className="input-base font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Description (EN Fallback)
              </label>
              <p className="text-[11px] text-[var(--portal-color-text-tertiary)] mb-1.5">
                If omitted, falls back to Chinese description
              </p>
              <textarea
                rows={6}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Hello! I'm Rick..."
                className="input-base font-sans"
              />
            </div>
          </div>
        </div>

        {/* Homepage Developer Card (Author Config) Section */}
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 space-y-4">
          <h2 className="text-base font-semibold text-[var(--portal-color-text)] border-b border-[var(--portal-color-border-soft)] pb-3">
            Homepage Code Terminal Config (首页代码卡片配置)
          </h2>
          <p className="text-xs text-[var(--portal-color-text-secondary)]">
            Configure the <code className="font-mono text-[var(--portal-color-primary)]">const developer = &#123; ... &#125;</code> object on the homepage terminal. Omitted/empty fields will not be displayed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Name (`name`)
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Rick"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Status (`status`)
              </label>
              <input
                type="text"
                value={authorStatus}
                onChange={(e) => setAuthorStatus(e.target.value)}
                placeholder="wondering / Building"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Role (ZH) (`role`)
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="全栈开发者"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Role (EN) (`role_en`)
              </label>
              <input
                type="text"
                value={authorRoleEn}
                onChange={(e) => setAuthorRoleEn(e.target.value)}
                placeholder="Full-Stack Developer"
                className="input-base"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[var(--portal-color-text-secondary)] mb-1">
                Tech Stack (`stack`)
              </label>
              <input
                type="text"
                value={authorStack}
                onChange={(e) => setAuthorStack(e.target.value)}
                placeholder="Next.js, TypeScript, Vue, Python, AI Agent"
                className="input-base"
              />
            </div>
          </div>
        </div>

        {/* Work Experiences Section */}
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--portal-color-border-soft)] pb-3">
            <h2 className="text-base font-semibold text-[var(--portal-color-text)]">
              Work Experiences
            </h2>
            <button
              type="button"
              onClick={handleAddExperience}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--portal-color-primary)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Experience
            </button>
          </div>

          {experiences.length === 0 ? (
            <p className="text-xs text-[var(--portal-color-text-tertiary)] py-2">
              No work experiences added. Click "Add Experience" to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--portal-color-border-soft)] bg-[var(--portal-color-background)]"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Role (e.g. Senior Developer)"
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                      className="input-base"
                    />
                    <input
                      type="text"
                      placeholder="Company (e.g. Tech Corp)"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      className="input-base"
                    />
                    <input
                      type="text"
                      placeholder="Period (e.g. 2023 — Present)"
                      value={exp.period}
                      onChange={(e) => handleExperienceChange(index, 'period', e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Social Links Section */}
        <div className="rounded-xl border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--portal-color-border-soft)] pb-3">
            <h2 className="text-base font-semibold text-[var(--portal-color-text)]">
              Social Links
            </h2>
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--portal-color-primary)] hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Social Link
            </button>
          </div>

          {socialLinks.length === 0 ? (
            <p className="text-xs text-[var(--portal-color-text-tertiary)] py-2">
              No social links added. Click "Add Social Link" to create one.
            </p>
          ) : (
            <div className="space-y-3">
              {socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--portal-color-border-soft)] bg-[var(--portal-color-background)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-0">
                      <input
                        type="text"
                        placeholder="Label (e.g. X)"
                        value={link.label}
                        onChange={(e) => handleSocialLinkChange(index, 'label', e.target.value)}
                        className="input-base"
                      />
                      <input
                        type="url"
                        placeholder="URL (e.g. https://x.com/...)"
                        value={link.href}
                        onChange={(e) => handleSocialLinkChange(index, 'href', e.target.value)}
                        className="input-base"
                      />
                      <Dropdown
                        value={link.displayMode || 'both'}
                        onChange={(val) => handleSocialLinkChange(index, 'displayMode', val)}
                        options={displayModeOptions}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSocialLink(index)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    {link.icon ? (
                      <div
                        className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-[var(--portal-color-border)] bg-[var(--portal-color-surface)] text-[var(--portal-color-text)]"
                        dangerouslySetInnerHTML={{ __html: link.icon }}
                        title="SVG Preview"
                      />
                    ) : (
                      <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg border border-dashed border-[var(--portal-color-border)] text-[10px] text-[var(--portal-color-text-tertiary)] font-mono">
                        SVG
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="SVG Icon Code (e.g. <svg>...</svg>)"
                      value={link.icon || ''}
                      onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                      className="input-base flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--portal-color-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
