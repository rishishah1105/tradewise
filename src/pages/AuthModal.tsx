import React, { useState } from 'react';
import { X, User, Lock, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useApp();
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState('student@iitb.ac.in');
  const [password, setPassword] = useState('••••••••');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-card border border-brand-card rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-brand-muted hover:text-brand-light p-1 rounded-lg hover:bg-brand-dark transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 space-y-1">
          <h3 className="text-lg font-semibold text-brand-light">
            {isSignUp ? 'Create your TradeWise Account' : 'Welcome back to TradeWise'}
          </h3>
          <p className="text-sm text-brand-muted">
            {isSignUp ? 'Start your Indian market financial literacy journey.' : 'Log in to continue your NSE paper-trading portfolio.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-xs font-semibold text-brand-muted block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-dark rounded-lg pl-10 pr-4 py-2.5 text-xs text-brand-light placeholder-brand-muted focus:outline-none focus:border-brand-orange"
                  placeholder="Rishi"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-brand-muted block mb-1">Student / Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-brand-dark border border-brand-dark rounded-lg pl-10 pr-4 py-2.5 text-xs text-brand-light placeholder-brand-muted focus:outline-none focus:border-brand-orange"
                placeholder="student@university.ac.in"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-muted block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-brand-dark border border-brand-dark rounded-lg pl-10 pr-4 py-2.5 text-xs text-brand-light placeholder-brand-muted focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          {isSignUp && (
            <div className="p-3 bg-brand-dark border border-brand-dark rounded-lg text-xs text-brand-muted flex justify-between items-center">
              <span>Starting Virtual Capital:</span>
              <strong className="text-[#10b981] font-bold font-mono">₹1,00,000 INR</strong>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-orange text-brand-black font-bold text-xs shadow-lg shadow-brand-orange/20 hover:scale-[1.02] transition-all"
          >
            {isSignUp ? 'Create Account & Start' : 'Log In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-brand-muted hover:text-brand-light hover:underline font-medium"
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
