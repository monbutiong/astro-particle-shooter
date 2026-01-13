import { useRef, useEffect } from 'react';

export const useBackgroundMusic = (shouldPlay, musicFile) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (shouldPlay && !audioRef.current) {
      // Create audio element
      audioRef.current = new Audio(musicFile);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // 30% volume
      
      // Play the music
      audioRef.current.play().catch(err => {
        console.log('Audio autoplay prevented:', err);
      });
    } else if (!shouldPlay && audioRef.current) {
      // Stop and cleanup
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [shouldPlay, musicFile]);

  return audioRef;
};

export const playClickSound = () => {
  const audio = new Audio('/assets/audio/ui_click.wav');
  audio.volume = 0.5;
  audio.play().catch(err => console.log('Click sound failed:', err));
};
