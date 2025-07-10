import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../../src/components/RegisterForm';
import LoginForm from '../../src/components/LoginForm';

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Success!' }),
  })
);

describe('Auth Forms', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('RegisterForm', () => {
    it('renders the registration form correctly', () => {
      render(<RegisterForm />);
      expect(screen.getByRole('heading', { name: /Register/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Role:/i)).toBeInTheDocument();
    });

    it('handles successful registration', async () => {
      render(<RegisterForm />);
      await userEvent.type(screen.getByLabelText(/Email:/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/Password:/i), 'password123');
      await userEvent.selectOptions(screen.getByLabelText(/Role:/i), 'fan');

      await fireEvent.click(screen.getByRole('button', { name: /Register/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          '/api/auth/register',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', password: 'password123', role: 'fan' }),
          })
        );
        expect(screen.getByText(/Registration successful:/i)).toBeInTheDocument();
      });
    });

    it('handles failed registration', async () => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'User already exists' }),
        })
      );

      render(<RegisterForm />);
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
      render(<LoginForm />);
      expect(screen.getByRole('heading', { name: /Login/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    });

    it('handles successful login', async () => {
      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText(/Email:/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/Password:/i), 'password123');

      await fireEvent.click(screen.getByRole('button', { name: /Login/i }));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
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
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Invalid credentials.' }),
        })
      );

      render(<LoginForm />);
      await userEvent.type(screen.getByLabelText(/Email:/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/Password:/i), 'wrongpassword');

      await fireEvent.click(screen.getByRole('button', { name: /Login/i }));

      await waitFor(() => {
        expect(screen.getByText(/Login failed: Invalid credentials./i)).toBeInTheDocument();
      });
    });
  });
});
