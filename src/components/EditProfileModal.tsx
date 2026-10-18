import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { useApp, type UserProfile } from '../context/AppContext';
import { UserAvatar } from './UserAvatar';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLORS = [
  '#475569',
  '#4f46e5',
  '#0f766e',
  '#9333ea',
  '#be123c',
  '#0369a1'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, addToast } = useApp();

  const [draft, setDraft] = useState<Partial<UserProfile>>({});
  const [photoError, setPhotoError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize draft when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraft({
        name: user.name,
        handle: user.handle || '',
        bio: user.bio || '',
        institution: user.institution || '',
        city: user.city || '',
        experienceLevel: user.experienceLevel || 'Beginner',
        avatarUrl: user.avatarUrl || '',
        avatarColor: user.avatarColor || '#475569',
        links: {
          linkedin: user.links?.linkedin || '',
          github: user.links?.github || '',
          twitter: user.links?.twitter || ''
        }
      });
      setPhotoError('');
    }
  }, [isOpen, user]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Validation
  const trimmedName = (draft.name || '').trim();
  const nameError =
    trimmedName.length < 2 || trimmedName.length > 40
      ? 'Display name must be between 2 and 40 characters.'
      : '';

  const rawHandle = draft.handle || '';
  const handleValid = !rawHandle || (rawHandle.length >= 3 && rawHandle.length <= 20 && /^[a-z0-9_]+$/.test(rawHandle));
  const handleError = !handleValid
    ? 'Username must be 3–20 characters and contain only lowercase letters, numbers, and underscores.'
    : '';

  const bioLength = draft.bio?.length || 0;
  const bioError = bioLength > 160 ? 'Bio cannot exceed 160 characters.' : '';

  const instLength = draft.institution?.length || 0;
  const instError = instLength > 60 ? 'Institution cannot exceed 60 characters.' : '';

  const cityLength = draft.city?.length || 0;
  const cityError = cityLength > 40 ? 'City cannot exceed 40 characters.' : '';

  const linkedinUrl = draft.links?.linkedin?.trim() || '';
  const linkedinError = linkedinUrl && !linkedinUrl.startsWith('https://') ? 'Must start with https://' : '';

  const githubUrl = draft.links?.github?.trim() || '';
  const githubError = githubUrl && !githubUrl.startsWith('https://') ? 'Must start with https://' : '';

  const twitterUrl = draft.links?.twitter?.trim() || '';
  const twitterError = twitterUrl && !twitterUrl.startsWith('https://') ? 'Must start with https://' : '';

  const hasErrors = Boolean(
    nameError ||
    handleError ||
    bioError ||
    instError ||
    cityError ||
    linkedinError ||
    githubError ||
    twitterError ||
    photoError
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Only PNG, JPEG, or WebP images are allowed.');
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setPhotoError('Image must be 2 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setPhotoError('Could not process image on this browser.');
          return;
        }

        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 256, 256);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setDraft(prev => ({ ...prev, avatarUrl: dataUrl }));
      };
      img.onerror = () => {
        setPhotoError('Failed to load image file.');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setPhotoError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setDraft(prev => ({ ...prev, avatarUrl: '' }));
    setPhotoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (hasErrors) return;

    updateProfile({
      name: trimmedName,
      handle: draft.handle ? draft.handle.toLowerCase().trim() : '',
      bio: draft.bio?.trim() || '',
      institution: draft.institution?.trim() || '',
      city: draft.city?.trim() || '',
      experienceLevel: draft.experienceLevel || 'Beginner',
      avatarUrl: draft.avatarUrl || '',
      avatarColor: draft.avatarColor || '#475569',
      links: {
        linkedin: linkedinUrl,
        github: githubUrl,
        twitter: twitterUrl
      }
    });

    addToast('Profile updated', 'Your changes have been saved.', 'info');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-brand-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-white/5 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-dark pb-4">
          <h2 className="text-xl font-bold text-brand-light">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-brand-muted hover:text-brand-light p-1 rounded-lg hover:bg-brand-dark cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo & Color Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 bg-brand-dark/50 rounded-xl">
          <div className="shrink-0">
            <UserAvatar
              size={80}
              name={draft.name}
              avatarUrl={draft.avatarUrl}
              avatarColor={draft.avatarColor}
            />
          </div>

          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div>
              <span className="text-sm font-semibold text-brand-light block">Profile Photo</span>
              <span className="text-xs text-brand-muted">PNG, JPG or WebP up to 2 MB. Auto-cropped to 256×256.</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
                id="profile-photo-input"
              />
              <label
                htmlFor="profile-photo-input"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-dark text-brand-light hover:bg-brand-dark/80 text-xs font-semibold cursor-pointer border border-white/5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload photo
              </label>

              {draft.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold cursor-pointer border border-red-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove photo
                </button>
              )}
            </div>

            {photoError && (
              <p className="text-[#ef4444] text-xs">{photoError}</p>
            )}

            {/* Avatar Color Swatches */}
            <div className="pt-2">
              <span className="text-xs text-brand-muted block mb-1.5">Avatar tone (used when no photo):</span>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, avatarColor: color }))}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      draft.avatarColor === color
                        ? 'ring-2 ring-brand-light scale-110'
                        : 'hover:scale-105'
                    }`}
                    aria-label={`Select avatar color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Display Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-light block">
              Display Name <span className="text-brand-orange">*</span>
            </label>
            <input
              type="text"
              value={draft.name || ''}
              onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
              className="w-full bg-brand-dark rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none"
            />
            {nameError && <p className="text-[#ef4444] text-xs">{nameError}</p>}
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-light block">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm text-brand-muted">@</span>
              <input
                type="text"
                value={draft.handle || ''}
                onChange={e =>
                  setDraft(prev => ({
                    ...prev,
                    handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                  }))
                }
                placeholder="username"
                className="w-full bg-brand-dark rounded-lg pl-7 pr-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none"
              />
            </div>
            {handleError && <p className="text-[#ef4444] text-xs">{handleError}</p>}
          </div>

          {/* Bio (Full width) */}
          <div className="space-y-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-brand-light block">Bio</label>
              <span className={`text-[11px] ${bioLength > 160 ? 'text-[#ef4444]' : 'text-brand-muted'}`}>
                {bioLength}/160
              </span>
            </div>
            <textarea
              rows={2}
              value={draft.bio || ''}
              onChange={e => setDraft(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell others about your investing journey..."
              className="w-full bg-brand-dark rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none resize-none"
            />
            {bioError && <p className="text-[#ef4444] text-xs">{bioError}</p>}
          </div>

          {/* Institution / College */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-light block">Institution / College</label>
            <input
              type="text"
              value={draft.institution || ''}
              onChange={e => setDraft(prev => ({ ...prev, institution: e.target.value }))}
              placeholder="e.g. SPIT Mumbai"
              className="w-full bg-brand-dark rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none"
            />
            {instError && <p className="text-[#ef4444] text-xs">{instError}</p>}
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-light block">City</label>
            <input
              type="text"
              value={draft.city || ''}
              onChange={e => setDraft(prev => ({ ...prev, city: e.target.value }))}
              placeholder="e.g. Mumbai"
              className="w-full bg-brand-dark rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none"
            />
            {cityError && <p className="text-[#ef4444] text-xs">{cityError}</p>}
          </div>

          {/* Experience Level */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-brand-light block">Experience Level</label>
            <select
              value={draft.experienceLevel || 'Beginner'}
              onChange={e =>
                setDraft(prev => ({
                  ...prev,
                  experienceLevel: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced'
                }))
              }
              className="w-full bg-brand-dark rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none cursor-pointer"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Links: LinkedIn */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-light block">LinkedIn URL</label>
            <input
              type="url"
              value={draft.links?.linkedin || ''}
              onChange={e =>
                setDraft(prev => ({
                  ...prev,
                  links: { ...prev.links, linkedin: e.target.value }
                }))
              }
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-brand-dark rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none"
            />
            {linkedinError && <p className="text-[#ef4444] text-xs">{linkedinError}</p>}
          </div>

          {/* Links: GitHub */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-light block">GitHub URL</label>
            <input
              type="url"
              value={draft.links?.github || ''}
              onChange={e =>
                setDraft(prev => ({
                  ...prev,
                  links: { ...prev.links, github: e.target.value }
                }))
              }
              placeholder="https://github.com/username"
              className="w-full bg-brand-dark rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none"
            />
            {githubError && <p className="text-[#ef4444] text-xs">{githubError}</p>}
          </div>

          {/* Links: X (Twitter) */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold text-brand-light block">X (Twitter) URL</label>
            <input
              type="url"
              value={draft.links?.twitter || ''}
              onChange={e =>
                setDraft(prev => ({
                  ...prev,
                  links: { ...prev.links, twitter: e.target.value }
                }))
              }
              placeholder="https://x.com/username"
              className="w-full bg-brand-dark rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none"
            />
            {twitterError && <p className="text-[#ef4444] text-xs">{twitterError}</p>}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-dark">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-brand-muted hover:text-brand-light hover:bg-brand-dark cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={hasErrors}
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-brand-orange text-brand-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
