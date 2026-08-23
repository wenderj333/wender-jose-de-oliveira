// A small built-in sound avoids depending on an external audio URL.
// Browsers only allow sound after the person has interacted with the page,
// so we unlock the shared AudioContext on the first click/touch/key press.
let audioContext = null;
let unlocked = false;
let lastPlayedAt = 0;

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

export function enableNotificationSound() {
  const context = getContext();
  if (!context) return;

  context.resume().then(() => { unlocked = true; }).catch(() => {});
}

if (typeof window !== 'undefined') {
  const unlock = () => enableNotificationSound();
  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true });
}

export function playNotificationSound() {
  const now = Date.now();
  // One notification can be received by more than one React component.
  if (now - lastPlayedAt < 900) return;

  const context = getContext();
  if (!context || context.state === 'suspended') return;

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(1046, context.currentTime + 0.1);
    gain.gain.setValueAtTime(0.16, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.38);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.38);
    lastPlayedAt = now;
  } catch (_) {}
}
