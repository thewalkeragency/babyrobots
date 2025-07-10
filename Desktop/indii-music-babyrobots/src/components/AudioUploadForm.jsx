import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';

const AudioUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState(null);

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

    const formData = new FormData();
    formData.append('audioFile', selectedFile);

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
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '500px', margin: '20px auto' }}>
      <h2>Upload Audio File</h2>
      <label htmlFor="audio-file-input" style={{ display: 'block', marginBottom: '5px' }}>Choose Audio File:</label>
      <input id="audio-file-input" type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile} style={{ marginLeft: '10px', padding: '8px 15px', cursor: 'pointer' }}>
        Upload
      </button>
      {message && <p style={{ marginTop: '10px', color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
      {uploadedAudioUrl && <AudioPlayer audioUrl={uploadedAudioUrl} />}
    </div>
  );
};

export default AudioUploadForm;
