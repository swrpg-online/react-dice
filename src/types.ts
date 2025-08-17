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

export type DieTheme =
  | 'white-arabic'
  | 'white-aurebesh'
  | 'black-arabic'
  | 'black-aurebesh'
  | 'anh-arabic'
  | 'anh-aurebesh'
  | 'aotc-arabic'
  | 'aotc-aurebesh'
  | 'rotj-arabic'
  | 'rotj-aurebesh'
  | 'rots-arabic'
  | 'rots-aurebesh'
  | 'tesb-arabic'
  | 'tesb-aurebesh'
  | 'tfa-arabic'
  | 'tfa-aurebesh'
  | 'tlj-arabic'
  | 'tlj-aurebesh'
  | 'tpm-arabic'
  | 'tpm-aurebesh'
  | 'tros-arabic'
  | 'tros-aurebesh';

export type D4Variant = 'standard' | 'apex' | 'base';

/** Enum for loading states to avoid magic strings */
export enum LoadingState {
  Loading = 'loading',
  Success = 'success',
  Error = 'error'
}

/** Possible results on narrative dice */
export type NarrativeResult =
  | 'Blank'
  | 'Success'
  | 'Failure'
  | 'Advantage'
  | 'Threat'
  | 'Triumph'
  | 'Despair'
  | '1x-Solid'
  | '1x-Hollow'
  | '2x-Solid'
  | '2x-Hollow';

/** Face value for narrative dice - can be a single result or two results */
export type NarrativeFace = NarrativeResult | `${NarrativeResult}-${NarrativeResult}`;

export interface DieProps {
  /** The type of die to display */
  type: DieType;
  /** 
   * The face to display:
   * - For numeric dice: number (1-based, for d100 use 0-90 in steps of 10)
   * - For narrative dice: result(s) (e.g., 'Success', 'Advantage-Advantage')
   */
  face?: number | NarrativeFace;
  /** The format of the die asset to display */
  format?: DieFormat;
  /** 
   * The color theme and numeral system of the die.
   * Format: 'style-script' (e.g., 'white-arabic', 'black-aurebesh')
   * Defaults to 'white-arabic' if invalid or missing.
   */
  theme?: DieTheme | string;
  /** The variant of the d4 die (only applicable when type is 'd4') */
  variant?: D4Variant;
  /** Additional CSS class names to apply to the die */
  className?: string;
  /** Additional inline styles to apply to the die */
  style?: CSSProperties;
} 