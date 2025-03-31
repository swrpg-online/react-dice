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
 * Determines the configuration for D4 dice based on the variant.
 * 
 * @param variant - The D4 variant type ('apex', 'base', or 'standard')
 * @returns The configuration string for the D4 variant
 */
const getD4Config = (variant: D4Variant): string => {
  switch (variant) {
    case 'apex':
      return 'D4Apex-01-Arabic';
    case 'base':
      return 'D4Base-01-Arabic';
    default:
      return 'D4-01-Arabic';
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
 * // Render a standard d20 die
 * <Die type="d20" />
 * 
 * @example
 * // Render a custom themed d6 with specific styling
 * <Die 
 *   type="d6"
 *   theme="custom-theme"
 *   className="large-die"
 *   style={{ width: '100px' }}
 * />
 */
export const Die: React.FC<DieProps> = ({
  type,
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

        // Validate die type
        const isNumericDie = VALID_NUMERIC_DICE.includes(type as NumericDieType);
        if (!isNumericDie && !type.startsWith('narrative-')) {
          throw new Error(`Invalid die type: ${type}. Must be one of ${VALID_NUMERIC_DICE.join(', ')} or start with 'narrative-'`);
        }

        const diceType = isNumericDie ? 'numeric' : 'narrative';
        let assetPath: string;
        
        if (type === 'd4') {
          const d4Config = getD4Config(variant);
          assetPath = `@swrpg-online/art/dice/${diceType}/${d4Config}-${theme}.${format}`;
        } else {
          assetPath = `@swrpg-online/art/dice/${diceType}/${type}-${theme}.${format}`;
        }

        // Import the SVG component
        const module = await import(assetPath);
        
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
  }, [type, format, theme, variant]);

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