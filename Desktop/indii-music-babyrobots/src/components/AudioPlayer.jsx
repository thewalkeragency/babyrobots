import React, { useRef, useState, useEffect } from 'react';
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid';

const AudioPlayer = ({ track, compact = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.load(); // Load new track
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [track]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!track) {
    return null;
  }

  if (compact) {
    return (
      <div className="uk-flex uk-flex-middle uk-flex-between uk-padding-small uk-background-muted uk-border-rounded uk-margin-small-bottom">
        <div className="uk-flex uk-flex-middle">
          <button onClick={togglePlayPause} className="uk-button uk-button-text uk-margin-small-right">
            {isPlaying ? <PauseIcon className="uk-icon" style={{width: '20px', height: '20px'}} /> : <PlayIcon className="uk-icon" style={{width: '20px', height: '20px'}} />}
          </button>
          <div>
            <span className="uk-text-white uk-text-bold">{track.title || 'Unknown Title'}</span>
            <span className="uk-text-muted uk-text-small uk-margin-small-left">{track.artist || 'Unknown Artist'}</span>
          </div>
        </div>
        <div className="uk-text-muted uk-text-small">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <audio
          ref={audioRef}
          src={track.fileUrl}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px', textAlign: 'center' }}>
      <h3>Now Playing: {track.title || 'Unknown Title'} by {track.artist || 'Unknown Artist'}</h3>
      <audio
        ref={audioRef}
        src={track.fileUrl}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        controls
        style={{ width: '100%', maxWidth: '400px' }}
        role="audio"
      >
        Your browser does not support the audio element.
      </audio>
      <div style={{ marginTop: '10px' }}>
        <button onClick={togglePlayPause} style={{ margin: '0 5px' }}>
          {isPlaying ? <PauseIcon style={{width: '24px', height: '24px'}} /> : <PlayIcon style={{width: '24px', height: '24px'}} />}
        </button>
        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>
      <p>File URL: <a href={track.fileUrl} target="_blank" rel="noopener noreferrer">{track.fileUrl}</a></p>
    </div>
  );
};

export default AudioPlayer;
