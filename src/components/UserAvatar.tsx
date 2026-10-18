import React from 'react';
import { useApp } from '../context/AppContext';

export interface UserAvatarProps {
  size: number;
  className?: string;
  avatarUrl?: string;
  avatarColor?: string;
  name?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  size,
  className = '',
  avatarUrl,
  avatarColor,
  name
}) => {
  const { user } = useApp();

  const effectiveAvatarUrl = avatarUrl !== undefined ? avatarUrl : user.avatarUrl;
  const effectiveAvatarColor = (avatarColor !== undefined ? avatarColor : user.avatarColor) || '#475569';
  const effectiveName = (name !== undefined ? name : user.name) || 'User';

  const getInitials = (n: string): string => {
    if (!n) return 'U';
    const parts = n.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (effectiveAvatarUrl) {
    return (
      <img
        src={effectiveAvatarUrl}
        alt={effectiveName}
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`rounded-full object-cover shrink-0 select-none ${className}`}
      />
    );
  }

  const initials = getInitials(effectiveName);
  const fontSize = Math.max(10, Math.round(size * 0.38));

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: effectiveAvatarColor,
        fontSize: `${fontSize}px`
      }}
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none ${className}`}
    >
      {initials}
    </div>
  );
};
