'use client';

import React, { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Article } from '@/types';
import {
  createArticleAction,
  updateArticleAction,
  checkSlugAction,
} from '@/app/admin/(dashboard)/articles/actions';
import { generateSlug, validateSlug } from '@/lib/slug';

interface ArticleFormProps {
  article?: Article;
  action: 'create' | 'edit';
}

const CATEGORY_SUGGESTIONS = [
  'Entrepreneurs & Visionaries',
  'Science & Technology',
  'Politics & World Leaders',
  'Arts & Literature',
  'Philosophy & Thought',
  'History & Civilization',
  'Exploration & Adventure',
];

const IMAGE_POSITION_OPTIONS = [
  { value: 'center', label: 'Center (Default)' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'center 20%', label: 'Top-Weighted (20%)' },
  { value: 'center 40%', label: 'Upper-Center (40%)' },
  { value: 'center 60%', label: 'Lower-Center (60%)' },
];

export default function ArticleForm({ article, action }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Parse initial tags
  let initialTags = '';
  if (article?.tags) {
    try {
      const parsed = JSON.parse(article.tags);
      if (Array.isArray(parsed)) {
        initialTags = parsed.join(', ');
      } else {
        initialTags = article.tags;
      }
    } catch {
      initialTags = article.tags;
    }
  }

  // Form Fields State
  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(action === 'edit');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [slugMessage, setSlugMessage] = useState('');

  const [htmlContent, setHtmlContent] = useState(article?.htmlContent || '');
  const [heroImage, setHeroImage] = useState(article?.heroImage || '');
  const [heroImageAlt, setHeroImageAlt] = useState(article?.heroImageAlt || '');
  const [heroSubtitle, setHeroSubtitle] = useState(article?.heroSubtitle || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [imagePosition, setImagePosition] = useState(article?.imagePosition || 'center');
  const [seoTitle, setSeoTitle] = useState(article?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(article?.seoDescription || '');
  const [canonicalUrl, setCanonicalUrl] = useState(article?.canonicalUrl || '');
  const [author, setAuthor] = useState(article?.author || 'Admin');
  const [category, setCategory] = useState(article?.category || '');
  const [tags, setTags] = useState(initialTags);
  const [featured, setFeatured] = useState(Boolean(article?.featured));
  const [status, setStatus] = useState<'draft' | 'published'>(
    (article?.status as 'draft' | 'published') || 'draft'
  );

  // Upload & UI Feedback State
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize HTML content textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 380)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [htmlContent]);

  // Handle Title Change with slug auto-generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (!slugManuallyEdited) {
      const generated = generateSlug(newTitle);
      setSlug(generated);
      if (generated) {
        checkSlugAvailability(generated);
      } else {
        setSlugStatus('idle');
        setSlugMessage('');
      }
    }
  };

  // Check slug uniqueness & validity
  const checkSlugAvailability = async (candidateSlug: string) => {
    if (!candidateSlug) {
      setSlugStatus('invalid');
      setSlugMessage('Slug cannot be empty.');
      return;
    }

    if (!validateSlug(candidateSlug)) {
      setSlugStatus('invalid');
      setSlugMessage('Invalid slug format. Use lowercase letters, numbers, and hyphens.');
      return;
    }

    setSlugStatus('checking');
    setSlugMessage('Checking availability...');

    try {
      const res = await checkSlugAction(candidateSlug, article?.id);
      if (res.available) {
        setSlugStatus('available');
        setSlugMessage('✓ Slug is available');
      } else {
        setSlugStatus('taken');
        setSlugMessage('✗ Slug is already in use by another article');
      }
    } catch {
      setSlugStatus('idle');
      setSlugMessage('');
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setSlug(value);
  };

  const handleSlugBlur = () => {
    if (slug) {
      checkSlugAvailability(slug);
    }
  };

  // Image File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setToast(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setHeroImage(data.url);
      setToast({ type: 'success', message: 'Image uploaded successfully!' });
      // Clear error on heroImage if exists
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.heroImage;
        return next;
      });
    } catch (err: unknown) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Upload failed',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Validate form fields prior to submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Title is required.';
    }
    if (!slug.trim()) {
      errors.slug = 'Slug is required.';
    } else if (!validateSlug(slug)) {
      errors.slug = 'Invalid slug format.';
    } else if (slugStatus === 'taken') {
      errors.slug = 'Slug is already taken.';
    }
    if (!htmlContent.trim()) {
      errors.htmlContent = 'HTML content is required.';
    }
    if (!heroImage.trim()) {
      errors.heroImage = 'Hero image URL or upload is required.';
    }
    if (!heroImageAlt.trim()) {
      errors.heroImageAlt = 'Image alt text is required for accessibility and SEO.';
    }
    if (!excerpt.trim()) {
      errors.excerpt = 'Excerpt is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form Submission Handler
  const handleSubmit = (targetStatus?: 'draft' | 'published') => {
    const finalStatus = targetStatus || status;

    if (!validateForm()) {
      setToast({
        type: 'error',
        message: 'Please resolve the highlighted field errors before saving.',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('slug', slug.trim());
    formData.append('htmlContent', htmlContent);
    formData.append('heroImage', heroImage.trim());
    formData.append('heroImageAlt', heroImageAlt.trim());
    formData.append('heroSubtitle', heroSubtitle.trim());
    formData.append('excerpt', excerpt.trim());
    formData.append('imagePosition', imagePosition);
    formData.append('seoTitle', seoTitle.trim() || title.trim());
    formData.append('seoDescription', seoDescription.trim() || excerpt.trim());
    formData.append('canonicalUrl', canonicalUrl.trim());
    formData.append('author', author.trim() || 'Admin');
    formData.append('category', category.trim());
    formData.append('tags', tags.trim());
    formData.append('featured', featured ? '1' : '0');
    formData.append('status', finalStatus);

    startTransition(async () => {
      setToast(null);

      try {
        let res;
        if (action === 'create') {
          res = await createArticleAction(formData);
        } else if (article?.id) {
          res = await updateArticleAction(article.id, formData);
        }

        if (res?.error) {
          setToast({ type: 'error', message: res.error });
          return;
        }

        setToast({
          type: 'success',
          message:
            finalStatus === 'published'
              ? 'Article published successfully!'
              : 'Article saved as draft successfully!',
        });

        // Redirect after short delay so user sees feedback
        setTimeout(() => {
          router.push('/admin/articles');
          router.refresh();
        }, 600);
      } catch (err: unknown) {
        setToast({
          type: 'error',
          message:
            err instanceof Error ? err.message : 'An unexpected error occurred.',
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`flex items-start justify-between rounded-xl border p-4 shadow-sm transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg className="h-5 w-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-text-muted hover:text-text-primary text-sm font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary">
            {action === 'create' ? 'Create New Biography' : `Edit: ${article?.title}`}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {action === 'create'
              ? 'Draft a new biographical profile with rich content, media, and SEO attributes.'
              : 'Update content, publication details, and metadata.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {action === 'edit' && article?.id && (
            <a
              href={`/admin/articles/${article.id}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary shadow-xs hover:bg-surface-alt hover:text-text-primary transition-colors"
            >
              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Preview</span>
            </a>
          )}

          {action === 'create' && (
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              disabled={!htmlContent.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text-secondary shadow-xs hover:bg-surface-alt hover:text-text-primary disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Quick Preview</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-primary shadow-xs hover:bg-surface-alt disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Saving...' : 'Save Draft'}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Publishing...
              </span>
            ) : action === 'edit' && article?.status === 'published' ? (
              'Update Article'
            ) : (
              'Publish Now'
            )}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Content (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-text-primary mb-1">
                Article Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Steve Jobs: The Visionary Who Reimagined Modern Technology"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-text-primary text-base font-medium shadow-xs focus:outline-none focus:ring-2 ${
                  fieldErrors.title
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-border focus:border-brand-500 focus:ring-brand-500/20'
                }`}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
              )}
            </div>

            {/* Slug Field with validation feedback */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="slug" className="block text-sm font-semibold text-text-primary">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                {slugMessage && (
                  <span
                    className={`text-xs font-medium ${
                      slugStatus === 'available'
                        ? 'text-emerald-600'
                        : slugStatus === 'checking'
                        ? 'text-text-muted'
                        : 'text-red-600'
                    }`}
                  >
                    {slugMessage}
                  </span>
                )}
              </div>
              <div className="flex rounded-lg shadow-xs border border-border overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500">
                <span className="inline-flex items-center px-3 bg-surface-alt text-text-muted text-xs font-mono border-r border-border">
                  /
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  onBlur={handleSlugBlur}
                  placeholder="steve-jobs"
                  className="flex-1 bg-surface px-3 py-2 text-sm font-mono text-text-primary focus:outline-none"
                />
              </div>
              {fieldErrors.slug && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.slug}</p>
              )}
              <p className="mt-1 text-xs text-text-muted">
                URL path for this biography. Auto-generated from title, or manually editable.
              </p>
            </div>

            {/* Subtitle */}
            <div>
              <label htmlFor="heroSubtitle" className="block text-sm font-medium text-text-secondary mb-1">
                Hero Subtitle (Optional)
              </label>
              <input
                id="heroSubtitle"
                name="heroSubtitle"
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="A journey from a Silicon Valley garage to transforming the personal computer industry."
                className="w-full rounded-lg border border-border px-3.5 py-2 text-text-primary text-sm shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="excerpt" className="block text-sm font-semibold text-text-primary">
                  Excerpt & Summary <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-text-muted">
                  {excerpt.length} characters (2-3 lines recommended)
                </span>
              </div>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief editorial synopsis shown on cards, article headers, and search result previews..."
                className={`w-full rounded-lg border px-3.5 py-2 text-text-primary text-sm shadow-xs focus:outline-none focus:ring-2 ${
                  fieldErrors.excerpt
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-border focus:border-brand-500 focus:ring-brand-500/20'
                }`}
              />
              {fieldErrors.excerpt && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.excerpt}</p>
              )}
            </div>
          </div>

          {/* HTML Content Editor */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="htmlContent" className="block text-sm font-semibold text-text-primary">
                  Article Body (HTML) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-text-secondary mt-0.5">
                  Write or paste semantic HTML with &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;blockquote&gt;, &lt;figure&gt;. Headings will automatically populate the Table of Contents.
                </p>
              </div>
              <span className="text-xs text-text-muted font-mono">
                {htmlContent.length} chars
              </span>
            </div>

            <textarea
              id="htmlContent"
              name="htmlContent"
              ref={textareaRef}
              required
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="<h2>Early Life and Formative Years</h2>
<p>Born in San Francisco in 1955...</p>

<h2>Building Apple Computer</h2>
<p>In 1976, along with Steve Wozniak...</p>

<blockquote>Innovation distinguishes between a leader and a follower.</blockquote>"
              className={`w-full rounded-lg border px-4 py-3 font-mono text-sm leading-relaxed text-text-primary shadow-xs focus:outline-none focus:ring-2 resize-y min-h-[380px] ${
                fieldErrors.htmlContent
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                  : 'border-border focus:border-brand-500 focus:ring-brand-500/20'
              }`}
            />
            {fieldErrors.htmlContent && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.htmlContent}</p>
            )}
          </div>

          {/* SEO Metadata Card */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-sans text-base font-bold text-text-primary">
                Search Engine Optimization (SEO)
              </h3>
              <p className="text-xs text-text-secondary">
                Customize meta tags for Google, social sharing, and search bots.
              </p>
            </div>

            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="seoTitle" className="block text-sm font-medium text-text-primary">
                  SEO Title
                </label>
                <span className={`text-xs ${seoTitle.length > 60 ? 'text-amber-600 font-medium' : 'text-text-muted'}`}>
                  {seoTitle.length} / 60 recommended
                </span>
              </div>
              <input
                id="seoTitle"
                name="seoTitle"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || 'Steve Jobs Biography: Innovation, Legacy & Key Lessons'}
                className="w-full rounded-lg border border-border px-3.5 py-2 text-text-primary text-sm shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* SEO Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="seoDescription" className="block text-sm font-medium text-text-primary">
                  SEO Meta Description
                </label>
                <span className={`text-xs ${seoDescription.length > 160 ? 'text-amber-600 font-medium' : 'text-text-muted'}`}>
                  {seoDescription.length} / 160 recommended
                </span>
              </div>
              <textarea
                id="seoDescription"
                name="seoDescription"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={excerpt || 'Explore the biography of Steve Jobs, co-founder of Apple Inc.'}
                className="w-full rounded-lg border border-border px-3.5 py-2 text-text-primary text-sm shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {/* Canonical URL */}
            <div>
              <label htmlFor="canonicalUrl" className="block text-sm font-medium text-text-secondary mb-1">
                Canonical URL (Optional)
              </label>
              <input
                id="canonicalUrl"
                name="canonicalUrl"
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://example.com/original-article"
                className="w-full rounded-lg border border-border px-3.5 py-2 text-text-primary text-sm shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Settings, Hero Media, Taxonomy (1 Col) */}
        <div className="space-y-6">
          {/* Publication Status & Action Card */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-text-primary">
              Status & Publishing
            </h3>

            <div>
              <label htmlFor="status" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase">
                Publication Status
              </label>
              <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
              </select>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                id="featured"
                name="featured"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-border text-brand-700 focus:ring-brand-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-text-primary cursor-pointer">
                Mark as Featured Article
              </label>
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase">
                Author
              </label>
              <input
                id="author"
                name="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Admin"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Hero Image & Focal Alignment */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-text-primary">
              Hero Image <span className="text-red-500">*</span>
            </h3>

            {/* URL Input */}
            <div>
              <label htmlFor="heroImage" className="block text-xs font-medium text-text-secondary mb-1">
                Image URL
              </label>
              <input
                id="heroImage"
                name="heroImage"
                type="text"
                required
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="/uploads/jobs.jpg or https://images.unsplash.com/..."
                className={`w-full rounded-lg border px-3 py-2 text-sm text-text-primary shadow-xs focus:outline-none focus:ring-2 ${
                  fieldErrors.heroImage
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-border focus:border-brand-500 focus:ring-brand-500/20'
                }`}
              />
              {fieldErrors.heroImage && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.heroImage}</p>
              )}
            </div>

            {/* File Upload Button */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-alt px-3.5 py-2 text-xs font-semibold text-text-primary shadow-xs hover:bg-surface hover:border-border-strong disabled:opacity-50 transition-colors"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>Upload Image from Computer</span>
                  </>
                )}
              </button>
            </div>

            {/* Image Preview Thumbnail */}
            {heroImage && (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border bg-surface-alt">
                <Image
                  src={heroImage}
                  alt={heroImageAlt || 'Preview'}
                  fill
                  unoptimized
                  className="object-cover"
                  style={{ objectPosition: imagePosition }}
                />
              </div>
            )}

            {/* Hero Image Alt */}
            <div>
              <label htmlFor="heroImageAlt" className="block text-xs font-medium text-text-secondary mb-1">
                Alt Text (Accessibility) <span className="text-red-500">*</span>
              </label>
              <input
                id="heroImageAlt"
                name="heroImageAlt"
                type="text"
                required
                value={heroImageAlt}
                onChange={(e) => setHeroImageAlt(e.target.value)}
                placeholder="Portrait of Steve Jobs holding the first Macintosh in 1984"
                className={`w-full rounded-lg border px-3 py-2 text-sm text-text-primary shadow-xs focus:outline-none focus:ring-2 ${
                  fieldErrors.heroImageAlt
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-border focus:border-brand-500 focus:ring-brand-500/20'
                }`}
              />
              {fieldErrors.heroImageAlt && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.heroImageAlt}</p>
              )}
            </div>

            {/* Focal Position */}
            <div>
              <label htmlFor="imagePosition" className="block text-xs font-medium text-text-secondary mb-1">
                Focal Alignment
              </label>
              <select
                id="imagePosition"
                name="imagePosition"
                value={imagePosition}
                onChange={(e) => setImagePosition(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {IMAGE_POSITION_OPTIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Taxonomy: Category & Tags */}
          <div className="bg-surface rounded-xl border border-border p-6 shadow-xs space-y-4">
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-text-primary">
              Category & Tags
            </h3>

            {/* Category with suggestions */}
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase">
                Category
              </label>
              <input
                id="category"
                name="category"
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Science & Technology"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>

              {/* Quick suggestion badges */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORY_SUGGESTIONS.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="inline-block rounded bg-surface-alt px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-brand-50 hover:text-brand-800 transition-colors"
                  >
                    + {cat.split('&')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags (comma separated) */}
            <div>
              <label htmlFor="tags" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase">
                Tags (Comma-Separated)
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Apple, Silicon Valley, Innovation, Design"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary shadow-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <p className="mt-1 text-xs text-text-muted">
                Tags allow readers to discover related figures and topics.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Modal for Quick Preview in Create Mode */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-alt">
              <div>
                <h3 className="font-sans text-lg font-bold text-text-primary">
                  Preview: {title || 'Untitled Biography'}
                </h3>
                <p className="text-xs text-text-secondary">
                  Rendered HTML presentation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg p-1.5 text-text-muted hover:bg-surface hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
              {heroImage && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border">
                  <Image
                    src={heroImage}
                    alt={heroImageAlt || 'Preview'}
                    fill
                    unoptimized
                    className="object-cover"
                    style={{ objectPosition: imagePosition }}
                  />
                </div>
              )}

              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                  {title || 'Biography Title'}
                </h1>
                {heroSubtitle && (
                  <p className="mt-2 text-lg text-text-secondary italic">
                    {heroSubtitle}
                  </p>
                )}
              </div>

              <div
                className="article-content border-t border-border pt-6"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>

            <div className="border-t border-border px-6 py-3 bg-surface-alt flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg bg-brand-800 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-900"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
