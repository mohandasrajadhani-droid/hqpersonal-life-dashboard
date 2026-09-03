import React from 'react';
import { LucideIcon, Plus, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  buttonText?: string;
  onAction?: () => void;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  buttonText,
  onAction,
  id = 'empty-state-card',
}) => {
  const label = actionLabel || buttonText;

  return (
    <div
      id={id}
      className="flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-2xl bg-[#FAFBF9] border border-dashed border-slate-200/80 dark:bg-slate-900/30 dark:border-slate-800 transition-colors my-2"
    >
      <div className="w-11 h-11 rounded-xl bg-[#EDF5F0] dark:bg-emerald-950/40 flex items-center justify-center text-[#2E6844] dark:text-emerald-400 mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {label && onAction && (
        <button
          id={`${id}-action-btn`}
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#387652] hover:bg-[#2E6143] text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}
    </div>
  );
};
