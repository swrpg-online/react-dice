import { CSSProperties } from 'react';

export type DieType =
  | 'boost'
  | 'proficiency'
  | 'ability'
  | 'setback'
  | 'challenge'
  | 'difficulty'
  | 'd4'
  | 'd6'
  | 'd8'
  | 'd12'
  | 'd20'
  | 'd100';

export type DieFormat = 'svg' | 'png';

export type DieTheme = 'light' | 'dark';

export type D4Variant = 'standard' | 'apex' | 'base';

export interface DieProps {
  /** The type of die to display */
  type: DieType;
  /** The format of the die asset to display */
  format?: DieFormat;
  /** The color theme of the die */
  theme?: DieTheme;
  /** The variant of the d4 die (only applicable when type is 'd4') */
  variant?: D4Variant;
  /** Additional CSS class names to apply to the die */
  className?: string;
  /** Additional inline styles to apply to the die */
  style?: CSSProperties;
} 