import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrackForm from '../../src/components/TrackForm';

// Mock the fetch API globally, but allow for specific overrides per test
global.fetch = jest.fn();

describe('TrackForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the create track form correctly', async () => {
    // Mock fetch to return 404 for the initial GET request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ message: 'Not found' }) })
    );

    await act(async () => {
      render(<TrackForm artistId={1} />);
    });

    expect(screen.getByRole('heading', { name: /Create New Track/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Title:/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Track/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(0); // No initial GET call if trackId is not provided
  });

  it('renders the edit track form correctly when track exists', async () => {
    // Mock fetch to return an existing track for the initial GET request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          id: 101,
          artist_id: 1,
          title: 'Existing Song',
          album_title: 'Existing Album',
          genre: 'Rock',
          mood_tags: '["energetic","upbeat"]',
          instrumentation: '["guitar","drums"]',
          tempo_bpm: 120,
          key_signature: 'C Major',
          duration_seconds: 180,
          isrc: 'US-XXXXX-YY-ZZZZZ',
          iswc: 'T-000.000.000-0',
          explicit_content: true,
          language: 'English',
          release_date: '2023-01-01',
          original_release_date: '2022-12-01',
          copyright_holder: 'Artist Name',
          ai_tags: '["ai-generated","test-tag"]',
          file_url: 'http://example.com/existing.mp3',
          cover_art_url: 'http://example.com/existing.jpg',
        })
      })
    );

    await act(async () => {
      render(<TrackForm artistId={1} trackId={101} />);
    });

    // Wait for the fetch to complete and the component to switch to edit mode
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Track/i })).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByRole('textbox', { name: /^Title:/i })).toHaveValue('Existing Song');
    expect(screen.getByRole('button', { name: /Update Track/i })).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1); // Initial GET call
    expect(fetch).toHaveBeenCalledWith(
      `/api/tracks?id=${101}`,
      expect.objectContaining({
        method: 'GET',
      })
    );
  });

  it('handles track creation successfully', async () => {
    // Only mock the POST request since no trackId is provided (no initial GET)
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ message: 'Track created successfully!', trackId: 102 }),
    });

    await act(async () => {
      render(<TrackForm artistId={2} />); // Use a different artistId to simulate new track
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create New Track/i })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByRole('textbox', { name: /^Title:/i }), 'New Track Title');
    await userEvent.type(screen.getByRole('textbox', { name: /^Album Title:/i }), 'New Album');
    fireEvent.change(screen.getByLabelText(/Mood Tags \(JSON string\):/i), { target: { value: '["chill","relaxing"]' } });
    await userEvent.type(screen.getByRole('spinbutton', { name: /Tempo \(BPM\):/i }), '90');
    await userEvent.click(screen.getByRole('checkbox', { name: /Explicit Content/i }));
    await userEvent.type(screen.getByRole('textbox', { name: /File URL:/i }), 'http://example.com/new.mp3');
    await fireEvent.click(screen.getByRole('button', { name: /Create Track/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1); // Only POST (no initial GET for create)
      expect(fetch).toHaveBeenCalledWith(
        '/api/tracks',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            artistId: 2,
            title: 'New Track Title',
            albumTitle: 'New Album',
            genre: '',
            moodTags: '["chill","relaxing"]',
            instrumentation: null,
            tempoBpm: 90,
            keySignature: '',
            durationSeconds: null,
            isrc: '',
            iswc: '',
            explicitContent: true,
            language: '',
            releaseDate: '',
            originalReleaseDate: '',
            copyrightHolder: '',
            aiTags: null,
            fileUrl: 'http://example.com/new.mp3',
            coverArtUrl: '',
          }),
        })
      );
      expect(screen.getByText(/Track created successfully!/i)).toBeInTheDocument();
    });
  });

  it('handles track update successfully', async () => {
    // Mock fetch to return an existing track for GET, then success for PUT
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          id: 101,
          artist_id: 1,
          title: 'Existing Song',
          album_title: 'Existing Album',
          genre: 'Rock',
          mood_tags: '["energetic","upbeat"]',
          instrumentation: '["guitar","drums"]',
          tempo_bpm: 120,
          key_signature: 'C Major',
          duration_seconds: 180,
          isrc: 'US-XXXXX-YY-ZZZZZ',
          iswc: 'T-000.000.000-0',
          explicit_content: true,
          language: 'English',
          release_date: '2023-01-01',
          original_release_date: '2022-12-01',
          copyright_holder: 'Artist Name',
          ai_tags: '["ai-generated","test-tag"]',
          file_url: 'http://example.com/existing.mp3',
          cover_art_url: 'http://example.com/existing.jpg',
        })
      })
    );
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Track updated successfully!' }),
    });

    await act(async () => {
      render(<TrackForm artistId={1} trackId={101} />);
    });

    // Wait for the fetch to complete and the component to switch to edit mode
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Edit Track/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    await userEvent.clear(screen.getByRole('textbox', { name: /^Genre:/i }));
    await userEvent.type(screen.getByRole('textbox', { name: /^Genre:/i }), 'Electronic');
    await fireEvent.click(screen.getByRole('button', { name: /Update Track/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial GET + PUT
      expect(fetch).toHaveBeenCalledWith(
        `/api/tracks?id=${101}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            artistId: 1,
            title: 'Existing Song',
            albumTitle: 'Existing Album',
            genre: 'Electronic',
            moodTags: '["energetic","upbeat"]',
            instrumentation: '["guitar","drums"]',
            tempoBpm: 120,
            keySignature: 'C Major',
            durationSeconds: 180,
            isrc: 'US-XXXXX-YY-ZZZZZ',
            iswc: 'T-000.000.000-0',
            explicitContent: true,
            language: 'English',
            releaseDate: '2023-01-01',
            originalReleaseDate: '2022-12-01',
            copyrightHolder: 'Artist Name',
            aiTags: '["ai-generated","test-tag"]',
            fileUrl: 'http://example.com/existing.mp3',
            coverArtUrl: 'http://example.com/existing.jpg',
          }),
        })
      );
      expect(screen.getByText(/Track updated successfully!/i)).toBeInTheDocument();
    });
  });
});
