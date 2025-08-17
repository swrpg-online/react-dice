/**
 * @fileoverview Tests for DieContext and related utilities
 */

import * as React from 'react';
import { render, screen, act, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  DieProvider,
  useDieConfig,
  useEffectiveBasePath,
  normalizeBasePath,
  preloadImage,
  usePreloadAssets,
} from './DieContext';

describe('normalizeBasePath', () => {
  it('should remove trailing slashes', () => {
    expect(normalizeBasePath('/path/to/assets/')).toBe('/path/to/assets');
    expect(normalizeBasePath('/path/to/assets///')).toBe('/path/to/assets');
  });

  it('should handle empty path', () => {
    expect(normalizeBasePath('')).toBe('');
  });

  it('should add leading slash for relative paths', () => {
    expect(normalizeBasePath('path/to/assets')).toBe('/path/to/assets');
  });

  it('should preserve absolute URLs', () => {
    expect(normalizeBasePath('https://cdn.example.com/assets')).toBe('https://cdn.example.com/assets');
    expect(normalizeBasePath('http://cdn.example.com/assets')).toBe('http://cdn.example.com/assets');
  });

  it('should preserve protocol-relative URLs', () => {
    expect(normalizeBasePath('//cdn.example.com/assets')).toBe('//cdn.example.com/assets');
  });

  it('should handle root path', () => {
    expect(normalizeBasePath('/')).toBe('');
  });

  it('should remove trailing slashes from URLs', () => {
    expect(normalizeBasePath('https://cdn.example.com/assets/')).toBe('https://cdn.example.com/assets');
  });
});

describe('DieProvider', () => {
  it('should provide default config when no config is passed', () => {
    const TestComponent = () => {
      const context = useDieConfig();
      return <div>{JSON.stringify(context?.config)}</div>;
    };

    render(
      <DieProvider>
        <TestComponent />
      </DieProvider>
    );

    expect(screen.getByText('{}')).toBeInTheDocument();
  });

  it('should provide initial config', () => {
    const TestComponent = () => {
      const context = useDieConfig();
      return <div>{context?.config.basePath}</div>;
    };

    render(
      <DieProvider config={{ basePath: '/custom/path' }}>
        <TestComponent />
      </DieProvider>
    );

    expect(screen.getByText('/custom/path')).toBeInTheDocument();
  });

  it('should allow config updates', () => {
    const TestComponent = () => {
      const context = useDieConfig();
      return (
        <div>
          <span data-testid="path">{context?.config.basePath || 'default'}</span>
          <button onClick={() => context?.updateConfig({ basePath: '/new/path' })}>
            Update
          </button>
        </div>
      );
    };

    render(
      <DieProvider>
        <TestComponent />
      </DieProvider>
    );

    expect(screen.getByTestId('path')).toHaveTextContent('default');

    act(() => {
      screen.getByText('Update').click();
    });

    expect(screen.getByTestId('path')).toHaveTextContent('/new/path');
  });

  it('should track preloaded assets', () => {
    const TestComponent = () => {
      const context = useDieConfig();
      return (
        <div>
          <span data-testid="count">{context?.preloadedAssets.size}</span>
          <button onClick={() => context?.addPreloadedAsset('/test/asset.svg')}>
            Add Asset
          </button>
        </div>
      );
    };

    render(
      <DieProvider>
        <TestComponent />
      </DieProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');

    act(() => {
      screen.getByText('Add Asset').click();
    });

    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});

describe('useEffectiveBasePath', () => {
  const originalEnv = process.env.REACT_APP_DICE_ASSET_PATH;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.REACT_APP_DICE_ASSET_PATH = originalEnv;
    } else {
      delete process.env.REACT_APP_DICE_ASSET_PATH;
    }
  });

  it('should use prop path when provided', () => {
    const { result } = renderHook(() => useEffectiveBasePath('/prop/path'));
    expect(result.current).toBe('/prop/path');
  });

  it('should use context path when no prop provided', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DieProvider config={{ basePath: '/context/path' }}>
        {children}
      </DieProvider>
    );

    const { result } = renderHook(() => useEffectiveBasePath(), { wrapper });
    expect(result.current).toBe('/context/path');
  });

  it('should use environment variable when no prop or context', () => {
    process.env.REACT_APP_DICE_ASSET_PATH = '/env/path';
    const { result } = renderHook(() => useEffectiveBasePath());
    expect(result.current).toBe('/env/path');
  });

  it('should use default path when nothing else is provided', () => {
    delete process.env.REACT_APP_DICE_ASSET_PATH;
    const { result } = renderHook(() => useEffectiveBasePath());
    expect(result.current).toBe('/assets/@swrpg-online/art/dice');
  });

  it('should follow priority: prop > context > env > default', () => {
    process.env.REACT_APP_DICE_ASSET_PATH = '/env/path';
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DieProvider config={{ basePath: '/context/path' }}>
        {children}
      </DieProvider>
    );

    const { result } = renderHook(
      () => useEffectiveBasePath('/prop/path'),
      { wrapper }
    );
    
    expect(result.current).toBe('/prop/path');
  });

  it('should normalize the returned path', () => {
    const { result } = renderHook(() => useEffectiveBasePath('/path/with/trailing/slash/'));
    expect(result.current).toBe('/path/with/trailing/slash');
  });
});

