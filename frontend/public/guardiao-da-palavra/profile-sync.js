const MESSAGE_SOURCE = 'guardiao-da-palavra';
const MESSAGE_RESPONSE_SOURCE = 'sigocomfe-profile';
const SOCIAL_ORIGIN = 'https://www.sigocomfe.com';
const BRIDGE_NAMES = ['SigoComfeProfileBridge', 'SigoComfeProfile', 'sigoComfeProfile'];
const DEFAULT_TIMEOUT_MS = 900;
const INTERACTIVE_TIMEOUT_MS = 4200;

/**
 * Integração opcional com o perfil social do SigoComFe.
 *
 * O jogo continua independente quando aberto sozinho. Quando estiver dentro do
 * shell social, o host pode expor uma bridge global com loadProgress/saveProgress
 * ou responder às mensagens postadas para a origem https://www.sigocomfe.com:
 *
 * { source: 'guardiao-da-palavra', type: 'request', action: 'load'|'save', requestId, payload }
 * { source: 'sigocomfe-profile', type: 'response', requestId, ok, profile, progress }
 */
export class ProfileSync {
    constructor({ onStateChange = () => {} } = {}) {
        this.onStateChange = typeof onStateChange === 'function' ? onStateChange : () => {};
        this.state = 'local';
        this.profile = null;
        this.started = false;
        this.pendingRequests = new Map();
        this.saveTimer = null;
        this.latestSnapshot = null;
        this.handleMessage = this.handleMessage.bind(this);
    }

    start() {
        if (this.started) return;
        this.started = true;
        window.addEventListener('message', this.handleMessage);
        this.emit('local', 'Perfil local', 'O caminho está guardado neste dispositivo até o perfil social ser ligado.');
    }

    stop() {
        if (!this.started) return;
        window.removeEventListener('message', this.handleMessage);
        this.pendingRequests.forEach(request => window.clearTimeout(request.timeout));
        this.pendingRequests.clear();
        if (this.saveTimer) window.clearTimeout(this.saveTimer);
        this.saveTimer = null;
        this.started = false;
    }

    emit(status, label, detail = '') {
        this.state = status;
        this.onStateChange({ status, label, detail, profile: this.profile });
    }

    getBridge() {
        for (const name of BRIDGE_NAMES) {
            const candidate = globalThis[name];
            if (candidate && typeof candidate === 'object') return candidate;
        }
        return null;
    }

    canUseParentBridge() {
        try {
            return window.parent && window.parent !== window;
        } catch (error) {
            return false;
        }
    }

    isTrustedOrigin(origin) {
        return origin === SOCIAL_ORIGIN || origin === window.location.origin;
    }

