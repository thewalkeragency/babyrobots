import React, { useState, useEffect } from 'react';

const FanProfileForm = ({ userId, onProfileSaved }) => {
  const [displayName, setDisplayName] = useState('');
  const [musicPreferences, setMusicPreferences] = useState(''); // Stored as JSON string
  const [listeningHistory, setListeningHistory] = useState(''); // Stored as JSON string
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userId) {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`/api/profile/fan?userId=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          if (response.ok && data.id) {
            setDisplayName(data.display_name || '');
            setMusicPreferences(data.music_preferences || '');
            setListeningHistory(data.listening_history || '');
            setIsEditing(true);
          } else if (response.status === 404) {
            setIsEditing(false);
            setMessage('No existing profile found. You can create a new one below.');
          } else {
            setMessage(`Error fetching profile: ${data.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error fetching fan profile:', error);
          setMessage('Error fetching profile. Please try again.');
        }
      };
      fetchProfile();
    } else {
      setIsEditing(false);
      setMessage('Please provide a user ID to create or edit a profile.');
    }
  }, [userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!userId) {
      setMessage('User ID is required to create or update a profile.');
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url = '/api/profile/fan';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          displayName,
          musicPreferences: musicPreferences || null,
          listeningHistory: listeningHistory || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Profile ${isEditing ? 'updated' : 'created'} successfully!`);
        setIsEditing(true);
        if (onProfileSaved) onProfileSaved();
      } else {
        setMessage(`Failed to ${isEditing ? 'update' : 'create'} profile: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} fan profile:`, error);
      setMessage(`Error ${isEditing ? 'updating' : 'creating'} profile. Please try again.`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
      <h2>{isEditing ? 'Edit Fan Profile' : 'Create Fan Profile'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="displayName" style={{ display: 'block', marginBottom: '5px' }}>Display Name:</label>
          <input type="text" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="musicPreferences" style={{ display: 'block', marginBottom: '5px' }}>Music Preferences (JSON string):</label>
          <textarea id="musicPreferences" value={musicPreferences} onChange={(e) => setMusicPreferences(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="4"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="listeningHistory" style={{ display: 'block', marginBottom: '5px' }}>Listening History (JSON string):</label>
          <textarea id="listeningHistory" value={listeningHistory} onChange={(e) => setListeningHistory(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="4"></textarea>
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isEditing ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default FanProfileForm;
