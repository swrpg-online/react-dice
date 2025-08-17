/**
 * @fileoverview Context provider for global Die configuration
 */

import * as React from 'react';

/** Configuration options for the Die components */
export interface DieConfig {
  /** Base path for dice assets */
  basePath?: string;
  /** Whether to enable asset preloading */
  preloadAssets?: boolean;
  /** Cache duration in milliseconds (0 to disable caching) */
  cacheDuration?: number;
}

/** Context value type */
interface DieContextValue {
  config: DieConfig;
  updateConfig: (config: Partial<DieConfig>) => void;
  preloadedAssets: Set<string>;
  addPreloadedAsset: (path: string) => void;
}

/** The Die configuration context */
const DieContext = React.createContext<DieContextValue | undefined>(undefined);

/** Props for the DieProvider component */
export interface DieProviderProps {
  /** Initial configuration for the Die components */
  config?: DieConfig;
  /** Child components */
  children: React.ReactNode;
}

/**
 * Provider component for Die configuration.
 * Allows global configuration of dice assets path and other settings.
 * 
 * @example
 * <DieProvider config={{ basePath: 'https://cdn.example.com/dice' }}>
 *   <App />
 * </DieProvider>
 */
export const DieProvider: React.FC<DieProviderProps> = ({ config: initialConfig = {}, children }) => {
  const [config, setConfig] = React.useState<DieConfig>(initialConfig);
  const [preloadedAssets, setPreloadedAssets] = React.useState<Set<string>>(new Set());

  const updateConfig = React.useCallback((newConfig: Partial<DieConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const addPreloadedAsset = React.useCallback((path: string) => {
    setPreloadedAssets(prev => new Set(prev).add(path));
  }, []);

  const value = React.useMemo(() => ({
    config,
    updateConfig,
    preloadedAssets,
    addPreloadedAsset
  }), [config, updateConfig, preloadedAssets, addPreloadedAsset]);

  return (
    <DieContext.Provider value={value}>
      {children}
    </DieContext.Provider>
  );
};

/**
 * Hook to access the Die configuration context
 * @returns The Die configuration context value, or undefined if not within a provider
 */
export const useDieConfig = (): DieContextValue | undefined => {
  return React.useContext(DieContext);
};

/**
 * Hook to get the effective base path for dice assets.
 * Follows the fallback chain: prop > context > env var > default
 * 
 * @param propBasePath - Base path provided as a prop to the Die component
 * @returns The effective base path to use for dice assets
 */
export const useEffectiveBasePath = (propBasePath?: string): string => {
  const context = useDieConfig();
  
  // Fallback chain: prop > context > env var > default
  const basePath = 
    propBasePath ||
    context?.config.basePath ||
    process.env.REACT_APP_DICE_ASSET_PATH ||
    '/assets/@swrpg-online/art/dice';
  
  return normalizeBasePath(basePath);
};

/**
 * Normalizes a base path by ensuring it doesn't end with a slash
 * and handles leading slashes appropriately.
 * 
 * @param path - The path to normalize
 * @returns The normalized path
 */
export const normalizeBasePath = (path: string): string => {
  // Remove trailing slashes
  let normalized = path.replace(/\/+$/, '');
  
  // If the path is empty after removing slashes, return root
  if (normalized === '') {
    return '';
  }
  
  // For absolute URLs (http://, https://, //) don't add leading slash
  if (/^https?:\/\//.test(normalized) || normalized.startsWith('//')) {
    return normalized;
  }
  
  // For relative paths, ensure they start with /
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  return normalized;
};

/**
 * Preloads an image asset
 * @param src - The source URL of the image to preload
 * @returns A promise that resolves when the image is loaded
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

/**
 * Hook to preload dice assets
 * @param paths - Array of image paths to preload
 */
export const usePreloadAssets = (paths: string[]): void => {
  const context = useDieConfig();
  const pathsKey = paths.join(',');

  React.useEffect(() => {
    if (!context?.config.preloadAssets || paths.length === 0) {
      return;
    }

    const preloadAll = async () => {
      const promises = paths.map(async (path) => {
        if (!context.preloadedAssets.has(path)) {
          try {
            await preloadImage(path);
            context.addPreloadedAsset(path);
          } catch (error) {
            console.warn(`Failed to preload asset: ${path}`, error);
          }
        }
      });

      await Promise.allSettled(promises);
    };

    preloadAll();
  }, [pathsKey, context?.config.preloadAssets]); // Only depend on pathsKey and preloadAssets config
};