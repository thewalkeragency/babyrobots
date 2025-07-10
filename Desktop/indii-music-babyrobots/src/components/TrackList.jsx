import React, { useState, useEffect } from 'react';

const TrackList = ({ artistId }) => {
  const [tracks, setTracks] = useState([]);
  const [message, setMessage] = useState('');

  const fetchTracks = async () => {
    try {
      const response = await fetch(`/api/tracks?artistId=${artistId}`);
      const data = await response.json();
      if (response.ok) {
        setTracks(data);
      } else {
        setMessage(`Error fetching tracks: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setMessage('Error fetching tracks. Please try again.');
    }
  };

  useEffect(() => {
    if (artistId) {
      fetchTracks();
    }
  }, [artistId]);

  const handleDelete = async (trackId) => {
    if (!window.confirm('Are you sure you want to delete this track?')) {
      return;
    }
    try {
      const response = await fetch(`/api/tracks?id=${trackId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`Track deleted successfully!`);
        fetchTracks(); // Refresh the list
      } else {
        setMessage(`Failed to delete track: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      setMessage('Error deleting track. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '800px', margin: '20px auto' }}>
      <h2>Your Tracks</h2>
      {message && <p style={{ marginTop: '10px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
      {tracks.length === 0 ? (
        <p>No tracks found for this artist.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tracks.map((track) => (
            <li key={track.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{track.title}</strong> by {track.artist_id}
                {track.album_title && <span> ({track.album_title})</span>}
                {track.file_url && <audio controls src={track.file_url} style={{ marginLeft: '10px' }} role="audio" data-testid="audio-element" />}
              </div>
              <button onClick={() => handleDelete(track.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrackList;
