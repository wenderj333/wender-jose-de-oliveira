/**
 * Audio Manager for Guardião da Palavra
 */
const AUDIO_PREFERENCE_KEY = 'guardiao-da-palavra-audio-v1';

export class AudioManager {
    constructor() {
        this.isMuted = this.loadMutePreference();
        this.music = new Audio('assets/audio/ancient_ambience.mp3');
        this.music.loop = true;
        this.music.volume = Math.max(0, Math.min(1, 0.5));

        this.sounds = {
            unroll: new Audio('assets/audio/parchment_unroll.mp3'),
            success: new Audio('assets/audio/divine_success.mp3'),
            quill: new Audio('assets/audio/quill_on_parchment.mp3'),
            click: new Audio('assets/audio/parchment_unroll.mp3') // Fallback/reuse
        };
        this.sounds.quill.volume = Math.max(0, Math.min(1, 0.34));
        this.applyMuteState();

        this.initialized = false;
    }

    loadMutePreference() {
        try {
            return localStorage.getItem(AUDIO_PREFERENCE_KEY) === 'muted';
        } catch (error) {
            return false;
        }
    }

    saveMutePreference() {
        try {
            localStorage.setItem(AUDIO_PREFERENCE_KEY, this.isMuted ? 'muted' : 'on');
        } catch (error) {
            // O jogo continua funcionando quando a preferência não pode ser salva.
        }
    }

    applyMuteState() {
        this.music.muted = this.isMuted;
        Object.values(this.sounds).forEach(sound => sound.muted = this.isMuted);
    }

    init() {
        if (this.initialized) return;
        this.music.play().catch(() => {});
        this.initialized = true;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.applyMuteState();
        this.saveMutePreference();
        return this.isMuted;
    }

    playSound(name) {
        if (this.isMuted) return;
        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    }
}

export const audioManager = new AudioManager();
