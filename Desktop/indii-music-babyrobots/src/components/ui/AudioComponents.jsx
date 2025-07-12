import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

// Waveform Visualizer Component
export const WaveformDisplay = ({ 
  className, 
  height = 60, 
  animated = false,
  data = null,
  progress = 0 
}) => {
  // Generate mock waveform data if none provided
  const waveformData = data || Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.1);
  
  return (
    <div className={clsx("relative overflow-hidden rounded-lg bg-studio-800", className)}>
      <div className="flex items-end h-full space-x-0.5 p-2" style={{ height: `${height}px` }}>
        {waveformData.map((amplitude, index) => (
          <div
            key={index}
            className={clsx(
              "bg-gradient-to-t transition-all duration-300",
              index / waveformData.length <= progress / 100
                ? "from-electric-400 to-electric-300"
                : "from-technical-600 to-technical-500",
              animated && "animate-pulse"
            )}
            style={{
              height: `${amplitude * 100}%`,
              width: `${100 / waveformData.length}%`
            }}
          />
        ))}
      </div>
      
      {/* Progress indicator */}
      <div 
        className="absolute top-0 w-0.5 h-full bg-electric-400 shadow-lg shadow-electric-400/50 transition-all duration-300"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
};

// Audio Level Meter
export const AudioLevelMeter = ({ 
  level = 0, 
  peak = false, 
  className,
  orientation = 'vertical',
  showNumbers = false 
}) => {
  const segments = 20;
  const segmentLevel = level / 100 * segments;
  
  return (
    <div className={clsx(
      "flex bg-studio-900 rounded-lg p-1",
      orientation === 'vertical' ? 'flex-col-reverse h-32 w-6' : 'flex-row h-6 w-32',
      className
    )}>
      {Array.from({ length: segments }, (_, i) => {
        const isActive = i < segmentLevel;
        const isPeak = peak && i >= segments * 0.85;
        const isWarning = i >= segments * 0.7;
        
        return (
          <div
            key={i}
            className={clsx(
              "flex-1 rounded-sm mx-0.5 my-0.5 transition-all duration-75",
              isActive 
                ? isPeak 
                  ? "bg-audio-peak shadow-sm shadow-audio-peak/50" 
                  : isWarning 
                    ? "bg-audio-warning shadow-sm shadow-audio-warning/50"
                    : "bg-audio-levels shadow-sm shadow-audio-levels/50"
                : "bg-technical-800"
            )}
          />
        );
      })}
      
      {showNumbers && (
        <span className="text-xs text-technical-400 mt-1">
          {Math.round(level)}dB
        </span>
      )}
    </div>
  );
};

// Frequency Spectrum Display
export const SpectrumAnalyzer = ({ 
  className, 
  height = 80,
  bands = 32,
  animated = true 
}) => {
  const [spectrumData, setSpectrumData] = useState(
    Array.from({ length: bands }, () => Math.random() * 0.7 + 0.1)
  );
  
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setSpectrumData(prev => 
        prev.map(value => Math.max(0.1, value + (Math.random() - 0.5) * 0.3))
      );
    }, 100);
    
    return () => clearInterval(interval);
  }, [animated]);
  
  return (
    <div className={clsx("relative bg-studio-900 rounded-lg p-2", className)}>
      <div className="flex items-end justify-between h-full space-x-0.5" style={{ height: `${height}px` }}>
        {spectrumData.map((amplitude, index) => (
          <div
            key={index}
            className="bg-gradient-to-t from-audio-spectrum via-electric-500 to-electric-400 rounded-sm transition-all duration-100"
            style={{
              height: `${amplitude * 100}%`,
              width: `${100 / bands - 1}%`
            }}
          />
        ))}
      </div>
      
      {/* Frequency labels */}
      <div className="flex justify-between text-xs text-technical-500 mt-1">
        <span>20Hz</span>
        <span>1kHz</span>
        <span>20kHz</span>
      </div>
    </div>
  );
};

