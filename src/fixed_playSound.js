  // Play sound effect - FIXED: Made truly asynchronous
  const playSound = useCallback((soundName, volume = sfxVolumeRef.current) => {
    const sound = soundsRef.current[soundName];
    if (!sound) return;

    // CRITICAL: Play sound in a separate execution context to prevent blocking
    // Using setTimeout ensures audio operations don't freeze the game loop
    setTimeout(() => {
      try {
        const audio = sound.cloneNode();
        audio.volume = volume;
        audio.currentTime = 0;
        
        // Check if audio context is ready
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          // Play without awaiting - let it run in background
          const playPromise = audio.play();
          
          // Handle promise rejections asynchronously
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              // Silently ignore audio errors - they shouldn't crash the game
            });
          }
        }
      } catch (error) {
        // Catch any synchronous errors - don't let them propagate to game loop
      }
    }, 0);
  }, []);
