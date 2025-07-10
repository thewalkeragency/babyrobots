import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FanProfileForm from '../../src/components/FanProfileForm';

// Mock the fetch API globally, but allow for specific overrides per test
global.fetch = jest.fn();

describe('FanProfileForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the create profile form correctly', async () => {
    // Mock fetch to return 404 for the initial GET request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) })
    );

    await act(async () => {
      render(<FanProfileForm userId={1} />);
    });

    expect(screen.getByRole('heading', { name: /Create Fan Profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Display Name:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Profile/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
    expect(fetch).toHaveBeenCalledWith(
      `/api/profile/fan?userId=${1}`,
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
          display_name: 'Existing Fan',
          music_preferences: '{"genres":["pop","rock"]}',
          listening_history: '{"songs":["song1","song2"]}',
        }),
      })
    );

    await act(async () => {
      render(<FanProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Fan Profile/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Display Name:/i)).toHaveValue('Existing Fan');
    expect(screen.getByRole('button', { name: /Update Profile/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
  });

  it('handles profile creation successfully', async () => {
    // Mock fetch to return 404 for GET first, then success for POST
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) }));
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Fan profile created successfully!', profileId: 102 }) }));

    await act(async () => {
      render(<FanProfileForm userId={2} />); // Use a different userId to simulate new user
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create Fan Profile/i })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Display Name:/i), 'New Fan');
    fireEvent.change(screen.getByLabelText(/Music Preferences \(JSON string\):/i), { target: { value: '{"genres":["jazz"]}' } });
    await fireEvent.click(screen.getByRole('button', { name: /Create Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + POST
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/fan',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 2,
            displayName: 'New Fan',
            musicPreferences: '{"genres":["jazz"]}',
            listeningHistory: null,
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
          display_name: 'Existing Fan',
          music_preferences: '{"genres":["pop","rock"]}',
          listening_history: '{"songs":["song1","song2"]}',
        }),
      })
    );
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Fan profile updated successfully!' }) }));

    await act(async () => {
      render(<FanProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Fan Profile/i })).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByLabelText(/Listening History \(JSON string\):/i));
    fireEvent.change(screen.getByLabelText(/Listening History \(JSON string\):/i), { target: { value: '{"songs":["song3"]}' } });
    await fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + PUT
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/fan',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            userId: 1,
            displayName: 'Existing Fan',
            musicPreferences: '{"genres":["pop","rock"]}',
            listeningHistory: '{"songs":["song3"]}',
          }),
        })
      );
      expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();
    });
  });
});