// Professional Audio Player
export const AudioPlayer = ({ 
  track,
  className,
  showWaveform = true,
  compact = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("3:45");
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  if (compact) {
    return (
      <div className={clsx("bg-studio-800 rounded-lg p-3 border border-technical-700", className)}>
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 bg-electric-500 hover:bg-electric-400 rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <div className="w-2 h-2 bg-white rounded-sm" />
            ) : (
              <div className="w-0 h-0 border-l-4 border-l-white border-y-2 border-y-transparent ml-0.5" />
            )}
          </button>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{track?.title || "Summer Vibes"}</div>
            <div className="text-xs text-technical-400">{currentTime} / {duration}</div>
          </div>
          
          <AudioLevelMeter level={isPlaying ? 65 : 0} className="w-4 h-8" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={clsx("bg-studio-800 rounded-lg p-4 border border-technical-700", className)}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-electric-400 to-electric-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {(track?.title || "Summer Vibes").charAt(0)}
          </span>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{track?.title || "Summer Vibes"}</h3>
          <p className="text-technical-400">{track?.artist || "Demo Artist"}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <AudioLevelMeter level={isPlaying ? 72 : 0} />
          <AudioLevelMeter level={isPlaying ? 68 : 0} />
        </div>
      </div>
      
      {showWaveform && (
        <WaveformDisplay 
          height={60} 
          progress={progress} 
          animated={isPlaying}
          className="mb-4"
        />
      )}
      
      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 bg-electric-500 hover:bg-electric-400 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-electric-500/30"
        >
          {isPlaying ? (
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-white rounded-sm" />
              <div className="w-1 h-4 bg-white rounded-sm" />
            </div>
          ) : (
            <div className="w-0 h-0 border-l-6 border-l-white border-y-4 border-y-transparent ml-1" />
          )}
        </button>
        
        <div className="flex-1 flex items-center space-x-3">
          <span className="text-sm text-technical-400 font-mono">{currentTime}</span>
          <div className="flex-1 bg-technical-700 rounded-full h-1">
            <div 
              className="bg-electric-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-technical-400 font-mono">{duration}</span>
        </div>
      </div>
    </div>
  );
};

// Mastering Analysis Panel
export const MasteringPanel = ({ className }) => {
  return (
    <div className={clsx("bg-studio-800 rounded-lg p-4 border border-technical-700", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Audio Analysis</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-studio-900 rounded-lg p-3">
          <div className="text-sm text-technical-400 mb-1">RMS Level</div>
          <div className="text-xl font-mono text-electric-400">-18.2 dB</div>
        </div>
        
        <div className="bg-studio-900 rounded-lg p-3">
          <div className="text-sm text-technical-400 mb-1">Peak Level</div>
          <div className="text-xl font-mono text-audio-warning">-2.1 dB</div>
        </div>
        
        <div className="bg-studio-900 rounded-lg p-3">
          <div className="text-sm text-technical-400 mb-1">Dynamic Range</div>
          <div className="text-xl font-mono text-audio-levels">12.3 LU</div>
        </div>
        
        <div className="bg-studio-900 rounded-lg p-3">
          <div className="text-sm text-technical-400 mb-1">LUFS</div>
          <div className="text-xl font-mono text-electric-400">-14.7</div>
        </div>
      </div>
      
      <SpectrumAnalyzer height={60} className="mb-4" />
      
      <div className="flex space-x-2">
        <button className="flex-1 bg-electric-600 hover:bg-electric-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Apply Mastering
        </button>
        <button className="px-4 py-2 border border-technical-600 text-technical-300 hover:bg-technical-800 rounded-lg text-sm font-medium transition-colors">
          Preview
        </button>
      </div>
    </div>
  );
};

// Quick Stats Widget
export const AudioStatsWidget = ({ className }) => {
  return (
    <div className={clsx("bg-studio-800 rounded-lg p-4 border border-technical-700", className)}>
      <h3 className="text-lg font-semibold text-white mb-4">Audio Stats</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-technical-400">Bit Depth</span>
          <span className="text-white font-mono">24-bit</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-technical-400">Sample Rate</span>
          <span className="text-white font-mono">48 kHz</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-technical-400">File Format</span>
          <span className="text-white font-mono">WAV</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-technical-400">Duration</span>
          <span className="text-white font-mono">3:45</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-technical-400">File Size</span>
          <span className="text-white font-mono">42.3 MB</span>
        </div>
      </div>
    </div>
  );
};
