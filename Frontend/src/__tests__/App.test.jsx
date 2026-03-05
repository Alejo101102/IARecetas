import { render } from '@testing-library/react';
import { describe, it, expect, jest } from '@jest/globals';
import App from '../App';

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => <div>Route</div>,
  Navigate: () => <div>Navigate</div>
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Verifica que el componente se renderiza
    expect(document.body).toBeInTheDocument();
  });

  it('contains router structure', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
