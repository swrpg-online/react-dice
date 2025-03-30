import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Die } from './Die';

describe('Die', () => {
  it('renders loading state initially', () => {
    const { getByText } = render(<Die type="boost" />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders loading state with proper class name and style', () => {
    const { getByText } = render(
      <Die
        type="ability"
        className="custom-class"
        style={{ width: '100px' }}
      />
    );
    const loadingDiv = getByText('Loading...');
    expect(loadingDiv).toHaveClass('custom-class');
    expect(loadingDiv).toHaveStyle({ width: '100px' });
  });

  it('handles d4 variants correctly', () => {
    const { getByText } = render(<Die type="d4" variant="apex" />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });
}); 