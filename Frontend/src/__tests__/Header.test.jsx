import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock del componente Header
const Header = () => <header>Header Component</header>;

describe('Header Component', () => {
  beforeEach(() => {
    // Setup antes de cada test
  });

  it('renders header element', () => {
    render(<Header />);
    const headerElement = screen.getByText(/Header Component/i);
    expect(headerElement).toBeInTheDocument();
  });

  it('has correct structure', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });
});
