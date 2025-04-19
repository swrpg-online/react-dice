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
 * 
 * Note: The actual filenames use script-style order (e.g., 'Arabic-White') 
 * rather than style-script order, which is handled when constructing the import path.
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
 * Constructs the image path for a die based on its properties
 */
const constructImagePath = (
  type: string,
  face: number | string,
  theme: string,
  format: string,
  variant: D4Variant
): string => {
  const isNumericDie = VALID_NUMERIC_DICE.includes(type as NumericDieType);
  const { style: themeStyle, script: themeScript } = parseTheme(theme);
  
  // Use a relative path without leading slash for better compatibility
  // This assumes the @swrpg-online/art package is properly installed and accessible
  const basePath = './node_modules/@swrpg-online/art/dice';
  
  if (isNumericDie) {
    const faceStr = formatFaceNumber(face as number);
    if (type === 'd4') {
      const d4Config = getD4Config(variant);
      return `${basePath}/numeric/${theme}/${d4Config}-${faceStr}-${themeScript}-${themeStyle}.${format}`;
    } else {
      const dieType = getDieTypeName(type);
      return `${basePath}/numeric/${theme}/${dieType}-${faceStr}-${themeScript}-${themeStyle}.${format}`;
    }
  } else {
    const dieTypeName = getDieTypeName(type);
    return `${basePath}/narrative/${dieTypeName}/${dieTypeName}-${face}.${format}`;
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
 * - Supports custom styling and theming
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
  // State to track loading and error states
  const [loadingState, setLoadingState] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = React.useState<string | null>(null);
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);
  
  // On mount and when props change, validate and set the image path
  React.useEffect(() => {
    setLoadingState('loading');
    setError(null);
    
    try {
      // Validate die type
      const isNumericDie = VALID_NUMERIC_DICE.includes(type as NumericDieType);
      if (!isNumericDie && !['boost', 'proficiency', 'ability', 'setback', 'challenge', 'difficulty'].includes(type)) {
        throw new Error(`Invalid die type: ${type}. Must be one of ${VALID_NUMERIC_DICE.join(', ')} or a valid narrative die type`);
      }
      
      // Validate face value
      if (isNumericDie) {
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
      } else {
        if (typeof face !== 'string') {
          throw new Error(`Narrative dice require a string for the face value, got: ${face}`);
        }
      }
      
      // All validation passed, construct the image path
      const imagePath = constructImagePath(type, face, theme, format, variant);
      console.log(`Attempting to load die: ${type}, face: ${face}, path: ${imagePath}`);
      setImgSrc(imagePath);
    } catch (validationError) {
      const errorMessage = validationError instanceof Error ? validationError.message : 'Unknown error';
      console.error(`Die validation error:`, errorMessage);
      setError(errorMessage);
      setLoadingState('error');
    }
  }, [type, face, format, theme, variant]);
  
  // Handle successful image load
  const handleImageLoad = () => {
    setLoadingState('success');
  };
  
  // Handle image load error
  const handleImageError = () => {
    // If SVG fails, try PNG
    if (format === 'svg' && imgSrc) {
      const pngPath = imgSrc.replace(`.${format}`, '.png');
      console.log(`SVG failed to load, trying PNG: ${pngPath}`);
      setImgSrc(pngPath);
      return;
    }
    
    // If the original path started with './node_modules' and failed, try without it
    if (imgSrc && imgSrc.startsWith('./node_modules/')) {
      const alternativePath = imgSrc.replace('./node_modules/', '');
      console.log(`Path with node_modules failed, trying: ${alternativePath}`);
      setImgSrc(alternativePath);
      return;
    }
    
    // If all attempts failed, show error state
    setError(`Failed to load die image for ${type}`);
    setLoadingState('error');
  };

  // Render loading state
  if (loadingState === 'loading' && !imgSrc) {
    return (
      <div 
        className={`die-loading ${className || ''}`} 
        style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#e9ecef',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#495057',
          ...style
        }} 
        role="status"
      >
        <span>...</span>
      </div>
    );
  }

  // Render error state
  if (loadingState === 'error') {
    return (
      <div 
        className={`die-error ${className || ''}`} 
        style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#721c24',
          fontSize: '12px',
          padding: '4px',
          textAlign: 'center',
          ...style
        }} 
        role="alert"
        title={error || 'Error loading die'}
      >
        !
      </div>
    );
  }

  // Render the image
  return (
    <img
      src={imgSrc || ''}
      alt={`${type} die showing ${face}`}
      className={className}
      style={style}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
}; 