import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useApp();
  // Default to Log In mode so existing users can log in faster
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomGooglePrompt, setShowCustomGooglePrompt] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Reset fields to clean state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setIdentifier('');
      setPassword('');
      setIsSignUp(false);
      setShowCustomGooglePrompt(false);
    }
  }, [isOpen]);

  // Initialize official Google Identity Services if client ID is provided
  useEffect(() => {
    if (!isOpen || !googleClientId) return;

    const scriptId = 'google-gsi-client';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // @ts-expect-error google is loaded from external script
        if (window.google?.accounts?.id) {
          // @ts-expect-error google is loaded from external script
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: { credential: string }) => {
              setIsLoading(true);
              const ok = await loginWithGoogle({ email: '', credential: response.credential });
              setIsLoading(false);
              if (ok) onClose();
            },
          });
        }
      };
      document.body.appendChild(script);
    }
  }, [isOpen, googleClientId, loginWithGoogle, onClose]);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    // @ts-expect-error google is loaded from external script
    if (googleClientId && window.google?.accounts?.id) {
      // @ts-expect-error google is loaded from external script
      window.google.accounts.id.prompt();
      return;
    }

    // Fallback: interactive instant Google chooser
    setShowCustomGooglePrompt(true);
  };

  const handleCustomGoogleSignIn = async (selectedEmail: string, selectedName: string) => {
    setIsLoading(true);
    const ok = await loginWithGoogle({
      email: selectedEmail,
      name: selectedName || selectedEmail.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedName || selectedEmail)}&backgroundColor=0284c7`,
    });
    setIsLoading(false);
    if (ok) {
      setShowCustomGooglePrompt(false);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setIsLoading(true);
    const ok = await loginWithGoogle({
      email: identifier,
      name: isSignUp ? (name || identifier.split('@')[0]) : undefined,
    });
    setIsLoading(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111622] border border-white/10 rounded-2xl p-5 sm:p-6 max-w-[390px] w-full shadow-2xl relative overflow-hidden">
        {/* Subtle Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-orange via-amber-400 to-emerald-400" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {showCustomGooglePrompt ? (
          /* Google Account Chooser View */
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-white">Choose a Google Account</h3>
                <p className="text-[11px] text-gray-400">to continue to TradeWise</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleCustomGoogleSignIn('rishi@gmail.com', 'Rishi')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-orange/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-orange text-brand-black font-extrabold flex items-center justify-center text-xs">
                    R
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-brand-orange transition-colors">Rishi</div>
                    <div className="text-[10px] text-gray-400">rishi@gmail.com</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-brand-orange transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleCustomGoogleSignIn('investor@gmail.com', 'Pro Investor')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-orange/40 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-extrabold flex items-center justify-center text-xs">
                    P
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">Pro Investor</div>
                    <div className="text-[10px] text-gray-400">investor@gmail.com</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="text-[11px] font-semibold text-gray-400">Or use another Google email:</div>
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={googleName}
                  onChange={e => setGoogleName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-[#0b0f17] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                />
                <input
                  type="email"
                  value={googleEmail}
                  onChange={e => setGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-[#0b0f17] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomGooglePrompt(false)}
                  className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleCustomGoogleSignIn(googleEmail, googleName)}
                  disabled={isLoading || !googleEmail}
                  className="flex-1 py-1.5 rounded-lg bg-brand-orange hover:bg-amber-400 text-brand-black text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Compact Sign In / Sign Up View */
          <div className="space-y-3.5">
            {/* Header (Clean & Compact) */}
            <div className="text-center space-y-0.5 pt-1">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                {isSignUp ? 'Create an Account' : 'Welcome Back'}
              </h2>
              <p className="text-[11px] text-gray-400">
                {isSignUp ? 'Sign up to start paper-trading.' : 'Sign in with your username or email.'}
              </p>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] border border-gray-200"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Single-Line Divider */}
            <div className="flex items-center gap-2.5 my-1">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap select-none">
                or with email
              </span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {isSignUp && (
                <div>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#0b0f17] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                      placeholder="Username"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="relative">
                  {isSignUp ? (
                    <Mail className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  )}
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                    placeholder={isSignUp ? 'Email address' : 'Username or email'}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                    placeholder="Password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-brand-orange hover:bg-amber-400 text-brand-black font-extrabold text-xs shadow-md shadow-brand-orange/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* Toggle Mode: Default is "Don't have an account? Sign Up" */}
            <div className="text-center pt-1.5 border-t border-white/5">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[11px] text-gray-400 hover:text-brand-orange transition-colors font-medium cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
