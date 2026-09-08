const PRESENCE_STORAGE_KEY = 'guardiao-da-palavra-presence-v1';
const PRESENCE_CHANNEL_NAME = 'guardiao-da-palavra-presence';
const HEARTBEAT_INTERVAL = 15000;
const STALE_AFTER = 40000;

export class PresenceManager {
    constructor(onUpdate = () => {}) {
        this.onUpdate = typeof onUpdate === 'function' ? onUpdate : () => {};
        this.id = this.createId();
        this.channel = null;
        this.heartbeat = null;
        this.started = false;
        this.handleStorage = this.handleStorage.bind(this);
        this.handleChannelMessage = this.handleChannelMessage.bind(this);
        this.removePresence = this.removePresence.bind(this);
    }

    createId() {
        if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
        return `scribe-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    readEntries() {
        try {
            const saved = JSON.parse(localStorage.getItem(PRESENCE_STORAGE_KEY));
            return saved && typeof saved === 'object' ? saved : {};
        } catch (error) {
            return {};
        }
    }

    writeEntries(entries) {
        try {
            localStorage.setItem(PRESENCE_STORAGE_KEY, JSON.stringify(entries));
            return true;
        } catch (error) {
            return false;
        }
    }

    getActiveEntries() {
        const now = Date.now();
        const entries = this.readEntries();
        const activeEntries = Object.entries(entries).reduce((active, [id, timestamp]) => {
            const numericTimestamp = Number(timestamp);
            if (Number.isFinite(numericTimestamp) && now - numericTimestamp < STALE_AFTER) {
                active[id] = numericTimestamp;
            }
            return active;
        }, {});
        this.writeEntries(activeEntries);
        return activeEntries;
    }

    notify(count) {
        this.onUpdate(Math.max(1, Number(count) || 1));
    }

    heartbeatNow() {
        const activeEntries = this.getActiveEntries();
        activeEntries[this.id] = Date.now();
        this.writeEntries(activeEntries);
        this.notify(Object.keys(activeEntries).length);
        if (this.channel) this.channel.postMessage({ type: 'heartbeat', id: this.id });
    }

    start() {
        if (this.started) return;
        this.started = true;
        window.addEventListener('storage', this.handleStorage);
        window.addEventListener('pagehide', this.removePresence);
        if ('BroadcastChannel' in window) {
            this.channel = new BroadcastChannel(PRESENCE_CHANNEL_NAME);
            this.channel.addEventListener('message', this.handleChannelMessage);
        }
        this.heartbeatNow();
        this.heartbeat = window.setInterval(() => this.heartbeatNow(), HEARTBEAT_INTERVAL);
    }

    handleStorage(event) {
        if (event.key !== PRESENCE_STORAGE_KEY) return;
        const activeEntries = this.getActiveEntries();
        this.notify(Object.keys(activeEntries).length);
    }

    handleChannelMessage(event) {
        if (event.data?.type !== 'heartbeat') return;
        const activeEntries = this.getActiveEntries();
        this.notify(Object.keys(activeEntries).length);
    }

    removePresence() {
        if (!this.started) return;
        const activeEntries = this.readEntries();
        delete activeEntries[this.id];
        this.writeEntries(activeEntries);
        if (this.heartbeat) window.clearInterval(this.heartbeat);
        if (this.channel) this.channel.close();
        this.heartbeat = null;
        this.channel = null;
        this.started = false;
    }
}
