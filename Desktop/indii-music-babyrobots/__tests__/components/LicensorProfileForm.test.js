import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LicensorProfileForm from '../../src/components/LicensorProfileForm';

// Mock the fetch API globally, but allow for specific overrides per test
global.fetch = jest.fn();

describe('LicensorProfileForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the create profile form correctly', async () => {
    // Mock fetch to return 404 for the initial GET request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) })
    );

    await act(async () => {
      render(<LicensorProfileForm userId={1} />);
    });

    expect(screen.getByRole('heading', { name: /Create Licensor Profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Name:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Profile/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
    expect(fetch).toHaveBeenCalledWith(
      `/api/profile/licensor?userId=${1}`,
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('renders the edit profile form correctly when profile exists', async () => {
    // Mock fetch to return an existing profile for the initial GET request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 101,
          company_name: 'Existing Company',
          contact_person: 'John Doe',
          industry: 'Film',
          budget_range: '10k-50k',
          licensing_needs: 'Needs music for a documentary.',
        }),
      })
    );

    await act(async () => {
      render(<LicensorProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Licensor Profile/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Company Name:/i)).toHaveValue('Existing Company');
    expect(screen.getByRole('button', { name: /Update Profile/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
  });

  it('handles profile creation successfully', async () => {
    // Mock fetch to return 404 for GET first, then success for POST
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) }));
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Licensor profile created successfully!', profileId: 102 }) }));

    await act(async () => {
      render(<LicensorProfileForm userId={2} />); // Use a different userId to simulate new user
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create Licensor Profile/i })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Company Name:/i), 'New Licensor Co.');
    await userEvent.type(screen.getByLabelText(/Contact Person:/i), 'Jane Smith');
    fireEvent.change(screen.getByLabelText(/Licensing Needs:/i), { target: { value: 'Looking for upbeat indie music.' } });
    await fireEvent.click(screen.getByRole('button', { name: /Create Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + POST
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/licensor',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 2,
            companyName: 'New Licensor Co.',
            contactPerson: 'Jane Smith',
            industry: '',
            budgetRange: '',
            licensingNeeds: 'Looking for upbeat indie music.',
          }),
        })
      );
      expect(screen.getByText(/Profile created successfully!/i)).toBeInTheDocument();
    });
  });

  it('handles profile update successfully', async () => {
    // Mock fetch to return an existing profile for GET, then success for PUT
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 101,
          company_name: 'Existing Company',
          contact_person: 'John Doe',
          industry: 'Film',
          budget_range: '10k-50k',
          licensing_needs: 'Needs music for a documentary.',
        }),
      })
    );
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Licensor profile updated successfully!' }) }));

    await act(async () => {
      render(<LicensorProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Licensor Profile/i })).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByLabelText(/Budget Range:/i));
    await userEvent.type(screen.getByLabelText(/Budget Range:/i), '50k-100k');
    await fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + PUT
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/licensor',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            userId: 1,
            companyName: 'Existing Company',
            contactPerson: 'John Doe',
            industry: 'Film',
            budgetRange: '50k-100k',
            licensingNeeds: 'Needs music for a documentary.',
          }),
        })
      );
      expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();
    });
  });
});
