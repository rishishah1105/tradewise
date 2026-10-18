import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, X, Copy, Check, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DatabaseStatusBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { backendStatus, dbStatusText, recheckBackend } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isConnected = backendStatus === 'connected' && dbStatusText.toLowerCase().includes('connected');

  const handleRecheck = async () => {
    setIsChecking(true);
    await recheckBackend();
    setTimeout(() => setIsChecking(false), 600);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Trigger Chip */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none ${
          isConnected
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/10'
            : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 shadow-sm shadow-amber-500/10'
        } ${className}`}
        title="Click to view PostgreSQL Database & Backend status"
      >
        <div className="relative flex items-center justify-center">
          <Database className="w-3.5 h-3.5" />
          <span
            className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
        </div>
        <span>{isConnected ? 'PostgreSQL Connected' : 'Local Offline Mode'}</span>
      </button>

      {/* Info & Settings Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-card border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-light flex items-center gap-2">
                    Database & Backend Integration
                  </h3>
                  <p className="text-xs text-brand-muted">PostgreSQL + Prisma ORM + Express API</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-brand-muted hover:text-brand-light hover:bg-brand-dark transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  isConnected
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                }`}
              >
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-sm">
                    {isConnected ? 'PostgreSQL Database Synchronized' : 'Operating in Safe Offline Mode'}
                  </div>
                  <p className="opacity-90 leading-relaxed">
                    {isConnected
                      ? 'Your profile, trades, portfolio holdings, daily activity streak, and quiz scores are actively synced to PostgreSQL via Prisma ORM.'
                      : 'The backend server is offline or awaiting your PostgreSQL DATABASE_URL. All data is securely preserved in browser local storage and will sync automatically once connected.'}
                  </p>
                </div>
              </div>

              {/* Data Models Synced */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                  PostgreSQL Models Configured
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { name: 'Users & Profile', table: 'User' },
                    { name: 'Portfolio & Cash', table: 'PortfolioHolding' },
                    { name: 'Paper Orders', table: 'TradeOrder' },
                    { name: 'Trade Logs', table: 'TradeLog' },
                    { name: 'Concept Mastery', table: 'MasteredConcept' },
                    { name: 'Activity Heatmap', table: 'ActivityLog' },
                    { name: 'Achievement Badges', table: 'UserBadge' },
                    { name: 'Daily Quests', table: 'DailyQuestState' },
                  ].map(m => (
                    <div
                      key={m.table}
                      className="flex items-center justify-between p-2 rounded-lg bg-brand-dark border border-white/5"
                    >
                      <span className="text-brand-light font-medium">{m.name}</span>
                      <code className="text-[10px] text-brand-orange bg-brand-card px-1.5 py-0.5 rounded">
                        {m.table}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Setup Instructions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                    How to connect Cloud PostgreSQL (Neon / Supabase)
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="bg-brand-dark rounded-xl p-3 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-brand-muted text-[11px]">
                      <span>1. Paste your DB connection string into server/.env</span>
                      <button
                        onClick={() => copyToClipboard('DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/tradewise?sslmode=require"', 1)}
                        className="flex items-center gap-1 text-brand-orange hover:underline cursor-pointer"
                      >
                        {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === 1 ? 'Copied' : 'Copy Example'}</span>
                      </button>
                    </div>
                    <code className="block text-[11px] font-mono text-emerald-300 break-all bg-brand-black/60 p-2 rounded border border-white/5">
                      DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
                    </code>

                    <div className="flex items-center justify-between text-brand-muted text-[11px] pt-1">
                      <span>2. Push Prisma schema & start backend server</span>
                      <button
                        onClick={() => copyToClipboard('npm run db:push && npm run server', 2)}
                        className="flex items-center gap-1 text-brand-orange hover:underline cursor-pointer"
                      >
                        {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === 2 ? 'Copied' : 'Copy Command'}</span>
                      </button>
                    </div>
                    <code className="block text-[11px] font-mono text-brand-light bg-brand-black/60 p-2 rounded border border-white/5">
                      npm run db:push && npm run server
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-brand-dark/50 border-t border-white/5 flex items-center justify-between">
              <a
                href="https://neon.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-muted hover:text-brand-orange flex items-center gap-1 transition-colors"
              >
                <span>Free Cloud PostgreSQL (Neon)</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRecheck}
                  disabled={isChecking}
                  className="px-3 py-1.5 rounded-lg bg-brand-dark hover:bg-brand-card text-brand-light text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Pinging...' : 'Test Connection'}</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-brand-orange text-brand-black text-xs font-bold hover:bg-brand-orange/90 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
