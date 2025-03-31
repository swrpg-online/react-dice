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
 * Converts a camelCase string to kebab-case.
 * Used for converting React style properties to CSS format.
 * 
 * @param str - The camelCase string to convert
 * @returns The kebab-case version of the string
 * @example
 * toKebabCase('backgroundColor') // returns 'background-color'
 */
const toKebabCase = (str: string) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Processes a React style object into a CSS string.
 * Handles unit conversion for numeric values and property name formatting.
 * 
 * @param style - React style object to process
 * @returns A CSS string representation of the style object
 * @example
 * processStyle({ marginTop: 10, backgroundColor: 'red' })
 * // returns 'margin-top:10px;background-color:red'
 */
const processStyle = (style: React.CSSProperties): string => {
  if (!style) return '';
  return Object.entries(style)
    .map(([key, value]) => {
      const kebabKey = toKebabCase(key);
      // Handle numeric values that need units
      if (typeof value === 'number' && !['opacity', 'zIndex'].includes(key)) {
        return `${kebabKey}:${value}px`;
      }
      return `${kebabKey}:${value}`;
    })
    .join(';');
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
  /** Stores the loaded SVG/image content */
  const [svgContent, setSvgContent] = React.useState<string>('');
  /** Tracks the current loading state of the die asset */
  const [loadingState, setLoadingState] = React.useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  /** Stores any error message during loading */
  const [error, setError] = React.useState<string | null>(null);
  /** Used to track the most recent request to prevent race conditions */
  const requestIdRef = React.useRef<number>(0);

  /**
   * Effect hook to handle loading and managing die assets.
   * Implements:
   * - Asset loading and caching
   * - Race condition prevention
   * - Error handling
   * - Cleanup on unmount
   */
  React.useEffect(() => {
    const abortController = new AbortController();
    const currentRequestId = ++requestIdRef.current;

    /**
     * Generates the asset path based on die type and configuration.
     * Validates die types and throws errors for invalid configurations.
     * 
     * @throws {Error} If the die type is invalid
     * @returns The path to the die asset
     */
    const getAssetPath = () => {
      // Validate die type
      const isNumericDie = VALID_NUMERIC_DICE.includes(type as NumericDieType);
      if (!isNumericDie && !type.startsWith('narrative-')) {
        throw new Error(`Invalid die type: ${type}. Must be one of ${VALID_NUMERIC_DICE.join(', ')} or start with 'narrative-'`);
      }

      const diceType = isNumericDie ? 'numeric' : 'narrative';
      
      if (type === 'd4') {
        const d4Config = getD4Config(variant);
        return `/dice/${diceType}/${d4Config}-${theme}.${format}`;
      }
      
      return `/dice/${diceType}/${type}-${theme}.${format}`;
    };

    /**
     * Asynchronously loads the die asset.
     * Handles both SVG and image formats with proper error handling.
     */
    const loadAsset = async () => {
      try {
        setLoadingState('loading');
        setError(null);

        const assetPath = getAssetPath();
        const module = await import(`@swrpg-online/art${assetPath}`);

        // Check if this is still the most recent request
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (format === 'svg') {
          const response = await fetch(module.default, { signal: abortController.signal });
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.statusText}`);
          }
          const text = await response.text();
          
          // Check again if this is still the most recent request
          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          // Process SVG attributes
          const classAttr = className ? ` class="${className}"` : '';
          const styleAttr = style ? ` style="${processStyle(style)}"` : '';
          const processedSvg = text.replace('<svg', `<svg${classAttr}${styleAttr}`);
          
          setSvgContent(processedSvg);
          setLoadingState('success');
        } else {
          setSvgContent(module.default);
          setLoadingState('success');
        }
      } catch (error) {
        if (!abortController.signal.aborted && currentRequestId === requestIdRef.current) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          console.error(`Failed to load die ${format}:`, errorMessage);
          setError(errorMessage);
          setLoadingState('error');
          setSvgContent('');
        }
      }
    };

    loadAsset();

    // Cleanup function to abort any in-flight requests
    return () => {
      abortController.abort();
    };
  }, [type, format, theme, variant, className, style]);

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

  // Render SVG content
  if (format === 'svg') {
    return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
  }

  // Render image content
  return (
    <img
      src={svgContent}
      alt={`${type} die`}
      className={className}
      style={style}
    />
  );
}; 