import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Download, Share2, Copy, Loader2, CandlestickChart } from 'lucide-react';
import { toBlob } from 'html-to-image';
import type { Badge } from '../context/AppContext';
import { useApp } from '../context/AppContext';
import { BadgeMedallion } from './BadgeMedallion';

export interface BadgeModalProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ badge, isOpen, onClose }) => {
  const { user, addToast } = useApp();

  const [spinKey, setSpinKey] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasSettled, setHasSettled] = useState<boolean>(false);

  const shareCardRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reset spin and settled state when modal opens or badge changes
  useEffect(() => {
    if (isOpen && badge?.unlocked) {
      setSpinKey(prev => prev + 1);
      setHasSettled(false);
      const timer = setTimeout(() => {
        setHasSettled(true);
      }, prefersReducedMotion ? 0 : 1600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, badge?.id, badge?.unlocked, prefersReducedMotion]);

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

  if (!isOpen || !badge) return null;

  const hexClipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)';

  const handleMedallionClick = () => {
    if (!badge.unlocked || prefersReducedMotion) return;
    setSpinKey(prev => prev + 1);
    setHasSettled(false);
    setTimeout(() => {
      setHasSettled(true);
    }, 1600);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!badge.unlocked || prefersReducedMotion || !hasSettled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const shareText = `I just earned the "${badge.title}" badge on TradeWise 🏅 Learning to invest in Indian markets — ${window.location.origin}`;

  const renderShareImage = async (): Promise<Blob> => {
    if (!shareCardRef.current) {
      throw new Error('Share card element not found');
    }
    const blob = await toBlob(shareCardRef.current, {
      pixelRatio: 1,
      cacheBust: true
    });
    if (!blob) throw new Error('Could not generate share image');
    return blob;
  };

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const blob = await renderShareImage();
      const file = new File([blob], `tradewise-badge-${badge.id}.png`, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `TradeWise Badge: ${badge.title}`,
            text: shareText
          });
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') {
            // User cancelled share dialog
            return;
          }
          throw err;
        }
      } else {
        // Fallback: download PNG and copy text
        downloadBlob(blob);
        await navigator.clipboard.writeText(shareText);
        addToast('Image downloaded and caption copied', 'You can now paste it anywhere!', 'info');
      }
    } catch {
      addToast('Share failed', 'Could not generate or share the badge image.', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradewise-badge-${badge.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await renderShareImage();
      downloadBlob(blob);
      addToast('Badge downloaded', 'Your badge image is ready in your downloads.', 'info');
    } catch {
      addToast('Download failed', 'Could not export badge image.', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      addToast('Caption copied', 'Badge share text copied to clipboard.', 'info');
    } catch {
      addToast('Copy failed', 'Could not copy caption to clipboard.', 'info');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-brand-card rounded-2xl p-6 sm:p-8 w-full max-w-md text-center relative shadow-2xl border border-white/5 space-y-6"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-brand-muted hover:text-brand-light p-1.5 rounded-lg hover:bg-brand-dark cursor-pointer transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Spin and Tilt Medallion Container */}
        <div
          style={{ perspective: '1000px' }}
          className="flex justify-center pt-2"
        >
          <div
            onClick={handleMedallionClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform:
                !prefersReducedMotion && hasSettled
                  ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                  : undefined,
              transition:
                hasSettled && tilt.x === 0 && tilt.y === 0
                  ? 'transform 0.4s ease-out'
                  : undefined,
              cursor: badge.unlocked ? 'pointer' : 'default'
            }}
            className="relative w-[200px] h-[200px] flex items-center justify-center select-none"
            title={badge.unlocked ? 'Click to replay spin' : undefined}
          >
            <div
              key={spinKey}
              style={{
                transformStyle: 'preserve-3d',
              }}
              className={`w-full h-full relative ${
                badge.unlocked && !prefersReducedMotion ? 'animate-badge-spin' : ''
              }`}
            >
              {/* Front Face */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <BadgeMedallion badge={badge} size={200} showLock={false} />

                {/* Light sweep overlay on unlock */}
                {badge.unlocked && (
                  <div
                    style={{
                      clipPath: hexClipPath,
                    }}
                    className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-transparent via-white to-transparent"
                  />
                )}
              </div>

              {/* Back Face */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    clipPath: hexClipPath,
                    padding: '8px'
                  }}
                  className="bg-white/10"
                >
                  <div
                    style={{ clipPath: hexClipPath }}
                    className="w-full h-full bg-[#1e2030] flex flex-col items-center justify-center text-center p-4 border border-white/5 space-y-2"
                  >
                    <div className="w-10 h-10 rounded-lg bg-brand-dark flex items-center justify-center">
                      <CandlestickChart className="w-6 h-6 text-brand-orange" />
                    </div>
                    <span className="text-xs font-bold text-brand-light">TradeWise</span>
                    <span className="text-[10px] text-brand-muted">
                      {badge.unlocked ? `Earned ${badge.unlockedAt || 'Recently'}` : 'Locked Milestone'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Metadata Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-2xl font-bold text-brand-light">{badge.title}</h3>
            {!badge.unlocked && (
              <span className="px-2 py-0.5 rounded-full bg-brand-dark text-[10px] font-bold text-brand-muted border border-white/5 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>

          <p className="text-sm text-brand-muted max-w-sm mx-auto leading-relaxed">
            {badge.unlocked ? badge.description : `How to unlock: ${badge.description}`}
          </p>

          <div className="flex items-center justify-center gap-2 pt-1 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-dark text-brand-light font-semibold capitalize border border-white/5">
              {badge.category}
            </span>
            {badge.unlocked && (
              <span className="text-brand-muted">
                Earned {badge.unlockedAt || 'Recently'}
              </span>
            )}
          </div>
        </div>

        {/* Social Sharing Controls (Unlocked Badges Only) */}
        {badge.unlocked && (
          <div className="space-y-3 pt-3 border-t border-brand-dark">
            <div className="flex items-center justify-center gap-2">
              {/* Primary Share Button */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleShare}
                className="flex-1 py-2 px-3 rounded-xl bg-brand-light text-brand-black hover:bg-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>Share Badge</span>
              </button>

              {/* Download Button */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleDownload}
                className="p-2 rounded-xl bg-brand-dark text-brand-light hover:bg-brand-dark/80 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 border border-white/5"
                title="Download PNG"
                aria-label="Download badge image"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Copy Caption Button */}
              <button
                type="button"
                onClick={handleCopyText}
                className="p-2 rounded-xl bg-brand-dark text-brand-light hover:bg-brand-dark/80 text-xs font-semibold transition-colors cursor-pointer border border-white/5"
                title="Copy Caption"
                aria-label="Copy caption"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Social Platform Direct Share Buttons */}
            <div className="flex items-center justify-center gap-2 text-xs">
              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-lg bg-brand-dark text-brand-light hover:bg-brand-dark/80 flex items-center justify-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer border border-white/5"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-lg bg-brand-dark text-brand-light hover:bg-brand-dark/80 flex items-center justify-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer border border-white/5"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.25 1.62 1.62 0 0 0 0 3.25m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2 rounded-lg bg-brand-dark text-brand-light hover:bg-brand-dark/80 flex items-center justify-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer border border-white/5"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z" />
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Off-screen 1200x630 Share Card Element */}
        <div
          ref={shareCardRef}
          style={{
            position: 'fixed',
            left: '-10000px',
            top: 0,
            width: '1200px',
            height: '630px',
            zIndex: -100
          }}
          className="bg-gradient-to-br from-[#0b0f19] to-[#38384A] p-16 flex items-center justify-between gap-12 font-sans select-none text-left"
        >
          {/* Left: Medallion */}
          <div className="shrink-0 flex items-center justify-center">
            <BadgeMedallion badge={badge} size={260} showLock={false} />
          </div>

          {/* Right: Badge and User Details */}
          <div className="flex-1 flex flex-col justify-between h-full py-4 text-brand-light">
            <div className="space-y-3">
              <span className="text-2xl text-brand-muted uppercase tracking-wider font-semibold">
                I earned the
              </span>
              <h1 className="text-5xl font-black text-brand-light tracking-tight leading-tight">
                {badge.title}
              </h1>
              <span className="text-2xl text-brand-muted font-medium block">
                badge on TradeWise
              </span>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-brand-light">{user.name}</span>
                {user.handle && (
                  <span className="text-xl text-brand-muted">@{user.handle}</span>
                )}
              </div>
              <span className="text-base text-brand-muted block">
                Earned {badge.unlockedAt || 'Recently'}
              </span>
            </div>

            <div className="pt-4 text-xs text-brand-muted/80 tracking-wide uppercase font-semibold">
              TradeWise — learn to invest in Indian markets
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
