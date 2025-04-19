import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Die } from './Die';

describe('Die Component', () => {
  it('renders numeric dice with correct attributes', () => {
    const { getByAltText } = render(<Die type="d6" face={1} />);
    const img = getByAltText('d6 die showing 1');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('raw.githubusercontent.com/swrpg-online/art/main/dice/numeric/white-arabic/D6-01-Arabic-White.svg');
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
    expect(img.getAttribute('src')).toContain('raw.githubusercontent.com/swrpg-online/art/main/dice/numeric/white-arabic/D4Apex-01-Arabic-White.svg');
  });

  it('renders narrative dice correctly', () => {
    const { getByAltText } = render(<Die type="boost" face="Success" />);
    const img = getByAltText('boost die showing Success');
    expect(img.getAttribute('src')).toContain('raw.githubusercontent.com/swrpg-online/art/main/dice/narrative/Boost/Boost-Success.svg');
  });

  it('displays error state for invalid face values', () => {
    const { getByRole } = render(<Die type="d6" face={7} />);
    const errorDiv = getByRole('alert');
    expect(errorDiv).toBeInTheDocument();
    expect(errorDiv.getAttribute('title')).toContain('Invalid face for d6');
  });
}); 