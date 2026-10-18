import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldAlert, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination?: string;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  destination = 'dashboard',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [authConfig, setAuthConfig] = useState<{
    isConfigured: boolean;
    clientId?: string | null;
    redirectUri?: string;
    missing?: string[];
  } | null>(null);

  // Check backend Google OAuth configuration status when opened
  const checkConfig = async () => {
    setIsCheckingConfig(true);
    try {
      const config = await api.getAuthConfig();
      if (config) {
        setAuthConfig(config);
      } else {
        setAuthConfig({ isConfigured: false, missing: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] });
      }
    } catch {
      setAuthConfig({ isConfigured: false, missing: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] });
    } finally {
      setIsCheckingConfig(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkConfig();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinueWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await api.getGoogleAuthUrl(destination);
      if (res?.isConfigured && res.url) {
        // Genuine redirect to Google's OAuth 2.0 authorization endpoint
        window.location.href = res.url;
        return;
      } else if (res && !res.isConfigured) {
        setAuthConfig({
          isConfigured: false,
          missing: res.missing || ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
        });
      }
    } catch (err) {
      console.error('[AuthModal] Failed to initiate Google OAuth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111622] border border-white/10 rounded-2xl p-6 max-w-[420px] w-full shadow-2xl relative overflow-hidden">
        {/* Accent Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-orange via-amber-400 to-emerald-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-4 h-4" />
        </button>

        {isCheckingConfig ? (
          /* Loading State */
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-brand-orange animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Verifying Google OAuth service...</p>
          </div>
        ) : authConfig?.isConfigured ? (
          /* Configured State: Genuine Google OAuth Button */
          <div className="space-y-5 pt-2">
            <div className="text-center space-y-1.5">
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                Sign in to TradeWise
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                Sign in with Google to securely access your simulated portfolio, watchlists, and learning progress.
              </p>
            </div>

            <button
              type="button"
              onClick={handleContinueWithGoogle}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/5 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] border border-gray-200 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-700" />
                  <span>Redirecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-white/5 text-center">
              <p className="text-[11px] text-gray-500">
                You will be redirected to Google to verify your account.
              </p>
            </div>
          </div>
        ) : (
          /* Unconfigured State: Single Clear Actionable Error (No Fake Accounts) */
          <div className="space-y-4 pt-1 animate-fade-in">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 text-amber-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">Google OAuth Setup Required</h3>
                <p className="text-[11px] text-gray-400">Genuine Google credentials must be set</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              TradeWise enforces genuine Google OAuth 2.0 authentication. The backend has not been supplied with Google Cloud credentials yet.
            </p>

            <div className="bg-[#0b0f17] border border-white/5 rounded-xl p-3 text-xs space-y-2 font-mono">
              <div className="text-[11px] text-gray-400 font-sans font-semibold">
                Set these in <span className="text-amber-400">server/.env</span>:
              </div>
              <div className="space-y-1 text-[11px] text-gray-300 select-all">
                <div>GOOGLE_CLIENT_ID=&quot;your-id.apps.googleusercontent.com&quot;</div>
                <div>GOOGLE_CLIENT_SECRET=&quot;your-secret&quot;</div>
              </div>
              <div className="pt-2 border-t border-white/5 text-[10px] text-gray-400 font-sans space-y-1">
                <div>• <span className="text-white">Authorized Origin:</span> <code className="text-emerald-400">http://localhost:5173</code></div>
                <div>• <span className="text-white">Authorized Callback:</span> <code className="text-emerald-400">http://localhost:5000/api/auth/google/callback</code></div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-brand-orange hover:underline font-semibold"
              >
                <span>Google Cloud Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={checkConfig}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
