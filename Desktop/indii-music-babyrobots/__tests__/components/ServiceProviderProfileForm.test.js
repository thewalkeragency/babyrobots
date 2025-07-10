import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServiceProviderProfileForm from '../../src/components/ServiceProviderProfileForm';

// Mock the fetch API globally, but allow for specific overrides per test
global.fetch = jest.fn();

describe('ServiceProviderProfileForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the create profile form correctly', async () => {
    // Mock fetch to return 404 for the initial GET request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) })
    );

    await act(async () => {
      render(<ServiceProviderProfileForm userId={1} />);
    });

    expect(screen.getByRole('heading', { name: /Create Service Provider Profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Name:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Profile/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
    expect(fetch).toHaveBeenCalledWith(
      `/api/profile/serviceProvider?userId=${1}`,
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
          business_name: 'Existing Studio',
          service_categories: '["mixing","mastering"]',
          skills: '["protools","logic"]',
          experience_years: 10,
          portfolio_urls: '["http://portfolio.com/1","http://portfolio.com/2"]',
          rates: '{"hourly":100,"project":"negotiable"}',
          availability_status: 'Available',
        }),
      })
    );

    await act(async () => {
      render(<ServiceProviderProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Service Provider Profile/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Business Name:/i)).toHaveValue('Existing Studio');
    expect(screen.getByRole('button', { name: /Update Profile/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
  });

  it('handles profile creation successfully', async () => {
    // Mock fetch to return 404 for GET first, then success for POST
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) }));
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Service provider profile created successfully!', profileId: 102 }) }));

    await act(async () => {
      render(<ServiceProviderProfileForm userId={2} />); // Use a different userId to simulate new user
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create Service Provider Profile/i })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Business Name:/i), 'New Provider Co.');
    fireEvent.change(screen.getByLabelText(/Service Categories \(JSON string\):/i), { target: { value: '["production"]' } });
    fireEvent.change(screen.getByLabelText(/Skills \(JSON string\):/i), { target: { value: '["fl studio"]' } });
    await userEvent.type(screen.getByLabelText(/Experience Years:/i), '2');
    fireEvent.change(screen.getByLabelText(/Portfolio URLs \(JSON string\):/i), { target: { value: '["http://new.com/portfolio"]' } });
    fireEvent.change(screen.getByLabelText(/Rates \(JSON string\):/i), { target: { value: '{"hourly":50}' } });
    await userEvent.type(screen.getByLabelText(/Availability Status:/i), 'Busy');
    await fireEvent.click(screen.getByRole('button', { name: /Create Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + POST
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/serviceProvider',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 2,
            businessName: 'New Provider Co.',
            serviceCategories: '["production"]',
            skills: '["fl studio"]',
            experienceYears: 2,
            portfolioUrls: '["http://new.com/portfolio"]',
            rates: '{"hourly":50}',
            availabilityStatus: 'Busy',
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
          business_name: 'Existing Studio',
          service_categories: '["mixing","mastering"]',
          skills: '["protools","logic"]',
          experience_years: 10,
          portfolio_urls: '["http://portfolio.com/1","http://portfolio.com/2"]',
          rates: '{"hourly":100,"project":"negotiable"}',
          availability_status: 'Available',
        }),
      })
    );
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Service provider profile updated successfully!' }) }));

    await act(async () => {
      render(<ServiceProviderProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Service Provider Profile/i })).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByLabelText(/Availability Status:/i));
    await userEvent.type(screen.getByLabelText(/Availability Status:/i), 'Unavailable');
    await fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + PUT
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/serviceProvider',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            userId: 1,
            businessName: 'Existing Studio',
            serviceCategories: '["mixing","mastering"]',
            skills: '["protools","logic"]',
            experienceYears: 10,
            portfolioUrls: '["http://portfolio.com/1","http://portfolio.com/2"]',
            rates: '{"hourly":100,"project":"negotiable"}',
            availabilityStatus: 'Unavailable',
          }),
        })
      );
      expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();
    });
  });
});
