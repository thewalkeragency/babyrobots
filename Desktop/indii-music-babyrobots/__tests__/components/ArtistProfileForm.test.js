import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArtistProfileForm from '../../src/components/ArtistProfileForm';
import { faker } from '@faker-js/faker';

// Mock the fetch API globally, but allow for specific overrides per test
global.fetch = jest.fn();

describe('ArtistProfileForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the create profile form correctly', async () => {
    // Mock fetch to return 404 for the initial GET request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) })
    );

    await act(async () => {
      render(<ArtistProfileForm userId={1} />);
    });

    expect(screen.getByRole('heading', { name: /Create Artist Profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Stage Name:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Profile/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
    expect(fetch).toHaveBeenCalledWith(
      `/api/profile/artist?userId=${1}`,
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
          stage_name: faker.person.firstName(),
          legal_name: faker.person.lastName(),
          bio: faker.lorem.sentence(),
          website: faker.internet.url(),
          pro_affiliation: faker.company.name(),
          ipi_number: faker.string.numeric(5),
          social_links: JSON.stringify({ twitter: faker.internet.userName() }),
          profile_image_url: faker.image.avatar(),
        }),
      })
    );

    await act(async () => {
      render(<ArtistProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Artist Profile/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Stage Name:/i)).toHaveValue('Existing Artist');
    expect(screen.getByRole('button', { name: /Update Profile/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
  });

  it('handles profile creation successfully', async () => {
    // Mock fetch to return 404 for GET first, then success for POST
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) }));
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Artist profile created successfully!', profileId: 102 }) }));

    await act(async () => {
      render(<ArtistProfileForm userId={2} />); // Use a different userId to simulate new user
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create Artist Profile/i })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Stage Name:/i), 'New Artist');
    await userEvent.type(screen.getByLabelText(/Legal Name:/i), 'New Legal');
    await fireEvent.click(screen.getByRole('button', { name: /Create Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + POST
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/artist',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 2,
            stageName: 'New Artist',
            legalName: 'New Legal',
            bio: '',
            website: '',
            proAffiliation: '',
            ipiNumber: '',
            socialLinks: null,
            profileImageUrl: '',
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
          stage_name: faker.person.firstName(),
          legal_name: faker.person.lastName(),
          bio: faker.lorem.sentence(),
          website: faker.internet.url(),
          pro_affiliation: faker.company.name(),
          ipi_number: faker.string.numeric(5),
          social_links: JSON.stringify({ twitter: faker.internet.userName() }),
          profile_image_url: faker.image.avatar(),
        }),
      })
    );
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Artist profile updated successfully!' }) }));

    await act(async () => {
      render(<ArtistProfileForm userId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Artist Profile/i })).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByLabelText(/Bio:/i));
    const updatedBio = faker.lorem.sentence();
    await userEvent.type(screen.getByLabelText(/Bio:/i), updatedBio);
    await fireEvent.click(screen.getByRole('button', { name: /Update Profile/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + PUT
      expect(fetch).toHaveBeenCalledWith(
        '/api/profile/artist',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            userId: 1,
            stageName: expect.any(String), // Value is dynamic from mock
            legalName: expect.any(String), // Value is dynamic from mock
            bio: updatedBio,
            website: expect.any(String),
            proAffiliation: expect.any(String),
            ipiNumber: expect.any(String),
            socialLinks: expect.any(String),
            profileImageUrl: expect.any(String),
          }),
        })
      );
      expect(screen.getByText(/Profile updated successfully!/i)).toBeInTheDocument();
    });
  });
});
