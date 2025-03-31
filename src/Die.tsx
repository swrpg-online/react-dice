import * as React from 'react';
import { DieProps, D4Variant } from './types';

const DEFAULT_THEME = 'white-arabic';
const DEFAULT_FORMAT = 'svg';
const DEFAULT_D4_VARIANT = 'standard';

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

// Convert camelCase to kebab-case
const toKebabCase = (str: string) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Process style object into CSS string
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

export const Die: React.FC<DieProps> = ({
  type,
  format = DEFAULT_FORMAT,
  theme = DEFAULT_THEME,
  variant = DEFAULT_D4_VARIANT,
  className,
  style,
}) => {
  const [svgContent, setSvgContent] = React.useState<string>('');

  React.useEffect(() => {
    const abortController = new AbortController();

    const getAssetPath = () => {
      const diceType = ['d4', 'd6', 'd8', 'd12', 'd20', 'd100'].includes(type) ? 'numeric' : 'narrative';
      
      if (type === 'd4') {
        const d4Config = getD4Config(variant);
        return `/dice/${diceType}/${d4Config}-${theme}.${format}`;
      }
      
      return `/dice/${diceType}/${type}-${theme}.${format}`;
    };

    const loadAsset = async () => {
      try {
        const assetPath = getAssetPath();
        const module = await import(`@swrpg-online/art${assetPath}`);

        if (format === 'svg') {
          const response = await fetch(module.default, { signal: abortController.signal });
          const text = await response.text();
          
          // Process SVG attributes
          const classAttr = className ? ` class="${className}"` : '';
          const styleAttr = style ? ` style="${processStyle(style)}"` : '';
          const processedSvg = text.replace('<svg', `<svg${classAttr}${styleAttr}`);
          
          setSvgContent(processedSvg);
        } else {
          setSvgContent(module.default);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error(`Failed to load die ${format}:`, error);
          setSvgContent('');
        }
      }
    };

    loadAsset();

    return () => {
      abortController.abort();
    };
  }, [type, format, theme, variant, className, style]);

  if (!svgContent) {
    return <div className={className} style={style}>Loading...</div>;
  }

  if (format === 'svg') {
    return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
  }

  return (
    <img
      src={svgContent}
      alt={`${type} die`}
      className={className}
      style={style}
    />
  );
}; 