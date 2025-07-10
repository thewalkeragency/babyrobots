import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrackList from '../../src/components/TrackList';

// Fetch and window.confirm are now mocked globally in jest.setup.js

describe('TrackList', () => {
  beforeEach(() => {
    fetch.mockClear();
    window.confirm.mockClear();
    window.confirm.mockReturnValue(true);
  });

  it('renders no tracks message when no tracks are found', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );

    await act(async () => {
      render(<TrackList artistId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/No tracks found for this artist./i)).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`/api/tracks?artistId=1`);
  });

  it('renders a list of tracks', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Song A', artist_id: 1, album_title: 'Album A', file_url: 'http://example.com/songA.mp3' },
          { id: 2, title: 'Song B', artist_id: 1, file_url: 'http://example.com/songB.mp3' },
        ]),
      })
    );

    await act(async () => {
      render(<TrackList artistId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Song A/i)).toBeInTheDocument();
      expect(screen.getByText(/Song B/i)).toBeInTheDocument();
      expect(screen.getByText(/Album A/i)).toBeInTheDocument();
      // Check for audio elements by finding all audio tags
      expect(screen.getAllByTestId('audio-element')).toHaveLength(2);
    });
  });

  it('handles track deletion successfully', async () => {
    // Mock initial fetch for tracks
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Song A', artist_id: 1, file_url: 'http://example.com/songA.mp3' },
        ]),
      })
    );
    // Mock delete request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Track deleted successfully!' }) })
    );
    // Mock fetch after delete to refresh list (empty array)
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );

    await act(async () => {
      render(<TrackList artistId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Song A/i)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3); // Initial GET + DELETE + Refresh GET
      expect(fetch).toHaveBeenCalledWith(
        `/api/tracks?id=${1}`,
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(screen.getByText(/Track deleted successfully!/i)).toBeInTheDocument();
      expect(screen.getByText(/No tracks found for this artist./i)).toBeInTheDocument();
    });
  });
});
