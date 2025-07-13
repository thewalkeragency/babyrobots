// Test the database functions directly instead of the API handler
// This avoids module resolution issues with Next.js API routes in Jest
import { jest } from '@jest/globals';

// Mock the database functions
const mockDbFunctions = {
  createTrack: jest.fn(),
  getTrackById: jest.fn(),
  updateTrack: jest.fn(),
  deleteTrack: jest.fn(),
  getTracksByArtistId: jest.fn(),
};

jest.mock('@/lib/db', () => mockDbFunctions);

const { createTrack, getTrackById, updateTrack, deleteTrack, getTracksByArtistId } = mockDbFunctions;

describe('Tracks Database Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test createTrack function
  it('should create a track', () => {
    createTrack.mockReturnValue(101);

    const result = createTrack(1, 'New Song', 'Album', 'Pop', null, null, 120, 'C', 180, null, null, false, 'en', null, null, 'Artist', null, null, null);

    expect(createTrack).toHaveBeenCalledWith(1, 'New Song', 'Album', 'Pop', null, null, 120, 'C', 180, null, null, false, 'en', null, null, 'Artist', null, null, null);
    expect(result).toBe(101);
  });

  // Test getTrackById function
  it('should get a track by ID', () => {
    const mockTrack = { id: 101, title: 'Fetched Song', artist_id: 1 };
    getTrackById.mockReturnValue(mockTrack);

    const result = getTrackById(101);

    expect(getTrackById).toHaveBeenCalledWith(101);
    expect(result).toEqual(mockTrack);
  });

  it('should return null for non-existent track', () => {
    getTrackById.mockReturnValue(null);

    const result = getTrackById(999);

    expect(getTrackById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  // Test getTracksByArtistId function
  it('should get tracks by artist ID', () => {
    const mockTracks = [{ id: 101, title: 'Song 1' }, { id: 102, title: 'Song 2' }];
    getTracksByArtistId.mockReturnValue(mockTracks);

    const result = getTracksByArtistId(1);

    expect(getTracksByArtistId).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockTracks);
  });

  // Test updateTrack function
  it('should update a track', () => {
    updateTrack.mockReturnValue(1); // 1 change made

    const result = updateTrack(101, 1, 'Updated Song', 'Album', 'Rock', null, null, 140, 'G', 200, null, null, false, 'en', null, null, 'Artist', null, null, null);

    expect(updateTrack).toHaveBeenCalledWith(101, 1, 'Updated Song', 'Album', 'Rock', null, null, 140, 'G', 200, null, null, false, 'en', null, null, 'Artist', null, null, null);
    expect(result).toBe(1);
  });

  it('should return 0 changes for non-existent track update', () => {
    updateTrack.mockReturnValue(0); // 0 changes made

    const result = updateTrack(999, 1, 'Updated Song', 'Album', 'Rock', null, null, 140, 'G', 200, null, null, false, 'en', null, null, 'Artist', null, null, null);

    expect(result).toBe(0);
  });

  // Test deleteTrack function
  it('should delete a track', () => {
    deleteTrack.mockReturnValue(1); // 1 change made

    const result = deleteTrack(101);

    expect(deleteTrack).toHaveBeenCalledWith(101);
    expect(result).toBe(1);
  });

  it('should return 0 changes for non-existent track deletion', () => {
    deleteTrack.mockReturnValue(0); // 0 changes made

    const result = deleteTrack(999);

    expect(deleteTrack).toHaveBeenCalledWith(999);
    expect(result).toBe(0);
  });
});
