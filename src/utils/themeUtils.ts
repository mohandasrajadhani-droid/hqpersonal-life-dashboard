import { ColorPalette, ThemeMode, FontSize } from '../types';

export interface PaletteInfo {
  id: ColorPalette;
  name: string;
  description: string;
  primaryHex: string;
  hoverHex: string;
  accentHex: string;
  swatchClass: string;
  activeNavClass: string;
  primaryBtnClass: string;
  textAccentClass: string;
  borderAccentClass: string;
  ringClass: string;
  lightBgClass: string;
}

export const PALETTES: Record<ColorPalette, PaletteInfo> = {
  emerald: {
    id: 'emerald',
    name: 'Sage Green',
    description: 'Soft, natural muted green for calm and focus',
    primaryHex: '#387652',
    hoverHex: '#2e6143',
    accentHex: '#4d8f69',
    swatchClass: 'bg-[#387652]',
    activeNavClass: 'bg-[#EDF5F0] text-[#245236] dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold',
    primaryBtnClass: 'bg-[#387652] hover:bg-[#2e6143] text-white',
    textAccentClass: 'text-[#2e6844] dark:text-emerald-400',
    borderAccentClass: 'border-[#387652]',
    ringClass: 'focus:ring-[#387652]/25',
    lightBgClass: 'bg-[#EDF5F0] dark:bg-emerald-950/30 text-[#245236] dark:text-emerald-300',
  },
  blue: {
    id: 'blue',
    name: 'Soft Slate Blue',
    description: 'Calm, airy blue for clarity and peace',
    primaryHex: '#3B729F',
    hoverHex: '#2c5980',
    accentHex: '#528cb9',
    swatchClass: 'bg-[#3B729F]',
    activeNavClass: 'bg-[#EDF4FA] text-[#1E4D70] dark:bg-sky-950/50 dark:text-sky-300 font-semibold',
    primaryBtnClass: 'bg-[#3B729F] hover:bg-[#2c5980] text-white',
    textAccentClass: 'text-[#265B83] dark:text-sky-400',
    borderAccentClass: 'border-[#3B729F]',
    ringClass: 'focus:ring-[#3B729F]/25',
    lightBgClass: 'bg-[#EDF4FA] dark:bg-sky-950/30 text-[#1E4D70] dark:text-sky-300',
  },
  violet: {
    id: 'violet',
    name: 'Soft Lavender',
    description: 'Gentle, contemplative purple with refined warmth',
    primaryHex: '#6A5D8A',
    hoverHex: '#544870',
    accentHex: '#8374a5',
    swatchClass: 'bg-[#6A5D8A]',
    activeNavClass: 'bg-[#F5F3F9] text-[#4A3C6B] dark:bg-purple-950/50 dark:text-purple-300 font-semibold',
    primaryBtnClass: 'bg-[#6A5D8A] hover:bg-[#544870] text-white',
    textAccentClass: 'text-[#56467B] dark:text-purple-400',
    borderAccentClass: 'border-[#6A5D8A]',
    ringClass: 'focus:ring-[#6A5D8A]/25',
    lightBgClass: 'bg-[#F5F3F9] dark:bg-purple-950/30 text-[#4A3C6B] dark:text-purple-300',
  },
  amber: {
    id: 'amber',
    name: 'Soft Warm Amber',
    description: 'Gentle honey gold for a cozy, organic feel',
    primaryHex: '#A46522',
    hoverHex: '#864f14',
    accentHex: '#be7e38',
    swatchClass: 'bg-[#A46522]',
    activeNavClass: 'bg-[#FEF8EE] text-[#784610] dark:bg-amber-950/50 dark:text-amber-300 font-semibold',
    primaryBtnClass: 'bg-[#A46522] hover:bg-[#864f14] text-white',
    textAccentClass: 'text-[#884F14] dark:text-amber-400',
    borderAccentClass: 'border-[#A46522]',
    ringClass: 'focus:ring-[#A46522]/25',
    lightBgClass: 'bg-[#FEF8EE] dark:bg-amber-950/30 text-[#784610] dark:text-amber-300',
  },
  rose: {
    id: 'rose',
    name: 'Muted Rose',
    description: 'Subtle clay rose tone with gentle organic warmth',
    primaryHex: '#A3433F',
    hoverHex: '#85322e',
    accentHex: '#bf5d58',
    swatchClass: 'bg-[#A3433F]',
    activeNavClass: 'bg-[#FEF2F2] text-[#7A2824] dark:bg-rose-950/50 dark:text-rose-300 font-semibold',
    primaryBtnClass: 'bg-[#A3433F] hover:bg-[#85322e] text-white',
    textAccentClass: 'text-[#872F2B] dark:text-rose-400',
    borderAccentClass: 'border-[#A3433F]',
    ringClass: 'focus:ring-[#A3433F]/25',
    lightBgClass: 'bg-[#FEF2F2] dark:bg-rose-950/30 text-[#7A2824] dark:text-rose-300',
  },
  slate: {
    id: 'slate',
    name: 'Mineral Slate',
    description: 'Refined warm gray for quiet minimalism',
    primaryHex: '#4A5568',
    hoverHex: '#36404e',
    accentHex: '#647287',
    swatchClass: 'bg-[#4A5568]',
    activeNavClass: 'bg-[#F4F6F8] text-[#2D3748] dark:bg-slate-800 dark:text-slate-100 font-semibold',
    primaryBtnClass: 'bg-[#4A5568] hover:bg-[#36404e] text-white',
    textAccentClass: 'text-[#3D4756] dark:text-slate-300',
    borderAccentClass: 'border-[#4A5568]',
    ringClass: 'focus:ring-[#4A5568]/25',
    lightBgClass: 'bg-[#F4F6F8] dark:bg-slate-800/80 text-[#2D3748] dark:text-slate-200',
  },
};

export const THEME_MODES: { id: ThemeMode; label: string; description: string }[] = [
  {
    id: 'light',
    label: 'Light Mode',
    description: 'Clean bright canvas with soft slate borders and natural lighting',
  },
  {
    id: 'dark',
    label: 'Dark Mode',
    description: 'Deep slate backdrop that reduces eye strain in low-light environments',
  },
  {
    id: 'high-contrast',
    label: 'High-Contrast Mode',
    description: 'Maximum contrast, 2px borders, bold text, and WCAG AAA legibility',
  },
];

export const FONT_SIZES: { id: FontSize; label: string; sizePx: string; sample: string }[] = [
  { id: 'compact', label: 'Compact', sizePx: '13.5px', sample: 'Dense, space-efficient interface' },
  { id: 'normal', label: 'Standard', sizePx: '15px', sample: 'Balanced, optimal default typography' },
  { id: 'large', label: 'Comfortable', sizePx: '17px', sample: 'Spacious, relaxed reading comfort' },
  { id: 'xlarge', label: 'Extra Large', sizePx: '19px', sample: 'High visibility and large touch targets' },
];

export function getPalette(paletteId?: ColorPalette): PaletteInfo {
  return PALETTES[paletteId || 'emerald'] || PALETTES.emerald;
}