describe('preloadImage', () => {
  it('should resolve when image loads successfully', async () => {
    // Mock Image constructor
    const mockImage = {
      onload: null as any,
      onerror: null as any,
      src: '',
    };

    global.Image = jest.fn(() => mockImage) as any;

    const promise = preloadImage('/test/image.svg');

    // Simulate successful load
    act(() => {
      mockImage.onload?.();
    });

    await expect(promise).resolves.toBeUndefined();
    expect(mockImage.src).toBe('/test/image.svg');
  });

  it('should reject when image fails to load', async () => {
    // Mock Image constructor
    const mockImage = {
      onload: null as any,
      onerror: null as any,
      src: '',
    };

    global.Image = jest.fn(() => mockImage) as any;

    const promise = preloadImage('/test/image.svg');

    // Simulate load error
    act(() => {
      mockImage.onerror?.();
    });

    await expect(promise).rejects.toThrow('Failed to preload image: /test/image.svg');
  });
});

describe('usePreloadAssets', () => {
  beforeEach(() => {
    // Mock Image constructor
    const mockImage = {
      onload: null as any,
      onerror: null as any,
      src: '',
    };

    global.Image = jest.fn(() => mockImage) as any;
  });

  it('should not preload when preloadAssets is disabled', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DieProvider config={{ preloadAssets: false }}>
        {children}
      </DieProvider>
    );

    const spy = jest.spyOn(console, 'warn').mockImplementation();

    renderHook(() => usePreloadAssets(['/test1.svg', '/test2.svg']), { wrapper });

    expect(global.Image).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should preload assets when enabled', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DieProvider config={{ preloadAssets: true }}>
        {children}
      </DieProvider>
    );

    renderHook(() => usePreloadAssets(['/test1.svg', '/test2.svg']), { wrapper });

    expect(global.Image).toHaveBeenCalledTimes(2);
  });


  it('should handle preload failures gracefully', async () => {
    const mockImage = {
      onload: null as any,
      onerror: null as any,
      src: '',
    };

    global.Image = jest.fn(() => mockImage) as any;

    const spy = jest.spyOn(console, 'warn').mockImplementation();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DieProvider config={{ preloadAssets: true }}>
        {children}
      </DieProvider>
    );

    renderHook(() => usePreloadAssets(['/test1.svg']), { wrapper });

    // Simulate load error
    act(() => {
      mockImage.onerror?.();
    });

    // Wait for async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(spy).toHaveBeenCalledWith(
      'Failed to preload asset: /test1.svg',
      expect.any(Error)
    );

    spy.mockRestore();
  });
});