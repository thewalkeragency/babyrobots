import React, { useState, useEffect } from 'react';

const TrackForm = ({ artistId, trackId, onTrackSaved }) => {
  const [title, setTitle] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [moodTags, setMoodTags] = useState(''); // JSON string
  const [instrumentation, setInstrumentation] = useState(''); // JSON string
  const [tempoBpm, setTempoBpm] = useState('');
  const [keySignature, setKeySignature] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [isrc, setIsrc] = useState('');
  const [iswc, setIswc] = useState('');
  const [explicitContent, setExplicitContent] = useState(false);
  const [language, setLanguage] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [originalReleaseDate, setOriginalReleaseDate] = useState('');
  const [copyrightHolder, setCopyrightHolder] = useState('');
  const [aiTags, setAiTags] = useState(''); // JSON string
  const [fileUrl, setFileUrl] = useState('');
  const [coverArtUrl, setCoverArtUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (trackId) {
      const fetchTrack = async () => {
        try {
          const response = await fetch(`/api/tracks?id=${trackId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          if (response.ok && data.id) {
            setTitle(data.title || '');
            setAlbumTitle(data.album_title || '');
            setGenre(data.genre || '');
            setMoodTags(data.mood_tags || '');
            setInstrumentation(data.instrumentation || '');
            setTempoBpm(data.tempo_bpm || '');
            setKeySignature(data.key_signature || '');
            setDurationSeconds(data.duration_seconds || '');
            setIsrc(data.isrc || '');
            setIswc(data.iswc || '');
            setExplicitContent(data.explicit_content || false);
            setLanguage(data.language || '');
            setReleaseDate(data.release_date || '');
            setOriginalReleaseDate(data.original_release_date || '');
            setCopyrightHolder(data.copyright_holder || '');
            setAiTags(data.ai_tags || '');
            setFileUrl(data.file_url || '');
            setCoverArtUrl(data.cover_art_url || '');
            setIsEditing(true);
          } else if (response.status === 404) {
            setIsEditing(false);
          } else {
            setMessage(`Error fetching track: ${data.message || 'Unknown error'}`);
            setIsEditing(false);
          }
        } catch (error) {
          console.error('Error fetching track:', error);
          setMessage('Error fetching track. Please try again.');
        }
      };
      fetchTrack();
    }
  }, [trackId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/tracks?id=${trackId}` : '/api/tracks';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId,
          title,
          albumTitle,
          genre,
          moodTags: moodTags || null,
          instrumentation: instrumentation || null,
          tempoBpm: tempoBpm ? parseInt(tempoBpm, 10) : null,
          keySignature,
          durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : null,
          isrc,
          iswc,
          explicitContent,
          language,
          releaseDate,
          originalReleaseDate,
          copyrightHolder,
          aiTags: aiTags || null,
          fileUrl,
          coverArtUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Track ${isEditing ? 'updated' : 'created'} successfully!`);
        setIsEditing(true);
        if (onTrackSaved) onTrackSaved();
      } else {
        setMessage(`Failed to ${isEditing ? 'update' : 'create'} track: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} track:`, error);
      setMessage(`Error ${isEditing ? 'updating' : 'creating'} track. Please try again.`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '800px', margin: '20px auto' }}>
      <h2>{isEditing ? 'Edit Track' : 'Create New Track'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="albumTitle" style={{ display: 'block', marginBottom: '5px' }}>Album Title:</label>
          <input type="text" id="albumTitle" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="genre" style={{ display: 'block', marginBottom: '5px' }}>Genre:</label>
          <input type="text" id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="moodTags" style={{ display: 'block', marginBottom: '5px' }}>Mood Tags (JSON string):</label>
          <textarea id="moodTags" value={moodTags} onChange={(e) => setMoodTags(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="2"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="instrumentation" style={{ display: 'block', marginBottom: '5px' }}>Instrumentation (JSON string):</label>
          <textarea id="instrumentation" value={instrumentation} onChange={(e) => setInstrumentation(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="2"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="tempoBpm" style={{ display: 'block', marginBottom: '5px' }}>Tempo (BPM):</label>
          <input type="number" id="tempoBpm" value={tempoBpm} onChange={(e) => setTempoBpm(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="keySignature" style={{ display: 'block', marginBottom: '5px' }}>Key Signature:</label>
          <input type="text" id="keySignature" value={keySignature} onChange={(e) => setKeySignature(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="durationSeconds" style={{ display: 'block', marginBottom: '5px' }}>Duration (Seconds):</label>
          <input type="number" id="durationSeconds" value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="isrc" style={{ display: 'block', marginBottom: '5px' }}>ISRC:</label>
          <input type="text" id="isrc" value={isrc} onChange={(e) => setIsrc(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="iswc" style={{ display: 'block', marginBottom: '5px' }}>ISWC:</label>
          <input type="text" id="iswc" value={iswc} onChange={(e) => setIswc(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input type="checkbox" id="explicitContent" checked={explicitContent} onChange={(e) => setExplicitContent(e.target.checked)} />
          <label htmlFor="explicitContent" style={{ marginLeft: '5px' }}>Explicit Content</label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="language" style={{ display: 'block', marginBottom: '5px' }}>Language:</label>
          <input type="text" id="language" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="releaseDate" style={{ display: 'block', marginBottom: '5px' }}>Release Date:</label>
          <input type="date" id="releaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="originalReleaseDate" style={{ display: 'block', marginBottom: '5px' }}>Original Release Date:</label>
          <input type="date" id="originalReleaseDate" value={originalReleaseDate} onChange={(e) => setOriginalReleaseDate(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="copyrightHolder" style={{ display: 'block', marginBottom: '5px' }}>Copyright Holder:</label>
          <input type="text" id="copyrightHolder" value={copyrightHolder} onChange={(e) => setCopyrightHolder(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="aiTags" style={{ display: 'block', marginBottom: '5px' }}>AI Tags (JSON string):</label>
          <textarea id="aiTags" value={aiTags} onChange={(e) => setAiTags(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="2"></textarea>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="fileUrl" style={{ display: 'block', marginBottom: '5px' }}>File URL:</label>
          <input type="url" id="fileUrl" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="coverArtUrl" style={{ display: 'block', marginBottom: '5px' }}>Cover Art URL:</label>
          <input type="url" id="coverArtUrl" value={coverArtUrl} onChange={(e) => setCoverArtUrl(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isEditing ? 'Update Track' : 'Create Track'}
        </button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
};

export default TrackForm;
