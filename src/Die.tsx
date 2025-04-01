/**
 * @fileoverview A React component for rendering various types of dice (numeric and narrative) 
 * with support for different themes and formats.
 */

import * as React from 'react';
import { DieProps, D4Variant } from './types';

/** Default theme for dice rendering */
const DEFAULT_THEME = 'white-arabic';
/** Default format for dice assets */
const DEFAULT_FORMAT = 'svg';
/** Default variant for D4 dice */
const DEFAULT_D4_VARIANT = 'standard';

/** Array of valid numeric die types */
const VALID_NUMERIC_DICE = ['d4', 'd6', 'd8', 'd12', 'd20', 'd100'] as const;
/** Type representing valid numeric die values */
type NumericDieType = typeof VALID_NUMERIC_DICE[number];

/**
 * Gets the maximum face value for a given die type
 */
const getMaxFace = (type: NumericDieType): number => {
  switch (type) {
    case 'd4':
      return 4;
    case 'd6':
      return 6;
    case 'd8':
      return 8;
    case 'd12':
      return 12;
    case 'd20':
      return 20;
    case 'd100':
      return 90; // d100 uses 0-90 in steps of 10
    default:
      return 1;
  }
};

/**
 * Formats the face number as a two-digit string
 */
const formatFaceNumber = (face: number): string => {
  return face.toString().padStart(2, '0');
};

/**
 * Determines the configuration for D4 dice based on the variant.
 * 
 * @param variant - The D4 variant type ('apex', 'base', or 'standard')
 * @returns The configuration string for the D4 variant
 */
const getD4Config = (variant: D4Variant): string => {
  switch (variant) {
    case 'apex':
      return 'D4Apex';
    case 'base':
      return 'D4Base';
    default:
      return 'D4';
  }
};

/**
 * Extracts theme components from the theme string.
 * For example, 'white-arabic' becomes { style: 'White', script: 'Arabic' }
 */
const parseTheme = (theme: string): { style: string; script: string } => {
  const [style, script] = theme.split('-');
  return {
    style: style.charAt(0).toUpperCase() + style.slice(1),
    script: script.charAt(0).toUpperCase() + script.slice(1)
  };
};

/**
 * Gets the proper die type name for the asset path
 */
const getDieTypeName = (type: string): string => {
  switch (type) {
    case 'boost':
      return 'Boost';
    case 'proficiency':
      return 'Proficiency';
    case 'ability':
      return 'Ability';
    case 'setback':
      return 'Setback';
    case 'challenge':
      return 'Challenge';
    case 'difficulty':
      return 'Difficulty';
    default:
      return type.replace('d', 'D');
  }
};

/**
 * A React component that renders dice for tabletop gaming applications.
 * Supports both numeric (d4, d6, etc.) and narrative dice types with various themes and formats.
 * 
 * Features:
 * - Supports SVG and image formats
 * - Handles multiple D4 variants
 * - Provides loading and error states
 * - Prevents race conditions in async loading
 * - Supports custom styling and theming
 * - Implements proper cleanup on unmount
 * 
 * @component
 * @example
 * // Render a standard d20 showing face 20
 * <Die type="d20" face={20} />
 * 
 * @example
 * // Render a boost die showing two advantages
 * <Die 
 *   type="boost"
 *   face="Advantage-Advantage"
 *   className="large-die"
 *   style={{ width: '100px' }}
 * />
 */
export const Die: React.FC<DieProps> = ({
  type,
  face = 1,
  format = DEFAULT_FORMAT,
  theme = DEFAULT_THEME,
  variant = DEFAULT_D4_VARIANT,
  className,
  style,
}) => {
  /** Stores the loaded SVG component */
  const [DiceComponent, setDiceComponent] = React.useState<React.ComponentType<React.SVGProps<SVGSVGElement>> | null>(null);
  /** Tracks the current loading state of the die asset */
  const [loadingState, setLoadingState] = React.useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  /** Stores any error message during loading */
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadAsset = async () => {
      try {
        setLoadingState('loading');
        setError(null);

        // Determine if this is a numeric or narrative die
        const isNumericDie = VALID_NUMERIC_DICE.includes(type as NumericDieType);

        // Validate die type and face value
        if (!isNumericDie && !type.startsWith('narrative-')) {
          throw new Error(`Invalid die type: ${type}. Must be one of ${VALID_NUMERIC_DICE.join(', ')} or start with 'narrative-'`);
        }

        let assetPath: string;
        
        if (isNumericDie) {
          // Validate numeric face value
          if (typeof face !== 'number') {
            throw new Error(`Numeric dice require a number for the face value, got: ${face}`);
          }
          const maxFace = getMaxFace(type as NumericDieType);
          if (type === 'd100') {
            if (face < 0 || face > maxFace || face % 10 !== 0) {
              throw new Error(`Invalid face for d100: ${face}. Must be between 0 and 90 in steps of 10.`);
            }
          } else if (face < 1 || face > maxFace) {
            throw new Error(`Invalid face for ${type}: ${face}. Must be between 1 and ${maxFace}.`);
          }

          // Construct numeric die path
          const { style: themeStyle, script: themeScript } = parseTheme(theme);
          if (type === 'd4') {
            const d4Config = getD4Config(variant);
            assetPath = `@swrpg-online/art/dice/numeric/${theme}/${d4Config}-${formatFaceNumber(face)}-${themeStyle}-${themeScript}.${format}`;
          } else {
            const baseName = type.replace('d', 'D');
            assetPath = `@swrpg-online/art/dice/numeric/${theme}/${baseName}-${formatFaceNumber(face)}-${themeStyle}-${themeScript}.${format}`;
          }
        } else {
          // Validate narrative face value
          if (typeof face !== 'string') {
            throw new Error(`Narrative dice require a string for the face value, got: ${face}`);
          }

          // Construct narrative die path
          const dieTypeName = getDieTypeName(type);
          assetPath = `@swrpg-online/art/dice/narrative/${dieTypeName}-${face}.${format}`;
        }

        // Import the SVG component
        const module = await import(/* @vite-ignore */ assetPath);
        
        if (isMounted) {
          setDiceComponent(() => module.default);
          setLoadingState('success');
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`Failed to load die ${format}:`, errorMessage);
          setError(errorMessage);
          setLoadingState('error');
          setDiceComponent(null);
        }
      }
    };

    loadAsset();

    return () => {
      isMounted = false;
    };
  }, [type, face, format, theme, variant]);

  // Render error state
  if (loadingState === 'error') {
    return (
      <div className={className} style={style} role="alert">
        Error loading die: {error}
      </div>
    );
  }

  // Render loading state
  if (loadingState === 'loading' || loadingState === 'idle') {
    return (
      <div className={className} style={style} role="status">
        <span>Loading {type} die...</span>
      </div>
    );
  }

  // Render the SVG component
  if (DiceComponent) {
    return <DiceComponent className={className} style={style} />;
  }

  return null;
}; 