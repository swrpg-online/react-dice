import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Die } from './Die';

// Mock console.warn to test warnings
let consoleWarnSpy: jest.SpyInstance;

beforeEach(() => {
  consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  consoleWarnSpy.mockRestore();
});

describe('Die Component', () => {
  describe('Basic Functionality', () => {
    it('renders numeric dice with correct attributes', () => {
      const { getByAltText } = render(<Die type="d6" face={1} />);
      const img = getByAltText('d6 die showing 1');
      expect(img).toBeInTheDocument();
      expect(img.getAttribute('src')).toContain('D6-01-Arabic-White.svg');
    });

    it('applies custom styling correctly', () => {
      const { getByAltText } = render(
        <Die
          type="d20"
          face={1}
          className="custom-class"
          style={{ width: '100px' }}
        />
      );
      const img = getByAltText('d20 die showing 1');
      expect(img).toHaveClass('custom-class');
      expect(img).toHaveStyle({ width: '100px' });
    });

    it('handles d4 variants correctly', () => {
      const { getByAltText } = render(<Die type="d4" face={1} variant="apex" />);
      const img = getByAltText('d4 die showing 1');
      expect(img.getAttribute('src')).toContain('D4Apex-01-Arabic-White.svg');
    });

    it('renders narrative dice correctly', () => {
      const { getByAltText } = render(<Die type="boost" face="Success" />);
      const img = getByAltText('boost die showing Success');
      expect(img.getAttribute('src')).toContain('Boost-Success.svg');
    });

    it('displays error state for invalid face values', () => {
      const { getByRole } = render(<Die type="d6" face={7} />);
      const errorDiv = getByRole('alert');
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv.getAttribute('title')).toContain('Invalid face for d6');
    });
  });

  describe('Theme Parsing Edge Cases', () => {
    it('handles valid theme with hyphen correctly', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="black-roman" />);
      const img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toContain('Roman-Black');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('handles single word theme (no hyphen) with default script', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="black" />);
      const img = getByAltText('d6 die showing 1');
      // Should use 'black' as style and default 'Arabic' as script
      expect(img.getAttribute('src')).toContain('Arabic-Black');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Theme missing script part')
      );
    });

    it('handles empty string theme with defaults', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="" />);
      const img = getByAltText('d6 die showing 1');
      // Should use default theme: Arabic-White
      expect(img.getAttribute('src')).toContain('Arabic-White');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid theme provided')
      );
    });

    it('handles null theme with defaults', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme={null as unknown as string} />);
      const img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toContain('Arabic-White');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid theme provided')
      );
    });

    it('handles undefined theme with defaults', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme={undefined} />);
      const img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toContain('Arabic-White');
      // undefined is a valid value (means use default), so no warning expected
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('handles whitespace-only theme with defaults', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="   " />);
      const img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toContain('Arabic-White');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid theme provided')
      );
    });

    it('handles malformed theme with empty parts', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="-roman" />);
      const img = getByAltText('d6 die showing 1');
      // Should fallback to defaults due to empty style part
      expect(img.getAttribute('src')).toContain('Arabic-White');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Malformed theme string')
      );
    });

    it('handles theme with trailing hyphen', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="black-" />);
      const img = getByAltText('d6 die showing 1');
      // Should fallback to defaults due to empty script part
      expect(img.getAttribute('src')).toContain('Arabic-White');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Malformed theme string')
      );
    });

    it('handles theme with multiple hyphens correctly', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="dark-blue-roman" />);
      const img = getByAltText('d6 die showing 1');
      // Should take first part as style and second as script (ignoring rest)
      expect(img.getAttribute('src')).toContain('Blue-Dark');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('trims whitespace from theme parts', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="  white  -  arabic  " />);
      const img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toContain('Arabic-White');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('handles case insensitive themes correctly', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="WHITE-ARABIC" />);
      const img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toContain('Arabic-White');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not crash with non-string theme types', () => {
      // Test with number
      const { getByAltText, unmount: unmount1 } = render(<Die type="d6" face={1} theme={123 as unknown as string} />);
      const img1 = getByAltText('d6 die showing 1');
      expect(img1.getAttribute('src')).toContain('Arabic-White');
      unmount1();

      // Test with object
      const { getByAltText: getByAltText2, unmount: unmount2 } = render(<Die type="d6" face={1} theme={{} as unknown as string} />);
      const img2 = getByAltText2('d6 die showing 1');
      expect(img2.getAttribute('src')).toContain('Arabic-White');
      unmount2();

      // Test with array
      const { getByAltText: getByAltText3, unmount: unmount3 } = render(<Die type="d6" face={1} theme={[] as unknown as string} />);
      const img3 = getByAltText3('d6 die showing 1');
      expect(img3.getAttribute('src')).toContain('Arabic-White');
      unmount3();

      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
    });
  });
}); 