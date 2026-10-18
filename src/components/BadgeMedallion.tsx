import React from 'react';
import {
  BookOpen,
  Award,
  TrendingUp,
  PieChart,
  Zap,
  Target,
  ShieldCheck,
  DollarSign,
  Lock
} from 'lucide-react';
import type { Badge } from '../context/AppContext';

export interface BadgeMedallionProps {
  badge: Badge;
  size?: number;
  className?: string;
  showLock?: boolean;
}

export const getCategoryGradient = (category: string): string => {
  switch (category) {
    case 'learning':
      return 'from-indigo-500 to-blue-700';
    case 'trading':
      return 'from-emerald-500 to-teal-700';
    case 'streak':
      return 'from-rose-500 to-orange-600';
    default:
      return 'from-indigo-500 to-blue-700';
  }
};

export const getBadgeIcon = (iconName: string, iconSize: number) => {
  const iconProps = {
    style: { width: `${iconSize}px`, height: `${iconSize}px` },
    className: 'text-white drop-shadow-md'
  };

  switch (iconName) {
    case 'BookOpen':
      return <BookOpen {...iconProps} />;
    case 'Award':
      return <Award {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'PieChart':
      return <PieChart {...iconProps} />;
    case 'Zap':
      return <Zap {...iconProps} />;
    case 'Target':
      return <Target {...iconProps} />;
    case 'ShieldCheck':
      return <ShieldCheck {...iconProps} />;
    case 'DollarSign':
      return <DollarSign {...iconProps} />;
    default:
      return <Award {...iconProps} />;
  }
};

export const BadgeMedallion: React.FC<BadgeMedallionProps> = ({
  badge,
  size = 88,
  className = '',
  showLock = true
}) => {
  const iconSize = Math.round(size * 0.38);
  const lockSize = Math.max(12, Math.round(size * 0.18));
  const insetPx = Math.max(3, Math.round(size * 0.06));

  const hexClipPath = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)';

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {/* Outer Hexagon */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          clipPath: hexClipPath,
          padding: `${insetPx}px`
        }}
        className={`bg-white/20 transition-all ${
          !badge.unlocked ? 'grayscale opacity-40' : 'drop-shadow-lg'
        }`}
      >
        {/* Inner Hexagon */}
        <div
          style={{
            clipPath: hexClipPath
          }}
          className={`w-full h-full bg-gradient-to-br ${getCategoryGradient(badge.category)} flex items-center justify-center relative shadow-inner`}
        >
          {getBadgeIcon(badge.iconName, iconSize)}
        </div>
      </div>

      {/* Locked Overlay Icon */}
      {!badge.unlocked && showLock && (
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-brand-dark border border-white/20 shadow-md z-10 flex items-center justify-center">
          <Lock
            style={{ width: `${lockSize}px`, height: `${lockSize}px` }}
            className="text-brand-muted"
          />
        </div>
      )}
    </div>
  );
};
