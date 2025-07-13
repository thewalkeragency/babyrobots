import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';

const AudioUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);
  const [artistId, setArtistId] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    setUploadedAudioUrl(null); // Clear previous URL on new file selection
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select an audio file first!');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('audioFile', selectedFile);
    formData.append('artistId', artistId);
    formData.append('title', title);
    formData.append('genre', genre);
    formData.append('mood', mood);
    formData.append('description', description);

    try {
      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Upload successful! File URL: ${data.fileUrl}`);
        setUploadedAudioUrl(data.fileUrl); // Set the URL for playback
        setSelectedFile(null); // Clear selected file after upload
      } else {
        setMessage(`Upload failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '500px', margin: '20px auto' }}>
      <h2>Upload Audio File</h2>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="artistId" style={{ display: 'block', marginBottom: '5px' }}>Artist ID:</label>
        <input type="text" id="artistId" value={artistId} onChange={(e) => setArtistId(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="genre" style={{ display: 'block', marginBottom: '5px' }}>Genre:</label>
        <input type="text" id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="mood" style={{ display: 'block', marginBottom: '5px' }}>Mood:</label>
        <input type="text" id="mood" value={mood} onChange={(e) => setMood(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} rows="4"></textarea>
      </div>
      <label htmlFor="audio-file-input" style={{ display: 'block', marginBottom: '5px' }}>Choose Audio File:</label>
      <input id="audio-file-input" type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || isLoading} style={{ marginLeft: '10px', padding: '8px 15px', cursor: 'pointer' }}>
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p style={{ marginTop: '10px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
      {uploadedAudioUrl && <AudioPlayer track={{ fileUrl: uploadedAudioUrl, title, artist: 'Your Artist Name' }} />}
    </div>
  );
};

export default AudioUploadForm;
