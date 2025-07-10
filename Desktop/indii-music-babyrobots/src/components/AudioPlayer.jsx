import React from 'react';

const AudioPlayer = ({ audioUrl }) => {
  if (!audioUrl) {
    return null;
  }

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <h3>Now Playing:</h3>
      <audio controls src={audioUrl} style={{ width: '100%', maxWidth: '400px' }} role="audio">
        Your browser does not support the audio element.
      </audio>
      <p>File URL: <a href={audioUrl} target="_blank" rel="noopener noreferrer">{audioUrl}</a></p>
    </div>
  );
};

export default AudioPlayer;
