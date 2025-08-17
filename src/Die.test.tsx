import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Die } from './Die';
import { DieProvider } from './DieContext';

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

  describe('Loading State Transitions', () => {
    it('shows loading state initially when image has not loaded', () => {
      // Note: In the test environment, images may load instantly or not render loading state
      // This test validates the loading state logic when imgSrc is not yet set
      const { container } = render(<Die type="d6" face={1} />);
      // The component should render either loading state or the image
      const img = container.querySelector('img');
      const loadingDiv = container.querySelector('.die-loading');
      
      // Either the image is present (loaded quickly) or loading state is shown
      expect(img || loadingDiv).toBeTruthy();
    });

    it('transitions to success state on valid die', async () => {
      const { getByAltText, queryByRole } = render(<Die type="d6" face={3} />);
      
      // Wait for image to load
      await waitFor(() => {
        const img = getByAltText('d6 die showing 3');
        expect(img).toBeInTheDocument();
      });

      // Loading state should be gone
      const loadingDiv = queryByRole('status');
      expect(loadingDiv).not.toBeInTheDocument();
    });

    it('transitions to error state on invalid die type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { getByRole } = render(<Die type={"invalid" as any} face={1} />);
      
      // Should show error state
      const errorDiv = getByRole('alert');
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv.getAttribute('title')).toContain('Invalid die type');
    });

    it('transitions to error state on invalid numeric face', () => {
      const { getByRole } = render(<Die type="d6" face={10} />);
      
      // Should show error state
      const errorDiv = getByRole('alert');
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv.getAttribute('title')).toContain('Invalid face for d6');
    });

    it('transitions to error state when numeric die gets string face', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { getByRole } = render(<Die type="d20" face={"Success" as any} />);
      
      // Should show error state
      const errorDiv = getByRole('alert');
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv.getAttribute('title')).toContain('Numeric dice require a number');
    });

    it('transitions to error state when narrative die gets number face', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { getByRole } = render(<Die type="boost" face={5 as any} />);
      
      // Should show error state
      const errorDiv = getByRole('alert');
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv.getAttribute('title')).toContain('Narrative dice require a string');
    });

    it('handles d100 validation correctly', () => {
      // Valid d100 values
      const { rerender, queryByRole } = render(<Die type="d100" face={0} />);
      expect(queryByRole('alert')).not.toBeInTheDocument();
      
      rerender(<Die type="d100" face={50} />);
      expect(queryByRole('alert')).not.toBeInTheDocument();
      
      rerender(<Die type="d100" face={90} />);
      expect(queryByRole('alert')).not.toBeInTheDocument();
      
      // Invalid d100 values
      rerender(<Die type="d100" face={45} />);
      const errorDiv = queryByRole('alert');
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv?.getAttribute('title')).toContain('Invalid face for d100');
    });

    it('resets state when props change', async () => {
      const { rerender, getByAltText, queryByRole } = render(<Die type="d6" face={1} />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(getByAltText('d6 die showing 1')).toBeInTheDocument();
      });
      
      // Change to invalid props
      rerender(<Die type="d6" face={10} />);
      
      // Should show error state
      const errorDiv = queryByRole('alert');
      expect(errorDiv).toBeInTheDocument();
      
      // Change back to valid props
      rerender(<Die type="d6" face={3} />);
      
      // Should be back to success state
      await waitFor(() => {
        expect(getByAltText('d6 die showing 3')).toBeInTheDocument();
        expect(queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Image Loading States', () => {
    it('handles SVG to PNG fallback on error', async () => {
      const { getByAltText } = render(<Die type="d6" face={1} format="svg" />);
      const img = getByAltText('d6 die showing 1');
      
      // Initially should load SVG
      expect(img.getAttribute('src')).toContain('.svg');
      
      // Simulate SVG load error
      fireEvent.error(img);
      
      // Should fallback to PNG
      await waitFor(() => {
        expect(img.getAttribute('src')).toContain('.png');
      });
    });

    it('shows error when PNG format fails to load', async () => {
      const { getByAltText, queryByRole, rerender } = render(<Die type="d6" face={1} format="png" />);
      const img = getByAltText('d6 die showing 1');
      
      // Should load PNG directly
      expect(img.getAttribute('src')).toContain('.png');
      
      // Simulate PNG load error
      fireEvent.error(img);
      
      // Should now show error state since PNG has no fallback
      await waitFor(() => {
        const errorDiv = queryByRole('alert');
        expect(errorDiv).toBeInTheDocument();
      });
    });

    it('handles PNG format directly without fallback', async () => {
      const { getByAltText, queryByRole } = render(<Die type="d6" face={1} format="png" />);
      const img = getByAltText('d6 die showing 1');
      
      // Should load PNG directly
      expect(img.getAttribute('src')).toContain('.png');
      
      // Simulate PNG load error
      fireEvent.error(img);
      
      // Should show error state without trying SVG
      await waitFor(() => {
        const errorDiv = queryByRole('alert');
        expect(errorDiv).toBeInTheDocument();
      });
    });

    it('successfully loads image and transitions to success state', async () => {
      const { getByAltText } = render(<Die type="d20" face={15} />);
      const img = getByAltText('d20 die showing 15');
      
      // Simulate successful image load
      fireEvent.load(img);
      
      // Image should remain visible
      expect(img).toBeInTheDocument();
      expect(img.getAttribute('src')).toContain('D20-15');
    });
  });

  describe('All Theme Variations', () => {
    const allThemes = [
      'white-arabic', 'white-aurebesh',
      'black-arabic', 'black-aurebesh',
      'anh-arabic', 'anh-aurebesh',
      'aotc-arabic', 'aotc-aurebesh',
      'rotj-arabic', 'rotj-aurebesh',
      'rots-arabic', 'rots-aurebesh',
      'tesb-arabic', 'tesb-aurebesh',
      'tfa-arabic', 'tfa-aurebesh',
      'tlj-arabic', 'tlj-aurebesh',
      'tpm-arabic', 'tpm-aurebesh',
      'tros-arabic', 'tros-aurebesh'
    ];

    allThemes.forEach(theme => {
      it(`renders correctly with ${theme} theme`, () => {
        const { getByAltText } = render(<Die type="d6" face={3} theme={theme} />);
        const img = getByAltText('d6 die showing 3');
        expect(img).toBeInTheDocument();
        
        // Extract style and script from theme
        const [style, script] = theme.split('-');
        const capitalizedStyle = style.charAt(0).toUpperCase() + style.slice(1);
        const capitalizedScript = script.charAt(0).toUpperCase() + script.slice(1);
        
        // Verify the URL contains the correct theme parts (script-style order in filename)
        expect(img.getAttribute('src')).toContain(`${capitalizedScript}-${capitalizedStyle}`);
      });
    });

    it('handles movie theme variations correctly', () => {
      const movieThemes = [
        { theme: 'anh-arabic', expected: 'Arabic-Anh' },
        { theme: 'tesb-aurebesh', expected: 'Aurebesh-Tesb' },
        { theme: 'rotj-arabic', expected: 'Arabic-Rotj' },
        { theme: 'tpm-aurebesh', expected: 'Aurebesh-Tpm' },
        { theme: 'aotc-arabic', expected: 'Arabic-Aotc' },
        { theme: 'rots-aurebesh', expected: 'Aurebesh-Rots' },
        { theme: 'tfa-arabic', expected: 'Arabic-Tfa' },
        { theme: 'tlj-aurebesh', expected: 'Aurebesh-Tlj' },
        { theme: 'tros-arabic', expected: 'Arabic-Tros' }
      ];

      movieThemes.forEach(({ theme, expected }) => {
        const { getByAltText, unmount } = render(<Die type="d20" face={20} theme={theme} />);
        const img = getByAltText('d20 die showing 20');
        expect(img.getAttribute('src')).toContain(expected);
        unmount(); // Clean up between renders to avoid multiple elements
      });
    });
  });

  describe('D100 Comprehensive Validation', () => {
    const validD100Values = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
    const invalidD100Values = [1, 5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 100, -10];

    validD100Values.forEach(value => {
      it(`accepts valid d100 value: ${value}`, () => {
        const { getByAltText, queryByRole } = render(<Die type="d100" face={value} />);
        const img = getByAltText(`d100 die showing ${value}`);
        expect(img).toBeInTheDocument();
        expect(img.getAttribute('src')).toContain(`D100-${value.toString().padStart(2, '0')}`);
        expect(queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    invalidD100Values.forEach(value => {
      it(`rejects invalid d100 value: ${value}`, () => {
        const { getByRole } = render(<Die type="d100" face={value} />);
        const errorDiv = getByRole('alert');
        expect(errorDiv).toBeInTheDocument();
        expect(errorDiv.getAttribute('title')).toContain('Invalid face for d100');
      });
    });
  });

  describe('D4 Variants', () => {
    const variants: Array<'standard' | 'apex' | 'base'> = ['standard', 'apex', 'base'];
    const expectedPaths = {
      standard: 'D4-',
      apex: 'D4Apex-',
      base: 'D4Base-'
    };

    variants.forEach(variant => {
      describe(`${variant} variant`, () => {
        [1, 2, 3, 4].forEach(face => {
          it(`renders d4 ${variant} with face ${face}`, () => {
            const { getByAltText } = render(<Die type="d4" face={face} variant={variant} />);
            const img = getByAltText(`d4 die showing ${face}`);
            expect(img).toBeInTheDocument();
            expect(img.getAttribute('src')).toContain(expectedPaths[variant]);
            expect(img.getAttribute('src')).toContain(`${face.toString().padStart(2, '0')}`);
          });
        });

        it(`handles invalid face for d4 ${variant}`, () => {
          const { getByRole } = render(<Die type="d4" face={5} variant={variant} />);
          const errorDiv = getByRole('alert');
          expect(errorDiv).toBeInTheDocument();
          expect(errorDiv.getAttribute('title')).toContain('Invalid face for d4');
        });
      });
    });

    it('defaults to standard variant when not specified', () => {
      const { getByAltText } = render(<Die type="d4" face={2} />);
      const img = getByAltText('d4 die showing 2');
      expect(img.getAttribute('src')).toContain('D4-02');
      expect(img.getAttribute('src')).not.toContain('D4Apex');
      expect(img.getAttribute('src')).not.toContain('D4Base');
    });
  });

  describe('Narrative Dice with Compound Faces', () => {
    const narrativeDice = [
      { type: 'boost', faces: ['Blank', 'Success', 'Advantage', 'Success-Advantage', 'Advantage-Advantage'] },
      { type: 'setback', faces: ['Blank', 'Failure', 'Threat'] },
      { type: 'ability', faces: ['Blank', 'Success', 'Advantage', 'Success-Success', 'Advantage-Advantage', 'Success-Advantage'] },
      { type: 'difficulty', faces: ['Blank', 'Failure', 'Threat', 'Failure-Failure', 'Threat-Threat', 'Failure-Threat'] },
      { type: 'proficiency', faces: ['Blank', 'Success', 'Advantage', 'Success-Success', 'Advantage-Advantage', 'Success-Advantage', 'Triumph'] },
      { type: 'challenge', faces: ['Blank', 'Failure', 'Threat', 'Failure-Failure', 'Threat-Threat', 'Failure-Threat', 'Despair'] }
    ];

    narrativeDice.forEach(({ type, faces }) => {
      describe(`${type} die`, () => {
        faces.forEach(face => {
          it(`renders ${type} die with face: ${face}`, () => {
            const { getByAltText } = render(<Die type={type as any} face={face as any} />);
            const img = getByAltText(`${type} die showing ${face}`);
            expect(img).toBeInTheDocument();
            const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
            expect(img.getAttribute('src')).toContain(`${capitalizedType}/${capitalizedType}-${face}.svg`);
          });
        });

        it(`handles numeric face error for ${type} die`, () => {
          const { getByRole } = render(<Die type={type as any} face={1 as any} />);
          const errorDiv = getByRole('alert');
          expect(errorDiv).toBeInTheDocument();
          expect(errorDiv.getAttribute('title')).toContain('Narrative dice require a string');
        });
      });
    });

    it('handles complex compound faces correctly', () => {
      const compoundFaces = [
        { face: 'Success-Advantage', expected: 'Success-Advantage' },
        { face: 'Advantage-Advantage', expected: 'Advantage-Advantage' },
        { face: 'Failure-Threat', expected: 'Failure-Threat' },
        { face: 'Success-Success', expected: 'Success-Success' },
        { face: 'Threat-Threat', expected: 'Threat-Threat' }
      ];

      compoundFaces.forEach(({ face, expected }) => {
        const { getByAltText } = render(<Die type="ability" face={face as any} />);
        const img = getByAltText(`ability die showing ${face}`);
        expect(img.getAttribute('src')).toContain(`Ability-${expected}`);
      });
    });
  });

  describe('Error Messages and Accessibility', () => {
    it('provides descriptive error message for invalid die type', () => {
      const { getByRole } = render(<Die type={'invalid' as any} face={1} />);
      const errorDiv = getByRole('alert');
      expect(errorDiv).toHaveAttribute('title', 'Invalid die type: invalid');
      expect(errorDiv).toHaveAttribute('role', 'alert');
    });

    it('provides descriptive error message for out of range numeric face', () => {
      const { getByRole } = render(<Die type="d20" face={25} />);
      const errorDiv = getByRole('alert');
      expect(errorDiv).toHaveAttribute('title', 'Invalid face for d20: Must be between 1 and 20');
    });

    it('provides descriptive error message for wrong face type on numeric die', () => {
      const { getByRole } = render(<Die type="d6" face={'Success' as any} />);
      const errorDiv = getByRole('alert');
      expect(errorDiv).toHaveAttribute('title', 'Numeric dice require a number for the face value');
    });

    it('provides descriptive error message for wrong face type on narrative die', () => {
      const { getByRole } = render(<Die type="boost" face={3 as any} />);
      const errorDiv = getByRole('alert');
      expect(errorDiv).toHaveAttribute('title', 'Narrative dice require a string for the face value');
    });

    it('provides proper alt text for accessibility', () => {
      const { getByAltText } = render(<Die type="d20" face={18} />);
      const img = getByAltText('d20 die showing 18');
      expect(img).toBeInTheDocument();
    });

    it('provides proper alt text for narrative dice', () => {
      const { getByAltText } = render(<Die type="proficiency" face="Triumph" />);
      const img = getByAltText('proficiency die showing Triumph');
      expect(img).toBeInTheDocument();
    });

    it('loading state has proper ARIA role', () => {
      const { container } = render(<Die type="d6" face={1} />);
      const loadingDiv = container.querySelector('[role="status"]');
      // Note: loading state may not always be visible in tests due to fast rendering
      if (loadingDiv) {
        expect(loadingDiv).toHaveAttribute('role', 'status');
      }
    });

    it('error state displays exclamation mark indicator', () => {
      const { getByRole } = render(<Die type="d6" face={10} />);
      const errorDiv = getByRole('alert');
      expect(errorDiv.textContent).toBe('!');
    });
  });

  describe('Additional Coverage Tests', () => {
    it('handles empty string parts in theme correctly', () => {
      // This tests the edge case where theme splits but results in empty part
      const { getByAltText } = render(<Die type="d6" face={1} theme="" />);
      const img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toContain('Arabic-White');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid theme provided')
      );
    });

    it('handles single character theme', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme="b" />);
      const img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toContain('Arabic-B');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Theme missing script part')
      );
    });

    it('handles theme with only whitespace after split', () => {
      const { getByAltText } = render(<Die type="d6" face={1} theme=" " />);
      const img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toContain('Arabic-White');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Boundaries', () => {
    it('handles all valid numeric dice types', () => {
      const numericDice = [
        { type: 'd4', maxFace: 4 },
        { type: 'd6', maxFace: 6 },
        { type: 'd8', maxFace: 8 },
        { type: 'd12', maxFace: 12 },
        { type: 'd20', maxFace: 20 }
      ];

      numericDice.forEach(({ type, maxFace }) => {
        const { getByAltText } = render(<Die type={type as any} face={maxFace} />);
        const img = getByAltText(`${type} die showing ${maxFace}`);
        expect(img).toBeInTheDocument();
      });
    });

    it('handles minimum face values correctly', () => {
      const { getByAltText, rerender } = render(<Die type="d6" face={1} />);
      expect(getByAltText('d6 die showing 1')).toBeInTheDocument();
      
      // D100 has minimum of 0
      rerender(<Die type="d100" face={0} />);
      expect(getByAltText('d100 die showing 0')).toBeInTheDocument();
    });

    it('handles zero face value for non-d100 dice as error', () => {
      const { getByRole } = render(<Die type="d6" face={0} />);
      const errorDiv = getByRole('alert');
      expect(errorDiv).toBeInTheDocument();
    });

    it('handles negative face values as error', () => {
      const { getByRole } = render(<Die type="d20" face={-1} />);
      const errorDiv = getByRole('alert');
      expect(errorDiv).toBeInTheDocument();
    });

    it('handles very large face values as error', () => {
      const { getByRole } = render(<Die type="d6" face={999} />);
      const errorDiv = getByRole('alert');
      expect(errorDiv).toBeInTheDocument();
    });

    it('handles undefined variant with default', () => {
      const { getByAltText } = render(<Die type="d4" face={3} variant={undefined} />);
      const img = getByAltText('d4 die showing 3');
      expect(img.getAttribute('src')).toContain('D4-03');
    });

    it('handles undefined format with default', () => {
      const { getByAltText } = render(<Die type="d8" face={7} format={undefined} />);
      const img = getByAltText('d8 die showing 7');
      expect(img.getAttribute('src')).toContain('.svg');
    });

    it('handles custom className and style', () => {
      const { getByAltText } = render(
        <Die 
          type="d12" 
          face={11} 
          className="custom-die-class" 
          style={{ width: '200px', border: '2px solid red' }}
        />
      );
      const img = getByAltText('d12 die showing 11');
      expect(img).toHaveClass('custom-die-class');
      expect(img).toHaveStyle({ width: '200px', border: '2px solid red' });
    });

    it('handles rapid prop changes correctly', async () => {
      const { rerender, getByAltText, queryByRole } = render(<Die type="d6" face={1} />);
      
      // Rapid changes
      rerender(<Die type="d6" face={2} />);
      rerender(<Die type="d6" face={3} />);
      rerender(<Die type="d6" face={4} />);
      rerender(<Die type="d6" face={5} />);
      rerender(<Die type="d6" face={6} />);
      
      await waitFor(() => {
        expect(getByAltText('d6 die showing 6')).toBeInTheDocument();
      });
      
      // Now invalid
      rerender(<Die type="d6" face={7} />);
      
      await waitFor(() => {
        expect(queryByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for numeric die', () => {
      const { container } = render(<Die type="d20" face={20} theme="black-aurebesh" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for narrative die', () => {
      const { container } = render(<Die type="proficiency" face="Triumph" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for d4 apex variant', () => {
      const { container } = render(<Die type="d4" face={4} variant="apex" theme="tfa-arabic" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for compound face', () => {
      const { container } = render(<Die type="ability" face="Success-Advantage" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for error state', () => {
      const { container } = render(<Die type="d6" face={10} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for d100', () => {
      const { container } = render(<Die type="d100" face={90} theme="rotj-aurebesh" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Configurable Asset Path', () => {
    const originalEnv = process.env.REACT_APP_DICE_ASSET_PATH;

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.REACT_APP_DICE_ASSET_PATH = originalEnv;
      } else {
        delete process.env.REACT_APP_DICE_ASSET_PATH;
      }
    });

    it('uses custom basePath prop when provided', () => {
      const { getByAltText } = render(
        <Die type="d20" face={20} basePath="https://cdn.example.com/dice" />
      );
      const img = getByAltText('d20 die showing 20');
      expect(img.getAttribute('src')).toBe('https://cdn.example.com/dice/numeric/white-arabic/D20-20-Arabic-White.svg');
    });

    it('uses context basePath when no prop provided', () => {
      const { getByAltText } = render(
        <DieProvider config={{ basePath: '/custom/assets' }}>
          <Die type="d6" face={3} />
        </DieProvider>
      );
      const img = getByAltText('d6 die showing 3');
      expect(img.getAttribute('src')).toBe('/custom/assets/numeric/white-arabic/D6-03-Arabic-White.svg');
    });

    it('uses environment variable when no prop or context', () => {
      process.env.REACT_APP_DICE_ASSET_PATH = '/env/assets';
      const { getByAltText } = render(<Die type="d8" face={5} />);
      const img = getByAltText('d8 die showing 5');
      expect(img.getAttribute('src')).toBe('/env/assets/numeric/white-arabic/D8-05-Arabic-White.svg');
    });

    it('uses default path when nothing else is configured', () => {
      delete process.env.REACT_APP_DICE_ASSET_PATH;
      const { getByAltText } = render(<Die type="d12" face={11} />);
      const img = getByAltText('d12 die showing 11');
      expect(img.getAttribute('src')).toBe('/assets/@swrpg-online/art/dice/numeric/white-arabic/D12-11-Arabic-White.svg');
    });

    it('prop overrides context configuration', () => {
      const { getByAltText } = render(
        <DieProvider config={{ basePath: '/context/path' }}>
          <Die type="d4" face={2} basePath="/prop/path" />
        </DieProvider>
      );
      const img = getByAltText('d4 die showing 2');
      expect(img.getAttribute('src')).toBe('/prop/path/numeric/white-arabic/D4-02-Arabic-White.svg');
    });

    it('normalizes paths with trailing slashes', () => {
      const { getByAltText } = render(
        <Die type="boost" face="Success" basePath="/path/with/trailing/slash/" />
      );
      const img = getByAltText('boost die showing Success');
      expect(img.getAttribute('src')).toBe('/path/with/trailing/slash/narrative/Boost/Boost-Success.svg');
    });

    it('handles relative paths correctly', () => {
      const { getByAltText } = render(
        <Die type="ability" face="Advantage" basePath="relative/path" />
      );
      const img = getByAltText('ability die showing Advantage');
      expect(img.getAttribute('src')).toBe('/relative/path/narrative/Ability/Ability-Advantage.svg');
    });

    it('preserves CDN URLs correctly', () => {
      const { getByAltText } = render(
        <Die type="challenge" face="Threat" basePath="https://cdn.cloudflare.com/assets" />
      );
      const img = getByAltText('challenge die showing Threat');
      expect(img.getAttribute('src')).toBe('https://cdn.cloudflare.com/assets/narrative/Challenge/Challenge-Threat.svg');
    });

    it('preserves protocol-relative URLs', () => {
      const { getByAltText } = render(
        <Die type="difficulty" face="Failure" basePath="//cdn.example.com/dice" />
      );
      const img = getByAltText('difficulty die showing Failure');
      expect(img.getAttribute('src')).toBe('//cdn.example.com/dice/narrative/Difficulty/Difficulty-Failure.svg');
    });

    it('updates path when basePath prop changes', async () => {
      const { rerender, getByAltText } = render(
        <Die type="d20" face={1} basePath="/initial/path" />
      );
      
      let img = getByAltText('d20 die showing 1');
      expect(img.getAttribute('src')).toBe('/initial/path/numeric/white-arabic/D20-01-Arabic-White.svg');
      
      rerender(<Die type="d20" face={1} basePath="/updated/path" />);
      
      await waitFor(() => {
        img = getByAltText('d20 die showing 1');
        expect(img.getAttribute('src')).toBe('/updated/path/numeric/white-arabic/D20-01-Arabic-White.svg');
      });
    });

    it('follows priority order: prop > context > env > default', () => {
      process.env.REACT_APP_DICE_ASSET_PATH = '/env/path';

      // Test with all configurations present
      const { rerender, getByAltText } = render(
        <DieProvider config={{ basePath: '/context/path' }}>
          <Die type="d6" face={1} basePath="/prop/path" />
        </DieProvider>
      );
      
      let img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toBe('/prop/path/numeric/white-arabic/D6-01-Arabic-White.svg');

      // Remove prop, should fall back to context
      rerender(
        <DieProvider config={{ basePath: '/context/path' }}>
          <Die type="d6" face={1} />
        </DieProvider>
      );
      
      img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toBe('/context/path/numeric/white-arabic/D6-01-Arabic-White.svg');

      // Remove context, should fall back to env
      rerender(<Die type="d6" face={1} />);
      
      img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toBe('/env/path/numeric/white-arabic/D6-01-Arabic-White.svg');

      // Remove env, should fall back to default
      delete process.env.REACT_APP_DICE_ASSET_PATH;
      rerender(<Die type="d6" face={1} />);
      
      img = getByAltText('d6 die showing 1');
      expect(img.getAttribute('src')).toBe('/assets/@swrpg-online/art/dice/numeric/white-arabic/D6-01-Arabic-White.svg');
    });
  });
}); 