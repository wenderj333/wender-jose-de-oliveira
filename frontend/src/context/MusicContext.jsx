import React, { createContext, useContext, useState } from 'react';

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  function playSong(song) {
    setCurrentSong(song);
    setIsPlaying(true);
    setIsMinimized(false);
  }

  function stopSong() {
    setCurrentSong(null);
    setIsPlaying(false);
  }

  function toggleMinimize() {
    setIsMinimized(prev => !prev);
  }

  return (
    <MusicContext.Provider value={{ currentSong, isMinimized, isPlaying, playSong, stopSong, toggleMinimize, setIsMinimized }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
