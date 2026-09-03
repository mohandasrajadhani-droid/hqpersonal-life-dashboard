import React from 'react';

interface AppIconProps {
  className?: string;
  size?: number | string;
  withShadow?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({
  className = 'w-10 h-10',
  size,
  withShadow = true,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className} ${
        withShadow ? 'drop-shadow-md' : ''
      }`}
      style={style}
    >
      <img
        src="/app-icon.svg"
        alt="LifeHQ - Personal Life Dashboard Icon"
        className="w-full h-full object-contain rounded-2xl"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
