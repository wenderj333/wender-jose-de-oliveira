import React, { createContext, useContext, useState, useCallback } from "react";

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  function playSong(song, songs) {
    const list = songs || [song];
    setPlaylist(list);
    const idx = list.findIndex(s => s.id === song.id);
    setCurrentIdx(idx >= 0 ? idx : 0);
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

  function nextSong() {
    if (!playlist.length) return;
    let idx;
    if (shuffle) {
      idx = Math.floor(Math.random() * playlist.length);
    } else {
      idx = currentIdx + 1 >= playlist.length ? 0 : currentIdx + 1;
    }
    setCurrentIdx(idx);
    setCurrentSong(playlist[idx]);
  }

  function prevSong() {
    if (!playlist.length) return;
    const idx = currentIdx - 1 < 0 ? playlist.length - 1 : currentIdx - 1;
    setCurrentIdx(idx);
    setCurrentSong(playlist[idx]);
  }

  function toggleShuffle() { setShuffle(prev => !prev); }
  function toggleRepeat() { setRepeat(prev => !prev); }

  return (
    <MusicContext.Provider value={{
      currentSong, isMinimized, isPlaying, shuffle, repeat, playlist, currentIdx,
      playSong, stopSong, toggleMinimize, setIsMinimized,
      nextSong, prevSong, toggleShuffle, toggleRepeat
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
