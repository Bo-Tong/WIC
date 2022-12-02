import { render, screen } from '@testing-library/react';
import React from 'react';

import { App } from './app';

test('renders learn react link', (): void => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
