import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../../src/components/RegisterForm';
import LoginForm from '../../src/components/LoginForm';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { faker } from '@faker-js/faker';

// Mock the auth service
jest.mock('../../src/lib/auth-service.js', () => ({
  authService: {
    register: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock fetch for any remaining direct API calls
global.fetch = jest.fn();

// Helper to render components with AuthProvider
const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('Auth Forms', () => {
  beforeEach(() => {
    fetch.mockClear();
    // Default mock for session check
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false, authenticated: false }),
    });
  });

  describe('RegisterForm', () => {
    it('renders the registration form correctly', () => {
      renderWithAuth(<RegisterForm />);
      expect(screen.getByRole('heading', { name: /Register/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Role:/i)).toBeInTheDocument();
    });

    it('handles successful registration', async () => {
      // First call is for session check
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, authenticated: false }),
      });
      // Second call is for registration
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          message: 'Registration successful',
          user: { id: faker.string.uuid(), email: faker.internet.email(), role: 'fan' }
        }),

      renderWithAuth(<RegisterForm />);
      const email = faker.internet.email();
      const password = faker.internet.password();
      await userEvent.type(screen.getByLabelText(/Email:/i), email);
      await userEvent.type(screen.getByLabelText(/Password:/i), password);
      await userEvent.selectOptions(screen.getByLabelText(/Role:/i), 'fan');

      await fireEvent.click(screen.getByRole('button', { name: /Register/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/auth/signup',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', password: 'password123', role: 'fan' }),
          })
        );
        expect(screen.getByText(/Registration successful:/i)).toBeInTheDocument();
      });
    });

    it('handles failed registration', async () => {
      // First call is for session check
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, authenticated: false }),
      });
      // Second call is for registration
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          success: false, 
          message: 'User already exists' 
        }),
      });

      renderWithAuth(<RegisterForm />);
      await userEvent.type(screen.getByLabelText(/Email:/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/Password:/i), 'password123');

      await fireEvent.click(screen.getByRole('button', { name: /Register/i }));

      await waitFor(() => {
        expect(screen.getByText(/Registration failed: User already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('LoginForm', () => {
    it('renders the login form correctly', () => {
      renderWithAuth(<LoginForm />);
      expect(screen.getByRole('heading', { name: /Login/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    });

    it('handles successful login', async () => {
      // First call is for session check
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, authenticated: false }),
      });
      // Second call is for login
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          message: 'Login successful',
          user: { id: 'uuid-123', email: 'test@example.com', role: 'artist' }
        }),
      });

      renderWithAuth(<LoginForm />);
      await userEvent.type(screen.getByLabelText(/Email:/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/Password:/i), 'password123');

      await fireEvent.click(screen.getByRole('button', { name: /Login/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
          })
        );
        expect(screen.getByText(/Login successful:/i)).toBeInTheDocument();
      });
    });

    it('handles failed login', async () => {
      // First call is for session check
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, authenticated: false }),
      });
      // Second call is for login
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          success: false, 
          message: 'Invalid credentials.' 
        }),
      });

      renderWithAuth(<LoginForm />);
      const email = faker.internet.email();
      const password = faker.internet.password();
      await userEvent.type(screen.getByLabelText(/Email:/i), email);
      await userEvent.type(screen.getByLabelText(/Password:/i), password);

      await fireEvent.click(screen.getByRole('button', { name: /Login/i }));

      await waitFor(() => {
        expect(screen.getByText(/Login failed: Invalid credentials./i)).toBeInTheDocument();
      });
    });
  });
});
