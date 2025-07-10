import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AudioUploadForm from '../../src/components/AudioUploadForm';

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'File uploaded successfully!', fileUrl: '/audio_uploads/test.mp3' }),
  })
);

describe('AudioUploadForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the upload form correctly', () => {
    render(<AudioUploadForm />);
    expect(screen.getByText(/Upload Audio File/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload/i })).toBeDisabled();
  });

  it('enables the upload button when a file is selected', async () => {
    render(<AudioUploadForm />);
    const fileInput = screen.getByLabelText(/Choose Audio File:/i);
    const uploadButton = screen.getByRole('button', { name: /Upload/i });

    const file = new File(['(⌐□_□)'], 'chucknorris.mp3', { type: 'audio/mp3' });
    await userEvent.upload(fileInput, file);

    expect(uploadButton).toBeEnabled();
  });

  it('displays a success message and audio player on successful upload', async () => {
    render(<AudioUploadForm />);
    const fileInput = screen.getByLabelText(/Choose Audio File:/i);
    const uploadButton = screen.getByRole('button', { name: /Upload/i });

    const file = new File(['(⌐□_□)'], 'test.mp3', { type: 'audio/mp3' });
    await userEvent.upload(fileInput, file);

    await fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Upload successful!/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Now Playing:/i)).toBeInTheDocument();
    expect(screen.getByRole('audio')).toHaveAttribute('src', '/audio_uploads/test.mp3');
  });

  it('displays an error message on failed upload', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' }),
      })
    );

    render(<AudioUploadForm />);
    const fileInput = screen.getByLabelText(/Choose Audio File:/i);
    const uploadButton = screen.getByRole('button', { name: /Upload/i });

    const file = new File(['(⌐□_□)'], 'error.mp3', { type: 'audio/mp3' });
    await userEvent.upload(fileInput, file);

    await fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Upload failed: Upload failed/i)).toBeInTheDocument();
    });
  });
});