    createRequestId(action) {
        if (globalThis.crypto?.randomUUID) return `${action}-${globalThis.crypto.randomUUID()}`;
        return `${action}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    requestParent(action, payload, timeoutMs) {
        if (!this.canUseParentBridge()) return Promise.resolve(null);
        const requestId = this.createRequestId(action);
        return new Promise(resolve => {
            const timeout = window.setTimeout(() => {
                this.pendingRequests.delete(requestId);
                resolve(null);
            }, timeoutMs);
            this.pendingRequests.set(requestId, { resolve, timeout });
            try {
                window.parent.postMessage({
                    source: MESSAGE_SOURCE,
                    type: 'request',
                    action,
                    requestId,
                    payload
                }, SOCIAL_ORIGIN);
            } catch (error) {
                window.clearTimeout(timeout);
                this.pendingRequests.delete(requestId);
                resolve(null);
            }
        });
    }

    async callBridge(action, payload) {
        const bridge = this.getBridge();
        if (!bridge) return null;
        try {
            if (action === 'load' && typeof bridge.loadProgress === 'function') {
                return await bridge.loadProgress(payload);
            }
            if (action === 'save' && typeof bridge.saveProgress === 'function') {
                return await bridge.saveProgress(payload);
            }
        } catch (error) {
            return null;
        }
        return null;
    }

    normalizeResponse(response) {
        if (!response || typeof response !== 'object') return null;
        const source = response.progress && typeof response.progress === 'object'
            ? response.progress
            : response.data?.progress && typeof response.data.progress === 'object'
                ? response.data.progress
                : response.phase1Complete !== undefined || response.currentPhase !== undefined
                    ? response
                    : null;
        const progress = source?.progress && typeof source.progress === 'object'
            ? source.progress
            : source;
        const profile = response.profile || response.data?.profile || null;
        const leaderboard = response.leaderboard || response.data?.leaderboard || profile?.leaderboard || null;
        if (!progress || typeof progress !== 'object') return profile
            ? { profile, progress: null, leaderboard }
            : leaderboard ? { profile: null, progress: null, leaderboard } : null;
        return {
            profile,
            progress,
            leaderboard,
            updatedAt: response.updatedAt || source?.updatedAt || progress.updatedAt || null
        };
    }

    async getLeaderboard() {
        const requestPayload = { game: 'guardiao-da-palavra', schemaVersion: 1, limit: 10 };
        let response = await this.callBridge('leaderboard', requestPayload);
        if (!response) response = await this.requestParent('leaderboard', requestPayload, DEFAULT_TIMEOUT_MS);
        return this.normalizeResponse(response)?.leaderboard || [];
    }

    handleMessage(event) {
        if (!this.isTrustedOrigin(event.origin)) return;
        const data = event.data;
        if (!data || data.source !== MESSAGE_RESPONSE_SOURCE || data.type !== 'response') return;
        const request = this.pendingRequests.get(data.requestId);
        if (!request) return;
        this.pendingRequests.delete(data.requestId);
        window.clearTimeout(request.timeout);
        request.resolve(data.ok === false ? null : data);
    }

    async connect({ interactive = false } = {}) {
        this.start();
        const timeoutMs = interactive ? INTERACTIVE_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
        this.emit('connecting', 'Ligando perfil…', 'Procurando o vínculo seguro com seu perfil social.');
        const requestPayload = { game: 'guardiao-da-palavra', schemaVersion: 1 };
        let response = await this.callBridge('load', requestPayload);
        if (!response) response = await this.requestParent('load', requestPayload, timeoutMs);
        const normalized = this.normalizeResponse(response);
        if (!normalized) {
            this.emit('local', 'Perfil local', interactive
                ? 'O perfil social não respondeu nesta abertura; seu caminho local continua preservado.'
                : 'O perfil social ficará disponível quando o jogo for aberto dentro do SigoComFe.');
            return { connected: false, progress: null, profile: null };
        }
        this.profile = normalized.profile || this.profile;
        let leaderboard = normalized.leaderboard || [];
        if (!leaderboard.length) leaderboard = await this.getLeaderboard();
        this.emit('connected', 'Perfil ligado', 'Fase, lacunas, manuscritos e ranking acompanham seu perfil social.');
        return { connected: true, ...normalized, leaderboard };
    }

    queueSave(snapshot) {
        this.latestSnapshot = snapshot;
        if (this.state !== 'connected') return;
        if (this.saveTimer) window.clearTimeout(this.saveTimer);
        this.saveTimer = window.setTimeout(() => {
            this.saveTimer = null;
            this.saveLatestSnapshot();
        }, 700);
    }

    async saveLatestSnapshot() {
        if (this.state !== 'connected' || !this.latestSnapshot) return;
        const snapshot = this.latestSnapshot;
        let response = await this.callBridge('save', snapshot);
        if (!response) response = await this.requestParent('save', snapshot, INTERACTIVE_TIMEOUT_MS);
        if (response === null) {
            this.emit('error', 'Sincronização pausada', 'O perfil social não confirmou esta marca; o caminho local permanece guardado.');
            return;
        }
        const normalized = this.normalizeResponse(response);
        if (normalized?.profile) this.profile = normalized.profile;
        this.emit('connected', 'Perfil ligado', 'Sua última marca de estudo foi enviada ao perfil social.');
    }
}
