import React from 'react';
import { Award, TrendingUp, Zap, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-indigo-400" />;
        let borderClass = 'border-indigo-500/40 bg-slate-900/95';

        if (toast.type === 'xp') {
          icon = <Award className="w-5 h-5 text-amber-400 animate-bounce" />;
          borderClass = 'border-amber-500/50 bg-slate-900/95 shadow-amber-500/20';
        } else if (toast.type === 'trade') {
          icon = <TrendingUp className="w-5 h-5 text-emerald-400" />;
          borderClass = 'border-emerald-500/50 bg-slate-900/95 shadow-emerald-500/20';
        } else if (toast.type === 'badge') {
          icon = <Award className="w-5 h-5 text-teal-400" />;
          borderClass = 'border-teal-500/50 bg-slate-900/95 shadow-teal-500/20';
        } else if (toast.type === 'streak') {
          icon = <Zap className="w-5 h-5 text-amber-500 animate-pulse" />;
          borderClass = 'border-amber-500/50 bg-slate-900/95 shadow-amber-500/20';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderClass} shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in`}
          >
            <div className="p-1 rounded-lg bg-slate-800/80">{icon}</div>
            <div className="flex-1">
              <h5 className="text-xs font-bold text-slate-100">{toast.title}</h5>
              <p className="text-sm text-slate-300 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
