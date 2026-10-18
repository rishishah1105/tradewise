import React, { type ReactNode } from 'react';
import { SITE } from '../../config/site';

export interface InfoPageLayoutProps {
  title: string;
  showLastUpdated?: boolean;
  children: ReactNode;
}

export const InfoPageLayout: React.FC<InfoPageLayoutProps> = ({
  title,
  showLastUpdated = false,
  children
}) => {
  return (
    <div className="w-full pb-16">
      <div className="bg-brand-card rounded-lg p-6 sm:p-10 shadow-xl space-y-6">
        <div className="border-b border-brand-dark pb-4 space-y-1">
          <h1 className="text-3xl font-bold text-brand-light tracking-tight">{title}</h1>
          {showLastUpdated && (
            <p className="text-xs text-brand-muted">
              Last updated: {SITE.lastUpdated}
            </p>
          )}
        </div>

        <div className="max-w-4xl space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
