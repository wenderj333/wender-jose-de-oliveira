import * as THREE from 'three';
import { questions } from './questions.js';
import { bonusQuestions } from './bonus-questions.js';
import { QUESTION_BANK_SIZE, pickJourneyQuestions, restoreJourneyQuestions } from './question-bank.js';
import { ACHIEVEMENTS, ACHIEVEMENT_COPY } from './achievements.js';
import { ARRIVAL_COPY, AUDIO_COPY, BONUS_COPY, CAPABILITY_COPY, CONTRAST_COPY, DRAFT_COPY, FALLBACK_COPY, HELP_COPY, LANGUAGES, LAST_JOURNEY_COPY, MOTION_COPY, PAUSE_COPY, PROGRESS_COPY, RESUME_COPY, RESULT_COPY, THEME_MAP_COPY, THEME_REVIEW_COPY, UI, getLanguage, getStoredLanguage } from './i18n.js';

const COLORS = {
  navy: 0x0d1b33,
  navyLight: 0x203758,
  cream: 0xf5e8c7,
  paper: 0xd7b777,
  gold: 0xf1c76a,
  goldBright: 0xffe39a,
  green: 0x5f9963,
  red: 0xd9695e,
  ink: '#182942',
  mutedInk: '#5a4b3b'
};

const A11Y_COPY = {
  pt: { start: 'Tela de abertura. Comece a jornada quando estiver pronto.', question: 'Pergunta em andamento.', feedback: 'Leia a resposta e a reflexão.', result: 'Resultado final da jornada.', keyboard: 'Use Tab para navegar e Enter ou Espaço para escolher. No quiz, use as teclas 1 a 4 para responder.', muteOn: 'Ativar áudio', muteOff: 'Silenciar áudio', language: 'Escolher idioma' },
  en: { start: 'Opening screen. Start the journey when you are ready.', question: 'Question in progress.', feedback: 'Read the answer and reflection.', result: 'Final journey result.', keyboard: 'Use Tab to navigate and Enter or Space to choose. During the quiz, use keys 1 to 4 to answer.', muteOn: 'Turn audio on', muteOff: 'Mute audio', language: 'Choose language' },
  es: { start: 'Pantalla de inicio. Comienza el viaje cuando estés listo.', question: 'Pregunta en curso.', feedback: 'Lee la respuesta y la reflexión.', result: 'Resultado final del viaje.', keyboard: 'Usa Tab para navegar y Enter o Espacio para elegir. En el quiz, usa las teclas 1 a 4 para responder.', muteOn: 'Activar audio', muteOff: 'Silenciar audio', language: 'Elegir idioma' },
  de: { start: 'Startbildschirm. Beginne die Reise, wenn du bereit bist.', question: 'Aktuelle Frage.', feedback: 'Lies die Antwort und den Impuls.', result: 'Endergebnis der Reise.', keyboard: 'Mit Tab navigieren und mit Enter oder Leertaste wählen. Im Quiz die Tasten 1 bis 4 verwenden.', muteOn: 'Audio einschalten', muteOff: 'Audio stummschalten', language: 'Sprache wählen' },
  fr: { start: 'Écran d’accueil. Commencez le voyage quand vous êtes prêt.', question: 'Question en cours.', feedback: 'Lisez la réponse et la réflexion.', result: 'Résultat final du voyage.', keyboard: 'Utilisez Tab pour naviguer et Entrée ou Espace pour choisir. Pendant le quiz, utilisez les touches 1 à 4.', muteOn: 'Activer le son', muteOff: 'Couper le son', language: 'Choisir la langue' },
  ro: { start: 'Ecran de început. Începe călătoria când ești pregătit.', question: 'Întrebare în desfășurare.', feedback: 'Citește răspunsul și reflecția.', result: 'Rezultatul final al călătoriei.', keyboard: 'Folosește Tab pentru navigare și Enter sau Spațiu pentru alegere. În quiz, folosește tastele 1–4.', muteOn: 'Pornește sunetul', muteOff: 'Oprește sunetul', language: 'Alege limba' },
  ru: { start: 'Экран приветствия. Начните путь, когда будете готовы.', question: 'Текущий вопрос.', feedback: 'Прочитайте ответ и размышление.', result: 'Итоговый результат путешествия.', keyboard: 'Используйте Tab для навигации и Enter или Пробел для выбора. В викторине используйте клавиши 1–4.', muteOn: 'Включить звук', muteOff: 'Выключить звук', language: 'Выбрать язык' }
};

function getHelpCopy(owner) {
  return HELP_COPY[owner.language] || HELP_COPY.pt;
}

function renderHelpRows(host, rows, { keyboard = false } = {}) {
  if (!host) return;
  host.replaceChildren();
  rows.forEach((row) => {
    if (keyboard) {
      const item = document.createElement('div');
      item.className = 'quiz-help__row';
      const key = document.createElement('kbd');
      key.className = 'quiz-help__key';
      key.textContent = row.key;
      const text = document.createElement('p');
      text.className = 'quiz-help__text';
      text.textContent = row.text;
      item.append(key, text);
      host.appendChild(item);
      return;
    }
    const item = document.createElement('li');
    item.className = 'quiz-help__item';
    item.textContent = row;
    host.appendChild(item);
  });
}

function syncHelpPanel(owner) {
  const panel = document.getElementById('quiz-help-panel');
  const launcher = document.getElementById('quiz-help-launcher');
  const button = document.getElementById('open-quiz-help');
  if (!panel || !launcher || !button || !owner) return;
  const copy = getHelpCopy(owner);
  const visible = Boolean(owner.helpOpen);
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  setText('quiz-help-kicker', copy.kicker);
  setText('quiz-help-title', copy.title);
  setText('quiz-help-intro', copy.intro);
  setText('quiz-help-keyboard-title', copy.keyboardTitle);
  setText('quiz-help-touch-title', copy.touchTitle);
  setText('quiz-help-controls-title', copy.controlsTitle);
  setText('quiz-help-status', visible ? copy.openAnnouncement : '');
  button.textContent = `?  ${copy.label}`;
  button.setAttribute('aria-label', copy.open);
  button.setAttribute('aria-expanded', String(visible));
  button.setAttribute('aria-keyshortcuts', '? F1');
  button.title = `${copy.open} ( ? / F1 )`;
  const close = document.getElementById('close-quiz-help');
  if (close) close.setAttribute('aria-label', copy.close);
  renderHelpRows(document.getElementById('quiz-help-keyboard'), copy.keyboard, { keyboard: true });
  renderHelpRows(document.getElementById('quiz-help-touch'), copy.touch);
  renderHelpRows(document.getElementById('quiz-help-controls'), copy.controls);
  setDialogVisibility(panel, visible);
  launcher.setAttribute('aria-label', copy.title);
}

function openHelpPanel(owner) {
  if (!owner || window.sigoQuiz !== owner) return;
  const panel = document.getElementById('quiz-help-panel');
  if (!panel || owner.helpOpen) return;
  owner.helpOpen = true;
  owner.helpReturnFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
    ? document.activeElement
    : document.getElementById('open-quiz-help');
  syncHelpPanel(owner);
  announceDialog(owner, getHelpCopy(owner).openAnnouncement);
  focusFirstDialogControl(document.querySelector('#quiz-help-panel [role="dialog"]'), '#close-quiz-help');
}

function closeHelpPanel(owner, { restoreFocus = true, announce = true } = {}) {
  if (!owner || window.sigoQuiz !== owner || !owner.helpOpen) return;
  owner.helpOpen = false;
  syncHelpPanel(owner);
  if (announce) announceDialog(owner, getHelpCopy(owner).closeAnnouncement);
  const returnFocus = owner.helpReturnFocus;
  owner.helpReturnFocus = null;
  if (restoreFocus) restoreDialogFocus(returnFocus, '#open-quiz-help');
}

function toggleHelpPanel(owner) {
  if (!owner) return;
  if (owner.helpOpen) closeHelpPanel(owner);
  else openHelpPanel(owner);
}

function syncAudioControlVisibility(owner) {
  const launcher = document.getElementById('audio-control-launcher');
  const button = document.getElementById('open-audio-control');
  const control = document.getElementById('audio-control');
  if (!launcher || !button || !control || !owner) return;
  const copy = AUDIO_COPY[owner.language] || AUDIO_COPY.pt;
  const visible = Boolean(owner.audioControlOpen);
  launcher.hidden = false;
  control.hidden = !visible;
  button.textContent = `${visible ? '×' : '♫'}  ${copy.label}`;
  button.setAttribute('aria-label', copy.label);
  button.setAttribute('aria-expanded', String(visible));
  button.title = copy.label;
}

function toggleAudioControl(owner) {
  if (!owner || window.sigoQuiz !== owner) return;
  owner.audioControlOpen = !owner.audioControlOpen;
  syncAudioControlVisibility(owner);
}

function ensureAudioControls() {
  if (window.__sigoAudioControlsBound) return;
  window.__sigoAudioControlsBound = true;
  document.getElementById('open-audio-control')?.addEventListener('click', () => toggleAudioControl(window.sigoQuiz));
}

function ensureHelpControls() {
  if (window.__sigoHelpControlsBound) return;
  window.__sigoHelpControlsBound = true;
  document.getElementById('open-quiz-help')?.addEventListener('click', () => toggleHelpPanel(window.sigoQuiz));
  document.getElementById('close-quiz-help')?.addEventListener('click', () => closeHelpPanel(window.sigoQuiz));
  document.addEventListener('pointerdown', (event) => {
    const owner = window.sigoQuiz;
    const panel = document.getElementById('quiz-help-panel');
    const dialog = panel?.querySelector('.quiz-help__dialog');
    const launcher = document.getElementById('quiz-help-launcher');
    if (!owner?.helpOpen || panel?.hidden || dialog?.contains(event.target) || launcher?.contains(event.target)) return;
    closeHelpPanel(owner);
  }, true);
  window.addEventListener('keydown', (event) => {
    const owner = window.sigoQuiz;
    const target = event.target;
    const isEditable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
    const isHelpShortcut = event.key === 'F1' || event.key === '?' || (event.code === 'Slash' && event.shiftKey);
    if (event.key === 'Escape' && owner?.helpOpen) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeHelpPanel(owner);
      return;
    }
    if (isHelpShortcut && !isEditable) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleHelpPanel(owner);
    }
  }, true);
}

const TEXT_PROFILES = {
  // The 3D interface is rendered onto canvas textures, so keep a generous
  // baseline size in every language instead of shrinking longer translations.
  pt: { body: 2.2, heading: 1.75, button: 1.95, label: 1.9, lineHeight: 1.22, wrap: 1 },
  en: { body: 2.18, heading: 1.73, button: 1.93, label: 1.88, lineHeight: 1.2, wrap: 1 },
  es: { body: 2.16, heading: 1.71, button: 1.91, label: 1.86, lineHeight: 1.22, wrap: 0.99 },
  de: { body: 2.14, heading: 1.69, button: 1.89, label: 1.84, lineHeight: 1.2, wrap: 0.98 },
  fr: { body: 2.16, heading: 1.71, button: 1.91, label: 1.86, lineHeight: 1.2, wrap: 0.99 },
  ro: { body: 2.14, heading: 1.69, button: 1.89, label: 1.84, lineHeight: 1.2, wrap: 0.98 },
  ru: { body: 2.14, heading: 1.69, button: 1.89, label: 1.84, lineHeight: 1.2, wrap: 0.98 }
};

const FAVORITES_STORAGE_KEY = 'sigo-com-fe-favorite-verses';
const AUDIO_PREFERENCE_STORAGE_KEY = 'sigo-com-fe-audio-preference';
const HIGH_CONTRAST_STORAGE_KEY = 'sigo-com-fe-high-contrast';
const LAST_JOURNEY_STORAGE_KEY = 'sigo-com-fe-last-completed-journey';
const JOURNEY_DRAFT_STORAGE_KEY = 'sigo-com-fe-journey-draft';
const JOURNEY_DRAFT_VERSION = 1;
const JOURNEY_HISTORY_STORAGE_KEY = 'sigo-com-fe-journey-history';
const JOURNEY_HISTORY_LIMIT = 8;
const JOURNEY_HISTORY_TRANSFER_FORMAT = 'sigo-com-fe.journey-history';
const JOURNEY_HISTORY_TRANSFER_VERSION = 1;
const JOURNEY_SHARE_FORMAT = 'sigo-com-fe.journey-share';
const JOURNEY_SHARE_VERSION = 1;
const JOURNEY_SHARE_MAX_TOKEN_LENGTH = 12000;
const ACHIEVEMENTS_STORAGE_KEY = 'sigo-com-fe-achievements';
const PLAYER_PROFILE_STORAGE_KEY = 'sigo-com-fe-player-profile';
const PLAYER_LEADERBOARD_STORAGE_KEY = 'sigo-com-fe-player-leaderboard';
const LEADERBOARD_LIMIT = 10;
const PRESENCE_HEARTBEAT_MS = 7000;
const PRESENCE_TIMEOUT_MS = 19000;
const DEFAULT_AUDIO_VOLUME = 0.28;

const COMMUNITY_COPY = {
  pt: { launcher: 'COMUNIDADE', title: 'PRESENÇA E RANKING', intro: 'O ranking valoriza quem erra menos e responde com atenção. Os dados ficam neste dispositivo.', bank: 'Banco disponível: 2.000 perguntas bíblicas · cada jornada sorteia 10.', nameLabel: 'Nome de jogador', namePlaceholder: 'Visitante', save: 'SALVAR NOME', ranking: 'TOP 10 · MENOS ERROS', rankingEmpty: 'Conclua uma jornada para aparecer no ranking.', presence: 'PESSOAS PRESENTES NESTA SALA', presenceIntro: 'Mostra apenas outras abas ou janelas deste mesmo dispositivo. Não é uma lista global de usuários.', you: 'Você', online: 'online', noChannel: 'A presença entre abas não está disponível neste navegador.', points: 'pontos', errors: 'erros', average: 'média', speed: 'Bônus de velocidade', nameSaved: 'Nome de jogador salvo localmente.' },
  en: { launcher: 'COMMUNITY', title: 'PRESENCE AND RANKING', intro: 'The ranking values fewer mistakes and attentive answers. Data stays on this device.', bank: 'Available bank: 2,000 Bible questions · each journey draws 10.', nameLabel: 'Player name', namePlaceholder: 'Visitor', save: 'SAVE NAME', ranking: 'TOP 10 · FEWEST MISTAKES', rankingEmpty: 'Complete a journey to appear in the ranking.', presence: 'PEOPLE PRESENT IN THIS ROOM', presenceIntro: 'Only other tabs or windows on this device appear here. This is not a global user list.', you: 'You', online: 'online', noChannel: 'Tab presence is not available in this browser.', points: 'points', errors: 'mistakes', average: 'average', speed: 'Speed bonus', nameSaved: 'Player name saved locally.' },
  es: { launcher: 'COMUNIDAD', title: 'PRESENCIA Y CLASIFICACIÓN', intro: 'La clasificación valora menos errores y respuestas atentas. Los datos quedan en este dispositivo.', bank: 'Banco disponible: 2.000 preguntas bíblicas · cada camino sortea 10.', nameLabel: 'Nombre de jugador', namePlaceholder: 'Visitante', save: 'GUARDAR NOMBRE', ranking: 'TOP 10 · MENOS ERRORES', rankingEmpty: 'Termina un camino para aparecer en la clasificación.', presence: 'PERSONAS PRESENTES EN ESTA SALA', presenceIntro: 'Solo muestra otras pestañas o ventanas de este dispositivo. No es una lista global.', you: 'Tú', online: 'en línea', noChannel: 'La presencia entre pestañas no está disponible en este navegador.', points: 'puntos', errors: 'errores', average: 'media', speed: 'Bono de velocidad', nameSaved: 'Nombre de jugador guardado localmente.' },
  de: { launcher: 'GEMEINSCHAFT', title: 'ANWESENHEIT UND RANGLISTE', intro: 'Die Rangliste belohnt wenige Fehler und aufmerksame Antworten. Die Daten bleiben auf diesem Gerät.', bank: 'Verfügbar: 2.000 Bibelfragen · jede Reise zieht 10.', nameLabel: 'Spielername', namePlaceholder: 'Gast', save: 'NAMEN SPEICHERN', ranking: 'TOP 10 · WENIGSTE FEHLER', rankingEmpty: 'Schließe eine Reise ab, um in der Rangliste zu erscheinen.', presence: 'ANWESENDE IN DIESEM RAUM', presenceIntro: 'Hier erscheinen nur andere Tabs oder Fenster auf diesem Gerät. Keine globale Nutzerliste.', you: 'Du', online: 'online', noChannel: 'Tab-Anwesenheit wird in diesem Browser nicht unterstützt.', points: 'Punkte', errors: 'Fehler', average: 'Durchschnitt', speed: 'Geschwindigkeitsbonus', nameSaved: 'Spielername lokal gespeichert.' },
  fr: { launcher: 'COMMUNAUTÉ', title: 'PRÉSENCE ET CLASSEMENT', intro: 'Le classement valorise les réponses attentives et le moins d’erreurs. Les données restent sur cet appareil.', bank: 'Banque disponible : 2 000 questions bibliques · chaque voyage en tire 10.', nameLabel: 'Nom du joueur', namePlaceholder: 'Visiteur', save: 'ENREGISTRER LE NOM', ranking: 'TOP 10 · LE MOINS D’ERREURS', rankingEmpty: 'Terminez un voyage pour apparaître au classement.', presence: 'PERSONNES PRÉSENTES DANS CET ESPACE', presenceIntro: 'Seuls les autres onglets ou fenêtres de cet appareil apparaissent ici. Ce n’est pas une liste globale.', you: 'Vous', online: 'en ligne', noChannel: 'La présence entre onglets n’est pas disponible dans ce navigateur.', points: 'points', errors: 'erreurs', average: 'moyenne', speed: 'Bonus de rapidité', nameSaved: 'Nom du joueur enregistré localement.' },
  ro: { launcher: 'COMUNITATE', title: 'PREZENȚĂ ȘI CLASAMENT', intro: 'Clasamentul apreciază mai puține greșeli și răspunsuri atente. Datele rămân pe acest dispozitiv.', bank: 'Bancă disponibilă: 2.000 de întrebări biblice · fiecare călătorie alege 10.', nameLabel: 'Numele jucătorului', namePlaceholder: 'Vizitator', save: 'SALVEAZĂ NUMELE', ranking: 'TOP 10 · CELE MAI PUȚINE GREȘELI', rankingEmpty: 'Încheie o călătorie pentru a apărea în clasament.', presence: 'PERSOANE PREZENTE ÎN ACEASTĂ SALĂ', presenceIntro: 'Afișează doar alte file sau ferestre de pe acest dispozitiv. Nu este o listă globală.', you: 'Tu', online: 'online', noChannel: 'Prezența între file nu este disponibilă în acest browser.', points: 'puncte', errors: 'greșeli', average: 'medie', speed: 'Bonus de viteză', nameSaved: 'Numele jucătorului a fost salvat local.' },
  ru: { launcher: 'СООБЩЕСТВО', title: 'ПРИСУТСТВИЕ И РЕЙТИНГ', intro: 'Рейтинг ценит внимательные ответы и меньшее число ошибок. Данные остаются на этом устройстве.', bank: 'Доступно: 2 000 библейских вопросов · в каждом пути выбираются 10.', nameLabel: 'Имя игрока', namePlaceholder: 'Гость', save: 'СОХРАНИТЬ ИМЯ', ranking: 'ТОП-10 · МЕНЬШЕ ВСЕГО ОШИБОК', rankingEmpty: 'Завершите путь, чтобы появиться в рейтинге.', presence: 'ЛЮДИ В ЭТОЙ КОМНАТЕ', presenceIntro: 'Показываются только другие вкладки или окна на этом устройстве. Это не глобальный список пользователей.', you: 'Вы', online: 'онлайн', noChannel: 'Присутствие между вкладками недоступно в этом браузере.', points: 'баллов', errors: 'ошибок', average: 'среднее', speed: 'Бонус скорости', nameSaved: 'Имя игрока сохранено локально.' }
};

function getCommunityCopy(owner) {
  return COMMUNITY_COPY[owner?.language] || COMMUNITY_COPY.pt;
}

function sanitizePlayerName(value, fallback = 'Visitante') {
  const name = String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  return name || fallback;
}

function readPlayerName() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY) || '{}');
    return sanitizePlayerName(saved.name);
  } catch {
    return 'Visitante';
  }
}

function writePlayerName(name) {
  try {
    window.localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify({ name: sanitizePlayerName(name), updatedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

function getJourneyMetrics(owner) {
  const total = questions.length;
  const score = Math.max(0, Math.min(total, Math.floor(Number(owner?.score) || 0)));
  const errors = Math.max(0, total - score);
  const answerTimes = Array.isArray(owner?.answerTimes)
    ? owner.answerTimes.filter((time) => Number.isFinite(Number(time)) && Number(time) >= 0)
    : [];
  const totalTime = answerTimes.reduce((sum, time) => sum + Number(time), 0);
  const averageTime = answerTimes.length ? totalTime / answerTimes.length : 0;
  const speedPoints = Math.max(0, Math.floor(Number(owner?.speedPoints) || 0));
  const points = Math.max(0, Math.floor(score * 100 + speedPoints));
  return { points, errors, totalTime, averageTime, speedPoints };
}

function getQuestionSetIds(questionSet) {
  return Array.isArray(questionSet) && questionSet.length === questions.length
    ? questionSet.map((question) => typeof question?.bankId === 'string' ? question.bankId : '')
    : [];
}

function restoreQuestionSet(ids) {
  const restored = restoreJourneyQuestions(ids);
  return restored?.length === questions.length ? restored : null;
}

function normalizeAnswerTimes(value) {
  return Array.from({ length: questions.length }, (_, index) => {
    const time = Number(value?.[index]);
    return Number.isFinite(time) && time >= 0 ? Math.min(300, time) : null;
  });
}

function registerAnswerTiming(owner, questionIndex, correct) {
  const startedAt = Number(owner?.questionStartedAt);
  const elapsed = startedAt > 0 ? (performance.now() - startedAt) / 1000 : 0;
  const seconds = Number.isFinite(elapsed) ? Math.max(0, Math.min(300, elapsed)) : 0;
  if (owner) {
    owner.answerTimes = normalizeAnswerTimes(owner.answerTimes);
    owner.answerTimes[questionIndex] = seconds;
    if (correct) {
      const speedBonus = Math.max(0, Math.min(15, Math.round((10 - Math.min(seconds, 10)) * 1.5)));
      owner.speedPoints = Math.max(0, Math.floor(Number(owner.speedPoints) || 0) + speedBonus);
    }
  }
  return seconds;
}

function normalizeLeaderboardEntry(entry, index = 0) {
  if (!entry || typeof entry !== 'object') return null;
  const metrics = getJourneyMetrics({ score: Number(entry.score), answerTimes: entry.answerTimes, speedPoints: entry.speedPoints });
  return {
    id: typeof entry.id === 'string' && entry.id ? entry.id : `legacy-player-${index}`,
    name: sanitizePlayerName(entry.name),
    score: Math.max(0, Math.min(questions.length, Math.floor(Number(entry.score) || 0))),
    points: Math.max(0, Math.floor(Number(entry.points) || metrics.points)),
    errors: Math.max(0, Math.floor(Number(entry.errors) || metrics.errors)),
    averageTime: Math.max(0, Number(entry.averageTime) || metrics.averageTime),
    totalTime: Math.max(0, Number(entry.totalTime) || metrics.totalTime),
    speedPoints: Math.max(0, Math.floor(Number(entry.speedPoints) || metrics.speedPoints)),
    completedAt: typeof entry.completedAt === 'string' ? entry.completedAt : new Date().toISOString()
  };
}

function sortLeaderboard(entries) {
  return [...entries].sort((a, b) => a.errors - b.errors || b.points - a.points || a.averageTime - b.averageTime || Date.parse(b.completedAt) - Date.parse(a.completedAt));
}

function readLeaderboard() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PLAYER_LEADERBOARD_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? sortLeaderboard(saved.map(normalizeLeaderboardEntry).filter(Boolean)).slice(0, 80) : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(entries) {
  try {
    window.localStorage.setItem(PLAYER_LEADERBOARD_STORAGE_KEY, JSON.stringify(sortLeaderboard(entries).slice(0, 80)));
    return true;
  } catch {
    return false;
  }
}

function recordLeaderboardEntry(owner) {
  const metrics = getJourneyMetrics(owner);
  const entry = { id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: readPlayerName(), score: owner.score, ...metrics, answerTimes: [...(owner.answerTimes || [])], completedAt: new Date().toISOString() };
  writeLeaderboard([entry, ...readLeaderboard()]);
  return entry;
}

const presencePeers = new Map();
const presenceId = `presence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
let presenceChannel = null;
let presenceTimer = null;

function broadcastPresence(type = 'heartbeat') {
  presenceChannel?.postMessage({ type, id: presenceId, name: readPlayerName(), at: Date.now() });
}

function startPresence() {
  if (window.__sigoPresenceStarted) return;
  window.__sigoPresenceStarted = true;
  if (typeof BroadcastChannel !== 'function') return;
  try {
    presenceChannel = new BroadcastChannel('sigo-com-fe-presence');
    presenceChannel.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.id === presenceId) return;
      if (data.type === 'bye') {
        presencePeers.delete(data.id);
      } else if (['hello', 'heartbeat'].includes(data.type)) {
        presencePeers.set(data.id, { name: sanitizePlayerName(data.name), at: Number(data.at) || Date.now() });
        if (data.type === 'hello') broadcastPresence('heartbeat');
      } else return;
      syncCommunityPanel(window.sigoQuiz);
    });
    broadcastPresence('hello');
    presenceTimer = window.setInterval(() => {
      const now = Date.now();
      presencePeers.forEach((peer, id) => { if (now - peer.at > PRESENCE_TIMEOUT_MS) presencePeers.delete(id); });
      broadcastPresence();
      syncCommunityPanel(window.sigoQuiz);
    }, PRESENCE_HEARTBEAT_MS);
    window.addEventListener('beforeunload', () => {
      broadcastPresence('bye');
      presenceChannel?.close();
      if (presenceTimer) window.clearInterval(presenceTimer);
    }, { once: true });
  } catch {
    presenceChannel = null;
  }
}

function renderCommunityPanel(owner) {
  const panel = document.getElementById('community-panel');
  if (!panel || !owner) return;
  const copy = getCommunityCopy(owner);
  const title = document.getElementById('community-title');
  const intro = document.getElementById('community-intro');
  const bank = document.getElementById('community-bank');
  const nameLabel = document.getElementById('community-name-label');
  const input = document.getElementById('community-player-name');
  const save = document.getElementById('save-community-name');
  const rankingTitle = document.getElementById('community-ranking-title');
  const ranking = document.getElementById('community-ranking');
  const presenceTitle = document.getElementById('community-presence-title');
  const presenceIntro = document.getElementById('community-presence-intro');
  if (title) title.textContent = copy.title;
  if (intro) intro.textContent = copy.intro;
  if (bank) bank.textContent = copy.bank;
  if (nameLabel) nameLabel.textContent = copy.nameLabel;
  if (input) { input.value = readPlayerName(); input.placeholder = copy.namePlaceholder; }
  if (save) { save.textContent = copy.save; save.setAttribute('aria-label', copy.save); }
  if (rankingTitle) rankingTitle.textContent = copy.ranking;
  if (presenceTitle) presenceTitle.textContent = copy.presence;
  if (presenceIntro) presenceIntro.textContent = copy.presenceIntro;
  if (ranking) {
    ranking.replaceChildren();
    const entries = readLeaderboard().slice(0, LEADERBOARD_LIMIT);
    if (!entries.length) {
      const empty = document.createElement('p'); empty.className = 'community__empty'; empty.textContent = copy.rankingEmpty; ranking.appendChild(empty);
    } else entries.forEach((entry, index) => {
      const item = document.createElement('li'); item.className = 'community__ranking-item';
      const place = document.createElement('strong'); place.textContent = `${index + 1}.`;
      const player = document.createElement('span'); player.textContent = entry.name;
      const stats = document.createElement('span'); stats.className = 'community__stats'; stats.textContent = `${entry.errors} ${copy.errors} · ${entry.points} ${copy.points} · ${entry.averageTime.toFixed(1)}s ${copy.average}`;
      item.append(place, player, stats); ranking.appendChild(item);
    });
  }
  const presence = document.getElementById('community-presence');
  if (presence) {
    presence.replaceChildren();
    const you = document.createElement('li'); you.className = 'community__presence-item community__presence-item--you'; you.textContent = `${copy.you}: ${readPlayerName()} · ${copy.online}`; presence.appendChild(you);
    [...presencePeers.values()].filter((peer) => Date.now() - peer.at <= PRESENCE_TIMEOUT_MS).forEach((peer) => {
      const item = document.createElement('li'); item.className = 'community__presence-item'; item.textContent = `${peer.name} · ${copy.online}`; presence.appendChild(item);
    });
    if (!presenceChannel) { const note = document.createElement('li'); note.className = 'community__presence-note'; note.textContent = copy.noChannel; presence.appendChild(note); }
  }
}

function syncCommunityPanel(owner) {
  const launcher = document.getElementById('community-launcher');
  const button = document.getElementById('open-community');
  const panel = document.getElementById('community-panel');
  if (!launcher || !button || !panel || !owner) return;
  const copy = getCommunityCopy(owner);
  launcher.hidden = false;
  button.textContent = `◉  ${copy.launcher}`;
  button.setAttribute('aria-label', copy.launcher);
  button.setAttribute('aria-controls', 'community-panel');
  button.setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) renderCommunityPanel(owner);
}

function openCommunity(owner) {
  const panel = document.getElementById('community-panel');
  if (!panel || !owner) return;
  owner.communityReturnFocus = rememberDialogFocus();
  renderCommunityPanel(owner);
  setDialogVisibility(panel, true);
  focusFirstDialogControl(panel.querySelector('[role="dialog"]'), '#close-community');
  announceDialog(owner, `${getCommunityCopy(owner).title}. ${getCommunityCopy(owner).intro}`);
}

function closeCommunity(owner) {
  const panel = document.getElementById('community-panel');
  if (!panel || panel.hidden || !owner) return;
  const returnFocus = owner.communityReturnFocus;
  owner.communityReturnFocus = null;
  setDialogVisibility(panel, false);
  restoreDialogFocus(returnFocus, '#open-community');
  announceDialog(owner, getCommunityCopy(owner).title);
}

function saveCommunityName(owner) {
  const input = document.getElementById('community-player-name');
  const name = sanitizePlayerName(input?.value, getCommunityCopy(owner).namePlaceholder);
  writePlayerName(name);
  broadcastPresence();
  renderCommunityPanel(owner);
  owner.announce?.(getCommunityCopy(owner).nameSaved);
}

function ensureCommunityControls() {
  if (window.__sigoCommunityControlsBound) return;
  window.__sigoCommunityControlsBound = true;
  startPresence();
  document.getElementById('open-community')?.addEventListener('click', () => openCommunity(window.sigoQuiz));
  document.getElementById('close-community')?.addEventListener('click', () => closeCommunity(window.sigoQuiz));
  document.getElementById('save-community-name')?.addEventListener('click', () => saveCommunityName(window.sigoQuiz));
  document.getElementById('community-panel')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeCommunity(window.sigoQuiz);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !document.getElementById('community-panel')?.hidden) {
      event.preventDefault(); event.stopImmediatePropagation(); closeCommunity(window.sigoQuiz);
    }
  }, true);
}

function getProgressCopy(owner) {
  return PROGRESS_COPY[owner.language] || PROGRESS_COPY.pt;
}

function progressMessage(owner, kind, phase) {
  const copy = getProgressCopy(owner);
  const key = `${kind}${phase.charAt(0).toUpperCase()}${phase.slice(1)}`;
  return copy[key] || '';
}

function uniqueElements(elements) {
  return [...new Set(elements.filter((element) => element instanceof HTMLElement))];
}

const DIALOG_FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function isVisibleFocusable(element) {
  if (!(element instanceof HTMLElement) || !element.isConnected || element.hidden || element.closest('[hidden]') || element.closest('[aria-hidden="true"]') || element.closest('[inert]')) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function getDialogFocusable(dialog) {
  if (!(dialog instanceof HTMLElement)) return [];
  return [...dialog.querySelectorAll(DIALOG_FOCUSABLE_SELECTOR)].filter(isVisibleFocusable);
}

function getOpenDialogs() {
  return [...document.querySelectorAll('[role="dialog"]')].filter((dialog) => {
    if (!(dialog instanceof HTMLElement) || dialog.hidden || dialog.getAttribute('aria-hidden') === 'true' || dialog.closest('[hidden]') || dialog.closest('[inert]')) return false;
    const style = window.getComputedStyle(dialog);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

function syncDialogStack() {
  // Multiple local layers can briefly coexist (for example, the delete
  // confirmation above the history dialog). Expose only the uppermost one to
  // assistive technology and make the underlying layer inert.
  const visibleDialogs = [...document.querySelectorAll('[role="dialog"]')].filter((dialog) => {
    if (!(dialog instanceof HTMLElement) || dialog.hidden || dialog.closest('[hidden]')) return false;
    const style = window.getComputedStyle(dialog);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
  const activeDialog = visibleDialogs[visibleDialogs.length - 1] || null;
  visibleDialogs.forEach((dialog) => {
    dialog.setAttribute('aria-modal', 'true');
    const isActive = dialog === activeDialog;
    dialog.setAttribute('aria-hidden', String(!isActive));
    dialog.toggleAttribute('inert', !isActive);
  });
  document.querySelectorAll('[role="dialog"]').forEach((dialog) => {
    if (!visibleDialogs.includes(dialog)) {
      dialog.removeAttribute('inert');
      if (!dialog.closest('[hidden]')) dialog.setAttribute('aria-hidden', 'true');
    }
  });
}

function focusFirstDialogControl(dialog, preferredSelector = '') {
  if (!(dialog instanceof HTMLElement)) return false;
  const preferred = preferredSelector ? dialog.querySelector(preferredSelector) : null;
  const target = isVisibleFocusable(preferred) ? preferred : getDialogFocusable(dialog)[0];
  if (target) {
    window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
    return true;
  }
  dialog.tabIndex = -1;
  window.requestAnimationFrame(() => dialog.focus({ preventScroll: true }));
  return false;
}

function rememberDialogFocus() {
  return document.activeElement instanceof HTMLElement
    && document.activeElement !== document.body
    && !document.activeElement.closest('[role="dialog"]')
    ? document.activeElement
    : null;
}

function rememberFocusedElement() {
  const active = document.activeElement;
  return isVisibleFocusable(active) ? active : null;
}

function restoreDialogFocus(returnFocus, fallbackSelector = '') {
  const fallback = fallbackSelector ? document.querySelector(fallbackSelector) : null;
  const target = isVisibleFocusable(returnFocus) ? returnFocus : (isVisibleFocusable(fallback) ? fallback : null);
  if (target) window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
}

function announceDialog(owner, message) {
  if (!message) return;
  owner?.announce?.(message);
  if (owner?.a11yStatus) owner.a11yStatus.textContent = message;
  const dialogs = getOpenDialogs();
  const dialog = dialogs[dialogs.length - 1];
  const localStatus = dialog?.querySelector('[data-dialog-status]');
  if (localStatus) localStatus.textContent = message;
}

function setDialogVisibility(host, visible) {
  if (!(host instanceof HTMLElement)) return;
  host.hidden = !visible;
  host.setAttribute('aria-hidden', String(!visible));
  syncDialogStack();
}

function ensureDialogFocusManagement() {
  if (window.__sigoDialogFocusManagementBound) return;
  window.__sigoDialogFocusManagementBound = true;
  document.addEventListener('focusin', (event) => {
    const dialogs = getOpenDialogs();
    const dialog = dialogs[dialogs.length - 1];
    if (!dialog || dialog.contains(event.target)) return;
    const target = getDialogFocusable(dialog)[0];
    if (target) target.focus({ preventScroll: true });
    else {
      dialog.tabIndex = -1;
      dialog.focus({ preventScroll: true });
    }
  }, true);
  document.addEventListener('keydown', (event) => {
    const dialogs = getOpenDialogs();
    const dialog = dialogs[dialogs.length - 1];
    if (!dialog) return;

    // Keep quiz shortcuts and gameplay actions behind the active dialog.
    // Editable fields retain their native typing behavior.
    const isEditable = event.target instanceof HTMLInputElement
      || event.target instanceof HTMLTextAreaElement
      || event.target instanceof HTMLSelectElement
      || event.target?.isContentEditable;
    if (event.key !== 'Tab' && event.key !== 'Escape' && !isEditable) event.stopPropagation();
    if (event.key !== 'Tab') return;

    event.stopPropagation();
    const focusable = getDialogFocusable(dialog);
    if (!focusable.length) {
      event.preventDefault();
      dialog.tabIndex = -1;
      dialog.focus({ preventScroll: true });
      return;
    }
    const active = document.activeElement;
    if (!dialog.contains(active)) {
      event.preventDefault();
      (event.shiftKey ? focusable[focusable.length - 1] : focusable[0]).focus({ preventScroll: true });
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }, true);
}

function getResultCardButtons(owner, action = 'all') {
  const buttons = [];
  if (action === 'all' || action === 'download') {
    buttons.push(document.getElementById('download-result'));
    buttons.push(owner.a11yControls?.querySelector('[data-a11y-key="download-card"]'));
  }
  if (action === 'all' || action === 'share') {
    buttons.push(document.getElementById('share-result'));
    buttons.push(owner.a11yControls?.querySelector('[data-a11y-key="share-card"]'));
    buttons.push(owner.resultCardActionButton);
  }
  return uniqueElements(buttons);
}

function getAudioButtons(owner, kind = 'ambient') {
  const buttons = kind === 'arrival'
    ? [document.getElementById('arrival-sound'), owner.a11yControls?.querySelector('[data-a11y-key="arrival-sound"]')]
    : [document.getElementById('audio-mute'), owner.a11yControls?.querySelector('[data-a11y-key="mute"]')];
  return uniqueElements(buttons);
}

function setProgressState(owner, kind, phase, { targets = [], announce = true } = {}) {
  const message = progressMessage(owner, kind, phase);
  const statusIds = kind === 'audio'
    ? ['audio-status']
    : ['result-action-status', 'fallback-result-action-status'];
  statusIds.forEach((id) => {
    const status = document.getElementById(id);
    if (!status) return;
    status.textContent = message;
    status.setAttribute('aria-busy', String(phase !== 'complete'));
  });
  const busy = phase !== 'complete';
  uniqueElements(targets).forEach((button) => {
    button.disabled = busy;
    button.setAttribute('aria-busy', String(busy));
  });
  if (announce && message) {
    if (typeof owner.announce === 'function') owner.announce(message);
    else if (owner.a11yStatus) owner.a11yStatus.textContent = message;
  }
}

function nextAnimationFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

function scheduleResultPreparation(owner, createCard = null, { includeCard = Boolean(createCard) } = {}) {
  const token = (owner.resultPreparationToken || 0) + 1;
  owner.resultPreparationToken = token;
  owner.cardGenerationPending = true;
  const generationTargets = includeCard ? getResultCardButtons(owner) : [];
  setProgressState(owner, 'completion', 'preparing');
  window.requestAnimationFrame(() => {
    if (owner.resultPreparationToken !== token || owner.screen !== 'result') return;
    setProgressState(owner, 'completion', 'loading');
    window.requestAnimationFrame(() => {
      if (owner.resultPreparationToken !== token || owner.screen !== 'result') return;
      setProgressState(owner, 'completion', 'complete');
      if (!includeCard) {
        owner.cardGenerationPending = false;
        owner.cardReady = false;
        return;
      }
      setProgressState(owner, 'card', 'preparing', { targets: generationTargets });
      window.requestAnimationFrame(() => {
        if (owner.resultPreparationToken !== token || owner.screen !== 'result') return;
        setProgressState(owner, 'card', 'loading', { targets: generationTargets });
        window.requestAnimationFrame(() => {
          if (owner.resultPreparationToken !== token || owner.screen !== 'result') return;
          if (createCard) owner.resultCardCanvas = createCard();
          owner.cardGenerationPending = false;
          owner.cardReady = true;
          setProgressState(owner, 'card', 'complete', { targets: getResultCardButtons(owner) });
        });
      });
    });
  });
}

function normalizeAchievementIds(value) {
  if (!Array.isArray(value)) return [];
  const allowed = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));
  return [...new Set(value.filter((id) => typeof id === 'string' && allowed.has(id)))];
}

function readAchievementIds() {
  try {
    return normalizeAchievementIds(JSON.parse(window.localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY) || '[]'));
  } catch {
    return [];
  }
}

function writeAchievementIds(ids) {
  try {
    window.localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(normalizeAchievementIds(ids)));
    return true;
  } catch {
    return false;
  }
}

function getAchievementCopy(owner) {
  return ACHIEVEMENT_COPY[owner.language] || ACHIEVEMENT_COPY.pt;
}

function formatAchievementText(owner, text, values = {}) {
  let result = String(text || '');
  Object.entries(values).forEach(([name, value]) => {
    result = result.replaceAll(`{${name}}`, String(value));
  });
  return result;
}

function getAchievementProgress(owner) {
  const copy = getAchievementCopy(owner);
  const unlockedIds = new Set(readAchievementIds());
  return {
    unlockedIds,
    total: ACHIEVEMENTS.length,
    unlocked: ACHIEVEMENTS.filter((achievement) => unlockedIds.has(achievement.id)).length,
    items: ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      copy: copy.items[achievement.id] || ACHIEVEMENT_COPY.pt.items[achievement.id]
    }))
  };
}

function getAchievementSummaryText(owner) {
  const progress = getAchievementProgress(owner);
  const copy = getAchievementCopy(owner);
  const titles = progress.items.filter((item) => item.unlocked).map((item) => item.copy.title);
  const progressText = formatAchievementText(owner, copy.progress, { unlocked: progress.unlocked, total: progress.total });
  return titles.length ? `${progressText} · ${titles.join(' · ')}` : progressText;
}

function getAchievementCelebrationAction(owner, ids = []) {
  const copy = getAchievementCopy(owner);
  if (ids.includes('theme-reviewer') && owner.reviewThemeKey && typeof owner.startThemeReview === 'function') {
    return {
      label: copy.celebrationContinueReview,
      action: () => {
        closeAchievementCelebration(owner, { restoreFocus: false, announce: false });
        owner.startThemeReview(owner.reviewThemeKey);
      }
    };
  }
  if (['result', 'review-result', 'bonus-result'].includes(owner.screen)) {
    return {
      label: copy.celebrationContinueResult,
      action: () => closeAchievementCelebration(owner)
    };
  }
  return {
    label: copy.celebrationContinue,
    action: () => closeAchievementCelebration(owner)
  };
}

function getAchievementCelebrationAnnouncement(owner, ids) {
  const copy = getAchievementCopy(owner);
  const items = ids
    .map((id) => copy.items[id] || ACHIEVEMENT_COPY.pt.items[id])
    .filter(Boolean);
  return `${copy.celebrationTitle}. ${copy.celebrationIntro} ${items.map((item) => `${item.title}. ${item.reflection}`).join(' ')}`;
}

function syncAchievementCelebration(owner) {
  const host = document.getElementById('achievement-celebration');
  if (!host || !owner) return;
  const ids = [...new Set(owner.achievementCelebrationIds || [])];
  const visible = Boolean(owner.achievementCelebrationVisible && ids.length);
  const copy = getAchievementCopy(owner);
  const setText = (selector, value) => {
    const element = host.querySelector(selector);
    if (element) element.textContent = value;
  };
  setText('[data-achievement-celebration="icon"]', '✦');
  setText('[data-achievement-celebration="kicker"]', copy.celebrationTitle);
  setText('[data-achievement-celebration="title"]', copy.celebrationTitle);
  setText('[data-achievement-celebration="intro"]', copy.celebrationIntro);
  const list = host.querySelector('[data-achievement-celebration="list"]');
  if (list) {
    list.setAttribute('aria-label', copy.celebrationTitle);
    list.replaceChildren();
    ids.forEach((id) => {
      const item = copy.items[id] || ACHIEVEMENT_COPY.pt.items[id];
      if (!item) return;
      const entry = document.createElement('li');
      entry.className = 'achievement-celebration__item';
      const itemTitle = document.createElement('h3');
      itemTitle.className = 'achievement-celebration__item-title';
      itemTitle.textContent = item.title;
      const reflection = document.createElement('p');
      reflection.className = 'achievement-celebration__item-phrase';
      reflection.textContent = item.reflection;
      entry.append(itemTitle, reflection);
      list.appendChild(entry);
    });
  }
  const action = getAchievementCelebrationAction(owner, ids);
  const continueButton = host.querySelector('[data-achievement-celebration="continue"]');
  if (continueButton) {
    continueButton.textContent = action.label;
    continueButton.setAttribute('aria-label', action.label);
  }
  const dismissButton = host.querySelector('[data-achievement-celebration="dismiss"]');
  if (dismissButton) {
    dismissButton.textContent = copy.celebrationDismiss;
    dismissButton.setAttribute('aria-label', copy.celebrationDismiss);
  }
  host.hidden = !visible;
  host.setAttribute('aria-hidden', String(!visible));
  host.setAttribute('aria-label', copy.celebrationTitle);
  const localStatus = host.querySelector('[data-dialog-status]');
  if (localStatus && !visible) localStatus.textContent = '';
  syncDialogStack();
  if (visible) {
    host.classList.remove('achievement-celebration--entering');
    void host.offsetWidth;
    host.classList.add('achievement-celebration--entering');
  }
}

function closeAchievementCelebration(owner, { restoreFocus = true, announce = true } = {}) {
  if (!owner?.achievementCelebrationVisible) return;
  const returnFocus = owner.achievementCelebrationReturnFocus;
  owner.achievementCelebrationVisible = false;
  owner.achievementCelebrationIds = [];
  owner.achievementCelebrationReturnFocus = null;
  syncAchievementCelebration(owner);
  if (announce) owner.announce?.(getAchievementCopy(owner).celebrationClosed);
  if (restoreFocus) restoreDialogFocus(returnFocus);
}

function showAchievementCelebration(owner, ids = []) {
  const validIds = ids.filter((id) => ACHIEVEMENTS.some((achievement) => achievement.id === id));
  if (!validIds.length) return;
  const host = document.getElementById('achievement-celebration');
  if (!host) {
    owner.announce?.(getAchievementCelebrationAnnouncement(owner, validIds));
    return;
  }
  const wasVisible = Boolean(owner.achievementCelebrationVisible);
  owner.achievementCelebrationIds = [...new Set([...(owner.achievementCelebrationIds || []), ...validIds])];
  if (!wasVisible) owner.achievementCelebrationReturnFocus = rememberDialogFocus();
  owner.achievementCelebrationVisible = true;
  syncAchievementCelebration(owner);
  announceDialog(owner, getAchievementCelebrationAnnouncement(owner, owner.achievementCelebrationIds));
  if (!wasVisible) focusFirstDialogControl(host.querySelector('[role="dialog"]'), '[data-achievement-celebration="continue"]');
}

function ensureAchievementCelebrationControls() {
  if (window.__sigoAchievementCelebrationControlsBound) return;
  window.__sigoAchievementCelebrationControlsBound = true;
  const host = document.getElementById('achievement-celebration');
  host?.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-achievement-celebration]') : null;
    if (target instanceof HTMLElement) {
      const action = target.dataset.achievementCelebration;
      if (action === 'continue') {
        getAchievementCelebrationAction(window.sigoQuiz, window.sigoQuiz?.achievementCelebrationIds || []).action();
        return;
      }
      if (action === 'dismiss') {
        closeAchievementCelebration(window.sigoQuiz);
        return;
      }
    }
    if (event.target === event.currentTarget) closeAchievementCelebration(window.sigoQuiz);
  });
  window.addEventListener('keydown', (event) => {
    const owner = window.sigoQuiz;
    const currentHost = document.getElementById('achievement-celebration');
    if (!currentHost || currentHost.hidden || !owner?.achievementCelebrationVisible) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeAchievementCelebration(owner);
    }
  }, true);
}

function unlockAchievements(owner, ids) {
  const current = readAchievementIds();
  const currentSet = new Set(current);
  const nextIds = [...current];
  const newlyUnlocked = [];
  ids.filter((id) => ACHIEVEMENTS.some((achievement) => achievement.id === id)).forEach((id) => {
    if (!currentSet.has(id)) {
      currentSet.add(id);
      nextIds.push(id);
      newlyUnlocked.push(id);
    }
  });
  if (newlyUnlocked.length) {
    writeAchievementIds(nextIds);
    window.requestAnimationFrame(() => {
      if (window.sigoQuiz && window.sigoQuiz !== owner) return;
      showAchievementCelebration(owner, newlyUnlocked);
    });
  }
  owner.newAchievementIds = newlyUnlocked;
  return newlyUnlocked;
}

function renderAchievementCollection(owner, parent, { idPrefix = 'journey-achievements', clearParent = true } = {}) {
  if (!parent) return;
  if (clearParent) parent.replaceChildren();
  const copy = getAchievementCopy(owner);
  const progress = getAchievementProgress(owner);
  const section = document.createElement('section');
  section.className = 'journey-achievements';
  section.id = idPrefix;
  section.setAttribute('aria-labelledby', `${idPrefix}-title`);
  const title = document.createElement('h2');
  title.id = `${idPrefix}-title`;
  title.className = 'journey-achievements__title';
  title.textContent = copy.title;
  const intro = document.createElement('p');
  intro.className = 'journey-achievements__intro';
  intro.textContent = copy.intro;
  const progressText = document.createElement('p');
  progressText.className = 'journey-achievements__progress';
  progressText.setAttribute('role', 'status');
  progressText.textContent = formatAchievementText(owner, copy.progress, { unlocked: progress.unlocked, total: progress.total });
  const phrase = document.createElement('p');
  phrase.className = 'journey-achievements__phrase';
  phrase.textContent = copy.collectionPhrase;
  const list = document.createElement('div');
  list.className = 'journey-achievements__list';
  progress.items.forEach((item) => {
    const card = document.createElement('article');
    card.className = `journey-achievement${item.unlocked ? ' journey-achievement--unlocked' : ' journey-achievement--locked'}${owner.newAchievementIds?.includes(item.id) ? ' journey-achievement--new' : ''}`;
    const head = document.createElement('div');
    head.className = 'journey-achievement__head';
    const marker = document.createElement('span');
    marker.className = 'journey-achievement__marker';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = item.unlocked ? '✦' : '○';
    const itemTitle = document.createElement('h3');
    itemTitle.className = 'journey-achievement__title';
    itemTitle.textContent = item.copy.title;
    const status = document.createElement('span');
    status.className = 'journey-achievement__status';
    status.textContent = item.unlocked ? copy.unlocked : copy.locked;
    head.append(marker, itemTitle, status);
    const description = document.createElement('p');
    description.className = 'journey-achievement__description';
    description.textContent = item.unlocked ? item.copy.description : item.copy.locked;
    const reflection = document.createElement('p');
    reflection.className = 'journey-achievement__reflection';
    reflection.textContent = item.unlocked ? item.copy.reflection : item.copy.locked;
    card.append(head, description, reflection);
    if (owner.newAchievementIds?.includes(item.id)) {
      const badge = document.createElement('span');
      badge.className = 'journey-achievement__new';
      badge.textContent = copy.newBadge;
      card.appendChild(badge);
    }
    list.appendChild(card);
  });
  section.append(title, intro, progressText, phrase, list);
  parent.appendChild(section);
}

function getDraftCopy(owner) {
  return DRAFT_COPY[owner.language] || DRAFT_COPY.pt;
}

function formatDraftText(owner, key, values = {}) {
  let text = getDraftCopy(owner)[key] || key;
  Object.entries(values).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value));
  });
  return text;
}

const REVIEW_DRAFT_KEYS = {
  draftTitle: 'draftReviewTitle',
  draftIntro: 'draftReviewIntro',
  draftQuestion: 'draftReviewQuestion',
  draftReflection: 'draftReviewReflection',
  draftResume: 'draftReviewResume',
  draftNew: 'draftReviewNew',
  draftDiscard: 'draftReviewDiscard',
  draftResumed: 'draftReviewResumed',
  draftDiscarded: 'draftReviewDiscarded'
};

function isThemeReviewDraft(draft) {
  return Boolean(draft && (['review', 'review-feedback'].includes(draft.screen) || ['review', 'review-feedback'].includes(draft.pausedScreen)));
}

function formatJourneyDraftText(owner, draft, key, values = {}) {
  return formatDraftText(owner, isThemeReviewDraft(draft) ? (REVIEW_DRAFT_KEYS[key] || key) : key, values);
}

const RESUME_NOTICE_DURATION = 12000;

function getResumeCopy(owner) {
  return RESUME_COPY[owner.language] || RESUME_COPY.pt;
}

function formatResumeText(owner, key, values = {}) {
  let text = getResumeCopy(owner)[key] || RESUME_COPY.pt[key] || key;
  Object.entries(values).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value));
  });
  return text;
}

function getJourneyResumeAction(owner, draft) {
  const copy = getResumeCopy(owner);
  const screen = draft?.screen === 'paused' ? draft.pausedScreen : draft?.screen;
  if (draft?.screen === 'paused') return copy.actionPaused;
  if (screen === 'quiz') return copy.actionQuestion;
  if (screen === 'feedback') return draft.currentQuestionIndex === questions.length - 1 ? owner.t('seeScore') : owner.t('continue');
  if (screen === 'review') return copy.actionReviewQuestion;
  if (screen === 'review-feedback') return draft.reviewQuestionPosition === draft.reviewQuestionIndices.length - 1 ? owner.t('reviewFinish') : copy.actionReviewFeedback;
  if (screen === 'bonus') return copy.actionBonusQuestion;
  if (screen === 'bonus-feedback') return draft.bonusQuestionPosition === draft.bonusQuestionIndices.length - 1 ? owner.t('bonusFinish') : copy.actionBonusFeedback;
  return copy.actionResult;
}

function getJourneyResumeNotice(owner, draft) {
  if (!draft) return null;
  const progress = getJourneyDraftSummary(owner, draft);
  const language = getSavedJourneyLanguageName(draft);
  return {
    title: getResumeCopy(owner).title,
    message: formatResumeText(owner, 'message', {
      language,
      progress,
      action: getJourneyResumeAction(owner, draft)
    })
  };
}

function hideJourneyResumeNotice(owner) {
  if (owner?.resumeNoticeTimer) window.clearTimeout(owner.resumeNoticeTimer);
  if (owner) owner.resumeNoticeTimer = null;
  const notice = document.getElementById('journey-resume-notice');
  if (!notice) return;
  notice.hidden = true;
  notice.setAttribute('aria-hidden', 'true');
}

function showJourneyResumeNotice(owner, draft) {
  const content = getJourneyResumeNotice(owner, draft);
  if (!content) return;
  const notice = document.getElementById('journey-resume-notice');
  const title = document.getElementById('journey-resume-notice-title');
  const message = document.getElementById('journey-resume-notice-message');
  const announcement = `${content.title}. ${content.message}`;
  if (!notice || !title || !message) {
    owner.announce?.(announcement);
    return;
  }
  hideJourneyResumeNotice(owner);
  title.textContent = content.title;
  message.textContent = content.message;
  notice.hidden = false;
  notice.setAttribute('aria-hidden', 'false');
  owner.announce?.(announcement);
  owner.resumeNoticeTimer = window.setTimeout(() => {
    notice.hidden = true;
    notice.setAttribute('aria-hidden', 'true');
    owner.resumeNoticeTimer = null;
  }, RESUME_NOTICE_DURATION);
}

function getJourneyHistoryViewNotice(owner) {
  const record = owner?.savedJourney;
  if (!record) return null;
  return {
    title: owner.t('historyViewNoticeTitle'),
    message: owner.t('historyViewNoticeMessage', {
      language: getSavedJourneyLanguageName(record),
      score: record.score,
      total: questions.length,
      rank: record.rank || getJourneyRankForScore(owner, record.score)
    })
  };
}

function syncJourneyHistoryViewNotice(owner) {
  const notice = document.getElementById('journey-history-view-notice');
  const title = document.getElementById('journey-history-view-notice-title');
  const message = document.getElementById('journey-history-view-notice-message');
  const dismiss = document.getElementById('dismiss-journey-history-view-notice');
  if (!notice || !title || !message || !dismiss || !owner) return;
  const content = getJourneyHistoryViewNotice(owner);
  const visible = Boolean(owner.historyViewNoticeOpen && owner.screen === 'result' && owner.isViewingSavedJourney && content);
  if (visible) {
    title.textContent = content.title;
    message.textContent = content.message;
    dismiss.textContent = owner.t('historyViewNoticeDismiss');
    dismiss.setAttribute('aria-label', owner.t('historyViewNoticeDismiss'));
  }
  notice.hidden = !visible;
  notice.setAttribute('aria-hidden', String(!visible));
}

function announceJourneyHistoryViewNotice(owner) {
  const content = getJourneyHistoryViewNotice(owner);
  if (!content) return;
  owner.announce?.(`${content.title}. ${content.message}`);
}

function hideJourneyHistoryViewNotice(owner, { announce = true } = {}) {
  if (!owner) return;
  owner.historyViewNoticeOpen = false;
  syncJourneyHistoryViewNotice(owner);
  if (announce) owner.announce?.(owner.t('historyViewNoticeClosed'));
}

function buildThemeReviewReturnSummary(owner) {
  if (!owner?.reviewThemeKey || !owner.reviewQuestionIndices?.length) return null;
  return {
    themeKey: owner.reviewThemeKey,
    originalScore: getThemeReviewOriginalScore(owner),
    currentScore: Math.max(0, Number(owner.reviewScore) || 0),
    total: owner.reviewQuestionIndices.length
  };
}

function syncThemeReviewReturnNotice(owner) {
  const notice = document.getElementById('journey-review-return-notice');
  if (!notice) return;
  const summary = owner?.screen === 'result' ? owner.reviewReturnSummary : null;
  notice.hidden = !summary;
  notice.setAttribute('aria-hidden', String(!summary));
  if (!summary) return;

  const theme = getThemeLabel(owner, summary.themeKey);
  const card = document.createElement('div');
  card.className = 'journey-review-return-notice__card';
  card.setAttribute('role', 'status');
  card.setAttribute('aria-live', 'polite');
  card.setAttribute('aria-labelledby', 'journey-review-return-notice-title');
  const title = document.createElement('h2');
  title.id = 'journey-review-return-notice-title';
  title.className = 'journey-review-return-notice__title';
  title.textContent = owner.t('reviewReturnTitle');
  const message = document.createElement('p');
  message.className = 'journey-review-return-notice__summary';
  message.textContent = owner.t('reviewReturnSummary', {
    theme,
    original: summary.originalScore,
    current: summary.currentScore,
    total: summary.total
  });
  const guidance = document.createElement('p');
  guidance.className = 'journey-review-return-notice__guidance';
  guidance.textContent = owner.t('reviewReturnGuidance');
  const actions = document.createElement('div');
  actions.className = 'journey-review-return-notice__actions';
  const createAction = (label, action, modifier = '') => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `journey-review-return-notice__button${modifier ? ` ${modifier}` : ''}`;
    button.textContent = label;
    button.addEventListener('click', action);
    return button;
  };
  const dismiss = (messageKey) => {
    owner.reviewReturnSummary = null;
    syncThemeReviewReturnNotice(owner);
    owner.renderAccessibility?.();
    owner.announce?.(owner.t(messageKey));
  };
  actions.append(
    createAction(owner.t('reviewReturnMap'), () => dismiss('reviewReturnMap')),
    createAction(owner.t('reviewReturnAgain'), () => owner.startThemeReview(summary.themeKey), 'journey-review-return-notice__button--secondary'),
    createAction(owner.t('reviewReturnStay'), () => dismiss('reviewReturnStay'), 'journey-review-return-notice__button--quiet')
  );
  card.append(title, message, guidance, actions);
  notice.replaceChildren(card);
  owner.announce?.(`${title.textContent}. ${message.textContent} ${guidance.textContent}`);
}

function normalizeSelectedAnswers(saved) {
  return Array.from({ length: questions.length }, (_, index) => {
    const candidate = saved?.selectedAnswers?.[index];
    const numeric = Number(candidate);
    return candidate !== null && candidate !== undefined && candidate !== '' && Number.isInteger(numeric) && numeric >= 0 && numeric < (questions[index]?.pt?.options?.length || 4) ? numeric : null;
  });
}

function normalizeQuestionMarkers(saved) {
  const source = Array.isArray(saved) ? saved : saved?.markedQuestions;
  return Array.from({ length: questions.length }, (_, index) => Boolean(source?.[index]));
}

function getQuestionMarkerCount(ownerOrMarkers) {
  const markers = Array.isArray(ownerOrMarkers) ? ownerOrMarkers : ownerOrMarkers?.questionMarkers || ownerOrMarkers?.markedQuestions;
  return Array.isArray(markers) ? markers.filter(Boolean).length : 0;
}

function getQuestionMarkerIndices(ownerOrMarkers) {
  const markers = normalizeQuestionMarkers(Array.isArray(ownerOrMarkers) ? { markedQuestions: ownerOrMarkers } : ownerOrMarkers);
  return markers.map((marked, index) => marked ? index : -1).filter((index) => index >= 0);
}

function getActiveQuestionMarkerIndex(owner) {
  if (!owner) return null;
  if (owner.screen === 'review' || owner.screen === 'review-feedback' || (owner.screen === 'paused' && ['review', 'review-feedback'].includes(owner.pausedScreen))) {
    const index = owner.reviewQuestionIndices?.[owner.reviewQuestionPosition];
    return Number.isInteger(index) ? index : null;
  }
  if (owner.screen === 'quiz' || owner.screen === 'feedback' || (owner.screen === 'paused' && ['quiz', 'feedback'].includes(owner.pausedScreen))) {
    return Number.isInteger(owner.currentQuestionIndex) ? owner.currentQuestionIndex : null;
  }
  return null;
}

function getQuestionMarkerButtonText(owner, questionIndex) {
  return owner.questionMarkers?.[questionIndex]
    ? `★  ${owner.t('markerRemove')}`
    : `☆  ${owner.t('markerAdd')}`;
}

function getQuestionMarkerStatus(owner, questionIndex) {
  return owner.questionMarkers?.[questionIndex] ? owner.t('markerMarked') : owner.t('markerUnmarked');
}

function getQuestionMarkerAccessibleLabel(owner, questionIndex) {
  return `${getQuestionMarkerButtonText(owner, questionIndex)}. ${getQuestionMarkerStatus(owner, questionIndex)}. ${owner.t('markerCount', { count: getQuestionMarkerCount(owner) })}`;
}

function getThemeMarkedCount(owner, themeKey) {
  return getThemeQuestionIndices(themeKey, getMainQuestionSet(owner)).filter((index) => owner.questionMarkers?.[index]).length;
}

function startMarkedQuestionReview(owner, questionIndex) {
  if (!owner || !Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= questions.length) return;
  const question = getMainQuestionSet(owner)[questionIndex];
  if (!question || !owner.questionMarkers?.[questionIndex]) return;
  const themeKey = question.pt.category;
  if (owner.isViewingSavedJourney) {
    owner.isViewingSavedJourney = false;
    owner.savedJourney = null;
  }
  owner.announce?.(`${owner.t('markerResume')}: ${question[owner.language]?.question || question.pt.question}`);
  owner.startThemeReview?.(themeKey, questionIndex);
}

function toggleQuestionMarker(owner, questionIndex) {
  if (!owner || !Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= questions.length || owner.isViewingSavedJourney) return;
  owner.questionMarkers = normalizeQuestionMarkers(owner);
  owner.questionMarkers[questionIndex] = !owner.questionMarkers[questionIndex];
  persistJourneyDraft(owner);
  const message = owner.questionMarkers[questionIndex] ? owner.t('markerSaved') : owner.t('markerRemoved');
  if (typeof owner.renderScreen === 'function') owner.renderScreen(owner.screen);
  else owner.render?.();
  owner.announce?.(`${message} ${owner.t('markerCount', { count: getQuestionMarkerCount(owner) })}`);
}

function formatThemeMapCount(owner, theme) {
  return `${formatThemeMapText(owner, 'count', theme)} · ${owner.t('markerThemeCount', { count: getThemeMarkedCount(owner, theme.key) })}`;
}

function createQuestionMarkerControl(owner, parent, questionIndex) {
  if (!owner || !parent || !Number.isInteger(questionIndex)) return null;
  const section = document.createElement('section');
  section.className = 'fallback-marker-control';
  section.setAttribute('aria-label', owner.t('markerLabel'));
  const head = document.createElement('div');
  head.className = 'fallback-marker-control__head';
  const label = document.createElement('p');
  label.className = 'fallback-marker-control__label';
  label.textContent = owner.t('markerLabel');
  const status = document.createElement('span');
  status.className = 'fallback-marker-control__status';
  status.textContent = getQuestionMarkerStatus(owner, questionIndex);
  head.append(label, status);
  const button = owner.createButton(getQuestionMarkerButtonText(owner, questionIndex), () => toggleQuestionMarker(owner, questionIndex), true);
  button.classList.add('fallback-marker-control__button');
  button.setAttribute('aria-label', getQuestionMarkerAccessibleLabel(owner, questionIndex));
  button.setAttribute('aria-pressed', String(Boolean(owner.questionMarkers?.[questionIndex])));
  button.title = getQuestionMarkerStatus(owner, questionIndex);
  if (owner.isViewingSavedJourney) {
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  }
  section.append(head, button);
  parent.appendChild(section);
  return button;
}

function createMarkedQuestionsSection(owner, { themeKey = null, idPrefix = 'journey-marked-questions' } = {}) {
  const section = document.createElement('section');
  section.className = 'journey-marked-questions';
  section.id = idPrefix;
  section.setAttribute('aria-labelledby', `${idPrefix}-title`);
  section.setAttribute('aria-describedby', `${idPrefix}-intro ${idPrefix}-summary`);
  const title = document.createElement('h2');
  title.id = `${idPrefix}-title`;
  title.className = 'journey-marked-questions__title';
  title.textContent = owner.t('markerLabel');
  const intro = document.createElement('p');
  intro.id = `${idPrefix}-intro`;
  intro.className = 'journey-marked-questions__intro';
  intro.textContent = owner.t('markerReviewIntro');
  const indices = (themeKey ? getThemeQuestionIndices(themeKey) : getQuestionMarkerIndices(owner))
    .filter((index) => owner.questionMarkers?.[index]);
  const summary = document.createElement('p');
  summary.id = `${idPrefix}-summary`;
  summary.className = 'journey-marked-questions__summary';
  summary.setAttribute('role', 'status');
  summary.setAttribute('aria-live', 'polite');
  summary.textContent = owner.t('markerReviewSummary', { count: indices.length });
  const list = document.createElement('ol');
  list.className = 'journey-marked-questions__list';
  list.setAttribute('aria-label', owner.t('markerLabel'));
  if (!indices.length) {
    const empty = document.createElement('li');
    empty.className = 'journey-marked-questions__empty';
    empty.textContent = owner.t('markerEmpty');
    list.appendChild(empty);
  } else {
    indices.forEach((index) => {
      const question = getMainQuestionSet(owner)[index];
      const localized = question?.[owner.language] || question?.pt;
      if (!localized) return;
      const item = document.createElement('li');
      item.className = 'journey-marked-questions__item';
      const head = document.createElement('div');
      head.className = 'journey-marked-questions__head';
      const theme = document.createElement('p');
      theme.className = 'journey-marked-questions__theme';
      theme.textContent = `${index + 1}. ${localized.category}`;
      const status = document.createElement('span');
      status.className = 'journey-marked-questions__status';
      status.textContent = getQuestionMarkerStatus(owner, index);
      head.append(theme, status);
      const questionText = document.createElement('h3');
      questionText.className = 'journey-marked-questions__question';
      questionText.textContent = localized.question;
      const resume = document.createElement('button');
      resume.type = 'button';
      resume.className = 'journey-marked-questions__resume';
      resume.textContent = owner.t('markerResume');
      resume.setAttribute('aria-label', `${owner.t('markerResume')}: ${localized.question}`);
      resume.addEventListener('click', () => startMarkedQuestionReview(owner, index));
      item.append(head, questionText, resume);
      list.appendChild(item);
    });
  }
  section.append(title, intro, summary, list);
  return section;
}

function normalizeJourneyDraft(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return null;
  const allowedScreens = new Set(['quiz', 'feedback', 'paused', 'result', 'review', 'review-feedback', 'bonus', 'bonus-feedback']);
  if (!allowedScreens.has(saved.screen) || !UI[saved.language]) return null;
  const pausedScreen = saved.screen === 'paused' && ['quiz', 'feedback', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(saved.pausedScreen)
    ? saved.pausedScreen
    : null;
  const currentQuestionIndex = Math.max(0, Math.min(questions.length - 1, Math.floor(Number(saved.currentQuestionIndex) || 0)));
  const questionSetIds = Array.isArray(saved.questionSetIds) ? [...saved.questionSetIds] : [];
  const answerTimes = normalizeAnswerTimes(saved.answerTimes);
  const speedPoints = Math.max(0, Math.floor(Number(saved.speedPoints) || 0));
  const answerResults = Array.from({ length: questions.length }, (_, index) => (
    typeof saved.answerResults?.[index] === 'boolean' ? saved.answerResults[index] : null
  ));
  const score = answerResults.filter(Boolean).length;
  const savedAt = typeof saved.savedAt === 'string' && !Number.isNaN(Date.parse(saved.savedAt))
    ? saved.savedAt
    : new Date().toISOString();
  const feedbackState = saved.feedbackState && typeof saved.feedbackState === 'object'
    ? { correct: Boolean(saved.feedbackState.correct) }
    : null;
  const reviewThemeKey = typeof saved.reviewThemeKey === 'string' && getThemeQuestionIndices(saved.reviewThemeKey).length
    ? saved.reviewThemeKey
    : null;
  const reviewQuestionIndices = reviewThemeKey && Array.isArray(saved.reviewQuestionIndices)
    ? [...new Set(saved.reviewQuestionIndices.map((candidate) => Number(candidate)).filter((candidate) => Number.isInteger(candidate) && candidate >= 0 && candidate < questions.length))]
    : [];
  const expectedReviewIndices = reviewThemeKey ? getThemeQuestionIndices(reviewThemeKey) : [];
  const reviewDraftActive = ['review', 'review-feedback'].includes(saved.screen) || ['review', 'review-feedback'].includes(pausedScreen);
  if (reviewDraftActive && (!reviewThemeKey || reviewQuestionIndices.length !== expectedReviewIndices.length || reviewQuestionIndices.some((index, position) => index !== expectedReviewIndices[position]))) return null;
  const reviewAnswerResults = Array.from({ length: reviewQuestionIndices.length }, (_, index) => (
    typeof saved.reviewAnswerResults?.[index] === 'boolean' ? saved.reviewAnswerResults[index] : null
  ));
  const reviewFeedbackState = saved.reviewFeedbackState && typeof saved.reviewFeedbackState === 'object'
    ? { correct: Boolean(saved.reviewFeedbackState.correct) }
    : null;
  const bonusQuestionIndices = Array.isArray(saved.bonusQuestionIndices)
    ? [...new Set(saved.bonusQuestionIndices.map((candidate) => Number(candidate)).filter((candidate) => Number.isInteger(candidate) && candidate >= 0 && candidate < bonusQuestions.length))]
    : [];
  const bonusDraftActive = ['bonus', 'bonus-feedback'].includes(saved.screen) || ['bonus', 'bonus-feedback'].includes(pausedScreen);
  if (bonusDraftActive && !bonusQuestionIndices.length) return null;
  const screen = saved.screen === 'feedback' && !feedbackState
    ? 'quiz'
    : saved.screen === 'review-feedback' && !reviewFeedbackState
      ? 'review'
      : saved.screen === 'bonus-feedback' && !saved.bonusFeedbackState
        ? 'bonus'
        : saved.screen;
  const normalizedPausedScreen = pausedScreen === 'review-feedback' && !reviewFeedbackState ? 'review' : pausedScreen;
  const bonusFeedbackState = saved.bonusFeedbackState && typeof saved.bonusFeedbackState === 'object'
    ? { correct: Boolean(saved.bonusFeedbackState.correct) }
    : null;
  const bonusQuestionPosition = bonusQuestionIndices.length
    ? Math.max(0, Math.min(bonusQuestionIndices.length - 1, Math.floor(Number(saved.bonusQuestionPosition) || 0)))
    : 0;
  const bonusScore = Math.max(0, Math.min(bonusQuestionIndices.length, Math.floor(Number(saved.bonusScore) || 0)));
  const reviewQuestionPosition = reviewQuestionIndices.length
    ? Math.max(0, Math.min(reviewQuestionIndices.length - 1, Math.floor(Number(saved.reviewQuestionPosition) || 0)))
    : 0;
  const reviewScore = reviewAnswerResults.filter(Boolean).length;
  const reviewOriginalScore = Number.isFinite(Number(saved.reviewOriginalScore))
    ? Math.max(0, Math.min(reviewQuestionIndices.length, Math.floor(Number(saved.reviewOriginalScore))))
    : null;
  const musicVolume = Number.isFinite(Number(saved.musicVolume)) ? clampAudioVolume(saved.musicVolume, DEFAULT_AUDIO_VOLUME) : null;
  const lastAudibleMusicVolume = Number.isFinite(Number(saved.lastAudibleMusicVolume))
    ? clampAudioVolume(saved.lastAudibleMusicVolume, DEFAULT_AUDIO_VOLUME)
    : null;
  return {
    version: JOURNEY_DRAFT_VERSION,
    savedAt,
    language: saved.language,
    screen,
    pausedScreen: normalizedPausedScreen,
    currentQuestionIndex,
    questionSetIds,
    score,
    speedPoints,
    answerTimes,
    answerResults,
    selectedAnswers: normalizeSelectedAnswers(saved),
    markedQuestions: normalizeQuestionMarkers(saved),
    feedbackState,
    reviewThemeKey,
    reviewQuestionIndices,
    reviewQuestionPosition,
    reviewScore,
    reviewOriginalScore,
    reviewOriginalScoreCaptured: Boolean(saved.reviewOriginalScoreCaptured && reviewOriginalScore !== null),
    reviewAnswerResults,
    reviewFeedbackState,
    reviewReturnScreen: 'result',
    bonusQuestionIndices,
    bonusQuestionPosition,
    bonusScore,
    bonusFeedbackState,
    bonusReturnScreen: 'result',
    historyExpanded: Boolean(saved.historyExpanded),
    reducedMotion: typeof saved.reducedMotion === 'boolean' ? saved.reducedMotion : null,
    highContrast: typeof saved.highContrast === 'boolean' ? saved.highContrast : null,
    isMuted: typeof saved.isMuted === 'boolean' ? saved.isMuted : null,
    musicVolume,
    lastAudibleMusicVolume,
    arrivalSoundPlayed: Boolean(saved.arrivalSoundPlayed)
  };
}

function readJourneyDraft() {
  try {
    const raw = window.localStorage.getItem(JOURNEY_DRAFT_STORAGE_KEY);
    const saved = JSON.parse(raw || 'null');
    // Remove drafts from the old registration step, including any personal data they held.
    if (saved?.screen === 'lead') {
      window.localStorage.removeItem(JOURNEY_DRAFT_STORAGE_KEY);
      return null;
    }
    return normalizeJourneyDraft(saved);
  } catch {
    return null;
  }
}

function writeJourneyDraft(draft) {
  try {
    window.localStorage.setItem(JOURNEY_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

function clearJourneyDraft() {
  try {
    window.localStorage.removeItem(JOURNEY_DRAFT_STORAGE_KEY);
  } catch {
    // The current journey remains usable when local storage is unavailable.
  }
}

function getJourneyDraftSummary(owner, draft = readJourneyDraft()) {
  if (!draft) return '';
  if (draft.screen === 'result') return `${owner.t('resultTitle')} · ${draft.score} / ${questions.length}`;
  const isReview = isThemeReviewDraft(draft);
  if (isReview) {
    const current = Math.min(draft.reviewQuestionPosition + 1, draft.reviewQuestionIndices.length);
    const theme = getThemeLabel(owner, draft.reviewThemeKey);
    const language = getSavedJourneyLanguageName(draft);
    const values = { theme, current, total: draft.reviewQuestionIndices.length, language };
    const isReflection = draft.screen === 'review-feedback' || draft.pausedScreen === 'review-feedback';
    return formatJourneyDraftText(owner, draft, isReflection ? 'draftReflection' : 'draftQuestion', values);
  }
  const isBonus = ['bonus', 'bonus-feedback'].includes(draft.screen) || ['bonus', 'bonus-feedback'].includes(draft.pausedScreen);
  if (isBonus) {
    const current = Math.min(draft.bonusQuestionPosition + 1, draft.bonusQuestionIndices.length);
    const values = { current, total: draft.bonusQuestionIndices.length };
    const isReflection = draft.screen === 'bonus-feedback' || draft.pausedScreen === 'bonus-feedback';
    return formatDraftText(owner, isReflection ? 'draftBonusReflection' : 'draftBonusQuestion', values);
  }
  const current = Math.min(draft.currentQuestionIndex + 1, questions.length);
  const values = { current, total: questions.length };
  const isReflection = draft.screen === 'feedback' || draft.pausedScreen === 'feedback';
  return formatDraftText(owner, isReflection ? 'draftReflection' : 'draftQuestion', values);
}

function getJourneyDraftAnnouncement(owner, draft = readJourneyDraft()) {
  if (!draft) return '';
  return `${formatJourneyDraftText(owner, draft, 'draftTitle')}. ${getJourneyDraftSummary(owner, draft)} ${formatJourneyDraftText(owner, draft, 'draftIntro')}`;
}

function buildJourneyDraft(owner) {
  return {
    version: JOURNEY_DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    language: owner.language,
    screen: owner.screen,
    pausedScreen: owner.pausedScreen,
    currentQuestionIndex: owner.currentQuestionIndex,
    questionSetIds: getQuestionSetIds(getMainQuestionSet(owner)),
    score: owner.score,
    speedPoints: Math.max(0, Math.floor(Number(owner.speedPoints) || 0)),
    answerTimes: normalizeAnswerTimes(owner.answerTimes),
    answerResults: Array.from({ length: questions.length }, (_, index) => (
      typeof owner.answerResults[index] === 'boolean' ? owner.answerResults[index] : null
    )),
    selectedAnswers: normalizeSelectedAnswers(owner),
    markedQuestions: normalizeQuestionMarkers(owner),
    feedbackState: owner.feedbackState ? { correct: Boolean(owner.feedbackState.correct) } : null,
    reviewThemeKey: typeof owner.reviewThemeKey === 'string' ? owner.reviewThemeKey : null,
    reviewQuestionIndices: Array.isArray(owner.reviewQuestionIndices) ? [...owner.reviewQuestionIndices] : [],
    reviewQuestionPosition: Number.isFinite(Number(owner.reviewQuestionPosition)) ? Math.max(0, Math.floor(Number(owner.reviewQuestionPosition))) : 0,
    reviewScore: Number.isFinite(Number(owner.reviewScore)) ? Math.max(0, Math.floor(Number(owner.reviewScore))) : 0,
    reviewOriginalScore: Number.isFinite(Number(owner.reviewOriginalScore)) ? Math.max(0, Math.floor(Number(owner.reviewOriginalScore))) : null,
    reviewOriginalScoreCaptured: Boolean(owner.reviewOriginalScoreCaptured),
    reviewAnswerResults: Array.isArray(owner.reviewAnswerResults) ? [...owner.reviewAnswerResults] : [],
    reviewFeedbackState: owner.reviewFeedbackState ? { correct: Boolean(owner.reviewFeedbackState.correct) } : null,
    reviewReturnScreen: 'result',
    bonusQuestionIndices: Array.isArray(owner.bonusQuestionIndices) ? [...owner.bonusQuestionIndices] : [],
    bonusQuestionPosition: Number.isFinite(Number(owner.bonusQuestionPosition)) ? Math.max(0, Math.floor(Number(owner.bonusQuestionPosition))) : 0,
    bonusScore: Number.isFinite(Number(owner.bonusScore)) ? Math.max(0, Math.floor(Number(owner.bonusScore))) : 0,
    bonusFeedbackState: owner.bonusFeedbackState ? { correct: Boolean(owner.bonusFeedbackState.correct) } : null,
    bonusReturnScreen: 'result',
    historyExpanded: Boolean(owner.historyExpanded),
    reducedMotion: Boolean(owner.reducedMotion),
    highContrast: Boolean(owner.highContrast),
    isMuted: Boolean(owner.isMuted),
    musicVolume: clampAudioVolume(owner.musicVolume, DEFAULT_AUDIO_VOLUME),
    lastAudibleMusicVolume: clampAudioVolume(owner.lastAudibleMusicVolume, DEFAULT_AUDIO_VOLUME),
    arrivalSoundPlayed: Boolean(owner.arrivalSoundPlayed)
  };
}

function persistJourneyDraft(owner) {
  const isDraftScreen = ['quiz', 'feedback', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(owner.screen)
    || (owner.screen === 'paused' && ['quiz', 'feedback', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(owner.pausedScreen));
  if (isDraftScreen) writeJourneyDraft(buildJourneyDraft(owner));
  else if (owner.screen === 'bonus-result' || (owner.screen === 'review-result' && !owner.isViewingSavedJourney)) clearJourneyDraft();
  else if (owner.screen === 'result' && !owner.isViewingSavedJourney) clearJourneyDraft();
}

function applyJourneyDraft(owner, draft) {
  if (!draft) return false;
  owner.savedJourney = null;
  owner.isViewingSavedJourney = false;
  owner.language = UI[draft.language] ? draft.language : owner.language;
  owner.updateDocumentLanguage();
  owner.currentQuestionIndex = draft.currentQuestionIndex;
  owner.questionSet = restoreQuestionSet(draft.questionSetIds) || questions;
  owner.score = draft.score;
  owner.speedPoints = Math.max(0, Math.floor(Number(draft.speedPoints) || 0));
  owner.answerTimes = normalizeAnswerTimes(draft.answerTimes);
  owner.questionStartedAt = draft.screen === 'quiz' ? performance.now() : 0;
  owner.answerResults = [...draft.answerResults];
  owner.selectedAnswers = [...(draft.selectedAnswers || normalizeSelectedAnswers(draft))];
  owner.questionMarkers = [...(draft.markedQuestions || normalizeQuestionMarkers(draft))];
  owner.feedbackState = draft.feedbackState ? { ...draft.feedbackState } : null;
  owner.reviewThemeKey = draft.reviewThemeKey || null;
  owner.reviewQuestionIndices = [...(draft.reviewQuestionIndices || [])];
  owner.reviewQuestionPosition = Math.max(0, Number(draft.reviewQuestionPosition) || 0);
  owner.reviewScore = Math.max(0, Number(draft.reviewScore) || 0);
  owner.reviewOriginalScore = Number.isFinite(Number(draft.reviewOriginalScore)) ? Math.max(0, Number(draft.reviewOriginalScore)) : null;
  owner.reviewOriginalScoreCaptured = Boolean(draft.reviewOriginalScoreCaptured);
  owner.reviewAnswerResults = [...(draft.reviewAnswerResults || [])];
  owner.reviewFeedbackState = draft.reviewFeedbackState ? { ...draft.reviewFeedbackState } : null;
  owner.reviewReturnScreen = draft.reviewReturnScreen || 'result';
  owner.reviewReturnSummary = null;
  owner.bonusQuestionIndices = [...(draft.bonusQuestionIndices || [])];
  owner.bonusQuestionPosition = Math.max(0, Number(draft.bonusQuestionPosition) || 0);
  owner.bonusScore = Math.max(0, Number(draft.bonusScore) || 0);
  owner.bonusFeedbackState = draft.bonusFeedbackState ? { ...draft.bonusFeedbackState } : null;
  owner.bonusReturnScreen = draft.bonusReturnScreen || 'result';
  owner.historyExpanded = draft.historyExpanded;
  owner.pausedScreen = draft.pausedScreen || null;
  owner.audioWasPlayingBeforePause = false;
  owner.screen = draft.screen;
  owner.arrivalSoundPlayed = Boolean(draft.arrivalSoundPlayed);
  owner.arrivalStartedAt = 0;
  owner.resultCardCanvas = null;

  if (typeof draft.reducedMotion === 'boolean') {
    owner.reducedMotion = draft.reducedMotion;
    owner.motionPreferenceExplicit = true;
  }
  if (typeof draft.highContrast === 'boolean') owner.highContrast = draft.highContrast;
  if (typeof draft.isMuted === 'boolean') owner.isMuted = draft.isMuted;
  if (draft.musicVolume !== null) owner.musicVolume = clampAudioVolume(draft.musicVolume, owner.musicVolume);
  if (draft.lastAudibleMusicVolume !== null) owner.lastAudibleMusicVolume = clampAudioVolume(draft.lastAudibleMusicVolume, DEFAULT_AUDIO_VOLUME);
  if (owner.isMuted) owner.musicVolume = 0;
  if (owner.bgMusic) {
    owner.bgMusic.muted = owner.isMuted;
    owner.bgMusic.volume = clampAudioVolume(owner.musicVolume, 0);
  }
  syncAudioMuteState(owner);
  writeAudioPreference({ volume: owner.musicVolume, lastAudibleVolume: owner.lastAudibleMusicVolume, muted: owner.isMuted });
  writeHighContrastPreference(owner.highContrast);
  if (typeof owner.applyHighContrastTheme === 'function') owner.applyHighContrastTheme();
  owner.updateAudioControl?.();
  owner.updateMotionControl?.();
  owner.updateContrastControl?.();
  return true;
}

function normalizeJourneyRecord(saved, index = 0) {
  if (!saved || typeof saved !== 'object' || !Array.isArray(saved.answerResults) || !Array.isArray(saved.themes)) return null;
  if (!Number.isFinite(Number(saved.score)) || typeof saved.language !== 'string') return null;
  const completedAt = typeof saved.completedAt === 'string' && !Number.isNaN(Date.parse(saved.completedAt))
    ? saved.completedAt
    : new Date().toISOString();
  return {
    ...saved,
    id: typeof saved.id === 'string' && saved.id ? saved.id : `legacy-${completedAt}-${index}`,
    version: Number(saved.version) || 1,
    completedAt,
    questionSetIds: Array.isArray(saved.questionSetIds) ? [...saved.questionSetIds] : [],
    score: Math.max(0, Math.min(questions.length, Number(saved.score))),
    speedPoints: Math.max(0, Math.floor(Number(saved.speedPoints) || 0)),
    answerTimes: normalizeAnswerTimes(saved.answerTimes),
    answerResults: Array.from({ length: questions.length }, (_, answerIndex) => Boolean(saved.answerResults[answerIndex])),
    selectedAnswers: normalizeSelectedAnswers(saved),
    markedQuestions: normalizeQuestionMarkers(saved),
    achievementIds: normalizeAchievementIds(saved.achievementIds),
    themes: saved.themes.filter((theme) => theme && typeof theme.label === 'string').map((theme) => {
      const first = Math.max(0, Number(theme.first) || 0);
      return {
        key: typeof theme.key === 'string' ? theme.key : questions[first]?.pt?.category || theme.label,
        label: theme.label,
        correct: Math.max(0, Number(theme.correct) || 0),
        total: Math.max(0, Number(theme.total) || 0),
        first
      };
    })
  };
}

function readLastJourney() {
  try {
    return normalizeJourneyRecord(JSON.parse(window.localStorage.getItem(LAST_JOURNEY_STORAGE_KEY) || 'null'));
  } catch {
    return null;
  }
}

function writeLastJourney(record) {
  try {
    window.localStorage.setItem(LAST_JOURNEY_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

function clearLastJourney() {
  try {
    window.localStorage.removeItem(LAST_JOURNEY_STORAGE_KEY);
  } catch {
    // The interface remains usable when local storage is unavailable.
  }
}

function readJourneyHistory() {
  try {
    const raw = window.localStorage.getItem(JOURNEY_HISTORY_STORAGE_KEY);
    if (raw === null) {
      const legacy = readLastJourney();
      const migrated = legacy ? [legacy] : [];
      if (migrated.length) writeJourneyHistory(migrated);
      return migrated;
    }
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return [];
    return saved.map((record, index) => normalizeJourneyRecord(record, index)).filter(Boolean).slice(0, JOURNEY_HISTORY_LIMIT);
  } catch {
    const legacy = readLastJourney();
    return legacy ? [legacy] : [];
  }
}

function writeJourneyHistory(history) {
  try {
    window.localStorage.setItem(JOURNEY_HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, JOURNEY_HISTORY_LIMIT)));
    return true;
  } catch {
    return false;
  }
}

function appendJourneyHistory(record) {
  const history = readJourneyHistory().filter((entry) => entry.id !== record.id);
  return writeJourneyHistory([record, ...history]);
}

function removeJourneyHistory(id) {
  const history = readJourneyHistory();
  const next = history.filter((entry) => entry.id !== id);
  if (next.length === history.length) return false;
  writeJourneyHistory(next);
  const last = readLastJourney();
  if (last?.id === id) {
    if (next[0]) writeLastJourney(next[0]);
    else clearLastJourney();
  }
  return true;
}

function clearJourneyHistory() {
  try {
    window.localStorage.removeItem(JOURNEY_HISTORY_STORAGE_KEY);
  } catch {
    // The interface remains usable when local storage is unavailable.
  }
  clearLastJourney();
}

function sanitizeJourneyRecordForTransfer(record) {
  return {
    version: Number(record.version) || 1,
    id: record.id,
    completedAt: record.completedAt,
    score: record.score,
    rank: typeof record.rank === 'string' ? record.rank : '',
    answerResults: [...record.answerResults],
    selectedAnswers: normalizeSelectedAnswers(record),
    markedQuestions: normalizeQuestionMarkers(record),
    achievementIds: normalizeAchievementIds(record.achievementIds),
    themes: record.themes.map((theme) => ({
      key: theme.key,
      label: theme.label,
      correct: theme.correct,
      total: theme.total,
      first: theme.first
    })),
    synthesis: typeof record.synthesis === 'string' ? record.synthesis : '',
    verse: typeof record.verse === 'string' ? record.verse : '',
    language: record.language
  };
}

function getJourneyHistoryTransferText() {
  return JSON.stringify({
    format: JOURNEY_HISTORY_TRANSFER_FORMAT,
    version: JOURNEY_HISTORY_TRANSFER_VERSION,
    questionCount: questions.length,
    exportedAt: new Date().toISOString(),
    journeys: readJourneyHistory().map(sanitizeJourneyRecordForTransfer)
  }, null, 2);
}

function validateImportedJourneyRecord(record, index) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { valid: false, index };
  if (typeof record.id !== 'string' || !record.id.trim() || record.id.length > 160) return { valid: false, index };
  if (!UI[record.language]) return { valid: false, index };
  if (typeof record.completedAt !== 'string' || Number.isNaN(Date.parse(record.completedAt))) return { valid: false, index };
  if (!Number.isInteger(Number(record.score)) || Number(record.score) < 0 || Number(record.score) > questions.length) return { valid: false, index };
  if (!Array.isArray(record.answerResults) || record.answerResults.length !== questions.length || !record.answerResults.every((answer) => typeof answer === 'boolean')) return { valid: false, index };
  if (record.answerResults.filter(Boolean).length !== Number(record.score)) return { valid: false, index };
  if (record.selectedAnswers !== undefined && (!Array.isArray(record.selectedAnswers) || record.selectedAnswers.length !== questions.length || !record.selectedAnswers.every((answer, answerIndex) => answer === null || (Number.isInteger(answer) && answer >= 0 && answer < (questions[answerIndex]?.pt?.options?.length || 4))))) return { valid: false, index };
  if (record.markedQuestions !== undefined && (!Array.isArray(record.markedQuestions) || record.markedQuestions.length !== questions.length || !record.markedQuestions.every((marked) => typeof marked === 'boolean'))) return { valid: false, index };
  if (record.achievementIds !== undefined && (!Array.isArray(record.achievementIds) || !record.achievementIds.every((id) => typeof id === 'string' && ACHIEVEMENTS.some((achievement) => achievement.id === id)))) return { valid: false, index };
  if (!Array.isArray(record.themes) || !record.themes.length) return { valid: false, index };
  if (!record.themes.every((theme) => theme && typeof theme.label === 'string' && theme.label.trim() && Number.isFinite(Number(theme.correct)) && Number.isFinite(Number(theme.total)) && Number(theme.total) > 0 && Number(theme.correct) >= 0 && Number(theme.correct) <= Number(theme.total))) return { valid: false, index };
  const normalized = normalizeJourneyRecord(record, index);
  if (!normalized) return { valid: false, index };
  return {
    valid: true,
    index,
    record: sanitizeJourneyRecordForTransfer(normalized)
  };
}

function validateJourneyHistoryTransfer(text) {
  if (typeof text !== 'string' || !text.trim()) return { error: 'historyTransferNoText' };
  if (text.length > 500000) return { error: 'historyTransferTooLarge' };
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return { error: 'historyTransferInvalidJson' };
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload.format !== JOURNEY_HISTORY_TRANSFER_FORMAT || Number(payload.version) !== JOURNEY_HISTORY_TRANSFER_VERSION) return { error: 'historyTransferInvalidFormat' };
  if (Number(payload.questionCount) !== questions.length) return { error: 'historyTransferWrongQuestionCount' };
  if (!Array.isArray(payload.journeys) || payload.journeys.length > JOURNEY_HISTORY_LIMIT * 4) return { error: 'historyTransferInvalidRecords' };

  const seenIds = new Set();
  const valid = [];
  const invalidIndices = [];
  payload.journeys.forEach((record, index) => {
    const result = validateImportedJourneyRecord(record, index);
    if (!result.valid || seenIds.has(result.record?.id)) {
      invalidIndices.push(index + 1);
      return;
    }
    seenIds.add(result.record.id);
    valid.push(result.record);
  });
  return { valid, invalidIndices, total: payload.journeys.length };
}

function sortJourneyRecords(records) {
  return [...records].sort((a, b) => {
    const bTime = Date.parse(b.completedAt);
    const aTime = Date.parse(a.completedAt);
    return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
  });
}

function dedupeJourneyRecords(records) {
  const unique = new Map();
  records.forEach((record) => {
    if (record?.id && !unique.has(record.id)) unique.set(record.id, record);
  });
  return [...unique.values()];
}

function buildJourneyHistoryImportPlan(validation) {
  const local = readJourneyHistory();
  const localIds = new Set(local.map((record) => record.id));
  const imported = validation?.valid || [];
  const merge = [...local, ...imported.filter((record) => !localIds.has(record.id))];
  return {
    local,
    imported,
    conflicts: imported.filter((record) => localIds.has(record.id)).length,
    replaceRecords: sortJourneyRecords(dedupeJourneyRecords(imported)).slice(0, JOURNEY_HISTORY_LIMIT),
    mergeRecords: sortJourneyRecords(dedupeJourneyRecords(merge)).slice(0, JOURNEY_HISTORY_LIMIT)
  };
}

function setJourneyTransferStatus(owner, key, values = {}) {
  owner.historyTransferStatus = { key, values };
  const message = owner.t(key, values);
  const status = document.getElementById('journey-history-transfer-status');
  if (status) status.textContent = message;
  owner.announce?.(message);
}

function resetJourneyHistoryTransferState(owner) {
  owner.historyImportText = '';
  owner.historyImportFileName = '';
  owner.historyImportValidation = null;
  owner.historyTransferStatus = null;
  const file = document.getElementById('journey-history-import-file');
  if (file) file.value = '';
}

function formatJourneyDate(owner, completedAt) {
  try {
    return new Intl.DateTimeFormat(owner.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(completedAt));
  } catch {
    return new Date(completedAt).toLocaleString();
  }
}

function getJourneyRankForScore(owner, score) {
  const numericScore = Number(score);
  if (numericScore === questions.length) return owner.t('master');
  if (numericScore >= 7) return owner.t('scholar');
  if (numericScore >= 4) return owner.t('beginner');
  return owner.t('seed');
}

function getJourneyThemeStats(record) {
  const storedThemes = new Map((record?.themes || []).map((theme) => [theme.key, theme]));
  const orderedKeys = new Map();
  questions.forEach((question, index) => {
    const key = question.pt.category;
    if (!orderedKeys.has(key)) orderedKeys.set(key, index);
  });
  return [...orderedKeys.entries()].map(([key, first]) => {
    const stored = storedThemes.get(key) || (record?.themes || []).find((theme) => theme.first === first);
    const questionTotal = questions.filter((question) => question.pt.category === key).length;
    return {
      key,
      label: stored?.label || key,
      correct: Math.max(0, Number(stored?.correct) || 0),
      total: Math.max(1, Number(stored?.total) || questionTotal),
      first
    };
  });
}

function getJourneyComparisonRows(owner, earlier, later) {
  const earlierThemes = new Map(getJourneyThemeStats(earlier).map((theme) => [theme.key, theme]));
  const laterThemes = new Map(getJourneyThemeStats(later).map((theme) => [theme.key, theme]));
  const keys = [...new Set([...earlierThemes.keys(), ...laterThemes.keys()])];
  return keys.map((key, index) => {
    const before = earlierThemes.get(key) || { key, correct: 0, total: laterThemes.get(key)?.total || 1, first: index };
    const after = laterThemes.get(key) || { key, correct: 0, total: before.total, first: index };
    return {
      key,
      label: getThemeLabel(owner, key) || after.label || before.label || key,
      beforeCorrect: before.correct,
      beforeTotal: before.total,
      afterCorrect: after.correct,
      afterTotal: after.total,
      delta: after.correct - before.correct
    };
  });
}

function formatSignedJourneyDelta(value) {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;
  return '0';
}

function getLastJourneyCopy(owner) {
  return LAST_JOURNEY_COPY[owner.language] || LAST_JOURNEY_COPY.pt;
}

function formatLastJourneyText(owner, key, values = {}) {
  let text = getLastJourneyCopy(owner)[key] || key;
  Object.entries(values).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value));
  });
  return text;
}

function getSavedJourneyLanguageName(saved) {
  return getLanguage(saved?.language).name;
}

function buildLastJourneyRecord(owner) {
  return {
    version: 3,
    id: `journey-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: new Date().toISOString(),
    questionSetIds: getQuestionSetIds(getMainQuestionSet(owner)),
    score: owner.score,
    rank: owner.getRank(),
    ...getJourneyMetrics(owner),
    answerTimes: normalizeAnswerTimes(owner.answerTimes),
    answerResults: [...owner.answerResults],
    selectedAnswers: normalizeSelectedAnswers(owner),
    markedQuestions: normalizeQuestionMarkers(owner),
    achievementIds: readAchievementIds(),
    themes: owner.getResultThemeStats().map((theme) => ({ ...theme })),
    synthesis: owner.getResultSynthesis(),
    verse: owner.getResultVerse(),
    language: owner.language
  };
}

function getLastJourneyAnnouncement(owner, saved = readLastJourney()) {
  if (!saved) return '';
  return `${formatLastJourneyText(owner, 'announcement', { score: saved.score, total: questions.length, rank: getJourneyRankForScore(owner, saved.score) })} ${formatLastJourneyText(owner, 'savedLanguage', { language: getSavedJourneyLanguageName(saved) })}`;
}

function readHighContrastPreference() {
  try {
    return window.localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeHighContrastPreference(value) {
  try {
    window.localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, String(Boolean(value)));
  } catch {
    // The toggle remains usable when storage is unavailable.
  }
}

function readReducedMotionPreference(fallback = false) {
  try {
    const saved = window.localStorage.getItem('sigo-com-fe-reduced-motion');
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch {
    // The system preference remains a safe fallback when storage is unavailable.
  }
  return fallback;
}

function getContrastCopy(owner) {
  return CONTRAST_COPY[owner.language] || CONTRAST_COPY.pt;
}

function getContrastStatus(owner) {
  return owner.highContrast ? getContrastCopy(owner).on : getContrastCopy(owner).off;
}

function getContrastToggleLabel(owner) {
  const copy = getContrastCopy(owner);
  return owner.highContrast ? copy.disable : copy.enable;
}

function clampAudioVolume(value, fallback = DEFAULT_AUDIO_VOLUME) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(0, Math.min(1, numericValue)) : fallback;
}

function getCapabilityCopy(owner) {
  return CAPABILITY_COPY[owner.language] || CAPABILITY_COPY.pt;
}

function getThemeMapCopy(owner) {
  return THEME_MAP_COPY[owner.language] || THEME_MAP_COPY.pt;
}

function getThemeReviewEntry(owner, themeKey) {
  const languageCopy = THEME_REVIEW_COPY[owner.language] || THEME_REVIEW_COPY.pt;
  return languageCopy[themeKey] || THEME_REVIEW_COPY.pt[themeKey] || { conclusion: '' };
}

function getThemeReviewOriginalScore(owner) {
  const stored = Number(owner.reviewOriginalScore);
  if (owner.reviewOriginalScoreCaptured === true && Number.isFinite(stored)) return Math.max(0, stored);
  const theme = owner.getResultThemeStats?.().find((entry) => entry.key === owner.reviewThemeKey);
  return Math.max(0, Number(theme?.correct) || 0);
}

function getThemeReviewComparisonMessage(owner) {
  const original = getThemeReviewOriginalScore(owner);
  const delta = Number(owner.reviewScore) - original;
  if (delta > 0) return owner.t('reviewComparisonProgress', { delta });
  if (delta === 0) return owner.t('reviewComparisonSteady', { score: owner.reviewScore });
  return owner.t('reviewComparisonInvitation', { delta: Math.abs(delta) });
}

function getThemeQuestionIndices(themeKey, questionSet = questions) {
  return questionSet
    .map((question, index) => (question.pt.category === themeKey ? index : -1))
    .filter((index) => index >= 0);
}

function getThemeLabel(owner, themeKey) {
  const question = getMainQuestionSet(owner).find((item) => item.pt.category === themeKey);
  return question?.[owner.language]?.category || question?.pt?.category || themeKey;
}

function isThemeReviewScreen(screen) {
  return ['review', 'review-feedback', 'review-result'].includes(screen);
}

function isThemeReviewQuestionScreen(screen) {
  return ['review', 'review-feedback'].includes(screen);
}

function isBonusQuestionScreen(screen) {
  return ['bonus', 'bonus-feedback'].includes(screen);
}

function getBonusCopy(owner) {
  return BONUS_COPY[owner.language] || BONUS_COPY.pt;
}

const DEVOTIONAL_PAUSE_SCREENS = new Set(['result', 'bonus-result']);
const DEVOTIONAL_PAUSE_INTERVAL = 11000;

function getDevotionalPauseSlides(owner) {
  const stats = typeof owner.getResultThemeStats === 'function' ? owner.getResultThemeStats() : [];
  const isBonusPause = owner.screen === 'bonus-result';
  const bonusByTheme = new Map();
  if (isBonusPause && Array.isArray(owner.bonusQuestionIndices)) {
    owner.bonusQuestionIndices.forEach((questionIndex) => {
      const question = bonusQuestions[questionIndex];
      if (question?.themeKey && !bonusByTheme.has(question.themeKey)) bonusByTheme.set(question.themeKey, question);
    });
  }
  return stats.map((theme) => {
    const mainQuestion = questions.find((question) => question.pt.category === theme.key);
    const source = (bonusByTheme.get(theme.key)?.[owner.language] || bonusByTheme.get(theme.key)?.pt)
      || (mainQuestion?.[owner.language] || mainQuestion?.pt);
    return {
      key: theme.key,
      label: source?.category || theme.label || theme.key,
      verse: source?.verse || owner.getResultVerse?.() || '',
      reflection: source?.reflection || source?.explanation || owner.t('pauseDefaultReflection')
    };
  }).filter((slide) => slide.verse || slide.reflection);
}

function clearDevotionalPauseTimer(owner) {
  if (owner?.devotionalPauseTimer) window.clearInterval(owner.devotionalPauseTimer);
  if (owner) owner.devotionalPauseTimer = null;
}

function startDevotionalPauseTimer(owner) {
  clearDevotionalPauseTimer(owner);
  if (!owner || owner.reducedMotion || owner.devotionalPausePaused) return;
  owner.devotionalPauseTimer = window.setInterval(() => {
    if (!owner.devotionalPauseOpen || !DEVOTIONAL_PAUSE_SCREENS.has(owner.screen) || owner.devotionalPausePaused) return;
    const slides = getDevotionalPauseSlides(owner);
    if (owner.devotionalPauseIndex >= slides.length - 1) {
      owner.devotionalPausePaused = true;
      syncDevotionalPause(owner);
      return;
    }
    owner.devotionalPauseIndex += 1;
    syncDevotionalPause(owner);
  }, DEVOTIONAL_PAUSE_INTERVAL);
}

function syncDevotionalPause(owner) {
  const overlay = document.getElementById('devotional-pause');
  const launcher = document.getElementById('devotional-pause-launcher');
  const launcherButton = document.getElementById('open-devotional-pause');
  if (!overlay || !owner) return;
  const canOpen = DEVOTIONAL_PAUSE_SCREENS.has(owner.screen) && getDevotionalPauseSlides(owner).length > 0;
  if (!canOpen) {
    owner.devotionalPauseOpen = false;
    owner.devotionalPausePaused = false;
  }
  const visible = Boolean(owner.devotionalPauseOpen && canOpen);
  if (!visible) clearDevotionalPauseTimer(owner);
  overlay.hidden = !visible;
  overlay.setAttribute('aria-hidden', String(!visible));
  overlay.setAttribute('aria-label', owner.t('pauseTitle'));
  document.body.classList.toggle('devotional-pause-open', visible);
  syncDialogStack();
  if (launcher && launcherButton) {
    launcher.hidden = !canOpen || visible;
    launcher.setAttribute('aria-label', owner.t('pauseTitle'));
    launcherButton.setAttribute('aria-controls', 'devotional-pause');
    launcherButton.setAttribute('aria-expanded', String(visible));
    launcherButton.textContent = `✦  ${owner.t('devotionalPauseAction')}`;
    launcherButton.setAttribute('aria-label', owner.t('devotionalPauseAction'));
    launcherButton.title = owner.t('pauseIntro');
  }
  if (!visible) return;

  const slides = getDevotionalPauseSlides(owner);
  const index = Math.max(0, Math.min(slides.length - 1, Number(owner.devotionalPauseIndex) || 0));
  owner.devotionalPauseIndex = index;
  const slide = slides[index];
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  setText('devotional-pause-kicker', owner.t('pauseKicker'));
  setText('devotional-pause-title', owner.t('pauseTitle'));
  setText('devotional-pause-intro', owner.t('pauseIntro'));
  setText('devotional-pause-context', owner.screen === 'bonus-result' ? owner.t('pauseBonusContext') : owner.t('pauseResultContext'));
  setText('devotional-pause-progress', owner.t('pauseThemeProgress', { current: index + 1, total: slides.length, theme: slide.label }));
  setText('devotional-pause-theme', slide.label);
  setText('devotional-pause-verse-label', owner.t('pauseVerseTitle'));
  setText('devotional-pause-verse', slide.verse);
  setText('devotional-pause-reflection-label', owner.t('pauseReflectionTitle'));
  setText('devotional-pause-reflection', slide.reflection);
  setText('devotional-pause-hint', owner.devotionalPausePaused ? owner.t('pausePaused') : owner.t('pauseAutoHint'));
  const status = document.getElementById('devotional-pause-status');
  if (status && !owner.devotionalPauseStatus) status.textContent = '';
  if (status && owner.devotionalPauseStatus) {
    status.textContent = owner.devotionalPauseStatus;
    owner.devotionalPauseStatus = '';
  }
  const buttons = overlay.querySelectorAll('[data-devotional-action]');
  buttons.forEach((button) => {
    const action = button.dataset.devotionalAction;
    if (action === 'previous') {
      button.textContent = owner.t('pausePrevious');
      button.setAttribute('aria-label', owner.t('pausePrevious'));
      button.disabled = index === 0;
    } else if (action === 'next') {
      button.textContent = owner.t('pauseNext');
      button.setAttribute('aria-label', owner.t('pauseNext'));
      button.disabled = index >= slides.length - 1;
    } else if (action === 'toggle') {
      button.textContent = owner.devotionalPausePaused ? owner.t('pauseResume') : owner.t('pausePause');
      button.setAttribute('aria-label', owner.devotionalPausePaused ? owner.t('pauseResume') : owner.t('pausePause'));
      button.setAttribute('aria-pressed', String(owner.devotionalPausePaused));
    } else if (action === 'close') {
      button.textContent = button.classList.contains('devotional-pause__close') ? '×' : owner.t('pauseEnd');
      button.setAttribute('aria-label', owner.t('pauseClose'));
    }
  });
  const slideElement = document.getElementById('devotional-pause-slide');
  if (slideElement) {
    slideElement.classList.remove('devotional-pause__slide--changing');
    void slideElement.offsetWidth;
    slideElement.classList.add('devotional-pause__slide--changing');
    slideElement.setAttribute('aria-label', `${slide.label}. ${slide.verse} ${slide.reflection}`);
  }
  const languages = document.getElementById('devotional-pause-languages');
  if (languages) {
    languages.replaceChildren();
    languages.setAttribute('aria-label', owner.t('pauseLanguage'));
    LANGUAGES.forEach((language) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'devotional-pause__language';
      button.textContent = language.label;
      button.setAttribute('aria-label', `${owner.t('pauseLanguage')}: ${language.name}`);
      button.setAttribute('aria-pressed', String(language.code === owner.language));
      button.addEventListener('click', () => owner.setLanguage(language.code));
      languages.appendChild(button);
    });
  }
  if (owner.devotionalPauseNeedsFocus) {
    owner.devotionalPauseNeedsFocus = false;
    focusFirstDialogControl(overlay, '.devotional-pause__close');
  }
}

function openDevotionalPause(owner) {
  if (!owner || !DEVOTIONAL_PAUSE_SCREENS.has(owner.screen)) return;
  const slides = getDevotionalPauseSlides(owner);
  if (!slides.length) return;
  owner.devotionalPauseOpen = true;
  owner.devotionalPauseIndex = 0;
  owner.devotionalPausePaused = Boolean(owner.reducedMotion);
  owner.devotionalPauseStatus = owner.t('pauseAnnouncement', { theme: slides[0].label });
  owner.devotionalPauseReturnFocus = rememberDialogFocus();
  owner.devotionalPauseNeedsFocus = true;
  startDevotionalPauseTimer(owner);
  syncDevotionalPause(owner);
  announceDialog(owner, `${owner.t('pauseTitle')}. ${owner.t('pauseAnnouncement', { theme: slides[0].label })}`);
}

function closeDevotionalPause(owner) {
  if (!owner?.devotionalPauseOpen) return;
  owner.devotionalPauseOpen = false;
  owner.devotionalPausePaused = false;
  owner.devotionalPauseNeedsFocus = false;
  clearDevotionalPauseTimer(owner);
  syncDevotionalPause(owner);
  const returnFocus = owner.devotionalPauseReturnFocus;
  owner.devotionalPauseReturnFocus = null;
  announceDialog(owner, owner.t('pauseEnd'));
  restoreDialogFocus(returnFocus, '#open-devotional-pause');
}

function moveDevotionalPause(owner, direction) {
  if (!owner?.devotionalPauseOpen) return;
  const slides = getDevotionalPauseSlides(owner);
  const nextIndex = Math.max(0, Math.min(slides.length - 1, owner.devotionalPauseIndex + direction));
  if (nextIndex === owner.devotionalPauseIndex) return;
  owner.devotionalPauseIndex = nextIndex;
  owner.devotionalPauseStatus = owner.t('pauseAnnouncement', { theme: slides[nextIndex].label });
  startDevotionalPauseTimer(owner);
  syncDevotionalPause(owner);
}

function toggleDevotionalPause(owner) {
  if (!owner?.devotionalPauseOpen) return;
  owner.devotionalPausePaused = !owner.devotionalPausePaused;
  if (owner.devotionalPausePaused) clearDevotionalPauseTimer(owner);
  else startDevotionalPauseTimer(owner);
  syncDevotionalPause(owner);
  owner.announce?.(owner.devotionalPausePaused ? owner.t('pausePaused') : owner.t('pauseAutoHint'));
}

function ensureDevotionalPauseControls() {
  if (window.__sigoDevotionalPauseControlsBound) return;
  window.__sigoDevotionalPauseControlsBound = true;
  const overlay = document.getElementById('devotional-pause');
  document.getElementById('open-devotional-pause')?.addEventListener('click', () => window.sigoQuiz?.openDevotionalPause?.());
  overlay?.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-devotional-action]') : null;
    if (!(target instanceof HTMLElement)) {
      if (event.target === event.currentTarget) window.sigoQuiz?.closeDevotionalPause?.();
      return;
    }
    const action = target.dataset.devotionalAction;
    if (action === 'close') window.sigoQuiz?.closeDevotionalPause?.();
    if (action === 'previous') moveDevotionalPause(window.sigoQuiz, -1);
    if (action === 'next') moveDevotionalPause(window.sigoQuiz, 1);
    if (action === 'toggle') toggleDevotionalPause(window.sigoQuiz);
  });
  window.addEventListener('keydown', (event) => {
    const activeOwner = window.sigoQuiz;
    const currentOverlay = document.getElementById('devotional-pause');
    if (!currentOverlay || currentOverlay.hidden || !activeOwner?.devotionalPauseOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeDevotionalPause(activeOwner);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopImmediatePropagation();
      moveDevotionalPause(activeOwner, event.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if (event.key === ' ' && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleDevotionalPause(activeOwner);
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [...currentOverlay.querySelectorAll('button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }, true);
}

function formatThemeMapText(owner, key, values = {}) {
  let text = getThemeMapCopy(owner)[key] || key;
  Object.entries(values).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, String(value));
  });
  return text;
}

function getMainQuestionSet(owner) {
  return Array.isArray(owner?.questionSet) && owner.questionSet.length === questions.length ? owner.questionSet : questions;
}

function buildResultThemeStats(owner) {
  const stats = new Map();
  getMainQuestionSet(owner).forEach((question, index) => {
    const localizedQuestion = question[owner.language] || question.pt;
    const key = question.pt.category;
    const current = stats.get(key) || { key, label: localizedQuestion.category, correct: 0, total: 0, first: index };
    current.total += 1;
    if (owner.answerResults[index]) current.correct += 1;
    stats.set(key, current);
  });
  return [...stats.values()];
}

function getJourneyAnswerReviewRows(owner) {
  const selectedAnswers = Array.isArray(owner.selectedAnswers) ? owner.selectedAnswers : [];
  const answerResults = Array.isArray(owner.answerResults) ? owner.answerResults : [];
  return getMainQuestionSet(owner).map((question, index) => {
    const localized = question[owner.language] || question.pt;
    const selectedCandidate = selectedAnswers[index];
    const selectedIndex = Number.isInteger(selectedCandidate) ? selectedCandidate : null;
    const correct = typeof answerResults[index] === 'boolean'
      ? answerResults[index]
      : selectedIndex !== null && selectedIndex === question.correct;
    return {
      index,
      themeKey: question.pt.category,
      themeLabel: localized.category,
      question: localized.question,
      selectedIndex,
      selectedText: selectedIndex === null ? owner.t('answerReviewNotRecorded') : localized.options[selectedIndex] || owner.t('answerReviewNotRecorded'),
      correctText: localized.options[question.correct],
      correct
    };
  });
}

function announceAnswerReviewFilter(owner, shown) {
  const message = owner.t('answerReviewFilterAnnouncement', { shown });
  owner.announce?.(message);
  if (owner.a11yStatus) owner.a11yStatus.textContent = message;
}

function getFilteredJourneyAnswerReviewRows(owner, rows = getJourneyAnswerReviewRows(owner)) {
  const statusFilter = ['all', 'correct', 'incorrect'].includes(owner.answerReviewStatus) ? owner.answerReviewStatus : 'all';
  const themeFilter = owner.answerReviewTheme || 'all';
  return rows.filter((row) => {
    const statusMatches = statusFilter === 'all' || (statusFilter === 'correct' ? row.correct : !row.correct);
    const themeMatches = themeFilter === 'all' || row.themeKey === themeFilter;
    return statusMatches && themeMatches;
  });
}

function renderJourneyAnswerReviewContent(owner, section) {
  const rows = getJourneyAnswerReviewRows(owner);
  const statusFilter = ['all', 'correct', 'incorrect'].includes(owner.answerReviewStatus) ? owner.answerReviewStatus : 'all';
  const themeFilter = owner.answerReviewTheme || 'all';
  const filteredRows = getFilteredJourneyAnswerReviewRows(owner, rows);
  section.replaceChildren();
  section.className = 'journey-answer-review';
  section.setAttribute('aria-labelledby', 'journey-answer-review-title');
  section.setAttribute('aria-describedby', 'journey-answer-review-intro journey-answer-review-count');

  const title = document.createElement('h2');
  title.id = 'journey-answer-review-title';
  title.className = 'journey-answer-review__title';
  title.textContent = owner.t('answerReviewTitle');
  const intro = document.createElement('p');
  intro.id = 'journey-answer-review-intro';
  intro.className = 'journey-answer-review__intro';
  intro.textContent = owner.t('answerReviewIntro');

  const filters = document.createElement('fieldset');
  filters.className = 'journey-answer-review__filters';
  const legend = document.createElement('legend');
  legend.className = 'journey-answer-review__legend';
  legend.textContent = owner.t('answerReviewFilterLegend');
  const statusFilters = document.createElement('div');
  statusFilters.className = 'journey-answer-review__status-filters';
  [['all', owner.t('answerReviewAll')], ['correct', owner.t('answerReviewCorrect')], ['incorrect', owner.t('answerReviewIncorrect')]].forEach(([value, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'journey-answer-review__filter';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(statusFilter === value));
    button.addEventListener('click', () => {
      owner.answerReviewStatus = value;
      renderJourneyAnswerReviewContent(owner, section);
      announceAnswerReviewFilter(owner, getFilteredJourneyAnswerReviewRows(owner).length);
    });
    statusFilters.appendChild(button);
  });
  const themeSelect = document.createElement('select');
  themeSelect.className = 'journey-answer-review__theme';
  themeSelect.setAttribute('aria-label', owner.t('answerReviewTheme'));
  const allThemes = document.createElement('option');
  allThemes.value = 'all';
  allThemes.textContent = owner.t('answerReviewAllThemes');
  themeSelect.appendChild(allThemes);
  const themes = [];
  rows.forEach((row) => {
    if (!themes.some((theme) => theme.key === row.themeKey)) themes.push({ key: row.themeKey, label: row.themeLabel });
  });
  themes.forEach((theme) => {
    const option = document.createElement('option');
    option.value = theme.key;
    option.textContent = theme.label;
    themeSelect.appendChild(option);
  });
  themeSelect.value = themes.some((theme) => theme.key === themeFilter) ? themeFilter : 'all';
  themeSelect.addEventListener('change', (event) => {
    owner.answerReviewTheme = event.target.value;
    renderJourneyAnswerReviewContent(owner, section);
    announceAnswerReviewFilter(owner, getFilteredJourneyAnswerReviewRows(owner).length);
  });
  filters.append(legend, statusFilters, themeSelect);

  const count = document.createElement('p');
  count.id = 'journey-answer-review-count';
  count.className = 'journey-answer-review__count';
  count.setAttribute('role', 'status');
  count.setAttribute('aria-live', 'polite');
  count.textContent = owner.t('answerReviewShown', { shown: filteredRows.length, total: rows.length });

  const list = document.createElement('ol');
  list.className = 'journey-answer-review__list';
  list.setAttribute('aria-label', owner.t('answerReviewTitle'));
  if (!filteredRows.length) {
    const empty = document.createElement('li');
    empty.className = 'journey-answer-review__empty';
    empty.textContent = owner.t('answerReviewEmpty');
    list.appendChild(empty);
  } else {
    filteredRows.forEach((row) => {
      const item = document.createElement('li');
      item.className = `journey-answer-review__item journey-answer-review__item--${row.correct ? 'correct' : 'incorrect'}`;
      const head = document.createElement('div');
      head.className = 'journey-answer-review__item-head';
      const theme = document.createElement('p');
      theme.className = 'journey-answer-review__theme-label';
      theme.textContent = `${row.index + 1}. ${row.themeLabel}`;
      const status = document.createElement('span');
      status.className = 'journey-answer-review__status';
      status.textContent = row.correct ? owner.t('answerReviewCorrectStatus') : owner.t('answerReviewIncorrectStatus');
      head.append(theme, status);
      const question = document.createElement('h3');
      question.className = 'journey-answer-review__question';
      question.textContent = row.question;
      const details = document.createElement('dl');
      details.className = 'journey-answer-review__details';
      [[owner.t('answerReviewChoice'), row.selectedText], [owner.t('answerReviewCorrectAnswer'), row.correctText]].forEach(([label, value]) => {
        const term = document.createElement('dt');
        term.textContent = label;
        const description = document.createElement('dd');
        description.textContent = value;
        details.append(term, description);
      });
      item.append(head, question, details);
      list.appendChild(item);
    });
  }
  section.append(title, intro, filters, count, list);
}

function createJourneyAnswerReview(owner) {
  const section = document.createElement('section');
  renderJourneyAnswerReviewContent(owner, section);
  return section;
}

function syncJourneyAnswerReview(owner) {
  const host = document.getElementById('journey-answer-review-host');
  if (!host) return;
  host.replaceChildren();
  const visible = owner.usesResultActionsOverlay && ['result', 'review-result'].includes(owner.screen);
  host.hidden = !visible;
  if (!visible) return;
  if (owner.screen === 'result') host.appendChild(createJourneyAnswerReview(owner));
  host.appendChild(createMarkedQuestionsSection(owner, {
    themeKey: owner.screen === 'review-result' ? owner.reviewThemeKey : null,
    idPrefix: owner.screen === 'review-result' ? 'journey-marked-review-questions' : 'journey-marked-questions'
  }));
}

function getWeakestTheme(stats = []) {
  return [...stats]
    .filter((theme) => theme && Number(theme.total) > 0)
    .sort((a, b) => {
      const aRate = Number(a.correct) / Number(a.total);
      const bRate = Number(b.correct) / Number(b.total);
      return aRate - bRate || Number(a.correct) - Number(b.correct) || Number(a.first) - Number(b.first);
    })[0] || null;
}

function getThemeMapAnnouncement(owner) {
  const copy = getThemeMapCopy(owner);
  const rows = owner.getResultThemeStats().map((theme) => `${formatThemeMapText(owner, 'progressLabel', theme)} · ${owner.t('markerThemeCount', { count: getThemeMarkedCount(owner, theme.key) })}`);
  return `${copy.title}. ${copy.intro} ${rows.join('. ')}. ${owner.t('markerCount', { count: getQuestionMarkerCount(owner) })}`;
}

async function copyResultText(text) {
  if (typeof navigator.clipboard?.writeText !== 'function') return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function getEssentialResultText(owner) {
  if (!owner) return '';
  const shareText = typeof owner.t === 'function'
    ? owner.t('shareText', { score: owner.score, total: questions.length })
    : '';
  const synthesis = typeof owner.getResultSynthesis === 'function' ? owner.getResultSynthesis() : '';
  const verse = typeof owner.getResultVerse === 'function' ? owner.getResultVerse() : '';
  return [shareText, synthesis, verse]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join('\n\n');
}

function clearManualCopyAlternative() {
  document.querySelectorAll('[data-manual-result-copy]').forEach((element) => element.remove());
}

function clearShareRecoveryActions() {
  document.querySelectorAll('[data-share-recovery]').forEach((element) => element.remove());
}

function showManualCopyAlternative(owner, text, { labelText = '', helpText = '' } = {}) {
  clearManualCopyAlternative();
  const host = owner.usesResultActionsOverlay
    ? document.getElementById('result-actions')
    : document.getElementById('fallback-result-actions');
  if (!host) return;

  const copy = getCapabilityCopy(owner);
  const wrapper = document.createElement('div');
  wrapper.className = `result-actions__copy-wrap${owner.usesResultActionsOverlay ? '' : ' fallback-result-copy-wrap'}`;
  wrapper.dataset.manualResultCopy = 'true';
  const label = document.createElement('label');
  label.className = 'result-actions__copy-label';
  label.htmlFor = 'manual-result-copy';
  label.textContent = labelText || copy.copyLabel;
  const field = document.createElement('textarea');
  field.id = 'manual-result-copy';
  field.className = 'result-actions__copy';
  field.readOnly = true;
  field.rows = 3;
  field.value = text;
  field.setAttribute('aria-describedby', 'manual-result-copy-help');
  const help = document.createElement('span');
  help.id = 'manual-result-copy-help';
  help.className = 'result-actions__copy-help';
  help.textContent = helpText || copy.copyHelp;
  wrapper.append(label, field, help);
  host.appendChild(wrapper);
  window.requestAnimationFrame(() => {
    field.focus({ preventScroll: true });
    field.select();
  });
}

function showShareRecoveryActions(owner, { copyText = '', retry = null, continueAction = null, message = '', kind = 'share' } = {}) {
  const host = owner?.usesResultActionsOverlay
    ? document.getElementById('result-actions')
    : document.getElementById('fallback-result-actions');
  if (!host) return;
  clearShareRecoveryActions();
  const copy = getCapabilityCopy(owner);
  const isEmpty = kind === 'empty';
  const recovery = document.createElement('section');
  const titleId = owner.usesResultActionsOverlay ? 'result-actions-recovery-title' : 'fallback-result-recovery-title';
  const messageId = owner.usesResultActionsOverlay ? 'result-actions-recovery-message' : 'fallback-result-recovery-message';
  recovery.className = `result-actions__recovery${isEmpty ? ' result-actions__recovery--empty' : ''}${owner.usesResultActionsOverlay ? '' : ' fallback-result-recovery'}`;
  recovery.dataset.shareRecovery = 'true';
  recovery.setAttribute('role', 'group');
  recovery.setAttribute('aria-labelledby', titleId);
  recovery.setAttribute('aria-describedby', messageId);

  const title = document.createElement('h3');
  title.id = titleId;
  title.className = 'result-actions__recovery-title';
  title.textContent = isEmpty ? copy.resultEmptyTitle : copy.shareFailedTitle;
  const explanation = document.createElement('p');
  explanation.id = messageId;
  explanation.className = 'result-actions__recovery-message';
  explanation.textContent = message || (isEmpty ? copy.resultEmpty : copy.shareFailed);
  const actions = document.createElement('div');
  actions.className = 'result-actions__recovery-buttons';

  if (copyText) {
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'result-actions__recovery-button';
    copyButton.textContent = copy.copyEssential;
    copyButton.addEventListener('click', async () => {
      copyButton.disabled = true;
      const copied = await copyResultText(copyText);
      copyButton.disabled = false;
      owner.announceResultAction?.(copied ? copy.copied : copy.copyUnavailable, copied
        ? { keepRecovery: true }
        : { copyText, keepRecovery: true });
    });
    actions.appendChild(copyButton);
  }

  if (typeof retry === 'function') {
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'result-actions__recovery-button';
    retryButton.textContent = copy.tryAgain;
    retryButton.addEventListener('click', () => {
      clearShareRecoveryActions();
      clearManualCopyAlternative();
      retry();
    });
    actions.appendChild(retryButton);
  }

  const continueButton = document.createElement('button');
  continueButton.type = 'button';
  continueButton.className = 'result-actions__recovery-button result-actions__recovery-button--secondary';
  continueButton.textContent = copy.continueJourney;
  continueButton.addEventListener('click', () => {
    clearShareRecoveryActions();
    clearManualCopyAlternative();
    if (typeof continueAction === 'function') continueAction();
    else owner.announceResultAction?.(copy.continueNotice);
  });
  actions.appendChild(continueButton);
  recovery.append(title, explanation, actions);
  host.appendChild(recovery);
}

function retryResultCardAction(owner, action) {
  if (!owner?.resultCardCanvas && typeof owner?.createResultCardCanvas === 'function') {
    try {
      owner.resultCardCanvas = owner.createResultCardCanvas();
      owner.cardReady = Boolean(owner.resultCardCanvas);
    } catch {
      owner.resultCardCanvas = null;
      owner.cardReady = false;
    }
  }
  return action === 'download' ? owner?.downloadResultCard?.() : owner?.shareResultCard?.();
}

function encodeJourneyShareToken(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decodeJourneyShareToken(token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]+$/.test(token) || token.length > JOURNEY_SHARE_MAX_TOKEN_LENGTH) return null;
  try {
    const padded = token.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (token.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function normalizeJourneySharePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload.f !== JOURNEY_SHARE_FORMAT || Number(payload.v) !== JOURNEY_SHARE_VERSION || !UI[payload.l]) return null;
  const score = Number(payload.s);
  if (!Number.isInteger(score) || score < 0 || score > questions.length) return null;
  if (typeof payload.r !== 'string' || !payload.r.trim() || payload.r.length > 120) return null;
  if (!Array.isArray(payload.t) || payload.t.length < 1 || payload.t.length > 10) return null;
  const themes = payload.t.map((theme) => {
    if (!theme || typeof theme !== 'object' || Array.isArray(theme)) return null;
    const correct = Number(theme.c);
    const total = Number(theme.n);
    if (typeof theme.k !== 'string' || theme.k.length > 100 || typeof theme.l !== 'string' || !theme.l.trim() || theme.l.length > 140) return null;
    if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || correct < 0 || correct > total) return null;
    return { key: theme.k, label: theme.l, correct, total };
  });
  if (themes.some((theme) => !theme)) return null;
  if (typeof payload.y !== 'string' || !payload.y.trim() || payload.y.length > 1600) return null;
  if (typeof payload.e !== 'string' || !payload.e.trim() || payload.e.length > 900) return null;
  return { version: JOURNEY_SHARE_VERSION, language: payload.l, score, rank: payload.r, themes, synthesis: payload.y, verse: payload.e };
}

function readJourneyShareFromLocation() {
  const match = window.location.hash.match(/^#journey=([A-Za-z0-9_-]+)$/);
  if (!match) return null;
  return normalizeJourneySharePayload(decodeJourneyShareToken(match[1]));
}

function clearJourneyShareLocation() {
  const url = new URL(window.location.href);
  if (!url.hash.startsWith('#journey=')) return;
  url.hash = '';
  window.history.replaceState({}, document.title, url.toString());
}

function buildJourneySharePayload(owner) {
  const themes = owner.getResultThemeStats().map((theme) => ({
    k: String(theme.key || '').slice(0, 100),
    l: String(theme.label || theme.key || '').slice(0, 140),
    c: Math.max(0, Math.min(Number(theme.total) || 1, Math.floor(Number(theme.correct) || 0))),
    n: Math.max(1, Math.min(questions.length, Math.floor(Number(theme.total) || 1)))
  }));
  return {
    v: JOURNEY_SHARE_VERSION,
    f: JOURNEY_SHARE_FORMAT,
    l: UI[owner.language] ? owner.language : 'pt',
    s: Math.max(0, Math.min(questions.length, Math.floor(Number(owner.score) || 0))),
    r: String(owner.getRank()).slice(0, 120),
    t: themes.slice(0, 10),
    y: String(owner.getResultSynthesis() || '').slice(0, 1600),
    e: String(owner.getResultVerse() || '').slice(0, 900)
  };
}

function buildJourneyShareUrl(owner) {
  if (!owner || owner.screen !== 'result') return '';
  const payload = buildJourneySharePayload(owner);
  const token = encodeJourneyShareToken(payload);
  if (token.length > JOURNEY_SHARE_MAX_TOKEN_LENGTH) return '';
  const url = new URL(window.location.href);
  url.hash = `journey=${token}`;
  return url.toString();
}

function syncJourneySharePreview(owner) {
  const preview = document.getElementById('journey-share-preview');
  const payload = owner?.sharedJourneyPreview;
  if (!preview || !owner) return;
  const visible = Boolean(owner.sharePreviewOpen && payload);
  setDialogVisibility(preview, visible);
  if (!visible) return;
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  setText('journey-share-preview-kicker', owner.t('journeyShareLabel'));
  setText('journey-share-preview-title', owner.t('journeyShareTitle'));
  setText('journey-share-preview-intro', owner.t('journeyShareIntro'));
  setText('journey-share-preview-language-label', owner.t('journeyShareLanguage'));
  setText('journey-share-preview-language', getLanguage(payload.language).name);
  setText('journey-share-preview-score-label', owner.t('journeyShareScore'));
  setText('journey-share-preview-score', `${payload.score} / ${questions.length}`);
  setText('journey-share-preview-rank-label', owner.t('journeyShareRank'));
  setText('journey-share-preview-rank', payload.rank);
  setText('journey-share-preview-themes-title', owner.t('journeyShareThemes'));
  setText('journey-share-preview-synthesis-title', owner.t('journeyShareSynthesis'));
  setText('journey-share-preview-synthesis', payload.synthesis);
  setText('journey-share-preview-verse-title', owner.t('journeyShareVerse'));
  setText('journey-share-preview-verse', payload.verse);
  setText('journey-share-preview-safe-note', owner.t('journeyShareSafeNote'));
  const close = document.getElementById('close-journey-share-preview');
  const back = document.getElementById('journey-share-preview-back');
  const start = document.getElementById('journey-share-preview-new');
  if (close) close.setAttribute('aria-label', owner.t('journeyShareClose'));
  if (back) back.textContent = owner.t('journeyShareBack');
  if (start) start.textContent = owner.t('journeyShareNew');
  const themes = document.getElementById('journey-share-preview-themes');
  if (themes) {
    themes.replaceChildren();
    payload.themes.forEach((theme) => {
      const item = document.createElement('li');
      item.className = 'journey-share-preview__theme';
      const label = document.createElement('span');
      label.textContent = theme.label;
      const score = document.createElement('strong');
      score.textContent = `${theme.correct}/${theme.total}`;
      item.append(label, score);
      themes.appendChild(item);
    });
  }
}

function openJourneySharePreview(owner, payload) {
  const normalized = normalizeJourneySharePayload(payload);
  if (!owner || !normalized) return false;
  owner.sharedJourneyPreview = normalized;
  owner.sharePreviewOpen = true;
  owner.language = normalized.language;
  owner.updateDocumentLanguage?.();
  owner.sharePreviewReturnFocus = rememberDialogFocus();
  syncJourneySharePreview(owner);
  announceDialog(owner, `${owner.t('journeyShareTitle')}. ${owner.t('journeyShareOpened')}`);
  focusFirstDialogControl(document.querySelector('#journey-share-preview [role="dialog"]'), '#close-journey-share-preview');
  return true;
}

function closeJourneySharePreview(owner, { startNew = false } = {}) {
  if (!owner) return;
  const returnFocus = owner.sharePreviewReturnFocus;
  owner.sharePreviewReturnFocus = null;
  owner.sharePreviewOpen = false;
  owner.sharedJourneyPreview = null;
  clearJourneyShareLocation();
  syncJourneySharePreview(owner);
  if (startNew) {
    owner.startNewJourney?.();
    return;
  }
  owner.isViewingSavedJourney = false;
  owner.savedJourney = null;
  owner.screen = 'start';
  if (typeof owner.renderScreen === 'function') owner.renderScreen('start');
  else owner.render?.();
  announceDialog(owner, owner.t('journeyShareBack'));
  restoreDialogFocus(returnFocus, '#a11y-controls [data-a11y-key="start"], #fallback-journey .fallback-button');
}

function ensureJourneyShareControls() {
  if (window.__sigoJourneyShareControlsBound) return;
  window.__sigoJourneyShareControlsBound = true;
  document.getElementById('share-journey-link')?.addEventListener('click', () => window.sigoQuiz?.shareJourneyLink?.());
  document.getElementById('close-journey-share-preview')?.addEventListener('click', () => closeJourneySharePreview(window.sigoQuiz));
  document.getElementById('journey-share-preview-back')?.addEventListener('click', () => closeJourneySharePreview(window.sigoQuiz));
  document.getElementById('journey-share-preview-new')?.addEventListener('click', () => closeJourneySharePreview(window.sigoQuiz, { startNew: true }));
  window.addEventListener('keydown', (event) => {
    const owner = window.sigoQuiz;
    if (event.key === 'Escape' && owner?.sharePreviewOpen) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeJourneySharePreview(owner);
    }
  }, true);
}

async function shareJourneyLink(owner) {
  if (!owner || owner.screen !== 'result') return false;
  const capabilityCopy = getCapabilityCopy(owner);
  const essentialText = getEssentialResultText(owner);
  const shareUrl = buildJourneyShareUrl(owner);
  if (!shareUrl) {
    owner.announceResultAction?.(capabilityCopy.resultEmpty, {
      copyText: essentialText,
      recovery: { copyText: essentialText, kind: 'empty', retry: () => shareJourneyLink(owner) }
    });
    return false;
  }
  const shareText = owner.t('journeyShareText', { score: owner.score, total: questions.length, rank: owner.getRank() });
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title: owner.t('journeyShareTitle'), text: shareText, url: shareUrl });
      owner.announceResultAction?.(owner.t('journeyShareReady'));
      return true;
    }
  } catch (error) {
    if (error?.name === 'AbortError') return false;
  }
  const copied = await copyResultText(shareUrl);
  owner.announceResultAction?.(copied ? owner.t('journeyShareCopied') : owner.t('journeyShareUnavailable'), {
    copyText: copied ? '' : shareUrl,
    labelText: owner.t('journeyShareManualLabel'),
    helpText: owner.t('journeyShareManualHelp'),
    recovery: { copyText: shareUrl, retry: () => shareJourneyLink(owner) }
  });
  return copied;
}

function readAudioPreference() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(AUDIO_PREFERENCE_STORAGE_KEY) || '{}');
    const volume = clampAudioVolume(saved.volume);
    const lastAudibleVolume = clampAudioVolume(saved.lastAudibleVolume, DEFAULT_AUDIO_VOLUME);
    const muted = Boolean(saved.muted) || volume === 0;
    return { volume: muted ? 0 : volume, lastAudibleVolume: lastAudibleVolume || DEFAULT_AUDIO_VOLUME, muted };
  } catch {
    return { volume: DEFAULT_AUDIO_VOLUME, lastAudibleVolume: DEFAULT_AUDIO_VOLUME, muted: false };
  }
}

function writeAudioPreference(preference) {
  try {
    window.localStorage.setItem(AUDIO_PREFERENCE_STORAGE_KEY, JSON.stringify({
      volume: clampAudioVolume(preference.volume, 0),
      lastAudibleVolume: clampAudioVolume(preference.lastAudibleVolume, DEFAULT_AUDIO_VOLUME),
      muted: Boolean(preference.muted)
    }));
  } catch {
    // Audio remains usable when storage is unavailable, such as in private browsing.
  }
}

function createAudioCue(path, volume) {
  const audio = new Audio(path);
  audio.volume = clampAudioVolume(volume, 0);
  return audio;
}

function syncAudioMuteState(owner) {
  [
    owner.bgMusic,
    owner.correctSound,
    owner.incorrectSound,
    owner.arrivalSound,
    owner.startSound,
    owner.continueSound,
    owner.pauseSound,
    owner.languageSound,
    owner.favoriteSound
  ]
    .filter(Boolean)
    .forEach((audio) => {
      audio.muted = owner.isMuted;
    });
}

function readFavoriteVerses() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => item && typeof item.id === 'string' && ['question', 'bonus', 'result'].includes(item.kind));
  } catch {
    return [];
  }
}

function writeFavoriteVerses(favorites) {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // A private browsing context may deny storage; the current interaction still remains usable.
  }
}

function getFavoriteRoundLabel(owner, round, kind) {
  if (round === 'bonus' || kind === 'bonus') return owner.t('favoriteRoundBonus');
  if (round === 'review') return owner.t('favoriteRoundReview');
  if (round === 'result' || kind === 'result') return owner.t('favoriteRoundResult');
  return owner.t('favoriteRoundMain');
}

function getJourneyProgressValues(owner) {
  const current = Math.min(owner.currentQuestionIndex + 1, questions.length);
  const isFeedback = owner.screen === 'feedback'
    || (owner.screen === 'paused' && owner.pausedScreen === 'feedback');
  const completed = isFeedback
    ? current
    : Math.min(owner.currentQuestionIndex, questions.length);
  return { current, completed, total: questions.length, score: owner.score };
}

function getJourneyProgressSummary(owner) {
  return owner.t('progressSummary', getJourneyProgressValues(owner));
}

function getJourneyProgressAnnouncement(owner) {
  return `${owner.t('progressTitle')}. ${getJourneyProgressSummary(owner)} ${owner.t('progressEncouragement')}`;
}

function getFavoriteDisplay(owner, favorite) {
  if (favorite.kind === 'bonus') {
    const question = bonusQuestions[favorite.bonusQuestionIndex];
    const localized = question?.[owner.language] || question?.pt;
    if (localized) {
      return {
        title: localized.category,
        verse: localized.verse,
        theme: localized.category,
        round: getFavoriteRoundLabel(owner, 'bonus', favorite.kind)
      };
    }
  }
  if (favorite.kind === 'question') {
    const question = getMainQuestionSet(owner)[favorite.questionIndex];
    const localized = question?.[owner.language] || question?.pt;
    if (localized) {
      return {
        title: localized.category,
        verse: localized.verse,
        theme: localized.category,
        round: getFavoriteRoundLabel(owner, favorite.round, favorite.kind)
      };
    }
  }
  const resultCopy = RESULT_COPY[owner.language] || RESULT_COPY.pt;
  const resultVerse = resultCopy[favorite.band]?.verse;
  return {
    title: owner.t('carryVerseTitle'),
    verse: resultVerse || favorite.verse || '',
    theme: owner.t('favoriteThemeJourney'),
    round: getFavoriteRoundLabel(owner, 'result', favorite.kind)
  };
}

function renderFavoriteCollection(owner) {
  const panel = document.getElementById('verse-collection-panel');
  const title = document.getElementById('verse-collection-title');
  const intro = document.getElementById('verse-collection-intro');
  const list = document.getElementById('verse-collection-list');
  if (!panel || !title || !intro || !list) return;

  const favorites = readFavoriteVerses();
  title.textContent = `${owner.t('favoritesTitle')} (${favorites.length})`;
  intro.textContent = owner.t('favoritesIntro');
  list.replaceChildren();

  if (!favorites.length) {
    const empty = document.createElement('p');
    empty.className = 'verse-collection__empty';
    empty.textContent = owner.t('favoritesEmpty');
    list.appendChild(empty);
    return;
  }

  favorites.forEach((favorite) => {
    const display = getFavoriteDisplay(owner, favorite);
    const item = document.createElement('article');
    item.className = 'verse-collection__item';
    const label = document.createElement('p');
    label.className = 'verse-collection__label';
    label.textContent = display.title;
    const context = document.createElement('p');
    context.className = 'verse-collection__context';
    context.textContent = `${owner.t('favoriteTheme')}: ${display.theme} · ${owner.t('favoriteRound')}: ${display.round}`;
    const verse = document.createElement('blockquote');
    verse.className = 'verse-collection__verse';
    verse.textContent = display.verse;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'verse-collection__remove';
    remove.dataset.favoriteId = favorite.id;
    remove.textContent = owner.t('removeFavorite');
    remove.setAttribute('aria-label', `${owner.t('removeFavorite')}: ${display.verse}`);
    item.append(label, context, verse, remove);
    list.appendChild(item);
  });
}

function announceVerseAction(owner, message) {
  const status = document.getElementById('verse-action-status');
  if (status) status.textContent = message;
  if (owner.a11yStatus) owner.a11yStatus.textContent = message;
  owner.announce?.(message);
}

function syncVerseTools(owner) {
  const tools = document.getElementById('verse-tools');
  const favoriteButton = document.getElementById('verse-favorite');
  const collectionButton = document.getElementById('open-verse-collection');
  if (!tools || !favoriteButton || !collectionButton) return;

  const favorites = readFavoriteVerses();
  const current = owner.getCurrentVerseInfo?.();
  const saved = current ? favorites.some((favorite) => favorite.id === current.id) : false;
  const visible = Boolean(current) || favorites.length > 0;
  tools.hidden = !visible;
  tools.setAttribute('aria-label', owner.t('favorites'));
  const collectionPanel = document.getElementById('verse-collection-panel');
  collectionPanel?.setAttribute('aria-label', owner.t('favoritesTitle'));
  if (collectionPanel) {
    collectionPanel.setAttribute('aria-hidden', String(collectionPanel.hidden));
    collectionButton.setAttribute('aria-controls', 'verse-collection-panel');
    collectionButton.setAttribute('aria-expanded', String(!collectionPanel.hidden));
  }
  document.getElementById('close-verse-collection')?.setAttribute('aria-label', owner.t('closeCollection'));
  favoriteButton.hidden = !current;
  favoriteButton.setAttribute('aria-pressed', String(saved));
  const favoriteActionLabel = saved
    ? owner.t('removeFavorite')
    : current?.kind === 'bonus' && owner.screen === 'bonus-result'
      ? owner.t('bonusSaveVerse')
      : owner.t('favoriteVerse');
  favoriteButton.textContent = `${saved ? '★' : '☆'}  ${favoriteActionLabel}`;
  favoriteButton.setAttribute('aria-label', favoriteActionLabel);
  collectionButton.textContent = `▣  ${owner.t('favorites')} (${favorites.length})`;
  collectionButton.setAttribute('aria-label', `${owner.t('favorites')} (${favorites.length})`);

  const panel = document.getElementById('verse-collection-panel');
  if (panel && !panel.hidden) renderFavoriteCollection(owner);
}

function toggleVerseFavorite(owner) {
  const current = owner.getCurrentVerseInfo?.();
  if (!current) return;
  const favorites = readFavoriteVerses();
  const index = favorites.findIndex((favorite) => favorite.id === current.id);
  let message;
  if (index >= 0) {
    favorites.splice(index, 1);
    message = current.kind === 'bonus' ? owner.t('bonusVerseRemoved') : owner.t('favoriteRemoved');
  } else {
    favorites.unshift({ ...current, savedAt: Date.now() });
    owner.playSound?.(owner.favoriteSound);
    message = current.kind === 'bonus' ? owner.t('bonusVerseSaved') : owner.t('favoriteSaved');
  }
  writeFavoriteVerses(favorites);
  syncVerseTools(owner);
  const panel = document.getElementById('verse-collection-panel');
  if (panel && !panel.hidden) renderFavoriteCollection(owner);
  owner.renderAccessibility?.();
  announceVerseAction(owner, message);
}

function removeFavorite(owner, id) {
  const favorites = readFavoriteVerses();
  const next = favorites.filter((favorite) => favorite.id !== id);
  if (next.length === favorites.length) return;
  writeFavoriteVerses(next);
  syncVerseTools(owner);
  renderFavoriteCollection(owner);
  owner.renderAccessibility?.();
  announceVerseAction(owner, owner.t('favoriteRemoved'));
}

function openFavorites(owner) {
  const panel = document.getElementById('verse-collection-panel');
  if (!panel) return;
  owner.collectionReturnFocus = rememberDialogFocus();
  renderFavoriteCollection(owner);
  setDialogVisibility(panel, true);
  focusFirstDialogControl(panel.querySelector('[role="dialog"]'), '#close-verse-collection');
  announceDialog(owner, `${owner.t('favoritesTitle')}. ${owner.t('favoritesIntro')}`);
}

function closeFavorites(owner) {
  const panel = document.getElementById('verse-collection-panel');
  if (!panel || panel.hidden) return;
  const returnFocus = owner.collectionReturnFocus;
  owner.collectionReturnFocus = null;
  setDialogVisibility(panel, false);
  announceDialog(owner, owner.t('closeCollection'));
  restoreDialogFocus(returnFocus, '#open-verse-collection');
}

function ensureFavoriteControls() {
  if (window.__sigoFavoriteControlsBound) return;
  window.__sigoFavoriteControlsBound = true;
  document.getElementById('verse-favorite')?.addEventListener('click', () => window.sigoQuiz?.toggleCurrentVerseFavorite?.());
  document.getElementById('open-verse-collection')?.addEventListener('click', () => window.sigoQuiz?.openFavorites?.());
  document.getElementById('close-verse-collection')?.addEventListener('click', () => window.sigoQuiz?.closeFavorites?.());
  document.getElementById('verse-collection-panel')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) window.sigoQuiz?.closeFavorites?.();
    const removeButton = event.target instanceof Element ? event.target.closest('[data-favorite-id]') : null;
    if (removeButton instanceof HTMLElement) window.sigoQuiz?.removeFavorite?.(removeButton.dataset.favoriteId);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') window.sigoQuiz?.closeFavorites?.();
  });
}

function renderJourneyComparison(owner, earlier, later, rows) {
  const comparison = document.getElementById('journey-comparison');
  const title = document.getElementById('journey-comparison-title');
  const intro = document.getElementById('journey-comparison-intro');
  const summary = document.getElementById('journey-comparison-summary');
  const meta = document.getElementById('journey-comparison-meta');
  const tableHost = document.getElementById('journey-comparison-table');
  const back = document.getElementById('back-to-journey-history');
  if (!comparison || !title || !intro || !summary || !meta || !tableHost) return;

  title.textContent = owner.t('historyCompareTitle');
  intro.textContent = owner.t('historyCompareIntro');
  back && (back.textContent = owner.t('historyCompareBack'));
  meta.replaceChildren();
  tableHost.replaceChildren();

  const journeys = [
    { record: earlier, label: owner.t('historyCompareEarlier') },
    { record: later, label: owner.t('historyCompareLater') }
  ];
  journeys.forEach(({ record, label }) => {
    const card = document.createElement('article');
    card.className = 'journey-comparison__journey';
    const heading = document.createElement('h3');
    heading.className = 'journey-comparison__journey-title';
    heading.textContent = label;
    const date = document.createElement('time');
    date.className = 'journey-comparison__date';
    date.dateTime = record.completedAt;
    date.textContent = formatJourneyDate(owner, record.completedAt);
    const details = document.createElement('dl');
    details.className = 'journey-comparison__details';
    [[owner.t('historyCompareScore'), `${record.score} / ${questions.length}`], [owner.t('historyCompareRank'), getJourneyRankForScore(owner, record.score)], [owner.t('historyCompareLanguage'), getSavedJourneyLanguageName(record)]].forEach(([term, value]) => {
      const termElement = document.createElement('dt');
      termElement.textContent = term;
      const valueElement = document.createElement('dd');
      valueElement.textContent = value;
      details.append(termElement, valueElement);
    });
    card.append(heading, date, details);
    meta.appendChild(card);
  });

  const scoreDelta = later.score - earlier.score;
  const scoreCopy = scoreDelta > 0
    ? owner.t('historyCompareUp', { delta: scoreDelta })
    : scoreDelta < 0
      ? owner.t('historyCompareDown', { delta: formatSignedJourneyDelta(scoreDelta) })
      : owner.t('historyCompareSame', { score: later.score });
  const changed = rows.filter((row) => row.delta !== 0).length;
  summary.textContent = `${scoreCopy} ${owner.t('historyCompareThemes', { changed, steady: rows.length - changed })} ${owner.t('historyCompareEncouragement')}`;

  const table = document.createElement('table');
  table.className = 'journey-comparison__table';
  const caption = document.createElement('caption');
  caption.textContent = owner.t('historyCompareEvolution');
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  [owner.t('historyCompareTheme'), owner.t('historyCompareBefore'), owner.t('historyCompareAfter'), owner.t('historyCompareChange')].forEach((label) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = label;
    headRow.appendChild(cell);
  });
  head.appendChild(headRow);
  const body = document.createElement('tbody');
  rows.forEach((row) => {
    const tableRow = document.createElement('tr');
    const theme = document.createElement('th');
    theme.scope = 'row';
    theme.textContent = row.label;
    const before = document.createElement('td');
    before.textContent = `${row.beforeCorrect} / ${row.beforeTotal}`;
    const after = document.createElement('td');
    after.textContent = `${row.afterCorrect} / ${row.afterTotal}`;
    const change = document.createElement('td');
    change.className = row.delta > 0 ? 'journey-comparison__change--up' : row.delta < 0 ? 'journey-comparison__change--down' : 'journey-comparison__change--same';
    change.textContent = formatSignedJourneyDelta(row.delta);
    change.setAttribute('aria-label', `${owner.t('historyCompareChange')}: ${formatSignedJourneyDelta(row.delta)}`);
    tableRow.append(theme, before, after, change);
    body.appendChild(tableRow);
  });
  table.append(caption, head, body);
  tableHost.appendChild(table);
  comparison.hidden = false;
}

function renderJourneyHistoryTransfer(owner) {
  const transfer = document.getElementById('journey-history-transfer');
  if (!transfer) return;
  const hidden = Boolean(owner.historyCompareMode || owner.historyComparisonOpen);
  transfer.hidden = hidden;
  if (hidden) return;

  const exportText = document.getElementById('journey-history-export-text');
  const exportFile = document.getElementById('export-journey-history-file');
  const copyExport = document.getElementById('copy-journey-history-text');
  const fileInput = document.getElementById('journey-history-import-file');
  const importText = document.getElementById('journey-history-import-text');
  const fileStatus = document.getElementById('journey-history-import-file-status');
  const validate = document.getElementById('validate-journey-history-import');
  const status = document.getElementById('journey-history-transfer-status');
  const review = document.getElementById('journey-history-import-review');
  const reviewSummary = document.getElementById('journey-history-import-summary');
  const replaceHint = document.getElementById('journey-history-replace-hint');
  const mergeHint = document.getElementById('journey-history-merge-hint');
  const replace = document.getElementById('confirm-replace-journey-history');
  const merge = document.getElementById('confirm-merge-journey-history');
  const cancel = document.getElementById('cancel-journey-history-import');
  if (!exportText || !importText || !review) return;

  document.getElementById('journey-history-transfer-title')?.replaceChildren(document.createTextNode(owner.t('historyTransferTitle')));
  document.getElementById('journey-history-transfer-intro')?.replaceChildren(document.createTextNode(owner.t('historyTransferIntro')));
  document.getElementById('journey-history-transfer-step-export')?.replaceChildren(document.createTextNode(owner.t('historyTransferStepExport')));
  document.getElementById('journey-history-transfer-step-import')?.replaceChildren(document.createTextNode(owner.t('historyTransferStepImport')));
  document.getElementById('journey-history-transfer-step-confirm')?.replaceChildren(document.createTextNode(owner.t('historyTransferStepConfirm')));
  document.getElementById('journey-history-import-review-title')?.replaceChildren(document.createTextNode(owner.t('historyTransferReviewTitle')));
  document.getElementById('journey-history-export-label')?.replaceChildren(document.createTextNode(owner.t('historyTransferExportLabel')));
  document.getElementById('journey-history-import-file-label')?.replaceChildren(document.createTextNode(owner.t('historyTransferImportFileLabel')));
  document.getElementById('journey-history-import-text-label')?.replaceChildren(document.createTextNode(owner.t('historyTransferImportTextLabel')));
  document.getElementById('journey-history-import-help')?.replaceChildren(document.createTextNode(owner.t('historyTransferImportHelp')));
  if (exportFile) {
    exportFile.textContent = `↓  ${owner.t('historyTransferExportFile')}`;
    exportFile.setAttribute('aria-label', owner.t('historyTransferExportFile'));
  }
  if (copyExport) {
    copyExport.textContent = `▣  ${owner.t('historyTransferCopyText')}`;
    copyExport.setAttribute('aria-label', owner.t('historyTransferCopyText'));
  }
  if (fileInput) fileInput.setAttribute('aria-label', owner.t('historyTransferImportFileLabel'));
  if (validate) {
    validate.textContent = owner.t('historyTransferValidate');
    validate.disabled = !owner.historyImportText?.trim();
  }
  exportText.value = getJourneyHistoryTransferText();
  importText.value = owner.historyImportText || '';
  if (fileStatus) fileStatus.textContent = owner.historyImportFileName
    ? owner.t('historyTransferFileLoaded', { name: owner.historyImportFileName })
    : owner.t('historyTransferNoFile');
  if (status) status.textContent = owner.historyTransferStatus ? owner.t(owner.historyTransferStatus.key, owner.historyTransferStatus.values) : '';

  const validation = owner.historyImportValidation;
  review.hidden = !validation;
  if (!validation) return;
  const plan = buildJourneyHistoryImportPlan(validation);
  const invalid = validation.invalidIndices.length;
  if (reviewSummary) {
    reviewSummary.textContent = owner.t('historyTransferReviewSummary', {
      valid: validation.valid.length,
      invalid,
      total: validation.total,
      local: plan.local.length
    });
  }
  if (replaceHint) replaceHint.textContent = owner.t('historyTransferReplaceHint', {
    count: plan.replaceRecords.length,
    limit: JOURNEY_HISTORY_LIMIT,
    dropped: Math.max(0, plan.imported.length - plan.replaceRecords.length)
  });
  if (mergeHint) mergeHint.textContent = owner.t('historyTransferMergeHint', {
    local: plan.local.length,
    incoming: plan.imported.length,
    conflicts: plan.conflicts,
    count: plan.mergeRecords.length,
    dropped: Math.max(0, plan.local.length + plan.imported.length - plan.mergeRecords.length - plan.conflicts)
  });
  if (replace) {
    replace.textContent = owner.t('historyTransferConfirmReplace');
    replace.disabled = !plan.imported.length;
    replace.setAttribute('aria-label', owner.t('historyTransferConfirmReplace'));
  }
  if (merge) {
    merge.textContent = owner.t('historyTransferConfirmMerge');
    merge.disabled = !plan.imported.length;
    merge.setAttribute('aria-label', owner.t('historyTransferConfirmMerge'));
  }
  if (cancel) {
    cancel.textContent = owner.t('historyTransferCancel');
    cancel.setAttribute('aria-label', owner.t('historyTransferCancel'));
  }
}

function renderJourneyHistory(owner) {
  const panel = document.getElementById('journey-history-panel');
  const title = document.getElementById('journey-history-title');
  const intro = document.getElementById('journey-history-intro');
  const list = document.getElementById('journey-history-list');
  const clear = document.getElementById('clear-journey-history');
  const compareControls = document.getElementById('journey-history-compare-controls');
  const compareHint = document.getElementById('journey-history-compare-hint');
  const startCompare = document.getElementById('start-journey-comparison');
  const compareSelected = document.getElementById('compare-selected-journeys');
  const cancelCompare = document.getElementById('cancel-journey-comparison');
  const comparison = document.getElementById('journey-comparison');
  if (!panel || !title || !intro || !list) return;

  const history = readJourneyHistory();
  const availableIds = new Set(history.map((record) => record.id));
  owner.historySelection = new Set([...(owner.historySelection || [])].filter((id) => availableIds.has(id)));
  title.textContent = `${owner.t('historyTitle')} (${history.length})`;
  intro.textContent = owner.t('historyIntro');
  const achievementHost = document.getElementById('journey-achievements-history');
  if (achievementHost) {
    achievementHost.hidden = Boolean(owner.historyCompareMode || owner.historyComparisonOpen);
    renderAchievementCollection(owner, achievementHost, { idPrefix: 'journey-achievements-history-section' });
  }
  renderJourneyHistoryTransfer(owner);
  list.replaceChildren();
  if (clear) {
    clear.textContent = owner.t('historyClear');
    clear.hidden = !history.length || owner.historyCompareMode || owner.historyComparisonOpen;
    clear.setAttribute('aria-label', owner.t('historyClear'));
  }

  if (owner.historyComparisonOpen && owner.historySelection.size === 2) {
    list.hidden = true;
    if (compareControls) compareControls.hidden = true;
    if (comparison) {
      const selected = history.filter((record) => owner.historySelection.has(record.id)).sort((a, b) => Date.parse(a.completedAt) - Date.parse(b.completedAt));
      renderJourneyComparison(owner, selected[0], selected[1], getJourneyComparisonRows(owner, selected[0], selected[1]));
    }
    return;
  }

  list.hidden = false;
  if (comparison) comparison.hidden = true;
  const canCompare = history.length >= 2;
  if (compareControls) compareControls.hidden = !canCompare;
  if (compareHint) compareHint.textContent = owner.historyCompareMode
    ? owner.t('historyCompareSelected', { count: owner.historySelection.size })
    : owner.t('historyCompareHint');
  if (startCompare) {
    startCompare.hidden = owner.historyCompareMode;
    startCompare.textContent = owner.t('historyCompareStart');
    startCompare.setAttribute('aria-label', owner.t('historyCompareStart'));
  }
  if (compareSelected) {
    compareSelected.hidden = !owner.historyCompareMode;
    compareSelected.disabled = owner.historySelection.size !== 2;
    compareSelected.textContent = owner.t('historyCompareAction');
    compareSelected.setAttribute('aria-label', owner.t('historyCompareAction'));
  }
  if (cancelCompare) {
    cancelCompare.hidden = !owner.historyCompareMode;
    cancelCompare.textContent = owner.t('historyCompareCancel');
    cancelCompare.setAttribute('aria-label', owner.t('historyCompareCancel'));
  }

  if (!history.length) {
    const empty = document.createElement('p');
    empty.className = 'journey-history__empty';
    empty.textContent = owner.t('historyEmpty');
    list.appendChild(empty);
    return;
  }

  history.forEach((record, index) => {
    const entry = document.createElement('article');
    entry.className = 'journey-history__item';
    const heading = document.createElement('h3');
    heading.className = 'journey-history__date';
    const time = document.createElement('time');
    time.dateTime = record.completedAt;
    time.textContent = formatJourneyDate(owner, record.completedAt);
    heading.appendChild(time);
    const details = document.createElement('p');
    details.className = 'journey-history__details';
    details.textContent = `${owner.t('historyEntry', {
      date: formatJourneyDate(owner, record.completedAt),
      score: record.score,
      total: questions.length,
      rank: record.rank || getJourneyRankForScore(owner, record.score),
      language: getSavedJourneyLanguageName(record)
    })} · ${owner.t('markerHistory', { count: getQuestionMarkerCount(record) })}`;
    const actions = document.createElement('div');
    actions.className = 'journey-history__actions';
    const view = document.createElement('button');
    view.type = 'button';
    view.className = 'journey-history__view';
    view.dataset.historyView = record.id;
    view.textContent = owner.t('historyOpen');
    view.setAttribute('aria-label', `${owner.t('historyOpen')}: ${formatJourneyDate(owner, record.completedAt)}`);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'journey-history__remove';
    remove.dataset.historyDelete = record.id;
    remove.textContent = owner.t('historyDelete');
    remove.setAttribute('aria-label', `${owner.t('historyDelete')}: ${formatJourneyDate(owner, record.completedAt)}`);
    actions.append(view, remove);
    entry.append(heading, details);
    if (owner.historyCompareMode) {
      const selection = document.createElement('label');
      selection.className = 'journey-history__select';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.dataset.historySelect = record.id;
      checkbox.checked = owner.historySelection.has(record.id);
      checkbox.setAttribute('aria-label', `${owner.t('historyCompareSelect')}: ${formatJourneyDate(owner, record.completedAt)}`);
      const selectionText = document.createElement('span');
      selectionText.textContent = owner.t('historyCompareSelect');
      selection.append(checkbox, selectionText);
      entry.appendChild(selection);
    }
    entry.appendChild(actions);
    list.appendChild(entry);
    entry.setAttribute('aria-posinset', String(index + 1));
    entry.setAttribute('aria-setsize', String(history.length));
  });
}

function announceJourneyHistory(owner, key) {
  const message = owner.t(key);
  owner.announce?.(message);
  if (owner.a11yStatus) owner.a11yStatus.textContent = message;
}

function renderJourneyHistoryConfirmation(owner) {
  const confirmation = document.getElementById('journey-history-confirmation');
  const title = document.getElementById('journey-history-confirmation-title');
  const message = document.getElementById('journey-history-confirmation-message');
  const confirm = document.getElementById('confirm-journey-history-action');
  const cancel = document.getElementById('cancel-journey-history-action');
  if (!confirmation || !title || !message || !confirm || !cancel) return;

  const pending = owner.historyConfirmation;
  if (!pending) {
    setDialogVisibility(confirmation, false);
    return;
  }

  if (pending.type === 'delete') {
    const record = readJourneyHistory().find((entry) => entry.id === pending.id);
    if (!record) {
      owner.historyConfirmation = null;
      setDialogVisibility(confirmation, false);
      return;
    }
    title.textContent = owner.t('historyDeleteConfirmTitle');
    message.textContent = owner.t('historyDeleteConfirmMessage', { date: formatJourneyDate(owner, record.completedAt) });
    confirm.textContent = owner.t('historyDeleteConfirmAction');
    confirm.setAttribute('aria-label', owner.t('historyDeleteConfirmAction'));
  } else {
    title.textContent = owner.t('historyClearConfirmTitle');
    message.textContent = owner.t('historyClearConfirmMessage', { count: readJourneyHistory().length });
    confirm.textContent = owner.t('historyClearConfirmAction');
    confirm.setAttribute('aria-label', owner.t('historyClearConfirmAction'));
  }
  cancel.textContent = owner.t('historyConfirmCancel');
  cancel.setAttribute('aria-label', owner.t('historyConfirmCancel'));
  setDialogVisibility(confirmation, true);
}

function openJourneyHistoryConfirmation(owner, type, id = '') {
  const history = readJourneyHistory();
  if (type === 'delete' && !history.some((entry) => entry.id === id)) return;
  if (type === 'clear' && !history.length) return;
  owner.historyConfirmation = { type, id };
  // This dialog sits above the history dialog, so preserve the exact delete or
  // clear trigger instead of discarding focus because it is already in a dialog.
  owner.historyConfirmationReturnFocus = rememberFocusedElement() || document.getElementById('clear-journey-history');
  renderJourneyHistoryConfirmation(owner);
  const title = document.getElementById('journey-history-confirmation-title')?.textContent || '';
  const message = document.getElementById('journey-history-confirmation-message')?.textContent || '';
  announceDialog(owner, `${title}. ${message}`);
  focusFirstDialogControl(document.querySelector('#journey-history-confirmation [role="dialog"]'), '#cancel-journey-history-action');
}

function closeJourneyHistoryConfirmation(owner, { restoreFocus = true } = {}) {
  const returnFocus = owner.historyConfirmationReturnFocus;
  owner.historyConfirmation = null;
  owner.historyConfirmationReturnFocus = null;
  renderJourneyHistoryConfirmation(owner);
  announceDialog(owner, owner.t('historyConfirmCancel'));
  if (restoreFocus) restoreDialogFocus(returnFocus, '#clear-journey-history, #journey-history-title');
}

function focusJourneyHistoryAfterConfirmation(owner) {
  const panel = document.getElementById('journey-history-panel');
  const clear = document.getElementById('clear-journey-history');
  if (!panel?.hidden) {
    if (clear && !clear.hidden) {
      clear.focus({ preventScroll: true });
      return;
    }
    document.getElementById('journey-history-title')?.focus({ preventScroll: true });
  }
}

function confirmJourneyHistoryAction(owner) {
  const pending = owner.historyConfirmation;
  if (!pending) return;
  owner.historyConfirmation = null;
  owner.historyConfirmationReturnFocus = null;
  renderJourneyHistoryConfirmation(owner);
  if (pending.type === 'delete') deleteJourneyHistoryEntry(owner, pending.id);
  else clearAllJourneyHistory(owner);
  focusJourneyHistoryAfterConfirmation(owner);
}

function downloadJourneyHistory(owner) {
  const text = getJourneyHistoryTransferText();
  try {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sigo-com-fe-historico-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setJourneyTransferStatus(owner, 'historyTransferDownloaded');
  } catch {
    setJourneyTransferStatus(owner, 'historyTransferDownloadUnavailable');
  }
}

async function copyJourneyHistory(owner) {
  const copied = await copyResultText(getJourneyHistoryTransferText());
  setJourneyTransferStatus(owner, copied ? 'historyTransferCopied' : 'historyTransferCopyUnavailable');
}

function updateJourneyHistoryImportText(owner, text) {
  owner.historyImportText = String(text || '');
  owner.historyImportValidation = null;
  owner.historyTransferStatus = null;
  renderJourneyHistoryTransfer(owner);
}

async function loadJourneyHistoryImportFile(owner, file) {
  if (!file) return;
  try {
    owner.historyImportText = await file.text();
    owner.historyImportFileName = file.name || '';
    owner.historyImportValidation = null;
    owner.historyTransferStatus = null;
    renderJourneyHistoryTransfer(owner);
    setJourneyTransferStatus(owner, 'historyTransferFileReady', { name: owner.historyImportFileName || 'JSON' });
  } catch {
    owner.historyImportText = '';
    owner.historyImportFileName = '';
    owner.historyImportValidation = null;
    renderJourneyHistoryTransfer(owner);
    setJourneyTransferStatus(owner, 'historyTransferFileError');
  }
}

function validateJourneyHistoryImport(owner) {
  const validation = validateJourneyHistoryTransfer(owner.historyImportText || '');
  if (validation.error) {
    owner.historyImportValidation = null;
    renderJourneyHistoryTransfer(owner);
    setJourneyTransferStatus(owner, validation.error);
    return;
  }
  owner.historyImportValidation = validation;
  renderJourneyHistoryTransfer(owner);
  setJourneyTransferStatus(owner, 'historyTransferValidated', {
    valid: validation.valid.length,
    invalid: validation.invalidIndices.length,
    total: validation.total
  });
}

function cancelJourneyHistoryImport(owner) {
  owner.historyImportValidation = null;
  owner.historyTransferStatus = null;
  renderJourneyHistoryTransfer(owner);
  setJourneyTransferStatus(owner, 'historyTransferCancelled');
}

function applyJourneyHistoryImport(owner, mode) {
  const validation = owner.historyImportValidation;
  if (!validation?.valid?.length || !['replace', 'merge'].includes(mode)) {
    setJourneyTransferStatus(owner, 'historyTransferNothingToApply');
    return;
  }
  const plan = buildJourneyHistoryImportPlan(validation);
  const next = mode === 'replace' ? plan.replaceRecords : plan.mergeRecords;
  if (!writeJourneyHistory(next)) {
    setJourneyTransferStatus(owner, 'historyTransferStorageError');
    return;
  }
  if (next[0]) writeLastJourney(next[0]);
  else clearLastJourney();
  resetJourneyHistoryTransferState(owner);
  owner.historySelection = new Set();
  owner.historyCompareMode = false;
  owner.historyComparisonOpen = false;
  renderJourneyHistory(owner);
  owner.updateJourneyHistoryControl?.();
  setJourneyTransferStatus(owner, mode === 'replace' ? 'historyTransferReplaced' : 'historyTransferMerged', { count: next.length });
}

function openJourneyHistory(owner) {
  const panel = document.getElementById('journey-history-panel');
  if (!panel) return;
  owner.historyReturnFocus = rememberDialogFocus();
  owner.historyCompareMode = false;
  owner.historyComparisonOpen = false;
  owner.historySelection = new Set();
  resetJourneyHistoryTransferState(owner);
  renderJourneyHistory(owner);
  setDialogVisibility(panel, true);
  focusFirstDialogControl(panel.querySelector('[role="dialog"]'), '#close-journey-history');
  announceDialog(owner, `${owner.t('historyTitle')}. ${owner.t('historyIntro')}`);
}

function closeJourneyHistory(owner) {
  const panel = document.getElementById('journey-history-panel');
  if (!panel || panel.hidden) return;
  const returnFocus = owner.historyReturnFocus;
  owner.historyReturnFocus = null;
  setDialogVisibility(panel, false);
  owner.historyCompareMode = false;
  owner.historyComparisonOpen = false;
  owner.historySelection = new Set();
  resetJourneyHistoryTransferState(owner);
  announceDialog(owner, owner.t('historyClose'));
  restoreDialogFocus(returnFocus, '#open-journey-history');
}

function viewJourneyHistoryEntry(owner, id) {
  const record = readJourneyHistory().find((entry) => entry.id === id);
  if (!record) return;
  closeJourneyHistory(owner);
  owner.savedJourney = record;
  owner.isViewingSavedJourney = true;
  owner.language = UI[record.language] ? record.language : owner.language;
  owner.updateDocumentLanguage();
  owner.score = record.score;
  owner.answerResults = [...record.answerResults];
  owner.selectedAnswers = [...(record.selectedAnswers || normalizeSelectedAnswers(record))];
  owner.questionMarkers = [...(record.markedQuestions || normalizeQuestionMarkers(record))];
  owner.answerReviewStatus = 'all';
  owner.answerReviewTheme = 'all';
  owner.arrivalSoundPlayed = false;
  owner.arrivalStartedAt = 0;
  owner.historyViewNoticeOpen = true;
  owner.screen = 'result';
  if (typeof owner.renderScreen === 'function') owner.renderScreen('result');
  else owner.render();
  announceJourneyHistory(owner, 'historyOpened');
  announceJourneyHistoryViewNotice(owner);
}

function deleteJourneyHistoryEntry(owner, id) {
  if (!removeJourneyHistory(id)) return;
  owner.historySelection?.delete(id);
  renderJourneyHistory(owner);
  owner.updateJourneyHistoryControl?.();
  announceJourneyHistory(owner, 'historyDeleted');
}

function requestJourneyHistoryDeletion(owner, id) {
  openJourneyHistoryConfirmation(owner, 'delete', id);
}

function clearAllJourneyHistory(owner) {
  clearJourneyHistory();
  owner.historySelection = new Set();
  owner.historyCompareMode = false;
  owner.historyComparisonOpen = false;
  const panel = document.getElementById('journey-history-panel');
  if (panel?.hidden && owner.screen === 'start') {
    if (typeof owner.renderScreen === 'function') owner.renderScreen('start');
    else owner.render?.();
  } else {
    renderJourneyHistory(owner);
  }
  owner.updateJourneyHistoryControl?.();
  announceJourneyHistory(owner, 'historyCleared');
}

function requestClearAllJourneyHistory(owner) {
  openJourneyHistoryConfirmation(owner, 'clear');
}

function ensureJourneyHistoryControls() {
  if (window.__sigoJourneyHistoryControlsBound) return;
  window.__sigoJourneyHistoryControlsBound = true;
  document.getElementById('open-journey-history')?.addEventListener('click', () => window.sigoQuiz?.openJourneyHistory?.());
  document.getElementById('close-journey-history')?.addEventListener('click', () => window.sigoQuiz?.closeJourneyHistory?.());
  document.getElementById('dismiss-journey-history-view-notice')?.addEventListener('click', () => window.sigoQuiz?.dismissJourneyHistoryViewNotice?.());
  document.getElementById('clear-journey-history')?.addEventListener('click', () => window.sigoQuiz?.clearJourneyHistory?.());
  document.getElementById('confirm-journey-history-action')?.addEventListener('click', () => window.sigoQuiz?.confirmJourneyHistoryAction?.());
  document.getElementById('cancel-journey-history-action')?.addEventListener('click', () => window.sigoQuiz?.cancelJourneyHistoryConfirmation?.());
  document.getElementById('journey-history-confirmation')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) window.sigoQuiz?.cancelJourneyHistoryConfirmation?.();
  });
  document.getElementById('start-journey-comparison')?.addEventListener('click', () => window.sigoQuiz?.startJourneyComparison?.());
  document.getElementById('compare-selected-journeys')?.addEventListener('click', () => window.sigoQuiz?.compareSelectedJourneys?.());
  document.getElementById('cancel-journey-comparison')?.addEventListener('click', () => window.sigoQuiz?.cancelJourneyComparison?.());
  document.getElementById('back-to-journey-history')?.addEventListener('click', () => window.sigoQuiz?.backFromJourneyComparison?.());
  document.getElementById('export-journey-history-file')?.addEventListener('click', () => window.sigoQuiz?.downloadJourneyHistory?.());
  document.getElementById('copy-journey-history-text')?.addEventListener('click', () => window.sigoQuiz?.copyJourneyHistory?.());
  document.getElementById('journey-history-import-file')?.addEventListener('change', (event) => window.sigoQuiz?.loadJourneyHistoryImportFile?.(event.target.files?.[0]));
  document.getElementById('journey-history-import-text')?.addEventListener('input', (event) => window.sigoQuiz?.updateJourneyHistoryImportText?.(event.target.value));
  document.getElementById('validate-journey-history-import')?.addEventListener('click', () => window.sigoQuiz?.validateJourneyHistoryImport?.());
  document.getElementById('confirm-replace-journey-history')?.addEventListener('click', () => window.sigoQuiz?.applyJourneyHistoryImport?.('replace'));
  document.getElementById('confirm-merge-journey-history')?.addEventListener('click', () => window.sigoQuiz?.applyJourneyHistoryImport?.('merge'));
  document.getElementById('cancel-journey-history-import')?.addEventListener('click', () => window.sigoQuiz?.cancelJourneyHistoryImport?.());
  document.getElementById('journey-history-panel')?.addEventListener('change', (event) => {
    const checkbox = event.target instanceof HTMLInputElement ? event.target.closest('[data-history-select]') : null;
    if (checkbox instanceof HTMLInputElement) window.sigoQuiz?.toggleJourneyHistorySelection?.(checkbox.dataset.historySelect, checkbox.checked);
  });
  document.getElementById('journey-history-panel')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) {
      window.sigoQuiz?.closeJourneyHistory?.();
      return;
    }
    const view = event.target instanceof Element ? event.target.closest('[data-history-view]') : null;
    if (view instanceof HTMLElement) {
      window.sigoQuiz?.viewJourneyHistory?.(view.dataset.historyView);
      return;
    }
    const remove = event.target instanceof Element ? event.target.closest('[data-history-delete]') : null;
    if (remove instanceof HTMLElement) window.sigoQuiz?.deleteJourneyHistory?.(remove.dataset.historyDelete);
  });
  window.addEventListener('keydown', (event) => {
    const owner = window.sigoQuiz;
    const confirmation = document.getElementById('journey-history-confirmation');
    if (!confirmation?.hidden) {
      if (event.key === 'Escape') {
        event.preventDefault();
        owner?.cancelJourneyHistoryConfirmation?.();
        return;
      }
      if (event.key === 'Tab') {
        const focusable = [...confirmation.querySelectorAll('button:not([disabled])')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (event.key === 'Escape' && owner?.historyViewNoticeOpen && owner.screen === 'result') {
      event.preventDefault();
      owner.dismissJourneyHistoryViewNotice?.();
      return;
    }
    if (event.key === 'Escape') owner?.closeJourneyHistory?.();
  });
}

function syncJourneyHistoryControl(owner) {
  const launcher = document.getElementById('journey-history-launcher');
  const button = document.getElementById('open-journey-history');
  if (!launcher || !button) return;
  const count = readJourneyHistory().length;
  launcher.hidden = false;
  button.textContent = `◷  ${owner.t('historyLauncher')} (${count})`;
  button.setAttribute('aria-label', `${owner.t('historyLauncher')} (${count})`);
  button.title = owner.t('historyIntro');
}

class BibleQuiz3D {
  constructor(container) {
    this.container = container;
    this.usesResultActionsOverlay = true;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.navy);
    this.scene.fog = new THREE.Fog(COLORS.navy, 16, 38);
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(0, 2.1, 17);
    this.camera.lookAt(0, 2.2, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.renderer.domElement);
    this.active = true;
    this.renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      this.active = false;
      window.dispatchEvent(new CustomEvent('sigo-webgl-lost', { detail: { source: this } }));
    });

    this.lastFrameTime = performance.now();
    this.elapsed = 0;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.interactive = [];
    this.uiGroup = null;
    this.hoveredButton = null;
    this.currentQuestionIndex = 0;
    this.questionSet = pickJourneyQuestions(questions.length);
    this.score = 0;
    this.speedPoints = 0;
    this.answerTimes = normalizeAnswerTimes([]);
    this.questionStartedAt = performance.now();
    this.hasRecordedResult = false;
    this.answerResults = [];
    this.selectedAnswers = [];
    this.questionMarkers = [];
    this.answerReviewStatus = 'all';
    this.answerReviewTheme = 'all';
    const audioPreference = readAudioPreference();
    this.isMuted = audioPreference.muted;
    this.musicVolume = audioPreference.volume;
    this.lastAudibleMusicVolume = audioPreference.lastAudibleVolume;
    this.audioEnabled = false;
    this.audioUnlockPending = false;
    this.audioNoticeKind = null;
    this.audioNoticeTimer = null;
    this.audioActionPending = false;
    this.audioActionKind = null;
    this.audioProgressToken = 0;
    this.arrivalSoundPlayed = false;
    this.arrivalStartedAt = 0;
    this.motionMediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    this.systemReducedMotion = this.motionMediaQuery?.matches ?? false;
    const storedReducedMotion = window.localStorage.getItem('sigo-com-fe-reduced-motion');
    this.motionPreferenceExplicit = storedReducedMotion === 'true' || storedReducedMotion === 'false';
    this.reducedMotion = this.motionPreferenceExplicit ? readReducedMotionPreference(this.systemReducedMotion) : this.systemReducedMotion;
    this.highContrast = readHighContrastPreference();
    this.resultGlow = null;
    this.resultGlowMaterial = null;
    this.resultCardCanvas = null;
    this.cardGenerationPending = false;
    this.cardActionPending = false;
    this.cardReady = false;
    this.resultPreparationToken = 0;
    this.resultCardActionButton = null;
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.screen = 'start';
    this.pausedScreen = null;
    this.audioWasPlayingBeforePause = false;
    this.feedbackState = null;
    this.historyExpanded = false;
    this.historyViewNoticeOpen = false;
    this.sharePreviewOpen = false;
    this.sharedJourneyPreview = null;
    this.historyConfirmation = null;
    this.historyConfirmationReturnFocus = null;
    this.historyCompareMode = false;
    this.historyComparisonOpen = false;
    this.historySelection = new Set();
    this.historyImportText = '';
    this.historyImportFileName = '';
    this.historyImportValidation = null;
    this.historyTransferStatus = null;
    this.reviewThemeKey = null;
    this.reviewQuestionIndices = [];
    this.reviewQuestionPosition = 0;
    this.reviewScore = 0;
    this.reviewOriginalScore = null;
    this.reviewOriginalScoreCaptured = false;
    this.reviewAnswerResults = [];
    this.reviewFeedbackState = null;
    this.reviewReturnScreen = 'result';
    this.reviewReturnSummary = null;
    this.bonusQuestionIndices = [];
    this.bonusQuestionPosition = 0;
    this.bonusScore = 0;
    this.bonusFeedbackState = null;
    this.bonusReturnScreen = 'result';
    this.layout = {
      aspect: 1,
      compact: false,
      portrait: false,
      lowHeight: false,
      uiScale: 1,
      cameraZ: 17,
      textDensity: 1
    };
    this.usingKeyboard = false;
    this.helpOpen = false;
    this.audioControlOpen = false;
    this.helpReturnFocus = null;
    this.collectionReturnFocus = null;
    this.historyReturnFocus = null;
    this.sharePreviewReturnFocus = null;
    this.a11yStatus = document.getElementById('a11y-status');
    this.a11yControls = document.getElementById('a11y-controls');
    this.language = getStoredLanguage();
    this.updateDocumentLanguage();
    this.devotionalPauseOpen = false;
    this.devotionalPausePaused = false;
    this.devotionalPauseIndex = 0;
    this.devotionalPauseTimer = null;
    this.devotionalPauseReturnFocus = null;
    this.devotionalPauseNeedsFocus = false;
    this.devotionalPauseStatus = '';
    ensureDevotionalPauseControls();

    this.textureLoader = new THREE.TextureLoader();
    this.parchmentTexture = this.createParchmentTexture();
    this.brandTexture = this.createBrandTexture();
    this.arrivalGlowTexture = this.createArrivalGlowTexture();
    this.backgroundTexture = this.loadTexture('assets/bible-quiz-bg.webp');

    this.bgMusic = new Audio('assets/audio/peaceful-reflection.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = Math.max(0, Math.min(1, this.musicVolume));
    this.correctSound = new Audio('assets/audio/correct-chime.mp3');
    this.correctSound.volume = Math.max(0, Math.min(1, 0.42));
    this.incorrectSound = new Audio('assets/audio/incorrect-bell.mp3');
    this.incorrectSound.volume = Math.max(0, Math.min(1, 0.34));
    this.arrivalSound = new Audio('assets/audio/journey-arrival-chime.mp3');
    this.arrivalSound.volume = Math.max(0, Math.min(1, 0.24));
    this.startSound = createAudioCue('assets/audio/ui-start-gentle.mp3', 0.16);
    this.continueSound = createAudioCue('assets/audio/ui-continue-soft.mp3', 0.14);
    this.pauseSound = createAudioCue('assets/audio/ui-pause-breath.mp3', 0.12);
    this.languageSound = createAudioCue('assets/audio/ui-language-shimmer.mp3', 0.1);
    this.favoriteSound = createAudioCue('assets/audio/ui-favorite-warm.mp3', 0.15);
    syncAudioMuteState(this);

    this.buildEnvironment();
    this.applyHighContrastTheme();
    this.resize();
    this.buildAccessibilityLayer();
    ensureFavoriteControls();
    ensureJourneyHistoryControls();
    renderJourneyHistoryConfirmation(this);
    this.bindEvents();
    this.updateAudioControl();
    this.updateContrastControl();
    this.renderScreen('start');
    this.animate();
  }

  t(key, values = {}) {
    let text = UI[this.language]?.[key] ?? UI.pt[key] ?? key;
    Object.entries(values).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, String(value));
    });
    return text;
  }

  getPauseCopy() {
    return PAUSE_COPY[this.language] || PAUSE_COPY.pt;
  }

  getMotionCopy() {
    return MOTION_COPY[this.language] || MOTION_COPY.pt;
  }

  getMotionStatus() {
    const copy = this.getMotionCopy();
    return this.reducedMotion ? copy.reduced : copy.full;
  }

  getMotionToggleLabel() {
    const copy = this.getMotionCopy();
    return this.reducedMotion ? copy.allow : copy.reduce;
  }

  getTextProfile(role = 'body') {
    const profile = TEXT_PROFILES[this.language] || TEXT_PROFILES.pt;
    return {
      scale: profile[role] ?? profile.body,
      lineHeight: profile.lineHeight,
      wrap: profile.wrap
    };
  }

  getQuestion() {
    const question = getMainQuestionSet(this)[this.currentQuestionIndex];
    return question[this.language] || question.pt;
  }

  getReviewQuestion() {
    const question = getMainQuestionSet(this)[this.reviewQuestionIndices[this.reviewQuestionPosition]];
    return question?.[this.language] || question?.pt;
  }

  getReviewThemeLabel() {
    return getThemeLabel(this, this.reviewThemeKey);
  }

  getReviewProgressSummary() {
    return this.t('reviewProgress', {
      current: Math.min(this.reviewQuestionPosition + 1, this.reviewQuestionIndices.length),
      total: this.reviewQuestionIndices.length,
      score: this.reviewScore
    });
  }

  getReviewConclusion() {
    return getThemeReviewEntry(this, this.reviewThemeKey).conclusion || this.t('reviewIntro');
  }

  toggleHistoricalNote() {
    if (!['feedback', 'review-feedback'].includes(this.screen)) return;
    this.historyExpanded = !this.historyExpanded;
    if (typeof this.renderScreen === 'function') this.renderScreen(this.screen);
    else this.render?.();
  }

  getBonusQuestionIndices() {
    const studiedThemes = new Set(this.getResultThemeStats().map((theme) => theme.key));
    return bonusQuestions
      .map((question, index) => (studiedThemes.has(question.themeKey) ? index : -1))
      .filter((index) => index >= 0);
  }

  getBonusQuestion() {
    const question = bonusQuestions[this.bonusQuestionIndices[this.bonusQuestionPosition]];
    return question?.[this.language] || question?.pt;
  }

  getBonusResultQuestion() {
    const questionIndex = this.bonusQuestionIndices[this.bonusQuestionIndices.length - 1];
    const question = bonusQuestions[questionIndex];
    return question?.[this.language] || question?.pt;
  }

  getBonusResultThemeLabel() {
    return this.getBonusResultQuestion()?.category || '';
  }

  getBonusThemeLabel() {
    return this.getBonusQuestion()?.category || '';
  }

  getBonusProgressSummary() {
    return this.t('bonusProgress', {
      current: Math.min(this.bonusQuestionPosition + 1, this.bonusQuestionIndices.length),
      total: this.bonusQuestionIndices.length
    });
  }

  renderBonusState() {
    if (typeof this.renderScreen === 'function') this.renderScreen(this.screen);
    else this.render();
  }

  startBonusRound() {
    const questionIndices = this.getBonusQuestionIndices();
    if (!questionIndices.length) {
      this.announce?.(getBonusCopy(this).bonusNoThemes);
      return;
    }
    unlockAchievements(this, ['bonus-explorer']);
    this.bonusQuestionIndices = questionIndices;
    this.bonusQuestionPosition = 0;
    this.bonusScore = 0;
    this.bonusFeedbackState = null;
    this.bonusReturnScreen = 'result';
    this.pausedScreen = null;
    this.audioWasPlayingBeforePause = false;
    this.screen = 'bonus';
    this.renderBonusState();
  }

  handleBonusAnswer(selectedIndex) {
    if (this.screen !== 'bonus') return;
    const questionIndex = this.bonusQuestionIndices[this.bonusQuestionPosition];
    const questionData = bonusQuestions[questionIndex];
    const q = this.getBonusQuestion();
    const correct = selectedIndex === questionData.correct;
    if (correct) {
      this.bonusScore += 1;
      this.playSound(this.correctSound);
    } else {
      this.playSound(this.incorrectSound);
    }
    this.bonusFeedbackState = { correct };
    this.screen = 'bonus-feedback';
    this.renderBonusState();
  }

  continueBonusRound() {
    if (this.screen !== 'bonus-feedback') return;
    this.playSound(this.continueSound);
    this.bonusQuestionPosition += 1;
    this.bonusFeedbackState = null;
    if (this.bonusQuestionPosition >= this.bonusQuestionIndices.length) this.showBonusResult();
    else {
      this.screen = 'bonus';
      this.renderBonusState();
    }
  }

  showBonusResult() {
    this.screen = 'bonus-result';
    this.renderBonusState();
  }

  returnFromBonusRound() {
    this.pausedScreen = null;
    this.bonusFeedbackState = null;
    this.screen = this.bonusReturnScreen || 'result';
    this.renderBonusState();
  }

  startThemeReview(themeKey, startQuestionIndex = null) {
    const questionIndices = getThemeQuestionIndices(themeKey, getMainQuestionSet(this));
    if (!questionIndices.length) return;
    this.reviewThemeKey = themeKey;
    this.reviewQuestionIndices = questionIndices;
    const requestedPosition = questionIndices.indexOf(startQuestionIndex);
    this.reviewQuestionPosition = requestedPosition >= 0 ? requestedPosition : 0;
    const originalTheme = this.getResultThemeStats().find((theme) => theme.key === themeKey);
    const originalScore = Number(originalTheme?.correct);
    this.reviewOriginalScoreCaptured = Number.isFinite(originalScore);
    this.reviewOriginalScore = this.reviewOriginalScoreCaptured ? Math.max(0, originalScore) : null;
    this.reviewScore = 0;
    this.reviewAnswerResults = [];
    this.reviewFeedbackState = null;
    this.reviewReturnScreen = 'result';
    this.reviewReturnSummary = null;
    this.bonusQuestionIndices = [];
    this.bonusQuestionPosition = 0;
    this.bonusScore = 0;
    this.bonusFeedbackState = null;
    this.bonusReturnScreen = 'result';
    this.pausedScreen = null;
    this.audioWasPlayingBeforePause = false;
    this.screen = 'review';
    this.renderScreen('review');
  }

  handleReviewAnswer(selectedIndex) {
    if (this.screen !== 'review') return;
    const questionIndex = this.reviewQuestionIndices[this.reviewQuestionPosition];
    const questionData = getMainQuestionSet(this)[questionIndex];
    const q = this.getReviewQuestion();
    const correct = selectedIndex === questionData.correct;
    if (correct) {
      this.reviewScore += 1;
      this.playSound(this.correctSound);
    } else {
      this.playSound(this.incorrectSound);
    }
    this.reviewAnswerResults[this.reviewQuestionPosition] = correct;
    this.historyExpanded = false;
    this.reviewFeedbackState = { correct };
    this.renderScreen('review-feedback');
  }

  continueThemeReview() {
    if (this.screen !== 'review-feedback') return;
    this.playSound(this.continueSound);
    this.reviewQuestionPosition += 1;
    this.reviewFeedbackState = null;
    if (this.reviewQuestionPosition >= this.reviewQuestionIndices.length) this.showReviewResult();
    else this.renderScreen('review');
  }

  showReviewResult() {
    unlockAchievements(this, ['theme-reviewer']);
    this.reviewReturnSummary = buildThemeReviewReturnSummary(this);
    this.reviewFeedbackState = null;
    this.pausedScreen = null;
    this.screen = this.reviewReturnScreen || 'result';
    this.renderScreen(this.screen);
  }

  returnFromThemeReview() {
    this.reviewReturnSummary = buildThemeReviewReturnSummary(this);
    this.pausedScreen = null;
    this.reviewFeedbackState = null;
    this.screen = this.reviewReturnScreen || 'result';
    this.renderScreen(this.screen);
  }

  getQuestionForProgress() {
    if (isBonusQuestionScreen(this.screen) || (this.screen === 'paused' && isBonusQuestionScreen(this.pausedScreen))) return this.getBonusQuestion();
    return isThemeReviewQuestionScreen(this.screen) || (this.screen === 'paused' && isThemeReviewQuestionScreen(this.pausedScreen))
      ? this.getReviewQuestion()
      : this.getQuestion();
  }

  getProgressSummaryForScreen() {
    if (isBonusQuestionScreen(this.screen) || (this.screen === 'paused' && isBonusQuestionScreen(this.pausedScreen))) return this.getBonusProgressSummary();
    return isThemeReviewQuestionScreen(this.screen) || (this.screen === 'paused' && isThemeReviewQuestionScreen(this.pausedScreen))
      ? this.getReviewProgressSummary()
      : getJourneyProgressSummary(this);
  }

  viewSavedJourney() {
    const saved = readLastJourney();
    if (!saved) return;
    this.savedJourney = saved;
    this.isViewingSavedJourney = true;
    if (UI[saved.language]) {
      this.language = saved.language;
      this.updateDocumentLanguage();
    }
    this.score = saved.score;
    this.answerResults = [...saved.answerResults];
    this.selectedAnswers = [...(saved.selectedAnswers || normalizeSelectedAnswers(saved))];
    this.questionMarkers = [...(saved.markedQuestions || normalizeQuestionMarkers(saved))];
    this.arrivalSoundPlayed = false;
    this.arrivalStartedAt = 0;
    this.screen = 'result';
    this.renderScreen('result');
    this.a11yStatus.textContent = getLastJourneyAnnouncement(this, saved);
  }

  clearSavedJourney() {
    clearLastJourney();
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.screen = 'start';
    this.renderScreen('start');
    this.a11yStatus.textContent = formatLastJourneyText(this, 'cleared');
  }

  openJourneyHistory() {
    openJourneyHistory(this);
  }

  dismissJourneyHistoryViewNotice() {
    hideJourneyHistoryViewNotice(this);
  }

  shareJourneyLink() {
    return shareJourneyLink(this);
  }

  openJourneySharePreview(payload) {
    return openJourneySharePreview(this, payload);
  }

  closeJourneySharePreview() {
    closeJourneySharePreview(this);
  }

  closeJourneyHistory() {
    closeJourneyHistory(this);
  }

  viewJourneyHistory(id) {
    viewJourneyHistoryEntry(this, id);
  }

  deleteJourneyHistory(id) {
    requestJourneyHistoryDeletion(this, id);
  }

  clearJourneyHistory() {
    requestClearAllJourneyHistory(this);
  }

  confirmJourneyHistoryAction() {
    confirmJourneyHistoryAction(this);
  }

  cancelJourneyHistoryConfirmation() {
    closeJourneyHistoryConfirmation(this);
  }

  downloadJourneyHistory() {
    downloadJourneyHistory(this);
  }

  copyJourneyHistory() {
    copyJourneyHistory(this);
  }

  updateJourneyHistoryImportText(text) {
    updateJourneyHistoryImportText(this, text);
  }

  loadJourneyHistoryImportFile(file) {
    loadJourneyHistoryImportFile(this, file);
  }

  validateJourneyHistoryImport() {
    validateJourneyHistoryImport(this);
  }

  applyJourneyHistoryImport(mode) {
    applyJourneyHistoryImport(this, mode);
  }

  cancelJourneyHistoryImport() {
    cancelJourneyHistoryImport(this);
  }

  startJourneyComparison() {
    if (readJourneyHistory().length < 2) return;
    this.historyCompareMode = true;
    this.historyComparisonOpen = false;
    this.historySelection = new Set();
    renderJourneyHistory(this);
  }

  toggleJourneyHistorySelection(id, checked) {
    if (!this.historyCompareMode || !id) return;
    if (checked && this.historySelection.size >= 2) {
      renderJourneyHistory(this);
      return;
    }
    if (checked) this.historySelection.add(id);
    else this.historySelection.delete(id);
    renderJourneyHistory(this);
  }

  compareSelectedJourneys() {
    if (!this.historyCompareMode || this.historySelection.size !== 2) {
      announceJourneyHistory(this, 'historyCompareNeedTwo');
      return;
    }
    this.historyComparisonOpen = true;
    renderJourneyHistory(this);
    announceJourneyHistory(this, 'historyCompareOpened');
  }

  cancelJourneyComparison() {
    this.historyCompareMode = false;
    this.historyComparisonOpen = false;
    this.historySelection = new Set();
    renderJourneyHistory(this);
  }

  backFromJourneyComparison() {
    this.historyComparisonOpen = false;
    this.historyCompareMode = true;
    renderJourneyHistory(this);
  }

  updateJourneyHistoryControl() {
    syncJourneyHistoryControl(this);
  }

  resumeDraft() {
    const draft = readJourneyDraft();
    if (!applyJourneyDraft(this, draft)) return;
    this.unlockAudio();
    this.renderScreen(this.screen);
    showJourneyResumeNotice(this, draft);
  }

  startAnotherJourney() {
    clearJourneyDraft();
    this.unlockAudio();
    this.playSound(this.startSound);
    this.startNewJourney();
  }

  startAnotherReview() {
    const draft = readJourneyDraft();
    if (!isThemeReviewDraft(draft) || !applyJourneyDraft(this, draft) || !this.reviewThemeKey) return;
    this.unlockAudio();
    this.playSound(this.startSound);
    this.startThemeReview(this.reviewThemeKey);
  }

  discardDraft() {
    const draft = readJourneyDraft();
    if (!draft) return;
    clearJourneyDraft();
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.screen = 'start';
    this.renderScreen('start');
    const message = formatJourneyDraftText(this, draft, 'draftDiscarded');
    if (this.a11yStatus) this.a11yStatus.textContent = message;
  }

  openDevotionalPause() {
    openDevotionalPause(this);
  }

  closeDevotionalPause() {
    closeDevotionalPause(this);
  }

  nextDevotionalPause() {
    moveDevotionalPause(this, 1);
  }

  previousDevotionalPause() {
    moveDevotionalPause(this, -1);
  }

  toggleDevotionalPause() {
    toggleDevotionalPause(this);
  }

  getCurrentVerseInfo() {
    if ((this.screen === 'feedback' || (this.screen === 'paused' && this.pausedScreen === 'feedback')) && this.feedbackState) {
      return { id: `question-${this.currentQuestionIndex}`, kind: 'question', round: 'main', questionIndex: this.currentQuestionIndex, verse: this.getQuestion().verse };
    }
    if ((this.screen === 'review-feedback' || (this.screen === 'paused' && this.pausedScreen === 'review-feedback')) && this.reviewFeedbackState) {
      const questionIndex = this.reviewQuestionIndices[this.reviewQuestionPosition];
      return { id: `review-question-${questionIndex}`, kind: 'question', round: 'review', questionIndex, verse: this.getReviewQuestion().verse };
    }
    if ((this.screen === 'bonus-feedback' || (this.screen === 'paused' && this.pausedScreen === 'bonus-feedback')) && this.bonusFeedbackState) {
      const bonusQuestionIndex = this.bonusQuestionIndices[this.bonusQuestionPosition];
      return { id: `bonus-question-${bonusQuestionIndex}`, kind: 'bonus', bonusQuestionIndex, verse: this.getBonusQuestion().verse };
    }
    if (this.screen === 'bonus-result' && this.bonusQuestionIndices.length) {
      const bonusQuestionIndex = this.bonusQuestionIndices[this.bonusQuestionIndices.length - 1];
      const question = this.getBonusResultQuestion();
      return { id: `bonus-question-${bonusQuestionIndex}`, kind: 'bonus', bonusQuestionIndex, verse: question?.verse || '' };
    }
    if (this.screen === 'result') {
      return { id: `result-${this.getResultBand()}`, kind: 'result', round: 'result', band: this.getResultBand(), verse: this.getResultVerse() };
    }
    return null;
  }

  getFavorites() {
    return readFavoriteVerses();
  }

  toggleCurrentVerseFavorite() {
    toggleVerseFavorite(this);
  }

  openFavorites() {
    openFavorites(this);
  }

  closeFavorites() {
    closeFavorites(this);
  }

  removeFavorite(id) {
    removeFavorite(this, id);
  }

  updateVerseTools() {
    syncVerseTools(this);
  }

  updateDocumentLanguage() {
    const language = getLanguage(this.language);
    document.documentElement.lang = language.htmlLang;
    document.title = this.t('pageTitle');
  }

  applyHighContrastTheme() {
    document.documentElement.classList.toggle('high-contrast', this.highContrast);
    document.body.classList.toggle('high-contrast', this.highContrast);
    this.container.classList.toggle('high-contrast', this.highContrast);
    if (this.scene) {
      this.scene.background = new THREE.Color(this.highContrast ? 0x000000 : COLORS.navy);
      if (this.scene.fog) this.scene.fog.color.set(this.highContrast ? 0x000000 : COLORS.navy);
    }
    if (this.backgroundMesh?.material) {
      this.backgroundMesh.material.opacity = this.highContrast ? 0.3 : 0.82;
    }
  }

  setLanguage(code) {
    if (!UI[code] || code === this.language) return;
    this.playSound?.(this.languageSound);
    if (this.isViewingSavedJourney) {
      this.isViewingSavedJourney = false;
      this.savedJourney = null;
    }
    this.language = code;
    window.localStorage.setItem('sigo-com-fe-language', code);
    this.updateDocumentLanguage();
    this.renderScreen(this.screen);
    syncAchievementCelebration(this);
    if (!document.getElementById('journey-history-panel')?.hidden) renderJourneyHistory(this);
    if (!document.getElementById('journey-history-confirmation')?.hidden) renderJourneyHistoryConfirmation(this);
  }

  loadTexture(path) {
    const texture = this.textureLoader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    // UI images stay sharper without mipmaps, especially when the panel is
    // viewed at an angle or resized for a wide screen.
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy(), 8);
    return texture;
  }

  createParchmentTexture() {
    // The original parchment artwork is portrait-oriented. Drawing a clean,
    // high-resolution landscape version prevents it from being stretched and
    // keeps the panel crisp on desktop and mobile displays.
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1536;
    const ctx = canvas.getContext('2d');

    const paper = ctx.createRadialGradient(1024, 720, 180, 1024, 720, 1320);
    paper.addColorStop(0, '#fff8dc');
    paper.addColorStop(0.72, '#f5e4b5');
    paper.addColorStop(1, '#d9b76d');
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(122, 78, 23, 0.62)';
    ctx.lineWidth = 14;
    ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104);
    ctx.strokeStyle = 'rgba(181, 128, 39, 0.78)';
    ctx.lineWidth = 5;
    ctx.strokeRect(82, 82, canvas.width - 164, canvas.height - 164);

    const edgeShade = ctx.createLinearGradient(0, 0, canvas.width, 0);
    edgeShade.addColorStop(0, 'rgba(110, 65, 18, 0.18)');
    edgeShade.addColorStop(0.08, 'rgba(255, 255, 255, 0)');
    edgeShade.addColorStop(0.92, 'rgba(255, 255, 255, 0)');
    edgeShade.addColorStop(1, 'rgba(110, 65, 18, 0.18)');
    ctx.fillStyle = edgeShade;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  createBrandTexture() {
    // A high-resolution canvas mark keeps the identity crisp and reliable
    // without depending on a compressed or portrait-oriented logo image.
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Soft cream halo preserves contrast against every parchment variation.
    const halo = ctx.createRadialGradient(260, 210, 20, 260, 210, 230);
    halo.addColorStop(0, this.highContrast ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 248, 218, 0.92)');
    halo.addColorStop(1, this.highContrast ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 248, 218, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, 560, canvas.height);

    ctx.save();
    ctx.translate(238, 210);
    ctx.shadowColor = 'rgba(91, 57, 18, 0.28)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 8;

    // Golden cross drawn from clean rounded vector-like strokes.
    const crossGradient = ctx.createLinearGradient(-62, -160, 78, 170);
    crossGradient.addColorStop(0, this.highContrast ? '#ffffff' : '#fff2b2');
    crossGradient.addColorStop(0.42, this.highContrast ? '#ffff00' : '#f5c85c');
    crossGradient.addColorStop(1, this.highContrast ? '#ffffff' : '#b97820');
    ctx.fillStyle = crossGradient;
    ctx.beginPath();
    ctx.roundRect(-34, -166, 68, 300, 15);
    ctx.roundRect(-134, -72, 268, 68, 15);
    ctx.fill();
    ctx.restore();

    // Calm green leaf accent, with a single fine vein for recognition.
    ctx.save();
    ctx.translate(260, 116);
    ctx.rotate(-0.34);
    const leafGradient = ctx.createLinearGradient(-25, 0, 150, 0);
    leafGradient.addColorStop(0, '#2c7542');
    leafGradient.addColorStop(1, '#8fca43');
    ctx.fillStyle = leafGradient;
    ctx.beginPath();
    ctx.moveTo(-18, 88);
    ctx.bezierCurveTo(0, 10, 58, -60, 170, -74);
    ctx.bezierCurveTo(164, 22, 102, 90, -18, 88);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(21, 91, 42, 0.78)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-8, 77);
    ctx.bezierCurveTo(44, 28, 96, -20, 151, -55);
    ctx.stroke();
    ctx.restore();

    // The fixed brand name remains unchanged when the quiz language changes.
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.highContrast ? '#ffffff' : '#193b38';
    ctx.font = '700 126px Georgia, serif';
    ctx.fillText('Sigo com Fé', 470, 214);
    ctx.fillStyle = this.highContrast ? '#ffff00' : '#a16b27';
    ctx.fillRect(478, 316, 690, 5);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  createArrivalGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 768;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    const glow = ctx.createRadialGradient(384, 384, 20, 384, 384, 370);
    glow.addColorStop(0, 'rgba(255, 232, 155, 0.38)');
    glow.addColorStop(0.45, 'rgba(255, 216, 105, 0.14)');
    glow.addColorStop(1, 'rgba(255, 216, 105, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  buildEnvironment() {
    const hemi = new THREE.HemisphereLight(0xffdca1, 0x16233b, 1.55);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffd69a, 2.5);
    sun.position.set(-7, 12, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -8;
    this.scene.add(sun);

    const background = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 21),
      new THREE.MeshBasicMaterial({ map: this.backgroundTexture, transparent: true, opacity: 0.82 })
    );
    background.position.set(0, 5.1, -11);
    this.backgroundMesh = background;
    this.scene.add(background);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(25, 64),
      new THREE.MeshStandardMaterial({ color: 0x1a3a35, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.55;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 31),
      new THREE.MeshStandardMaterial({ color: 0x6a5942, roughness: 1 })
    );
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = 0.06;
    path.position.set(0, -1.5, -3);
    path.receiveShadow = true;
    this.scene.add(path);

    const hillMaterial = new THREE.MeshStandardMaterial({ color: 0x234b43, roughness: 1 });
    const hills = [
      [-9, 0.4, -8, 7.5, 2.8, 3], [7, 0.2, -7, 8, 3.2, 3.5],
      [-8, -0.25, -3.5, 6, 2.5, 2.8], [8.5, -0.2, -2.5, 6, 2.7, 2.6]
    ];
    hills.forEach(([x, y, z, sx, sy, sz]) => {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), hillMaterial);
      hill.position.set(x, y, z);
      hill.scale.set(sx, sy, sz);
      hill.receiveShadow = true;
      this.scene.add(hill);
    });

    const cross = this.createCross();
    cross.position.set(-5.8, 3.1, -4.5);
    cross.scale.setScalar(0.9);
    this.scene.add(cross);

    const smallCross = this.createCross();
    smallCross.position.set(5.7, 1.8, -5.2);
    smallCross.scale.setScalar(0.48);
    smallCross.rotation.y = -0.16;
    this.scene.add(smallCross);

    const glow = new THREE.PointLight(0xffc75a, 5, 13, 2);
    glow.position.set(-5.8, 3.2, -3.4);
    this.arrivalLight = glow;
    this.scene.add(glow);

    const particlePositions = [];
    for (let i = 0; i < 180; i += 1) {
      particlePositions.push((Math.random() - 0.5) * 30, Math.random() * 13 - 1, (Math.random() - 0.5) * 18 - 5);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ color: COLORS.goldBright, size: 0.045, transparent: true, opacity: 0.7, sizeAttenuation: true })
    );
    this.particles = particles;
    this.scene.add(particles);
  }

  createCross() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.gold,
      emissive: 0xc17c25,
      emissiveIntensity: 0.7,
      roughness: 0.28,
      metalness: 0.8
    });
    const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.62, 5.1, 0.5), material);
    const horizontal = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.62, 0.5), material);
    vertical.position.y = 0.3;
    horizontal.position.y = 1.12;
    [vertical, horizontal].forEach((mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });
    return group;
  }

  buildAccessibilityLayer() {
    if (!this.a11yControls || !this.a11yStatus) return;
    this.a11yControls.replaceChildren();
  }

  createA11yButton(key, label, action, { pressed = null, shortcut = '' } = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'a11y-control';
    button.dataset.a11yKey = key;
    button.textContent = label;
    button.setAttribute('aria-label', label);
    if (pressed !== null) button.setAttribute('aria-pressed', String(pressed));
    if (shortcut) button.setAttribute('aria-keyshortcuts', shortcut);
    button.addEventListener('click', () => {
      this.usingKeyboard = true;
      action();
    });
    this.a11yControls.appendChild(button);
    return button;
  }

  renderAccessibility() {
    if (!this.a11yControls || !this.a11yStatus) return;
    const copy = A11Y_COPY[this.language] || A11Y_COPY.pt;
    const activeKey = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.a11yKey || '' : '';
    this.a11yControls.replaceChildren();
    let firstContextualButton = null;

    const addContextButton = (key, label, action, options = {}) => {
      const button = this.createA11yButton(key, label, action, options);
      if (!firstContextualButton) firstContextualButton = button;
      return button;
    };

    if (this.screen === 'start') {
      const saved = readLastJourney();
      const draft = readJourneyDraft();
      if (draft) {
        addContextButton('resume-draft', formatJourneyDraftText(this, draft, 'draftResume'), () => this.resumeDraft(), { shortcut: 'Enter' });
        addContextButton('new-journey', formatJourneyDraftText(this, draft, 'draftNew'), () => isThemeReviewDraft(draft) ? this.startAnotherReview() : this.startAnotherJourney());
        addContextButton('discard-draft', formatJourneyDraftText(this, draft, 'draftDiscard'), () => this.discardDraft());
      } else {
        addContextButton('start', saved ? formatLastJourneyText(this, 'newJourney') : this.t('start'), () => {
          this.unlockAudio();
          this.startNewJourney();
        }, { shortcut: 'Enter' });
      }
      if (saved) {
        addContextButton('saved-result', this.t('historyOpen'), () => this.viewJourneyHistory(saved.id));
        addContextButton('clear-saved-result', this.t('historyClear'), () => this.clearJourneyHistory());
      }
    } else if (this.screen === 'quiz' || this.screen === 'review' || this.screen === 'bonus') {
      addContextButton('pause', this.getPauseCopy().button, () => this.pauseJourney(), { shortcut: 'P' });
      const q = this.screen === 'review' ? this.getReviewQuestion() : this.screen === 'bonus' ? this.getBonusQuestion() : this.getQuestion();
      if (this.screen !== 'bonus') {
        const questionIndex = this.screen === 'review' ? this.reviewQuestionIndices[this.reviewQuestionPosition] : this.currentQuestionIndex;
        addContextButton('question-marker', getQuestionMarkerAccessibleLabel(this, questionIndex), () => toggleQuestionMarker(this, questionIndex), {
          pressed: Boolean(this.questionMarkers?.[questionIndex])
        });
      }
      q.options.forEach((option, index) => {
        addContextButton(`answer-${index}`, `${String.fromCharCode(65 + index)}: ${option}`, () => this.screen === 'review' ? this.handleReviewAnswer(index) : this.screen === 'bonus' ? this.handleBonusAnswer(index) : this.handleAnswer(index), {
          shortcut: String(index + 1)
        });
      });
    } else if (this.screen === 'feedback' && this.feedbackState) {
      const label = this.currentQuestionIndex === questions.length - 1 ? this.t('seeScore') : this.t('continue');
      addContextButton('pause', this.getPauseCopy().button, () => this.pauseJourney(), { shortcut: 'P' });
      addContextButton('question-marker', getQuestionMarkerAccessibleLabel(this, this.currentQuestionIndex), () => toggleQuestionMarker(this, this.currentQuestionIndex), {
        pressed: Boolean(this.questionMarkers?.[this.currentQuestionIndex])
      });
      addContextButton('historical-note', `${this.t('historicalTitle')}: ${this.historyExpanded ? this.t('historicalCollapse') : this.t('historicalExpand')}`, () => this.toggleHistoricalNote(), { shortcut: 'H' });
      addContextButton('continue', label, () => {
        this.playSound(this.continueSound);
        this.currentQuestionIndex += 1;
        this.feedbackState = null;
        if (this.currentQuestionIndex >= questions.length) this.showResults();
        else this.renderScreen('quiz');
      }, { shortcut: 'Enter' });
    } else if (this.screen === 'review-feedback' && this.reviewFeedbackState) {
      const label = this.reviewQuestionPosition === this.reviewQuestionIndices.length - 1 ? this.t('reviewFinish') : this.t('continue');
      addContextButton('pause', this.getPauseCopy().button, () => this.pauseJourney(), { shortcut: 'P' });
      const reviewQuestionIndex = this.reviewQuestionIndices[this.reviewQuestionPosition];
      addContextButton('question-marker', getQuestionMarkerAccessibleLabel(this, reviewQuestionIndex), () => toggleQuestionMarker(this, reviewQuestionIndex), {
        pressed: Boolean(this.questionMarkers?.[reviewQuestionIndex])
      });
      addContextButton('historical-note', `${this.t('historicalTitle')}: ${this.historyExpanded ? this.t('historicalCollapse') : this.t('historicalExpand')}`, () => this.toggleHistoricalNote(), { shortcut: 'H' });
      addContextButton('continue-review', label, () => this.continueThemeReview(), { shortcut: 'Enter' });
    } else if (this.screen === 'bonus-feedback' && this.bonusFeedbackState) {
      const label = this.bonusQuestionPosition === this.bonusQuestionIndices.length - 1 ? this.t('bonusFinish') : this.t('continue');
      addContextButton('pause', this.getPauseCopy().button, () => this.pauseJourney(), { shortcut: 'P' });
      addContextButton('continue-bonus', label, () => this.continueBonusRound(), { shortcut: 'Enter' });
    } else if (this.screen === 'paused') {
      addContextButton('resume', this.getPauseCopy().resume, () => this.resumeJourney(), { shortcut: 'Enter' });
      addContextButton('restart', this.getPauseCopy().restart, () => this.restartJourney());
    } else if (this.screen === 'result') {
      const arrivalCopy = ARRIVAL_COPY[this.language] || ARRIVAL_COPY.pt;
      addContextButton('arrival-sound', this.arrivalSoundPlayed ? arrivalCopy.replay : arrivalCopy.button, () => this.playArrivalSound(), {
        shortcut: 'S'
      });
      addContextButton('download-card', this.t('downloadImage'), () => this.downloadResultCard());
      addContextButton('share-card', this.t('shareImage'), () => this.shareResultCard());
      addContextButton('share-journey-link', this.t('journeyShareLabel'), () => this.shareJourneyLink());
      addContextButton('devotional-pause', this.t('devotionalPauseAction'), () => this.openDevotionalPause());
      const weakestTheme = this.getResultWeakestTheme();
      if (weakestTheme) {
        addContextButton('next-step-theme', `${this.t('nextStepAction')}: ${this.getResultWeakestThemeLabel()}`, () => this.startThemeReview(weakestTheme.key));
      }
      if (this.getBonusQuestionIndices().length) {
        addContextButton('bonus-round', this.t('bonusStart'), () => this.startBonusRound());
      }
      this.getResultThemeStats().forEach((theme) => {
        addContextButton(`review-theme-${theme.key}`, `${getThemeMapCopy(this).reviewAction}: ${theme.label}`, () => this.startThemeReview(theme.key));
      });
      addContextButton('replay', this.t('replay'), () => this.startNewJourney());
      addContextButton('articles', this.t('articles'), () => window.open('https://sigocomfe.com', '_blank', 'noopener'));
    } else if (this.screen === 'review-result') {
      addContextButton('review-back', this.t('reviewBack'), () => this.returnFromThemeReview());
      addContextButton('review-again', this.t('reviewAgain'), () => this.startThemeReview(this.reviewThemeKey));
    } else if (this.screen === 'bonus-result') {
      addContextButton('devotional-pause', this.t('devotionalPauseAction'), () => this.openDevotionalPause());
      addContextButton('bonus-back', this.t('bonusBack'), () => this.returnFromBonusRound());
      addContextButton('bonus-again', this.t('bonusAgain'), () => this.startBonusRound());
    }

    const journeyHistoryCount = readJourneyHistory().length;
    addContextButton('journey-history', `${this.t('historyLauncher')} (${journeyHistoryCount})`, () => this.openJourneyHistory());
    addContextButton('favorites', `${this.t('favorites')} (${readFavoriteVerses().length})`, () => this.openFavorites());
    const currentVerse = this.getCurrentVerseInfo();
    if (currentVerse) {
      const isFavorite = readFavoriteVerses().some((favorite) => favorite.id === currentVerse.id);
      addContextButton('favorite-verse', isFavorite ? this.t('removeFavorite') : this.t('favoriteVerse'), () => this.toggleCurrentVerseFavorite(), {
        pressed: isFavorite
      });
    }

    LANGUAGES.forEach((language) => {
      const selected = language.code === this.language;
      this.createA11yButton(`language-${language.code}`, `${copy.language}: ${language.name}`, () => this.setLanguage(language.code), {
        pressed: selected
      });
    });
    const audioCopy = AUDIO_COPY[this.language] || AUDIO_COPY.pt;
    this.createA11yButton('mute', this.isMuted ? audioCopy.unmute : audioCopy.mute, () => this.toggleMute(), {
      pressed: this.isMuted,
      shortcut: 'M'
    });
    this.createA11yButton('motion', this.getMotionToggleLabel(), () => this.toggleReducedMotion(), {
      pressed: this.reducedMotion
    });
    this.createA11yButton('contrast', getContrastToggleLabel(this), () => this.toggleHighContrast(), {
      pressed: this.highContrast,
      shortcut: 'C'
    });

    const q = ['quiz', 'feedback', 'paused', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(this.screen)
      ? this.getQuestionForProgress()
      : null;
    const announcementKey = this.screen === 'review' || this.screen === 'bonus'
      ? 'question'
      : this.screen === 'review-feedback' || this.screen === 'bonus-feedback'
        ? 'feedback'
        : this.screen === 'review-result' || this.screen === 'bonus-result'
          ? 'result'
          : this.screen;
    let announcement = copy[announcementKey] || copy.start;
    if (this.screen === 'start' && readJourneyDraft()) {
      const draft = readJourneyDraft();
      announcement = `${getJourneyDraftAnnouncement(this, draft)} ${formatJourneyDraftText(this, draft, 'draftResume')}. ${formatJourneyDraftText(this, draft, 'draftNew')}. ${formatJourneyDraftText(this, draft, 'draftDiscard')}.`;
    }
    if (this.screen === 'quiz' && q) {
      announcement += ` ${getJourneyProgressAnnouncement(this)} ${this.t('question')} ${this.currentQuestionIndex + 1} / ${questions.length}. ${q.category}. ${q.question}. ${copy.keyboard}`;
    } else if (this.screen === 'feedback' && this.feedbackState && q) {
      announcement += ` ${getJourneyProgressAnnouncement(this)} ${this.feedbackState.correct ? this.t('correct') : this.t('almost')}. ${this.t('explanationTitle')}. ${q.explanation} ${this.t('historicalTitle')}. ${this.historyExpanded ? q.historicalNote : this.t('historicalExpand')}. ${this.t('devotional')}. ${q.verse}`;
    } else if (this.screen === 'review' && q) {
      announcement += ` ${this.getReviewThemeLabel()}. ${this.getReviewProgressSummary()} ${this.t('question')} ${this.reviewQuestionPosition + 1}. ${q.question}. ${copy.keyboard}`;
    } else if (this.screen === 'review-feedback' && this.reviewFeedbackState && q) {
      announcement += ` ${this.getReviewThemeLabel()}. ${this.getReviewProgressSummary()} ${this.reviewFeedbackState.correct ? this.t('correct') : this.t('almost')}. ${this.t('explanationTitle')}. ${q.explanation} ${this.t('historicalTitle')}. ${this.historyExpanded ? q.historicalNote : this.t('historicalExpand')}. ${this.t('devotional')}. ${q.verse}`;
    } else if (this.screen === 'bonus' && q) {
      announcement += ` ${this.getBonusThemeLabel()}. ${this.getBonusProgressSummary()} ${this.t('question')} ${this.bonusQuestionPosition + 1}. ${q.question}. ${getBonusCopy(this).bonusChooseHint}. ${copy.keyboard}`;
    } else if (this.screen === 'bonus-feedback' && this.bonusFeedbackState && q) {
      announcement += ` ${this.getBonusThemeLabel()}. ${this.getBonusProgressSummary()} ${this.bonusFeedbackState.correct ? getBonusCopy(this).bonusCorrect : getBonusCopy(this).bonusAlmost}. ${getBonusCopy(this).bonusReflectionTitle}. ${q.reflection} ${this.t('devotional')}. ${q.verse}`;
    } else if (this.screen === 'paused' && q) {
      const pauseCopy = this.getPauseCopy();
      announcement = `${pauseCopy.title}. ${pauseCopy.message} ${this.getProgressSummaryForScreen()} ${pauseCopy.questionLabel}: ${q.question}. ${this.pausedScreen === 'feedback' || this.pausedScreen === 'review-feedback' || this.pausedScreen === 'bonus-feedback' ? pauseCopy.reflectionContext : ''}`;
    } else if (this.screen === 'result') {
      announcement += ` ${this.t('arrivalMessage')} ${this.score} / ${questions.length}. ${this.getRank()}. ${getThemeMapAnnouncement(this)} ${this.getResultReflection()} ${this.getResultNextStepMessage()} ${this.getResultVerse()} ${getAchievementSummaryText(this)}`;
    } else if (this.screen === 'review-result') {
      announcement += ` ${this.getReviewThemeLabel()}. ${this.t('reviewComparisonTitle')}. ${this.t('reviewOriginal')}: ${getThemeReviewOriginalScore(this)} / ${this.reviewQuestionIndices.length}. ${this.t('reviewCurrent')}: ${this.reviewScore} / ${this.reviewQuestionIndices.length}. ${getThemeReviewComparisonMessage(this)} ${this.getReviewConclusion()} ${getAchievementSummaryText(this)}`;
    } else if (this.screen === 'bonus-result') {
      announcement += ` ${getBonusCopy(this).bonusResultTitle}. ${this.bonusScore} / ${this.bonusQuestionIndices.length}. ${getBonusCopy(this).bonusNoScore} ${getBonusCopy(this).bonusResultMessage} ${getBonusCopy(this).bonusInvitation} ${this.t('bonusVerseTitle')}. ${this.getBonusResultThemeLabel()}. ${this.getBonusResultQuestion()?.verse || ''}. ${this.t('bonusSaveVerse')}. ${getAchievementSummaryText(this)}`;
    }
    announcement += ` ${this.getMotionStatus()}`;
    this.a11yStatus.textContent = announcement;

    if (this.usingKeyboard) {
      const preferredButton = activeKey ? this.a11yControls.querySelector(`[data-a11y-key="${activeKey}"]`) : null;
      const focusTarget = preferredButton instanceof HTMLButtonElement ? preferredButton : firstContextualButton;
      if (focusTarget) window.requestAnimationFrame(() => focusTarget.focus());
    }
  }

  bindEvents() {
    const isCurrentQuiz = () => window.sigoQuiz === this;
    window.addEventListener('resize', () => {
      if (isCurrentQuiz()) this.resize();
    });
    const handleMotionPreferenceChange = (event) => {
      if (!isCurrentQuiz()) return;
      this.systemReducedMotion = event.matches;
      if (this.motionPreferenceExplicit) return;
      this.reducedMotion = event.matches;
      this.updateMotionControl();
      this.renderAccessibility();
    };
    if (this.motionMediaQuery?.addEventListener) this.motionMediaQuery.addEventListener('change', handleMotionPreferenceChange);
    else this.motionMediaQuery?.addListener?.(handleMotionPreferenceChange);
    window.addEventListener('keydown', (event) => {
      if (!isCurrentQuiz()) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target.isContentEditable) return;
      if (getOpenDialogs().length) return;
      this.usingKeyboard = true;
      if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        this.toggleHighContrast();
        return;
      }
      if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        this.toggleMute();
        return;
      }
      if (event.key.toLowerCase() === 'p' && ['quiz', 'feedback', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(this.screen)) {
        event.preventDefault();
        this.pauseJourney();
        return;
      }
      if (event.key.toLowerCase() === 'h' && ['feedback', 'review-feedback'].includes(this.screen)) {
        event.preventDefault();
        this.toggleHistoricalNote();
        return;
      }
      if (this.screen === 'paused' && event.key === 'Escape') {
        event.preventDefault();
        this.resumeJourney();
        return;
      }
      if (this.screen === 'quiz' && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault();
        this.handleAnswer(Number(event.key) - 1);
      }
      if (this.screen === 'review' && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault();
        this.handleReviewAnswer(Number(event.key) - 1);
      }
      if (this.screen === 'bonus' && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault();
        this.handleBonusAnswer(Number(event.key) - 1);
      }
    });
    this.renderer.domElement.addEventListener('pointermove', (event) => this.handlePointerMove(event));
    this.renderer.domElement.addEventListener('pointerdown', (event) => {
      this.usingKeyboard = false;
      this.handlePointerDown(event);
    });
    const volumeInput = document.getElementById('music-volume');
    const muteButton = document.getElementById('audio-mute');
    volumeInput?.addEventListener('input', (event) => {
      if (!isCurrentQuiz()) return;
      this.setMusicVolume(Number(event.target.value) / 100);
    });
    muteButton?.addEventListener('click', () => {
      if (!isCurrentQuiz()) return;
      this.usingKeyboard = true;
      this.toggleMute();
    });
    const motionButton = document.getElementById('motion-toggle');
    motionButton?.addEventListener('click', () => {
      if (!isCurrentQuiz()) return;
      this.usingKeyboard = true;
      this.toggleReducedMotion();
    });
    const contrastButton = document.getElementById('contrast-toggle');
    contrastButton?.addEventListener('click', () => {
      if (!isCurrentQuiz()) return;
      this.usingKeyboard = true;
      this.toggleHighContrast();
    });
    const pauseButton = document.getElementById('pause-journey');
    pauseButton?.addEventListener('click', () => {
      if (!isCurrentQuiz()) return;
      this.usingKeyboard = true;
      this.pauseJourney();
    });
    const arrivalButton = document.getElementById('arrival-sound');
    arrivalButton?.addEventListener('click', () => {
      if (!isCurrentQuiz()) return;
      this.usingKeyboard = true;
      this.playArrivalSound();
    });
    const downloadButton = document.getElementById('download-result');
    downloadButton?.addEventListener('click', () => {
      if (!isCurrentQuiz()) return;
      this.usingKeyboard = true;
      this.downloadResultCard();
    });
    const shareButton = document.getElementById('share-result');
    shareButton?.addEventListener('click', () => {
      if (!isCurrentQuiz()) return;
      this.usingKeyboard = true;
      this.shareResultCard();
    });
  }

  updateResponsiveLayout() {
    const width = Math.max(this.container.clientWidth || window.innerWidth, 1);
    const height = Math.max(this.container.clientHeight || window.innerHeight, 1);
    const aspect = width / height;
    const compact = aspect < 0.9;
    const portrait = aspect < 0.68;
    const lowHeight = height < 640;
    const uiScale = portrait ? 0.66 : compact ? 0.78 : lowHeight ? 0.84 : aspect > 1.25 ? 0.9 : 1;
    const widestPanel = 11.5 * uiScale;
    const horizontalMargin = compact ? 0.9 : 1.1;
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const tangent = Math.tan(halfFov);
    const widthDistance = (widestPanel + horizontalMargin) / (2 * tangent * aspect);
    const verticalTarget = (this.screen === 'result' ? 12.2 : 10.8) * uiScale + (compact ? 0.5 : 0.8);
    const verticalDistance = verticalTarget / (2 * tangent);
    const cameraZ = Math.max(9.5, Math.min(30, Math.max(widthDistance, verticalDistance)));

    this.layout = { aspect, compact, portrait, lowHeight, uiScale, cameraZ, textDensity: 1 / uiScale };
    this.camera.aspect = aspect;
    this.camera.position.z = cameraZ;
    const targetY = compact ? 2.3 : 2.45;
    this.camera.position.y = targetY;
    this.camera.lookAt(0, targetY, 0);
    if (this.uiGroup) this.uiGroup.scale.setScalar(uiScale);
  }

  resize() {
    this.updateResponsiveLayout();
    this.camera.updateProjectionMatrix();
    const width = Math.max(this.container.clientWidth || window.innerWidth, 1);
    const height = Math.max(this.container.clientHeight || window.innerHeight, 1);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 2));
  }

  makeTextTexture(text, {
    width = 1200,
    height = 300,
    fontSize = 48,
    color = COLORS.ink,
    font = '600 48px Georgia',
    align = 'center',
    lineHeight = null,
    padding = 36,
    uppercase = false,
    role = 'body',
    fontScale = 1
  } = {}) {
    const profile = this.getTextProfile(role);
    const density = this.layout?.textDensity ?? 1;
    const effectiveScale = profile.scale * fontScale;
    const textureWidth = Math.round(width * density);
    const textureHeight = Math.round(height * density);
    const scaledPadding = padding * density;
    const canvas = document.createElement('canvas');
    canvas.width = textureWidth;
    canvas.height = textureHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, textureWidth, textureHeight);
    const baseFont = font || `600 ${fontSize}px Georgia`;
    ctx.font = baseFont.replace(/(\d+(?:\.\d+)?)px/g, (_, size) => `${Math.round(Number(size) * density * effectiveScale)}px`);
    ctx.fillStyle = this.highContrast ? (role === 'label' ? '#ffff00' : '#ffffff') : color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    const content = uppercase ? text.toUpperCase() : text;
    const words = String(content).split(/\s+/);
    const compactAllowance = this.layout?.compact ? (this.layout.portrait ? 0.88 : 0.92) : 1;
    const maxWidth = (textureWidth - scaledPadding * 2) * compactAllowance * profile.wrap;
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
    const lineSize = fontSize * density * effectiveScale * (lineHeight ?? profile.lineHeight);
    const startY = textureHeight / 2 - ((lines.length - 1) * lineSize) / 2;
    lines.forEach((lineText, index) => {
      const x = align === 'left' ? scaledPadding : textureWidth / 2;
      ctx.fillText(lineText, x, startY + index * lineSize);
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    // Text is rendered as UI artwork, so preserve its full canvas resolution.
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  addText(parent, text, x, y, width, height, options = {}, z = 0.38) {
    const role = options.role || (String(options.font || '').includes('Georgia') ? 'heading' : 'body');
    const texture = this.makeTextTexture(text, { ...options, role });
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false })
    );
    mesh.position.set(x, y, z);
    mesh.renderOrder = 10;
    parent.add(mesh);
    return mesh;
  }

  addImage(parent, texture, x, y, width, height, z = 0.4) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false })
    );
    mesh.position.set(x, y, z);
    mesh.renderOrder = 10;
    parent.add(mesh);
    return mesh;
  }

  createPanel(width = 9.8, height = 7.6, y = 2.1) {
    const group = new THREE.Group();
    group.position.y = y;
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, 0.24),
      this.highContrast
        ? new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.85, metalness: 0.05 })
        : new THREE.MeshStandardMaterial({ map: this.parchmentTexture, color: 0xf5e8c7, roughness: 0.85, metalness: 0.05 })
    );
    panel.castShadow = true;
    panel.receiveShadow = true;
    group.add(panel);

    const frameMaterial = new THREE.MeshStandardMaterial({
      color: this.highContrast ? 0xffffff : COLORS.gold,
      emissive: this.highContrast ? 0xffff00 : 0x80531b,
      emissiveIntensity: this.highContrast ? 0.52 : 0.38,
      roughness: 0.35,
      metalness: 0.75
    });
    const rails = [
      [width + 0.18, 0.12, 0, height / 2, 0], [width + 0.18, 0.12, 0, -height / 2, 0],
      [0.12, height, -width / 2, 0, 0], [0.12, height, width / 2, 0, 0]
    ];
    rails.forEach(([sx, sy, x, yPos]) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, 0.32), frameMaterial);
      rail.position.set(x, yPos, 0.17);
      rail.castShadow = true;
      group.add(rail);
    });
    return group;
  }

  createButton(parent, label, x, y, width, action, { color = COLORS.navyLight, accent = COLORS.gold, textColor = '#fff8e7', height = 0.78, textWidth = 800, textHeight = 180, textFont = '700 34px Georgia' } = {}) {
    const group = new THREE.Group();
    const buttonColor = this.highContrast ? 0x000000 : color;
    const buttonAccent = this.highContrast ? 0xffff00 : accent;
    const buttonTextColor = this.highContrast ? '#ffffff' : textColor;
    const touchHeight = this.layout.compact ? Math.max(height, 0.92) : height;
    group.position.set(x, y, 0.42);
    group.userData.action = action;
    group.userData.baseScale = 1;
    const shadow = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.13, touchHeight + 0.13, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x2a1f17, transparent: true, opacity: 0.24, roughness: 1 })
    );
    shadow.position.set(0.04, -0.08, -0.11);
    group.add(shadow);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, touchHeight, 0.32),
      new THREE.MeshStandardMaterial({ color: buttonColor, emissive: buttonAccent, emissiveIntensity: this.highContrast ? 0.3 : 0.18, roughness: 0.32, metalness: 0.5 })
    );
    mesh.castShadow = true;
    mesh.userData.buttonRoot = group;
    group.add(mesh);
    this.addText(group, label, 0, 0, width - 0.22, touchHeight - 0.12, {
      width: textWidth, height: textHeight, fontSize: 34, font: textFont, color: buttonTextColor, role: 'button'
    }, 0.19);
    parent.add(group);
    this.interactive.push(mesh);
    return group;
  }

  clearUI() {
    if (this.uiGroup) this.scene.remove(this.uiGroup);
    this.uiGroup = new THREE.Group();
    this.uiGroup.scale.setScalar(this.layout.uiScale);
    this.resultGlow = null;
    this.resultGlowMaterial = null;
    this.interactive = [];
    this.scene.add(this.uiGroup);
  }

  renderScreen(screen) {
    this.screen = screen;
    this.resultPreparationToken += 1;
    if (screen === 'result') {
      this.resultCardCanvas = null;
      this.cardReady = false;
      this.cardGenerationPending = true;
      this.cardActionPending = false;
    } else {
      this.cardGenerationPending = false;
      this.cardActionPending = false;
    }
    persistJourneyDraft(this);
    this.updateResponsiveLayout();
    this.clearUI();
    if (screen === 'start') this.renderStart();
    if (screen === 'quiz') this.renderQuiz();
    if (screen === 'feedback' && this.feedbackState) this.renderFeedback(this.feedbackState.correct, this.getQuestion());
    if (screen === 'review') this.renderReview();
    if (screen === 'review-feedback' && this.reviewFeedbackState) this.renderReviewFeedback(this.reviewFeedbackState.correct, this.getReviewQuestion());
    if (screen === 'review-result') this.renderReviewResult();
    if (screen === 'bonus') this.renderBonus();
    if (screen === 'bonus-feedback' && this.bonusFeedbackState) this.renderBonusFeedback(this.bonusFeedbackState.correct, this.getBonusQuestion());
    if (screen === 'bonus-result') this.renderBonusResult();
    if (screen === 'paused') this.renderPause();
    if (screen === 'result') this.renderResult();
    this.addLanguageSelector();
    this.uiGroup.userData.baseY = this.uiGroup.position.y;
    this.renderAccessibility();
    this.updateAudioControl();
    this.updateMotionControl();
    this.updateContrastControl();
    this.updatePauseControl();
    this.updateArrivalControl();
    this.updateResultActions();
    this.updateVerseTools();
    this.updateJourneyHistoryControl();
    if (screen === 'result') scheduleResultPreparation(this, () => this.createResultCardCanvas());
    syncJourneyAnswerReview(this);
    syncDevotionalPause(this);
    syncThemeReviewReturnNotice(this);
    syncJourneyHistoryViewNotice(this);
    syncJourneySharePreview(this);
    syncHelpPanel(this);
  }

  renderStart() {
    const history = readJourneyHistory();
    const saved = history[0];
    const draft = readJourneyDraft();
    const panelHeight = draft ? 10.6 : saved ? 9.8 : 7.5;
    const panel = this.createPanel(9.8, panelHeight, 2.35);
    this.uiGroup.add(panel);
    // The symbol and fixed brand name are rendered together as one crisp,
    // centered mark and remain unchanged in every quiz language.
    this.addImage(panel, this.brandTexture, 0, 2.05, 6.2, 1.63, 0.39);
    this.addText(panel, this.t('quizTitle'), 0, 1.16, 8.8, 0.78, {
      width: 1400, height: 220, fontSize: 64, font: '700 64px Georgia', color: COLORS.ink, uppercase: true
    });
    this.addText(panel, this.t('subtitle'), 0, 0.42, 8.5, 0.78, {
      width: 1400, height: 220, fontSize: 46, font: '400 46px Georgia', color: '#7c5d2a'
    });
    this.addText(panel, this.t('startDescription'), 0, -0.35, 8, 0.58, {
      width: 1200, height: 170, fontSize: 31, font: '400 31px Arial', color: COLORS.mutedInk
    });
    if (draft) {
      this.addText(panel, formatJourneyDraftText(this, draft, 'draftTitle'), 0, -0.92, 8.6, 0.32, {
        width: 1300, height: 100, fontSize: 19, font: '700 19px Arial', color: '#886728', role: 'label'
      });
      this.addText(panel, getJourneyDraftSummary(this, draft), 0, -1.25, 8.9, 0.46, {
        width: 1400, height: 150, fontSize: 22, font: '400 22px Arial', color: COLORS.mutedInk
      });
      this.createButton(panel, formatJourneyDraftText(this, draft, 'draftResume'), 0, -1.86, 5.25, () => {
        this.unlockAudio();
        this.playSound(this.continueSound);
        this.resumeDraft();
      }, { color: 0x1d4a43, accent: 0x9e6b24, textWidth: 960 });
      this.createButton(panel, formatJourneyDraftText(this, draft, 'draftNew'), -2.05, -2.56, 3.75, () => {
        if (isThemeReviewDraft(draft)) this.startAnotherReview();
        else this.startAnotherJourney();
      }, {
        color: 0x39475d, accent: 0x725c37, height: 0.68, textWidth: 720, textFont: '700 25px Arial'
      });
      this.createButton(panel, formatJourneyDraftText(this, draft, 'draftDiscard'), 2.05, -2.56, 3.75, () => this.discardDraft(), {
        color: 0x4b3c32, accent: 0x725c37, height: 0.68, textWidth: 720, textFont: '700 25px Arial'
      });
    } else if (saved) {
      this.createButton(panel, formatLastJourneyText(this, 'newJourney'), 0, -1.12, 5.35, () => {
        this.unlockAudio();
        this.playSound(this.startSound);
        this.startNewJourney();
      }, { color: 0x1d4a43, accent: 0x9e6b24, textWidth: 980 });
      this.addText(panel, this.t('historyTitle'), 0, -1.82, 8.4, 0.32, {
        width: 1300, height: 100, fontSize: 19, font: '700 19px Arial', color: '#886728', role: 'label'
      });
      this.addText(panel, `${this.t('historyEntry', { date: formatJourneyDate(this, saved.completedAt), score: saved.score, total: questions.length, rank: getJourneyRankForScore(this, saved.score), language: getSavedJourneyLanguageName(saved) })} · ${this.t('markerHistory', { count: getQuestionMarkerCount(saved) })}`, 0, -2.14, 8.9, 0.34, {
        width: 1400, height: 110, fontSize: 18, font: '400 18px Arial', color: COLORS.mutedInk
      });
      this.createButton(panel, this.t('historyOpen'), -2.1, -2.68, 3.75, () => this.viewJourneyHistory(saved.id), {
        color: 0x39475d, accent: 0x725c37, height: 0.68, textWidth: 720, textFont: '700 27px Arial'
      });
      this.createButton(panel, this.t('historyClear'), 2.1, -2.68, 3.75, () => this.clearJourneyHistory(), {
        color: 0x4b3c32, accent: 0x725c37, height: 0.68, textWidth: 720, textFont: '700 27px Arial'
      });
    } else {
      this.createButton(panel, this.t('start'), 0, -1.42, 4.5, () => {
        this.unlockAudio();
        this.playSound(this.startSound);
        this.startNewJourney();
      }, { color: 0x1d4a43, accent: 0x9e6b24, textWidth: 800 });
      this.addText(panel, this.t('pointerHint'), 0, -2.55, 8, 0.48, {
        width: 1200, height: 160, fontSize: 27, font: '400 27px Arial', color: '#72572f'
      });
    }
  }

  startNewJourney() {
    clearJourneyDraft();
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.startQuiz();
  }

  startQuiz() {
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.pausedScreen = null;
    this.audioWasPlayingBeforePause = false;
    this.currentQuestionIndex = 0;
    this.questionSet = pickJourneyQuestions(questions.length);
    this.score = 0;
    this.speedPoints = 0;
    this.answerTimes = normalizeAnswerTimes([]);
    this.questionStartedAt = performance.now();
    this.hasRecordedResult = false;
    this.answerResults = [];
    this.selectedAnswers = [];
    this.questionMarkers = [];
    this.answerReviewStatus = 'all';
    this.answerReviewTheme = 'all';
    if (readJourneyHistory().length || readAchievementIds().includes('first-journey')) unlockAchievements(this, ['returning-heart']);
    this.arrivalSoundPlayed = false;
    this.arrivalStartedAt = 0;
    this.resultCardCanvas = null;
    this.renderScreen('quiz');
    window.ProgressLogger?.logProgress?.('quiz_started');
  }

  renderQuiz() {
    const q = this.getQuestion();
    const panel = this.createPanel(11.5, 8.8, 2.55);
    this.uiGroup.add(panel);
    // Keep the progress line below the compact language bar, leaving each
    // element its own breathing room on smaller notebook screens too.
    this.addText(panel, getJourneyProgressSummary(this), 0, 3.15, 10.4, 0.42, {
      width: 1400, height: 170, fontSize: 22, font: '700 22px Arial', color: '#3e7d4b', role: 'label'
    });
    this.addText(panel, q.category, -4.55, 3.55, 4.5, 0.42, {
      width: 900, height: 150, fontSize: 25, font: '700 25px Arial', color: '#886728', align: 'left'
    });
    this.addText(panel, `${this.t('question')} ${this.currentQuestionIndex + 1} / ${questions.length}`, 4.55, 3.55, 4.5, 0.42, {
      width: 900, height: 150, fontSize: 25, font: '700 25px Arial', color: '#886728', align: 'right'
    });
    this.addText(panel, q.question, 0, 2.18, 10.1, 1.34, {
      width: 1400, height: 330, fontSize: 32, font: '700 32px Georgia', color: COLORS.ink, lineHeight: 1.25
    });

    const positions = [[-2.9, 0.68], [2.9, 0.68], [-2.9, -0.46], [2.9, -0.46]];
    q.options.forEach((option, index) => {
      this.createButton(panel, `${String.fromCharCode(65 + index)}  ·  ${option}`, positions[index][0], positions[index][1], 5.1, () => this.handleAnswer(index), {
        color: 0x3b4c63, accent: 0x8f6b2a, height: 0.84, textColor: '#fff5df'
      });
    });
    this.createButton(panel, getQuestionMarkerButtonText(this, this.currentQuestionIndex), 0, -1.38, 4.8, () => toggleQuestionMarker(this, this.currentQuestionIndex), {
      color: this.questionMarkers?.[this.currentQuestionIndex] ? 0x72572f : 0x6b5a3f,
      accent: 0xb88739,
      height: 0.58,
      textWidth: 900,
      textHeight: 150,
      textFont: '700 24px Arial'
    });
    this.addText(panel, this.t('chooseHint'), 0, -2.05, 9, 0.42, {
      width: 1200, height: 140, fontSize: 24, font: '400 24px Arial', color: '#72572f'
    });
  }

  renderBonus() {
    const q = this.getBonusQuestion();
    const panel = this.createPanel(11.5, 8.8, 2.55);
    this.uiGroup.add(panel);
    this.addText(panel, this.t('bonusRoundLabel'), 0, 3.72, 9, 0.38, {
      width: 1350, height: 130, fontSize: 21, font: '700 21px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, `${this.getBonusThemeLabel()} · ${this.getBonusProgressSummary()}`, 0, 3.3, 10.4, 0.48, {
      width: 1400, height: 170, fontSize: 21, font: '700 21px Arial', color: '#3e7d4b', role: 'label'
    });
    this.addText(panel, q.question, 0, 2.28, 10.1, 1.45, {
      width: 1400, height: 330, fontSize: 36, font: '700 36px Georgia', color: COLORS.ink, lineHeight: 1.25
    });
    const positions = [[-2.9, 0.68], [2.9, 0.68], [-2.9, -0.46], [2.9, -0.46]];
    q.options.forEach((option, index) => {
      this.createButton(panel, `${String.fromCharCode(65 + index)}  ·  ${option}`, positions[index][0], positions[index][1], 5.1, () => this.handleBonusAnswer(index), {
        color: 0x3b4c63, accent: 0x8f6b2a, height: 0.84, textColor: '#fff5df'
      });
    });
    this.addText(panel, this.t('bonusChooseHint'), 0, -1.82, 9, 0.5, {
      width: 1200, height: 150, fontSize: 27, font: '400 27px Arial', color: '#72572f'
    });
  }

  renderBonusFeedback(correct, q) {
    const panel = this.createPanel(10.2, 8.8, 2.45);
    this.uiGroup.add(panel);
    this.addText(panel, `${this.getBonusThemeLabel()} · ${this.getBonusProgressSummary()}`, 0, 3.18, 9.2, 0.5, {
      width: 1400, height: 180, fontSize: 21, font: '700 21px Arial', color: '#3e7d4b', role: 'label'
    });
    this.addText(panel, correct ? this.t('bonusCorrect') : this.t('bonusAlmost'), 0, 2.38, 9, 0.72, {
      width: 1300, height: 180, fontSize: 43, font: '700 43px Georgia', color: correct ? '#3e7d4b' : '#a64f46'
    });
    const questionData = bonusQuestions[this.bonusQuestionIndices[this.bonusQuestionPosition]];
    this.addText(panel, correct ? this.t('correctMessage') : `${this.t('bonusCorrectAnswer')} ${q.options[questionData.correct]}`, 0, 1.55, 8.7, 0.58, {
      width: 1200, height: 170, fontSize: 27, font: '400 27px Arial', color: COLORS.mutedInk
    });
    this.addText(panel, this.t('bonusReflectionTitle'), 0, 0.88, 8.3, 0.34, {
      width: 1200, height: 110, fontSize: 20, font: '700 20px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, q.reflection, 0, 0.25, 8.8, 0.9, {
      width: 1400, height: 260, fontSize: 21, font: '400 21px Arial', color: COLORS.mutedInk, lineHeight: 1.18
    });
    this.addText(panel, q.verse, 0, -1.0, 8.65, 0.72, {
      width: 1300, height: 210, fontSize: 23, font: 'italic 23px Georgia', color: COLORS.ink, lineHeight: 1.2
    });
    this.createButton(panel, this.bonusQuestionPosition === this.bonusQuestionIndices.length - 1 ? this.t('bonusFinish') : this.t('continue'), 0, -2.05, 5.2, () => this.continueBonusRound(), {
      color: 0x1d4a43, accent: 0x9e6b24
    });
  }

  renderBonusResult() {
    const panel = this.createPanel(10.2, 9.1, 2.55);
    this.uiGroup.add(panel);
    const verse = this.getBonusResultQuestion();
    const verseInfo = this.getCurrentVerseInfo();
    const verseSaved = verseInfo && readFavoriteVerses().some((favorite) => favorite.id === verseInfo.id);
    this.addText(panel, this.t('bonusResultTitle'), 0, 2.92, 9, 0.48, {
      width: 1400, height: 160, fontSize: 29, font: '700 29px Georgia', color: '#85652d'
    });
    this.addText(panel, `${this.bonusScore} / ${this.bonusQuestionIndices.length}`, 0, 2.12, 8.8, 0.72, {
      width: 1100, height: 220, fontSize: 58, font: '700 58px Georgia', color: '#9a6c25'
    });
    this.addText(panel, this.t('bonusScore'), 0, 1.52, 8.8, 0.3, {
      width: 1300, height: 100, fontSize: 18, font: '700 18px Arial', color: '#3e7d4b', role: 'label'
    });
    this.addText(panel, this.t('bonusNoScore'), 0, 0.92, 8.8, 0.52, {
      width: 1400, height: 160, fontSize: 18, font: '400 18px Arial', color: COLORS.mutedInk, lineHeight: 1.18
    });
    this.addText(panel, this.t('bonusResultMessage'), 0, 0.12, 8.8, 0.76, {
      width: 1400, height: 220, fontSize: 20, font: '400 20px Arial', color: COLORS.mutedInk, lineHeight: 1.18
    });
    this.addText(panel, this.t('bonusInvitation'), 0, -0.72, 8.8, 0.62, {
      width: 1400, height: 190, fontSize: 19, font: 'italic 19px Georgia', color: COLORS.ink, lineHeight: 1.18
    });
    if (verse) {
      this.addText(panel, `${this.t('bonusVerseTitle')} · ${this.getBonusResultThemeLabel()} · ${this.t('favoriteRound')}: ${this.t('favoriteRoundBonus')}`, 0, -1.38, 8.9, 0.3, {
        width: 1400, height: 100, fontSize: 16, font: '700 16px Arial', color: '#886728', role: 'label'
      });
      this.addText(panel, verse.verse, 0, -1.84, 8.9, 0.5, {
        width: 1400, height: 150, fontSize: 18, font: 'italic 18px Georgia', color: COLORS.ink, lineHeight: 1.15
      });
      this.createButton(panel, verseSaved ? this.t('removeFavorite') : this.t('bonusSaveVerse'), 0, -2.45, 4.95, () => {
        this.toggleCurrentVerseFavorite();
        this.renderBonusState();
      }, { color: verseSaved ? 0x44526a : 0x1d4a43, accent: 0x9e6b24, textWidth: 860, textFont: '700 25px Arial' });
    }
    this.addText(panel, getAchievementSummaryText(this), 0, -3.08, 9.15, 0.28, {
      width: 1450, height: 100, fontSize: 12, font: '700 12px Arial', color: '#3e7d4b', lineHeight: 1.1
    });
    this.createButton(panel, this.t('bonusBack'), -2.35, -3.66, 4.35, () => this.returnFromBonusRound(), {
      color: 0x1d4a43, accent: 0x9e6b24, textWidth: 760
    });
    this.createButton(panel, this.t('bonusAgain'), 2.35, -3.54, 4.35, () => this.startBonusRound(), {
      color: 0x44526a, accent: 0x725c37, textWidth: 760
    });
  }

  renderReview() {
    const q = this.getReviewQuestion();
    const panel = this.createPanel(11.5, 8.8, 2.55);
    this.uiGroup.add(panel);
    this.addText(panel, this.t('reviewTitle'), 0, 3.72, 8.8, 0.38, {
      width: 1300, height: 130, fontSize: 22, font: '700 22px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, `${this.getReviewThemeLabel()} · ${this.getReviewProgressSummary()}`, 0, 3.3, 10.4, 0.48, {
      width: 1400, height: 170, fontSize: 21, font: '700 21px Arial', color: '#3e7d4b', role: 'label'
    });
    this.addText(panel, q.question, 0, 2.28, 10.1, 1.45, {
      width: 1400, height: 330, fontSize: 36, font: '700 36px Georgia', color: COLORS.ink, lineHeight: 1.25
    });
    const positions = [[-2.9, 0.68], [2.9, 0.68], [-2.9, -0.46], [2.9, -0.46]];
    q.options.forEach((option, index) => {
      this.createButton(panel, `${String.fromCharCode(65 + index)}  ·  ${option}`, positions[index][0], positions[index][1], 5.1, () => this.handleReviewAnswer(index), {
        color: 0x3b4c63, accent: 0x8f6b2a, height: 0.84, textColor: '#fff5df'
      });
    });
    const questionIndex = this.reviewQuestionIndices[this.reviewQuestionPosition];
    this.createButton(panel, getQuestionMarkerButtonText(this, questionIndex), 0, -1.38, 4.8, () => toggleQuestionMarker(this, questionIndex), {
      color: this.questionMarkers?.[questionIndex] ? 0x72572f : 0x6b5a3f,
      accent: 0xb88739,
      height: 0.58,
      textWidth: 900,
      textHeight: 150,
      textFont: '700 24px Arial'
    });
    this.addText(panel, this.t('reviewChooseHint'), 0, -2.05, 9, 0.42, {
      width: 1200, height: 140, fontSize: 24, font: '400 24px Arial', color: '#72572f'
    });
  }

  renderHistoricalNote(panel, q, { buttonY = -0.14, noteY = -0.82, buttonX = 0, buttonWidth = 5.35 } = {}) {
    const actionLabel = this.historyExpanded ? this.t('historicalCollapse') : this.t('historicalExpand');
    this.createButton(panel, `${this.t('historicalTitle')} · ${actionLabel}`, buttonX, buttonY, buttonWidth, () => this.toggleHistoricalNote(), {
      color: 0x6b5a3f,
      accent: 0xb88739,
      height: 0.58,
      textWidth: 1040,
      textHeight: 140,
      textFont: '700 20px Arial'
    });
    if (this.historyExpanded) {
      this.addText(panel, q.historicalNote, 0, noteY, 8.75, 0.86, {
        width: 1400,
        height: 250,
        fontSize: 20,
        font: '400 20px Arial',
        color: COLORS.mutedInk,
        lineHeight: 1.14
      });
    }
  }

  renderReviewFeedback(correct, q) {
    const panel = this.createPanel(10.2, 9.5, 2.45);
    this.uiGroup.add(panel);
    this.addText(panel, `${this.getReviewThemeLabel()} · ${this.getReviewProgressSummary()}`, 0, 3.34, 9.2, 0.5, {
      width: 1400, height: 180, fontSize: 21, font: '700 21px Arial', color: '#3e7d4b', role: 'label'
    });
    this.addText(panel, correct ? this.t('correct') : this.t('almost'), 0, 2.55, 9, 0.72, {
      width: 1200, height: 180, fontSize: 48, font: '700 48px Georgia', color: correct ? '#3e7d4b' : '#a64f46'
    });
    this.addText(panel, correct ? this.t('correctMessage') : `${this.t('correctAnswer')} ${q.options[getMainQuestionSet(this)[this.reviewQuestionIndices[this.reviewQuestionPosition]].correct]}`, 0, 1.72, 8.7, 0.58, {
      width: 1200, height: 170, fontSize: 29, font: '400 29px Arial', color: COLORS.mutedInk
    });
    this.addText(panel, this.t('explanationTitle'), 0, 1.02, 8.3, 0.34, {
      width: 1200, height: 110, fontSize: 20, font: '700 20px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, q.explanation, 0, 0.47, 8.8, 0.72, {
      width: 1400, height: 220, fontSize: 22, font: '400 22px Arial', color: COLORS.mutedInk, lineHeight: 1.18
    });
    const reviewQuestionIndex = this.reviewQuestionIndices[this.reviewQuestionPosition];
    this.renderHistoricalNote(panel, q, { buttonX: -2.38, buttonWidth: 4.55 });
    this.createButton(panel, getQuestionMarkerButtonText(this, reviewQuestionIndex), 2.55, -0.14, 4.15, () => toggleQuestionMarker(this, reviewQuestionIndex), {
      color: this.questionMarkers?.[reviewQuestionIndex] ? 0x72572f : 0x6b5a3f,
      accent: 0xb88739,
      height: 0.58,
      textWidth: 780,
      textHeight: 140,
      textFont: '700 21px Arial'
    });
    this.addText(panel, this.t('devotional'), 0, this.historyExpanded ? -1.32 : -0.66, 8, 0.34, {
      width: 1200, height: 110, fontSize: 20, font: '700 20px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, q.verse, 0, this.historyExpanded ? -1.92 : -1.24, 8.65, 0.82, {
      width: 1300, height: 230, fontSize: 26, font: 'italic 26px Georgia', color: COLORS.ink, lineHeight: 1.22
    });
    this.createButton(panel, this.reviewQuestionPosition === this.reviewQuestionIndices.length - 1 ? this.t('reviewFinish') : this.t('continue'), 0, this.historyExpanded ? -2.9 : -2.14, 5.2, () => this.continueThemeReview(), {
      color: 0x1d4a43, accent: 0x9e6b24
    });
  }

  renderReviewResult() {
    const panel = this.createPanel(10.2, 7.9, 2.65);
    this.uiGroup.add(panel);
    this.addText(panel, this.t('reviewTitle'), 0, 2.72, 8.9, 0.36, {
      width: 1300, height: 120, fontSize: 22, font: '700 22px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, this.getReviewThemeLabel(), 0, 2.05, 9, 0.65, {
      width: 1300, height: 180, fontSize: 40, font: '700 40px Georgia', color: COLORS.ink
    });
    const comparisonMaterial = new THREE.MeshBasicMaterial({
      color: this.highContrast ? 0x050505 : 0xfff4d3,
      transparent: true,
      opacity: this.highContrast ? 0.96 : 0.82,
      depthTest: false
    });
    [-2.35, 2.35].forEach((x) => {
      const comparisonCard = new THREE.Mesh(new THREE.BoxGeometry(4.25, 1.08, 0.1), comparisonMaterial);
      comparisonCard.position.set(x, 1.08, 0.27);
      comparisonCard.renderOrder = 9;
      panel.add(comparisonCard);
    });
    const comparisonOriginal = getThemeReviewOriginalScore(this);
    this.addText(panel, this.t('reviewOriginal'), -2.35, 1.34, 3.85, 0.24, {
      width: 650, height: 80, fontSize: 17, font: '700 17px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, `${comparisonOriginal} / ${this.reviewQuestionIndices.length}`, -2.35, 0.94, 3.85, 0.36, {
      width: 700, height: 110, fontSize: 27, font: '700 27px Arial', color: COLORS.ink
    });
    this.addText(panel, this.t('reviewCurrent'), 2.35, 1.34, 3.85, 0.24, {
      width: 650, height: 80, fontSize: 17, font: '700 17px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, `${this.reviewScore} / ${this.reviewQuestionIndices.length}`, 2.35, 0.94, 3.85, 0.36, {
      width: 700, height: 110, fontSize: 27, font: '700 27px Arial', color: '#3e7d4b'
    });
    this.addText(panel, this.t('reviewComparisonTitle'), 0, 0.42, 8.5, 0.28, {
      width: 1200, height: 90, fontSize: 18, font: '700 18px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, getThemeReviewComparisonMessage(this), 0, -0.25, 8.8, 0.82, {
      width: 1400, height: 220, fontSize: 20, font: '400 20px Arial', color: COLORS.mutedInk, lineHeight: 1.18
    });
    this.addText(panel, this.t('reviewConclusionTitle'), 0, -0.92, 8.5, 0.3, {
      width: 1200, height: 100, fontSize: 19, font: '700 19px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, this.getReviewConclusion(), 0, -1.3, 8.8, 0.58, {
      width: 1400, height: 170, fontSize: 17, font: '400 17px Arial', color: COLORS.mutedInk, lineHeight: 1.16
    });
    this.addText(panel, getAchievementSummaryText(this), 0, -1.74, 9.15, 0.34, {
      width: 1450, height: 110, fontSize: 13, font: '700 13px Arial', color: '#3e7d4b', lineHeight: 1.15
    });
    this.createButton(panel, this.t('reviewBack'), -2.35, -2.12, 4.35, () => this.returnFromThemeReview(), {
      color: 0x1d4a43, accent: 0x9e6b24, textWidth: 760
    });
    this.createButton(panel, this.t('reviewAgain'), 2.35, -1.55, 4.35, () => this.startThemeReview(this.reviewThemeKey), {
      color: 0x44526a, accent: 0x725c37, textWidth: 760
    });
  }

  handleAnswer(selectedIndex) {
    if (this.screen !== 'quiz') return;
    const questionData = getMainQuestionSet(this)[this.currentQuestionIndex];
    const q = this.getQuestion();
    const correct = selectedIndex === questionData.correct;
    if (correct) {
      this.score += 1;
      this.playSound(this.correctSound);
    } else {
      this.playSound(this.incorrectSound);
    }
    this.selectedAnswers[this.currentQuestionIndex] = selectedIndex;
    this.answerResults[this.currentQuestionIndex] = correct;
    this.historyExpanded = false;
    this.feedbackState = { correct };
    this.renderScreen('feedback');
  }

  renderFeedback(correct, q) {
    const panel = this.createPanel(10.2, 9.5, 2.45);
    this.uiGroup.add(panel);
    this.addText(panel, getJourneyProgressSummary(this), 0, 3.34, 9.2, 0.5, {
      width: 1400, height: 180, fontSize: 22, font: '700 22px Arial', color: '#3e7d4b', role: 'label'
    });
    const resultTitle = correct ? this.t('correct') : this.t('almost');
    const resultColor = correct ? '#3e7d4b' : '#a64f46';
    this.addText(panel, resultTitle, 0, 2.55, 9, 0.72, {
      width: 1200, height: 180, fontSize: 48, font: '700 48px Georgia', color: resultColor
    });
    this.addText(panel, correct ? this.t('correctMessage') : `${this.t('correctAnswer')} ${q.options[getMainQuestionSet(this)[this.currentQuestionIndex].correct]}`, 0, 1.72, 8.7, 0.58, {
      width: 1200, height: 170, fontSize: 29, font: '400 29px Arial', color: COLORS.mutedInk
    });
    this.addText(panel, this.t('explanationTitle'), 0, 1.02, 8.3, 0.34, {
      width: 1200, height: 110, fontSize: 20, font: '700 20px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, q.explanation, 0, 0.47, 8.8, 0.72, {
      width: 1400, height: 220, fontSize: 22, font: '400 22px Arial', color: COLORS.mutedInk, lineHeight: 1.18
    });
    this.renderHistoricalNote(panel, q, { buttonX: -2.38, buttonWidth: 4.55 });
    this.createButton(panel, getQuestionMarkerButtonText(this, this.currentQuestionIndex), 2.55, -0.14, 4.15, () => toggleQuestionMarker(this, this.currentQuestionIndex), {
      color: this.questionMarkers?.[this.currentQuestionIndex] ? 0x72572f : 0x6b5a3f,
      accent: 0xb88739,
      height: 0.58,
      textWidth: 780,
      textHeight: 140,
      textFont: '700 21px Arial'
    });
    this.addText(panel, this.t('devotional'), 0, this.historyExpanded ? -1.32 : -0.66, 8, 0.34, {
      width: 1200, height: 110, fontSize: 20, font: '700 20px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, q.verse, 0, this.historyExpanded ? -1.92 : -1.24, 8.65, 0.82, {
      width: 1300, height: 230, fontSize: 26, font: 'italic 26px Georgia', color: COLORS.ink, lineHeight: 1.22
    });
    this.createButton(panel, this.currentQuestionIndex === questions.length - 1 ? this.t('seeScore') : this.t('continue'), 0, this.historyExpanded ? -2.9 : -2.14, 5.2, () => {
      this.playSound(this.continueSound);
      this.currentQuestionIndex += 1;
      this.feedbackState = null;
      if (this.currentQuestionIndex >= questions.length) this.showResults();
      else this.renderScreen('quiz');
    }, { color: 0x1d4a43, accent: 0x9e6b24 });
  }

  renderPause() {
    const pauseCopy = this.getPauseCopy();
    const panel = this.createPanel(10.4, 8.5, 2.4);
    this.uiGroup.add(panel);
    this.addText(panel, pauseCopy.title, 0, 2.85, 9.2, 0.7, {
      width: 1300, height: 190, fontSize: 48, font: '700 48px Georgia', color: COLORS.ink
    });
    this.addText(panel, pauseCopy.message, 0, 2.02, 8.8, 0.84, {
      width: 1300, height: 240, fontSize: 28, font: '400 28px Arial', color: COLORS.mutedInk, lineHeight: 1.25
    });
    this.addText(panel, this.getProgressSummaryForScreen(), 0, 1.08, 9, 0.48, {
      width: 1400, height: 170, fontSize: 22, font: '700 22px Arial', color: '#3e7d4b', role: 'label'
    });
    this.addText(panel, pauseCopy.questionLabel, 0, 0.56, 8.8, 0.34, {
      width: 1200, height: 120, fontSize: 20, font: '700 20px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, this.getQuestionForProgress().question, 0, -0.23, 8.9, 1.05, {
      width: 1400, height: 280, fontSize: 31, font: '700 31px Georgia', color: COLORS.ink, lineHeight: 1.22
    });
    if (this.pausedScreen === 'feedback' || this.pausedScreen === 'review-feedback' || this.pausedScreen === 'bonus-feedback') {
      this.addText(panel, pauseCopy.reflectionContext, 0, -0.93, 8.5, 0.42, {
        width: 1300, height: 130, fontSize: 22, font: 'italic 22px Georgia', color: '#72572f'
      });
    }
    this.createButton(panel, pauseCopy.resume, -2.35, -1.72, 4.35, () => this.resumeJourney(), {
      color: 0x1d4a43, accent: 0x9e6b24, textWidth: 760
    });
    this.createButton(panel, pauseCopy.restart, 2.35, -1.72, 4.35, () => this.restartJourney(), {
      color: 0x44526a, accent: 0x725c37, textWidth: 760
    });
  }

  showResults() {
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.arrivalSoundPlayed = false;
    this.arrivalStartedAt = performance.now();
    unlockAchievements(this, ['first-journey']);
    const journeyRecord = buildLastJourneyRecord(this);
    writeLastJourney(journeyRecord);
    appendJourneyHistory(journeyRecord);
    this.renderScreen('result');
    window.ProgressLogger?.logProgress?.('quiz_completed', {
      score: this.score,
      rank: this.getRank()
    });
  }

  getRank() {
    if (this.score === 10) return this.t('master');
    if (this.score >= 7) return this.t('scholar');
    if (this.score >= 4) return this.t('beginner');
    return this.t('seed');
  }

  getResultBand() {
    if (this.score >= 8) return 'deep';
    if (this.score >= 4) return 'growing';
    return 'beginning';
  }

  getResultThemeStats() {
    if (this.isViewingSavedJourney && this.savedJourney?.themes?.length) return this.savedJourney.themes.map((theme) => ({ ...theme }));
    return buildResultThemeStats(this);
  }

  getResultWeakestTheme() {
    return getWeakestTheme(this.getResultThemeStats());
  }

  getResultWeakestThemeLabel() {
    const theme = this.getResultWeakestTheme();
    return theme ? (getThemeLabel(this, theme.key) || theme.label) : '';
  }

  getResultNextStepMessage() {
    const theme = this.getResultWeakestTheme();
    return theme
      ? this.t('nextStepMessage', { theme: this.getResultWeakestThemeLabel(), correct: theme.correct, total: theme.total })
      : '';
  }

  getResultThemes() {
    return [...this.getResultThemeStats()]
      .sort((a, b) => b.correct - a.correct || b.total - a.total || a.first - b.first)
      .slice(0, 3)
      .map((theme) => theme.label);
  }

  getResultCopy() {
    const languageCopy = RESULT_COPY[this.language] || RESULT_COPY.pt;
    return languageCopy[this.getResultBand()] || languageCopy.growing;
  }

  getResultSynthesis() {
    if (this.isViewingSavedJourney && this.savedJourney?.synthesis) return this.savedJourney.synthesis;
    const themes = this.getResultThemes().join(' · ');
    return this.getResultCopy().reflection.replaceAll('{themes}', themes);
  }

  getResultReflection() {
    return this.getResultSynthesis();
  }

  getResultVerse() {
    if (this.isViewingSavedJourney && this.savedJourney?.verse) return this.savedJourney.verse;
    return this.getResultCopy().verse;
  }

  getShortResultVerse() {
    const verse = this.getResultVerse();
    const referenceStart = verse.lastIndexOf('(');
    const quote = referenceStart > 0 ? verse.slice(0, referenceStart).trim() : verse;
    const reference = referenceStart > 0 ? ` ${verse.slice(referenceStart).trim()}` : '';
    const shortened = quote.length > 112 ? `${quote.slice(0, 109).trimEnd()}…` : quote;
    return `${shortened}${reference}`;
  }

  drawCardWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
    const visibleLines = lines.slice(0, maxLines);
    visibleLines.forEach((lineText, index) => {
      ctx.fillText(lineText, x, y + index * lineHeight);
    });
    return visibleLines.length;
  }

  drawCardTextBlock(ctx, text, {
    x,
    y,
    width,
    height,
    color,
    fontFamily = 'Arial, sans-serif',
    fontSize = 30,
    minFontSize = 20,
    fontWeight = '400',
    fontStyle = 'normal',
    lineHeight = 1.28,
    maxLines = 4,
    align = 'center'
  }) {
    const wrapAtSize = (size) => {
      ctx.font = `${fontStyle} ${fontWeight} ${size}px ${fontFamily}`;
      const words = String(text).split(/\s+/);
      const lines = [];
      let line = '';
      words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > width && line) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      });
      if (line) lines.push(line);
      return lines;
    };

    let size = fontSize;
    let lines = wrapAtSize(size);
    while (lines.length > maxLines && size > minFontSize) {
      size -= 1;
      lines = wrapAtSize(size);
    }
    if (lines.length > maxLines) {
      lines.length = maxLines;
      let lastLine = lines[maxLines - 1].replace(/[.…]+$/u, '').trimEnd();
      ctx.font = `${fontStyle} ${fontWeight} ${size}px ${fontFamily}`;
      while (lastLine && ctx.measureText(`${lastLine}…`).width > width) {
        lastLine = lastLine.slice(0, -1).trimEnd();
      }
      lines[maxLines - 1] = `${lastLine}…`;
    }

    ctx.font = `${fontStyle} ${fontWeight} ${size}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    const rowHeight = size * lineHeight;
    const blockHeight = Math.max(rowHeight, lines.length * rowHeight);
    const firstY = y + (height - blockHeight) / 2 + rowHeight / 2;
    const textX = align === 'left' ? x : x + width / 2;
    lines.forEach((lineText, index) => ctx.fillText(lineText, textX, firstY + index * rowHeight));
    return { fontSize: size, lines: lines.length };
  }

  drawCardThemeMap(ctx, palette, { x = 100, y = 750, width = 1000, height = 190 } = {}) {
    ctx.fillStyle = palette.themeMapPanel;
    ctx.strokeStyle = palette.themeMapBorder;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 22);
    ctx.fill();
    ctx.stroke();

    const stats = this.getResultThemeStats();
    const rowHeight = 42;
    const labelX = x + 30;
    const labelWidth = 470;
    const countX = x + width - 310;
    const countWidth = 280;
    const trackX = x + 30;
    const trackWidth = width - 60;
    stats.forEach((theme, index) => {
      const rowY = y + 17 + index * rowHeight;
      this.drawCardTextBlock(ctx, theme.label, {
        x: labelX, y: rowY, width: labelWidth, height: 22, color: palette.body,
        fontFamily: 'Arial, sans-serif', fontSize: 20, minFontSize: 14, fontWeight: '700', maxLines: 1, align: 'left'
      });
      this.drawCardTextBlock(ctx, formatThemeMapCount(this, theme), {
        x: countX, y: rowY, width: countWidth, height: 22, color: palette.label,
        fontFamily: 'Arial, sans-serif', fontSize: 18, minFontSize: 13, fontWeight: '700', maxLines: 1, align: 'right'
      });
      const trackY = rowY + 25;
      ctx.fillStyle = palette.themeTrack;
      ctx.fillRect(trackX, trackY, trackWidth, 8);
      const progressWidth = trackWidth * (theme.total ? theme.correct / theme.total : 0);
      if (progressWidth > 0) {
        ctx.fillStyle = palette.themeProgress;
        ctx.fillRect(trackX, trackY, progressWidth, 8);
      }
    });
  }

  createResultCardCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const cardPalette = this.highContrast
      ? {
        backdrop: '#000000',
        panel: '#000000',
        border: '#ffffff',
        secondaryBorder: '#ffffff',
        label: '#ffff00',
        heading: '#ffffff',
        body: '#ffffff',
        accent: '#ffff00',
        sun: 'rgba(255, 255, 0, 0.24)',
        imageAlpha: 0.18,
        themeMapPanel: '#111111',
        themeMapBorder: '#ffffff',
        themeTrack: '#444444',
        themeProgress: '#ffff00',
        synthesisPanel: '#111111',
        synthesisBorder: '#ffffff'
      }
      : {
        backdrop: null,
        panel: 'rgba(255, 247, 218, 0.91)',
        border: '#b88739',
        secondaryBorder: 'rgba(255, 255, 255, 0.72)',
        label: '#886728',
        heading: '#85652d',
        body: '#182942',
        accent: '#a16b27',
        sun: 'rgba(255, 220, 123, 0.48)',
        imageAlpha: 0.62,
        themeMapPanel: 'rgba(255, 252, 231, 0.9)',
        themeMapBorder: 'rgba(161, 107, 39, 0.62)',
        themeTrack: 'rgba(183, 135, 57, 0.3)',
        themeProgress: '#3e7d4b',
        synthesisPanel: 'rgba(255, 252, 231, 0.9)',
        synthesisBorder: 'rgba(161, 107, 39, 0.62)'
      };
    ctx.fillStyle = cardPalette.backdrop || '#1e3654';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const background = this.backgroundTexture?.image;
    if (background?.width && background?.height) {
      const scale = Math.max(canvas.width / background.width, canvas.height / background.height);
      const drawWidth = background.width * scale;
      const drawHeight = background.height * scale;
      ctx.globalAlpha = cardPalette.imageAlpha;
      ctx.drawImage(background, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
    } else if (!this.highContrast) {
      const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
      sky.addColorStop(0, '#1e3654');
      sky.addColorStop(0.55, '#e1a467');
      sky.addColorStop(1, '#315851');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = cardPalette.panel;
    ctx.fillRect(44, 44, canvas.width - 88, canvas.height - 88);
    ctx.strokeStyle = cardPalette.border;
    ctx.lineWidth = 5;
    ctx.strokeRect(66, 66, canvas.width - 132, canvas.height - 132);
    ctx.strokeStyle = cardPalette.secondaryBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(82, 82, canvas.width - 164, canvas.height - 164);

    const sun = ctx.createRadialGradient(950, 210, 12, 950, 210, 180);
    sun.addColorStop(0, cardPalette.sun);
    sun.addColorStop(1, this.highContrast ? 'rgba(255, 255, 0, 0)' : 'rgba(255, 220, 123, 0)');
    ctx.fillStyle = sun;
    ctx.fillRect(650, 50, 430, 360);

    const brandImage = this.brandTexture?.image;
    if (brandImage) ctx.drawImage(brandImage, 118, 98, 964, 253);

    this.drawCardTextBlock(ctx, this.t('resultTitle'), {
      x: 140, y: 365, width: 920, height: 58, color: cardPalette.heading,
      fontFamily: 'Arial, sans-serif', fontSize: 25, minFontSize: 18, fontWeight: '700', maxLines: 2, lineHeight: 1.15
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = cardPalette.accent;
    ctx.font = '700 112px Georgia, serif';
    ctx.fillText(`${this.score} / ${questions.length}`, canvas.width / 2, 515);
    this.drawCardTextBlock(ctx, `${this.t('discipleScore')} · ${this.getRank()}`, {
      x: 120, y: 555, width: 960, height: 62, color: this.highContrast ? '#ffffff' : '#3e7d4b',
      fontFamily: 'Arial, sans-serif', fontSize: 31, minFontSize: 20, fontWeight: '700', maxLines: 2, lineHeight: 1.15
    });

    ctx.strokeStyle = this.highContrast ? '#ffffff' : 'rgba(158, 107, 36, 0.42)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(170, 650);
    ctx.lineTo(1030, 650);
    ctx.stroke();

    this.drawCardTextBlock(ctx, getThemeMapCopy(this).title, {
      x: 140, y: 673, width: 920, height: 42, color: cardPalette.label,
      fontFamily: 'Arial, sans-serif', fontSize: 23, minFontSize: 16, fontWeight: '700', maxLines: 2, lineHeight: 1.15
    });
    this.drawCardTextBlock(ctx, getThemeMapCopy(this).intro, {
      x: 140, y: 713, width: 920, height: 30, color: cardPalette.heading,
      fontFamily: 'Arial, sans-serif', fontSize: 18, minFontSize: 13, maxLines: 2, lineHeight: 1.15
    });
    this.drawCardThemeMap(ctx, cardPalette);

    ctx.fillStyle = cardPalette.synthesisPanel;
    ctx.strokeStyle = cardPalette.synthesisBorder;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(100, 955, 1000, 310, 24);
    ctx.fill();
    ctx.stroke();
    this.drawCardTextBlock(ctx, this.t('reflectionTitle'), {
      x: 140, y: 972, width: 920, height: 42, color: cardPalette.label,
      fontFamily: 'Arial, sans-serif', fontSize: 23, minFontSize: 16, fontWeight: '700', maxLines: 2, lineHeight: 1.15
    });
    this.drawCardTextBlock(ctx, this.getResultSynthesis(), {
      x: 155, y: 1020, width: 890, height: 225, color: cardPalette.body,
      fontFamily: 'Arial, sans-serif', fontSize: 28, minFontSize: 19, maxLines: 5, lineHeight: 1.25
    });

    this.drawCardTextBlock(ctx, this.t('carryVerseTitle'), {
      x: 140, y: 1292, width: 920, height: 44, color: cardPalette.label,
      fontFamily: 'Arial, sans-serif', fontSize: 23, minFontSize: 16, fontWeight: '700', maxLines: 2, lineHeight: 1.15
    });
    this.drawCardTextBlock(ctx, this.getShortResultVerse(), {
      x: 155, y: 1344, width: 890, height: 195, color: cardPalette.body,
      fontFamily: 'Georgia, serif', fontSize: 29, minFontSize: 20, fontStyle: 'italic', maxLines: 5, lineHeight: 1.28
    });

    this.drawCardTextBlock(ctx, this.t('arrivalMessage'), {
      x: 175, y: 1574, width: 850, height: 70, color: this.highContrast ? '#ffffff' : '#7c5d2a',
      fontFamily: 'Georgia, serif', fontSize: 22, minFontSize: 16, maxLines: 3, lineHeight: 1.22
    });
    ctx.fillStyle = cardPalette.accent;
    ctx.fillRect(420, 1680, 360, 4);
    this.drawCardTextBlock(ctx, 'sigocomfe.com', {
      x: 200, y: 1704, width: 800, height: 44, color: this.highContrast ? '#ffffff' : '#5b745e',
      fontFamily: 'Arial, sans-serif', fontSize: 22, minFontSize: 17, fontWeight: '700', maxLines: 1
    });
    return canvas;
  }

  updateResultActions() {
    const actions = document.getElementById('result-actions');
    const downloadButton = document.getElementById('download-result');
    const shareButton = document.getElementById('share-result');
    const shareJourneyButton = document.getElementById('share-journey-link');
    const status = document.getElementById('result-action-status');
    if (!actions || !downloadButton || !shareButton || !shareJourneyButton) return;
    const eyebrow = actions.querySelector('.result-actions__eyebrow');
    const visible = this.screen === 'result';
    actions.hidden = !visible;
    if (!visible) return;
    actions.setAttribute('aria-label', this.t('resultTitle'));
    if (eyebrow) eyebrow.textContent = this.t('resultTitle');
    downloadButton.textContent = `↓  ${this.t('downloadImage')}`;
    shareButton.textContent = `↗  ${this.t('shareImage')}`;
    downloadButton.setAttribute('aria-label', this.t('downloadImage'));
    shareButton.setAttribute('aria-label', this.t('shareImage'));
    shareJourneyButton.textContent = `⌁  ${this.t('journeyShareLabel')}`;
    shareJourneyButton.setAttribute('aria-label', this.t('journeyShareLabel'));
    if (status) status.textContent = '';
    clearManualCopyAlternative();
    clearShareRecoveryActions();
  }

  announceResultAction(message, { copyText = '', labelText = '', helpText = '', recovery = null, keepRecovery = false } = {}) {
    const status = document.getElementById('result-action-status');
    if (status) status.textContent = message;
    if (!keepRecovery) clearShareRecoveryActions();
    if (copyText) showManualCopyAlternative(this, copyText, { labelText, helpText });
    else clearManualCopyAlternative();
    if (recovery) showShareRecoveryActions(this, { ...recovery, message: recovery.message || message });
    if (this.a11yStatus) this.a11yStatus.textContent = message;
  }

  resultCardBlob() {
    return new Promise((resolve, reject) => {
      if (!this.resultCardCanvas?.toBlob) {
        reject(new Error('Result card canvas is not available.'));
        return;
      }
      this.resultCardCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Result card could not be encoded.'));
      }, 'image/png');
    });
  }

  async saveResultCardFile() {
    const blob = await this.resultCardBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sigo-com-fe-${this.language}-${this.score}-${questions.length}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  }

  async downloadResultCard({ announce = true, progress = true } = {}) {
    if (this.screen !== 'result' || this.cardGenerationPending || this.cardActionPending) return false;
    const shareText = this.t('shareText', { score: this.score, total: questions.length });
    const essentialText = getEssentialResultText(this);
    if (!this.resultCardCanvas) {
      if (announce) this.announceResultAction(getCapabilityCopy(this).resultEmpty, {
        copyText: essentialText || shareText,
        recovery: { copyText: essentialText || shareText, kind: 'empty', retry: () => retryResultCardAction(this, 'download') }
      });
      return false;
    }
    const targets = getResultCardButtons(this, 'download');
    this.cardActionPending = true;
    if (progress) {
      setProgressState(this, 'card', 'preparing', { targets });
      await nextAnimationFrame();
      setProgressState(this, 'card', 'loading', { targets });
    }
    try {
      await this.saveResultCardFile();
      if (progress) setProgressState(this, 'card', 'complete', { targets });
      if (announce) this.announceResultAction(this.t('downloaded'));
      return true;
    } catch {
      if (announce) this.announceResultAction(getCapabilityCopy(this).downloadUnavailable, {
        copyText: essentialText || shareText,
        recovery: { retry: () => retryResultCardAction(this, 'download') }
      });
      return false;
    } finally {
      this.cardActionPending = false;
      if (progress) targets.forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
    }
  }

  async shareResultCard() {
    if (this.screen !== 'result' || this.cardGenerationPending || this.cardActionPending) return false;
    const capabilityCopy = getCapabilityCopy(this);
    const shareText = this.t('shareText', { score: this.score, total: questions.length });
    const essentialText = getEssentialResultText(this);
    if (!this.resultCardCanvas) {
      this.announceResultAction(capabilityCopy.resultEmpty, {
        copyText: essentialText || shareText,
        recovery: { copyText: essentialText || shareText, kind: 'empty', retry: () => retryResultCardAction(this, 'share') }
      });
      return false;
    }
    const targets = getResultCardButtons(this, 'share');
    this.cardActionPending = true;
    setProgressState(this, 'card', 'preparing', { targets });
    await nextAnimationFrame();
    setProgressState(this, 'card', 'loading', { targets });
    let finalMessage = '';
    let finalCopyText = '';
    let usedFallback = false;
    let fallbackNeedsRecovery = false;
    let cancelled = false;
    try {
      const blob = await this.resultCardBlob();
      const file = new File([blob], `sigo-com-fe-${this.language}-${this.score}.png`, { type: 'image/png' });
      if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: this.t('pageTitle'),
          text: shareText,
          files: [file]
        });
        finalMessage = this.t('shareReady');
      }
    } catch (error) {
      if (error?.name === 'AbortError') cancelled = true;
    }

    if (cancelled) {
      setProgressState(this, 'card', 'complete', { targets, announce: false });
      this.cardActionPending = false;
      return false;
    }

    if (!finalMessage) {
      usedFallback = true;
      let saved = false;
      try {
        saved = await this.saveResultCardFile();
      } catch {
        saved = false;
      }
      const copied = await copyResultText(shareText);
      fallbackNeedsRecovery = !(saved && copied);
      if (saved && copied) finalMessage = capabilityCopy.shareSavedAndCopied;
      else if (saved) {
        finalMessage = capabilityCopy.shareSavedCopyReady;
        finalCopyText = shareText;
      } else if (copied) finalMessage = capabilityCopy.shareCopyOnly;
      else {
        finalMessage = capabilityCopy.shareCopyUnavailable;
        finalCopyText = shareText;
      }
    }
    setProgressState(this, 'card', 'complete', { targets });
    this.cardActionPending = false;
    this.announceResultAction(finalMessage, {
      ...(finalCopyText ? { copyText: finalCopyText } : {}),
      recovery: usedFallback && fallbackNeedsRecovery ? {
        copyText: essentialText || shareText,
        message: capabilityCopy.shareFailed,
        retry: () => retryResultCardAction(this, 'share')
      } : null
    });
    return Boolean(finalMessage);
  }

  renderThemeMap(parent) {
    const stats = this.getResultThemeStats();
    const mapPanel = new THREE.Mesh(
      new THREE.BoxGeometry(9.35, 1.95, 0.1),
      new THREE.MeshBasicMaterial({
        color: this.highContrast ? 0x050505 : 0xfff4d3,
        transparent: true,
        opacity: this.highContrast ? 0.96 : 0.66,
        depthTest: false
      })
    );
    mapPanel.position.set(0, 0.5, 0.27);
    mapPanel.renderOrder = 9;
    parent.add(mapPanel);

    const trackMaterial = new THREE.MeshBasicMaterial({
      color: this.highContrast ? 0x444444 : 0xd9c28b,
      transparent: true,
      opacity: this.highContrast ? 1 : 0.76,
      depthTest: false
    });
    const progressMaterial = new THREE.MeshBasicMaterial({
      color: this.highContrast ? 0xffff00 : 0x3e7d4b,
      depthTest: false
    });
    const rowStart = 1.18;
    const rowStep = 0.39;
    const trackWidth = 7.7;
    stats.forEach((theme, index) => {
      const rowY = rowStart - index * rowStep;
      this.addText(parent, theme.label, -4.25, rowY + 0.12, 4.6, 0.25, {
        width: 760, height: 90, fontSize: 16, font: '700 16px Arial', color: COLORS.mutedInk, align: 'left', role: 'label'
      }, 0.39);
      this.addText(parent, formatThemeMapCount(this, theme), 4.2, rowY + 0.12, 2.45, 0.25, {
        width: 420, height: 90, fontSize: 15, font: '700 15px Arial', color: '#886728', align: 'right', role: 'label'
      }, 0.39);
      const track = new THREE.Mesh(new THREE.BoxGeometry(trackWidth, 0.09, 0.07), trackMaterial);
      track.position.set(0, rowY - 0.08, 0.34);
      track.renderOrder = 10;
      parent.add(track);
      const progressWidth = trackWidth * (theme.total ? theme.correct / theme.total : 0);
      if (progressWidth > 0) {
        const progress = new THREE.Mesh(new THREE.BoxGeometry(progressWidth, 0.09, 0.08), progressMaterial);
        progress.position.set(-trackWidth / 2 + progressWidth / 2, rowY - 0.08, 0.38);
        progress.renderOrder = 11;
        parent.add(progress);
      }
      const reviewHitArea = new THREE.Mesh(
        new THREE.BoxGeometry(9.1, 0.34, 0.1),
        new THREE.MeshBasicMaterial({ color: this.highContrast ? 0xffff00 : 0xd69d3a, transparent: true, opacity: this.highContrast ? 0.08 : 0.001, depthTest: false })
      );
      reviewHitArea.position.set(0, rowY + 0.03, 0.5);
      reviewHitArea.renderOrder = 12;
      reviewHitArea.userData.buttonRoot = reviewHitArea;
      reviewHitArea.userData.action = () => this.startThemeReview(theme.key);
      parent.add(reviewHitArea);
      this.interactive.push(reviewHitArea);
    });
  }

  renderResult() {
    const panel = this.createPanel(10.6, 11.7, 2.75);
    this.uiGroup.add(panel);
    this.resultGlow = this.addImage(panel, this.arrivalGlowTexture, 0, 0.34, 10, 10.7, 0.33);
    this.resultGlowMaterial = this.resultGlow.material;
    this.resultGlowMaterial.opacity = 0.24;
    this.addImage(panel, this.brandTexture, 0, 4.92, 4.2, 1.1, 0.39);
    this.addText(panel, this.t('resultTitle'), 0, 4.18, 9.2, 0.56, {
      width: 1300, height: 170, fontSize: 35, font: '700 35px Georgia', color: '#85652d', lineHeight: 1.15
    });
    this.addText(panel, `${this.score} / ${questions.length}`, 0, 3.34, 8, 0.8, {
      width: 1000, height: 230, fontSize: 64, font: '700 64px Georgia', color: '#9a6c25'
    });
    this.addText(panel, `${this.t('discipleScore')} · ${this.getRank()}`, 0, 2.64, 8.7, 0.44, {
      width: 1200, height: 145, fontSize: 23, font: '700 23px Arial', color: '#3e7d4b', lineHeight: 1.15
    });
    this.addText(panel, getThemeMapCopy(this).title, 0, 1.91, 8.8, 0.3, {
      width: 1200, height: 100, fontSize: 19, font: '700 19px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, getThemeMapCopy(this).intro, 0, 1.68, 8.9, 0.24, {
      width: 1400, height: 80, fontSize: 14, font: '400 14px Arial', color: COLORS.mutedInk, lineHeight: 1.1
    });
    this.renderThemeMap(panel);

    const synthesisPanel = new THREE.Mesh(
      new THREE.BoxGeometry(9.35, 1.55, 0.1),
      new THREE.MeshBasicMaterial({
        color: this.highContrast ? 0x050505 : 0xfff4d3,
        transparent: true,
        opacity: this.highContrast ? 0.96 : 0.72,
        depthTest: false
      })
    );
    synthesisPanel.position.set(0, -0.98, 0.27);
    synthesisPanel.renderOrder = 9;
    panel.add(synthesisPanel);
    this.addText(panel, this.t('reflectionTitle'), 0, -0.36, 8.8, 0.28, {
      width: 1200, height: 100, fontSize: 18, font: '700 18px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, this.getResultSynthesis(), 0, -0.88, 8.9, 0.88, {
      width: 1400, height: 250, fontSize: 20, font: '400 20px Arial', color: COLORS.mutedInk, lineHeight: 1.18
    });

    const weakestTheme = this.getResultWeakestTheme();
    if (weakestTheme) {
      const nextStepPanel = new THREE.Mesh(
        new THREE.BoxGeometry(9.35, 1.25, 0.1),
        new THREE.MeshBasicMaterial({
          color: this.highContrast ? 0x050505 : 0xfff4d3,
          transparent: true,
          opacity: this.highContrast ? 0.96 : 0.72,
          depthTest: false
        })
      );
      nextStepPanel.position.set(0, -2.25, 0.27);
      nextStepPanel.renderOrder = 9;
      panel.add(nextStepPanel);
      this.addText(panel, this.t('nextStepTitle'), 0, -1.78, 8.8, 0.28, {
        width: 1300, height: 100, fontSize: 17, font: '700 17px Arial', color: '#886728', role: 'label'
      });
      this.addText(panel, this.getResultNextStepMessage(), 0, -2.12, 8.8, 0.44, {
        width: 1400, height: 150, fontSize: 15, font: '400 15px Arial', color: COLORS.mutedInk, lineHeight: 1.16
      });
      this.createButton(panel, this.t('nextStepAction'), 0, -2.64, 4.85, () => this.startThemeReview(weakestTheme.key), {
        color: 0x1d4a43, accent: 0x9e6b24, height: 0.58, textWidth: 900, textHeight: 170, textFont: '700 25px Arial'
      });
    }

    this.addText(panel, this.t('carryVerseTitle'), 0, -3.42, 8.8, 0.28, {
      width: 1200, height: 100, fontSize: 18, font: '700 18px Arial', color: '#886728', role: 'label'
    });
    this.addText(panel, this.getShortResultVerse(), 0, -3.86, 9.2, 0.68, {
      width: 1400, height: 200, fontSize: 20, font: 'italic 20px Georgia', color: COLORS.ink, lineHeight: 1.2
    });
    this.addText(panel, this.t('arrivalMessage'), 0, -4.58, 8.8, 0.34, {
      width: 1400, height: 110, fontSize: 16, font: '400 16px Georgia', color: '#7c5d2a', lineHeight: 1.2
    });
    this.addText(panel, getAchievementSummaryText(this), 0, -4.98, 9.15, 0.42, {
      width: 1450, height: 130, fontSize: 14, font: '700 14px Arial', color: '#3e7d4b', lineHeight: 1.18
    });
    if (this.getBonusQuestionIndices().length) {
      this.createButton(panel, this.t('bonusStart'), 0, -5.28, 5.25, () => this.startBonusRound(), {
        color: 0x1d4a43, accent: 0x9e6b24, height: 0.58, textWidth: 980, textHeight: 170, textFont: '700 24px Arial'
      });
    }
  }

  addLanguageSelector() {
    // The old two-line language selector was drawn over the question header.
    // A single compact row stays above the content on every game screen.
    const spacing = 1.04;
    const buttonWidth = 0.9;
    const startX = -((LANGUAGES.length - 1) * spacing) / 2;
    LANGUAGES.forEach((language, index) => {
        const isActive = language.code === this.language;
        this.createButton(this.uiGroup, language.label, startX + index * spacing, 6.78, buttonWidth, () => this.setLanguage(language.code), {
          color: isActive ? 0x1d4a43 : 0x39475d,
          accent: isActive ? 0xe3b84f : 0x725c37,
          height: 0.44,
          textColor: '#fff3d2',
          textWidth: 400,
          textHeight: 150,
          textFont: '700 25px Arial'
        });
    });
  }

  async shareScore() {
    const text = this.t('shareText', { score: this.score, total: questions.length });
    const shareUrl = window.location.href;
    const capabilityCopy = getCapabilityCopy(this);
    const essentialText = getEssentialResultText(this);
    if (!essentialText.trim()) {
      this.announceResultAction(capabilityCopy.resultEmpty, {
        recovery: { retry: () => this.shareScore() }
      });
      return false;
    }
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: this.t('pageTitle'), text, url: shareUrl });
        this.announceResultAction(this.t('shareReady'));
        return true;
      } catch (error) {
        if (error?.name === 'AbortError') return false;
      }
    }
    const shareContent = `${text} ${shareUrl}`;
    const copied = await copyResultText(shareContent);
    this.announceResultAction(copied ? capabilityCopy.copied : capabilityCopy.shareFailed, {
      copyText: copied ? '' : shareContent,
      recovery: { copyText: essentialText, retry: () => this.shareScore() }
    });
    return copied;
  }

  showAudioNotice(kind = 'music') {
    if (this.audioNoticeKind === kind) return;
    this.audioNoticeKind = kind;
    const copy = AUDIO_COPY[this.language] || AUDIO_COPY.pt;
    const message = kind === 'effect' ? copy.effectUnavailable : copy.musicUnavailable;
    const status = document.getElementById('audio-status');
    if (status) status.textContent = message;
    if (this.a11yStatus) this.a11yStatus.textContent = message;
    window.clearTimeout(this.audioNoticeTimer);
    this.audioNoticeTimer = window.setTimeout(() => {
      if (status && this.audioNoticeKind === kind) {
        status.textContent = '';
        this.audioNoticeKind = null;
      }
    }, 6500);
  }

  syncMuteAccessibility() {
    const copy = AUDIO_COPY[this.language] || AUDIO_COPY.pt;
    const muteLabel = this.isMuted ? copy.unmute : copy.mute;
    const hiddenMute = this.a11yControls?.querySelector('[data-a11y-key="mute"]');
    if (hiddenMute) {
      hiddenMute.textContent = muteLabel;
      hiddenMute.setAttribute('aria-label', muteLabel);
      hiddenMute.setAttribute('aria-pressed', String(this.isMuted));
    }
  }

  updateAudioControl() {
    syncAudioControlVisibility(this);
    const copy = AUDIO_COPY[this.language] || AUDIO_COPY.pt;
    const audioControl = document.getElementById('audio-control');
    const label = document.getElementById('audio-label');
    const value = document.getElementById('audio-value');
    const input = document.getElementById('music-volume');
    const muteButton = document.getElementById('audio-mute');
    const percent = Math.round(this.musicVolume * 100);
    const level = copy.level.replace('{value}', String(percent));
    if (audioControl) audioControl.setAttribute('aria-label', `${copy.label}: ${level}`);
    if (label) label.textContent = copy.label;
    if (value) value.textContent = level;
    if (input) {
      input.value = String(percent);
      input.setAttribute('aria-label', `${copy.label}: ${level}`);
      input.setAttribute('aria-valuetext', level);
    }
    if (muteButton) {
      const muteLabel = this.isMuted ? copy.unmute : copy.mute;
      muteButton.textContent = this.isMuted ? '🔇' : '♫';
      muteButton.setAttribute('aria-label', muteLabel);
      muteButton.setAttribute('aria-pressed', String(this.isMuted));
      muteButton.title = muteLabel;
    }
    const status = document.getElementById('audio-status');
    if (status && this.audioNoticeKind) {
      status.textContent = this.audioNoticeKind === 'effect' ? copy.effectUnavailable : copy.musicUnavailable;
    }
    this.syncMuteAccessibility();
  }

  updateMotionControl() {
    const copy = this.getMotionCopy();
    const label = document.getElementById('motion-label');
    const status = document.getElementById('motion-status');
    const button = document.getElementById('motion-toggle');
    if (label) label.textContent = copy.label;
    if (status) status.textContent = this.getMotionStatus();
    if (button) {
      button.textContent = this.getMotionToggleLabel();
      button.setAttribute('aria-label', this.getMotionToggleLabel());
      button.setAttribute('aria-pressed', String(this.reducedMotion));
      button.title = this.getMotionStatus();
    }
  }

  updateContrastControl() {
    const copy = getContrastCopy(this);
    const label = document.getElementById('contrast-label');
    const status = document.getElementById('contrast-status');
    const button = document.getElementById('contrast-toggle');
    const buttonText = getContrastToggleLabel(this);
    if (label) label.textContent = copy.label;
    if (status) status.textContent = getContrastStatus(this);
    if (button) {
      button.textContent = buttonText;
      button.setAttribute('aria-label', buttonText);
      button.setAttribute('aria-pressed', String(this.highContrast));
      button.setAttribute('aria-keyshortcuts', 'C');
      button.title = getContrastStatus(this);
    }
  }

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    writeHighContrastPreference(this.highContrast);
    this.applyHighContrastTheme();
    if (this.brandTexture) {
      this.brandTexture.dispose();
      this.brandTexture = this.createBrandTexture();
    }
    this.renderScreen(this.screen);
    this.updateContrastControl();
    if (this.a11yStatus) this.a11yStatus.textContent = getContrastStatus(this);
  }

  toggleReducedMotion() {
    this.reducedMotion = !this.reducedMotion;
    this.motionPreferenceExplicit = true;
    window.localStorage.setItem('sigo-com-fe-reduced-motion', String(this.reducedMotion));
    if (this.reducedMotion && this.resultGlow) this.resultGlow.scale.setScalar(1);
    if (this.reducedMotion && this.uiGroup) {
      this.uiGroup.scale.setScalar(this.layout.uiScale);
      this.uiGroup.position.y = this.uiGroup.userData.baseY || 0;
    }
    persistJourneyDraft(this);
    this.updateMotionControl();
    this.renderAccessibility();
  }

  updatePauseControl() {
    const control = document.getElementById('pause-control');
    const button = document.getElementById('pause-journey');
    if (!control || !button) return;
    const visible = ['quiz', 'feedback', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(this.screen);
    const label = this.getPauseCopy().button;
    control.hidden = !visible;
    control.setAttribute('aria-label', label);
    button.textContent = `Ⅱ  ${label}`;
    button.setAttribute('aria-label', label);
    button.title = label;
  }

  pauseJourney() {
    if (!['quiz', 'feedback', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(this.screen)) return;
    this.playSound?.(this.pauseSound);
    this.pausedScreen = this.screen;
    this.audioWasPlayingBeforePause = Boolean(this.bgMusic && !this.bgMusic.paused && !this.bgMusic.ended);
    if (this.audioWasPlayingBeforePause) this.bgMusic.pause();
    this.renderScreen('paused');
  }

  resumeJourney() {
    if (this.screen !== 'paused') return;
    const resumeDraft = buildJourneyDraft(this);
    const nextScreen = this.pausedScreen || 'quiz';
    const shouldResumeAudio = this.audioWasPlayingBeforePause;
    this.pausedScreen = null;
    this.audioWasPlayingBeforePause = false;
    this.renderScreen(nextScreen);
    showJourneyResumeNotice(this, resumeDraft);
    if (shouldResumeAudio && !this.isMuted) {
      const playback = this.bgMusic?.play();
      playback?.catch?.(() => this.showAudioNotice('music'));
    }
  }

  restartJourney() {
    if (this.screen !== 'paused') return;
    this.bgMusic?.pause?.();
    this.unlockAudio();
    if (isBonusQuestionScreen(this.pausedScreen)) this.startBonusRound();
    else if (isThemeReviewQuestionScreen(this.pausedScreen)) this.startThemeReview(this.reviewThemeKey);
    else this.startQuiz();
  }

  updateArrivalControl() {
    const control = document.getElementById('arrival-control');
    const button = document.getElementById('arrival-sound');
    if (!control || !button) return;
    const copy = ARRIVAL_COPY[this.language] || ARRIVAL_COPY.pt;
    const label = this.arrivalSoundPlayed ? copy.replay : copy.button;
    control.hidden = this.screen !== 'result';
    control.setAttribute('aria-label', copy.label);
    button.textContent = `♫  ${label}`;
    button.setAttribute('aria-label', label);
    button.title = label;
  }

  playArrivalSound() {
    if (this.screen !== 'result' || !this.arrivalSound || this.isMuted || this.audioActionKind === 'arrival') return;
    const token = (this.audioProgressToken || 0) + 1;
    this.audioProgressToken = token;
    const targets = getAudioButtons(this, 'arrival');
    this.audioActionPending = true;
    this.audioActionKind = 'arrival';
    setProgressState(this, 'audio', 'preparing', { targets });
    this.arrivalSound.currentTime = 0;
    this.arrivalSound.volume = Math.max(0, Math.min(1, 0.24));
    setProgressState(this, 'audio', 'loading', { targets });
    let playback;
    try {
      playback = this.arrivalSound.play();
    } catch {
      this.audioActionPending = false;
      this.audioActionKind = null;
      targets.forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
      this.showAudioNotice('effect');
      return;
    }
    const complete = () => {
      if (this.audioProgressToken !== token) return;
      this.audioActionPending = false;
      this.audioActionKind = null;
      this.arrivalSoundPlayed = true;
      const copy = ARRIVAL_COPY[this.language] || ARRIVAL_COPY.pt;
      this.updateArrivalControl();
      this.renderAccessibility();
      setProgressState(this, 'audio', 'complete', { targets: getAudioButtons(this, 'arrival') });
      if (this.a11yStatus) this.a11yStatus.textContent = `${copy.label}. ${copy.played}.`;
    };
    playback?.then?.(complete).catch?.(() => {
      if (this.audioProgressToken !== token) return;
      this.audioActionPending = false;
      this.audioActionKind = null;
      targets.forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
      this.showAudioNotice('effect');
    });
  }

  setMusicVolume(value) {
    const clamped = clampAudioVolume(value, this.musicVolume);
    if (clamped > 0) {
      this.musicVolume = clamped;
      this.lastAudibleMusicVolume = clamped;
      this.isMuted = false;
      this.bgMusic.muted = false;
      this.bgMusic.volume = Math.max(0, Math.min(1, clamped));
    } else {
      if (this.musicVolume > 0) this.lastAudibleMusicVolume = this.musicVolume;
      this.musicVolume = 0;
      this.isMuted = true;
      this.bgMusic.volume = 0;
      this.bgMusic.muted = true;
    }
    syncAudioMuteState(this);
    writeAudioPreference({ volume: this.musicVolume, lastAudibleVolume: this.lastAudibleMusicVolume, muted: this.isMuted });
    persistJourneyDraft(this);
    this.updateAudioControl();
    this.renderAccessibility();
  }

  unlockAudio() {
    if (this.audioEnabled || this.audioUnlockPending || this.isMuted || !this.bgMusic) return;
    const token = (this.audioProgressToken || 0) + 1;
    this.audioProgressToken = token;
    const targets = getAudioButtons(this, 'ambient');
    this.audioActionPending = true;
    this.audioActionKind = 'ambient';
    setProgressState(this, 'audio', 'preparing', { targets });
    this.audioUnlockPending = true;
    let playback;
    try {
      playback = this.bgMusic.play();
    } catch {
      this.audioUnlockPending = false;
      this.audioActionPending = false;
      this.audioActionKind = null;
      targets.forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
      this.showAudioNotice('music');
      return;
    }
    setProgressState(this, 'audio', 'loading', { targets });
    const complete = () => {
      if (this.audioProgressToken !== token) return;
      this.audioUnlockPending = false;
      this.audioEnabled = true;
      this.audioActionPending = false;
      this.audioActionKind = null;
      setProgressState(this, 'audio', 'complete', { targets: getAudioButtons(this, 'ambient') });
    };
    if (!playback?.then) {
      complete();
      return;
    }
    playback.then(complete).catch(() => {
      if (this.audioProgressToken !== token) return;
      this.audioUnlockPending = false;
      this.audioEnabled = false;
      this.audioActionPending = false;
      this.audioActionKind = null;
      targets.forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
      this.showAudioNotice('music');
    });
  }

  playSound(sound) {
    if (this.isMuted || !sound) return;
    try {
      sound.currentTime = 0;
      const playback = sound.play();
      playback?.catch?.(() => this.showAudioNotice('effect'));
    } catch {
      this.showAudioNotice('effect');
    }
  }

  toggleMute() {
    if (this.isMuted || this.musicVolume === 0) {
      this.setMusicVolume(this.lastAudibleMusicVolume || 0.28);
      return;
    }
    this.setMusicVolume(0);
  }

  updatePointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  getButtonAtPointer() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.interactive, false);
    return hits.length ? hits[0].object.userData.buttonRoot : null;
  }

  handlePointerMove(event) {
    this.updatePointer(event);
    const button = this.getButtonAtPointer();
    if (this.hoveredButton && this.hoveredButton !== button) {
      this.hoveredButton.scale.setScalar(1);
    }
    this.hoveredButton = button;
    if (button) button.scale.setScalar(1.035);
    this.renderer.domElement.style.cursor = button ? 'pointer' : 'default';
  }

  handlePointerDown(event) {
    this.updatePointer(event);
    const button = this.getButtonAtPointer();
    if (!button?.userData.action) return;
    this.unlockAudio();
    button.userData.action();
  }

  deactivate() {
    this.active = false;
    this.bgMusic?.pause?.();
    this.renderer.dispose();
  }

  animate() {
    if (!this.active) return;
    requestAnimationFrame(() => this.animate());
    const now = performance.now();
    const delta = Math.min((now - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = now;
    if (!this.reducedMotion && this.screen !== 'paused') this.elapsed += delta;
    // Keep the parchment panel and its image textures perfectly steady.
    // Reduced motion also freezes the distant particles, ambient glow, and
    // arrival transition while leaving the render loop and all controls active.
    if (this.particles && !this.reducedMotion && this.screen !== 'paused') {
      this.particles.rotation.y = this.elapsed * 0.015;
      this.particles.position.y = Math.sin(this.elapsed * 0.35) * 0.12;
    }
    if (this.screen === 'result' && this.resultGlowMaterial) {
      const pulse = this.reducedMotion ? 0.24 : 0.22 + Math.sin(this.elapsed * 1.15) * 0.045;
      this.resultGlowMaterial.opacity = pulse;
      if (!this.reducedMotion && this.resultGlow) {
        const glowScale = 1 + Math.sin(this.elapsed * 0.85) * 0.018;
        this.resultGlow.scale.setScalar(glowScale);
      }
    }
    if (this.arrivalLight) {
      const arrivalSeconds = this.arrivalStartedAt ? (now - this.arrivalStartedAt) / 1000 : 99;
      const arrivalPulse = this.screen === 'result' && !this.reducedMotion && arrivalSeconds < 2.4
        ? Math.max(0, 1 - arrivalSeconds / 2.4)
        : 0;
      this.arrivalLight.intensity = 5 + arrivalPulse * 1.5;
      if (this.screen === 'result' && this.uiGroup && this.arrivalStartedAt && !this.reducedMotion && arrivalSeconds < 0.9) {
        const eased = 1 - Math.pow(1 - Math.min(arrivalSeconds / 0.9, 1), 3);
        this.uiGroup.scale.setScalar(this.layout.uiScale * (0.985 + eased * 0.015));
        this.uiGroup.position.y = (this.uiGroup.userData.baseY || 0) + (1 - eased) * 0.045;
      } else if (this.screen === 'result' && this.uiGroup) {
        this.uiGroup.scale.setScalar(this.layout.uiScale);
        this.uiGroup.position.y = this.uiGroup.userData.baseY || 0;
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
}

class AccessibleFallbackQuiz {
  constructor(container, state = {}) {
    this.container = container;
    this.usesResultActionsOverlay = false;
    this.language = state.language || getStoredLanguage();
    this.savedJourney = state.savedJourney || null;
    this.isViewingSavedJourney = Boolean(state.isViewingSavedJourney);
    this.screen = state.screen || 'start';
    this.pausedScreen = state.pausedScreen || null;
    this.audioWasPlayingBeforePause = Boolean(state.audioWasPlayingBeforePause);
    this.currentQuestionIndex = state.currentQuestionIndex || 0;
    this.score = state.score || 0;
    this.answerResults = Array.isArray(state.answerResults) ? [...state.answerResults] : [];
    this.selectedAnswers = Array.isArray(state.selectedAnswers) ? [...state.selectedAnswers] : [];
    this.questionMarkers = Array.isArray(state.questionMarkers) ? [...state.questionMarkers] : normalizeQuestionMarkers(state);
    this.answerReviewStatus = state.answerReviewStatus || 'all';
    this.answerReviewTheme = state.answerReviewTheme || 'all';
    this.feedbackState = state.feedbackState || null;
    this.historyExpanded = Boolean(state.historyExpanded);
    this.historyViewNoticeOpen = false;
    this.sharePreviewOpen = Boolean(state.sharePreviewOpen);
    this.sharedJourneyPreview = state.sharedJourneyPreview || null;
    this.historyCompareMode = false;
    this.historyComparisonOpen = false;
    this.historySelection = new Set();
    this.reviewThemeKey = state.reviewThemeKey || null;
    this.reviewQuestionIndices = Array.isArray(state.reviewQuestionIndices) ? [...state.reviewQuestionIndices] : [];
    this.reviewQuestionPosition = state.reviewQuestionPosition || 0;
    this.reviewScore = state.reviewScore || 0;
    this.reviewOriginalScoreCaptured = state.reviewOriginalScoreCaptured === true;
    this.reviewOriginalScore = Number.isFinite(Number(state.reviewOriginalScore)) ? Math.max(0, Number(state.reviewOriginalScore)) : null;
    this.reviewAnswerResults = Array.isArray(state.reviewAnswerResults) ? [...state.reviewAnswerResults] : [];
    this.reviewFeedbackState = state.reviewFeedbackState || null;
    this.reviewReturnScreen = state.reviewReturnScreen || 'result';
    this.bonusQuestionIndices = Array.isArray(state.bonusQuestionIndices) ? [...state.bonusQuestionIndices] : [];
    this.bonusQuestionPosition = Math.max(0, Number(state.bonusQuestionPosition) || 0);
    this.bonusScore = Math.max(0, Number(state.bonusScore) || 0);
    this.bonusFeedbackState = state.bonusFeedbackState || null;
    this.bonusReturnScreen = state.bonusReturnScreen || 'result';
    this.modeRecovery = Boolean(state.modeRecovery);
    this.helpOpen = false;
    this.audioControlOpen = Boolean(state.audioControlOpen);
    this.helpReturnFocus = null;
    this.collectionReturnFocus = null;
    this.historyReturnFocus = null;
    this.sharePreviewReturnFocus = null;
    this.cardGenerationPending = false;
    this.cardActionPending = false;
    this.cardReady = false;
    this.resultPreparationToken = 0;
    this.resultCardActionButton = null;
    const storedAudioPreference = readAudioPreference();
    this.isMuted = state.isMuted ?? storedAudioPreference.muted;
    this.musicVolume = clampAudioVolume(state.musicVolume ?? storedAudioPreference.volume, storedAudioPreference.volume);
    this.lastAudibleMusicVolume = clampAudioVolume(state.lastAudibleMusicVolume ?? storedAudioPreference.lastAudibleVolume, storedAudioPreference.lastAudibleVolume);
    if (this.isMuted) this.musicVolume = 0;
    this.audioEnabled = false;
    this.audioUnlockPending = false;
    this.audioNoticeKind = null;
    this.audioNoticeTimer = null;
    this.audioActionPending = false;
    this.audioActionKind = null;
    this.audioProgressToken = 0;
    this.arrivalSoundPlayed = Boolean(state.arrivalSoundPlayed);
    this.arrivalStartedAt = 0;
    this.motionPreferenceExplicit = typeof state.reducedMotion === 'boolean' || Boolean(state.motionPreferenceExplicit);
    this.reducedMotion = typeof state.reducedMotion === 'boolean'
      ? state.reducedMotion
      : readReducedMotionPreference(true);
    this.highContrast = state.highContrast ?? readHighContrastPreference();
    this.updateDocumentLanguage();
    this.devotionalPauseOpen = false;
    this.devotionalPausePaused = false;
    this.devotionalPauseIndex = 0;
    this.devotionalPauseTimer = null;
    this.devotionalPauseReturnFocus = null;
    this.devotionalPauseNeedsFocus = false;
    this.devotionalPauseStatus = '';
    ensureDevotionalPauseControls();
    this.applyHighContrastTheme();
    this.container.classList.add('fallback-mode');
    document.body.classList.add('fallback-mode');
    this.bgMusic = new Audio('assets/audio/peaceful-reflection.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = Math.max(0, Math.min(1, this.musicVolume));
    this.correctSound = new Audio('assets/audio/correct-chime.mp3');
    this.correctSound.volume = Math.max(0, Math.min(1, 0.42));
    this.incorrectSound = new Audio('assets/audio/incorrect-bell.mp3');
    this.incorrectSound.volume = Math.max(0, Math.min(1, 0.34));
    this.arrivalSound = new Audio('assets/audio/journey-arrival-chime.mp3');
    this.arrivalSound.volume = Math.max(0, Math.min(1, 0.24));
    this.startSound = createAudioCue('assets/audio/ui-start-gentle.mp3', 0.16);
    this.continueSound = createAudioCue('assets/audio/ui-continue-soft.mp3', 0.14);
    this.pauseSound = createAudioCue('assets/audio/ui-pause-breath.mp3', 0.12);
    this.languageSound = createAudioCue('assets/audio/ui-language-shimmer.mp3', 0.1);
    this.favoriteSound = createAudioCue('assets/audio/ui-favorite-warm.mp3', 0.15);
    syncAudioMuteState(this);
    ensureFavoriteControls();
    ensureJourneyHistoryControls();
    renderJourneyHistoryConfirmation(this);
    this.bindEvents();
    this.render();
    if (this.sharePreviewOpen) focusFirstDialogControl(document.querySelector('#journey-share-preview [role="dialog"]'), '#close-journey-share-preview');
  }

  t(key, values = {}) {
    let text = UI[this.language]?.[key] ?? UI.pt[key] ?? key;
    Object.entries(values).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, String(value));
    });
    return text;
  }

  getPauseCopy() {
    return PAUSE_COPY[this.language] || PAUSE_COPY.pt;
  }

  copy() {
    return FALLBACK_COPY[this.language] || FALLBACK_COPY.pt;
  }

  question() {
    const question = getMainQuestionSet(this)[this.currentQuestionIndex];
    return question[this.language] || question.pt;
  }

  reviewQuestion() {
    const question = getMainQuestionSet(this)[this.reviewQuestionIndices[this.reviewQuestionPosition]];
    return question?.[this.language] || question?.pt;
  }

  getReviewThemeLabel() {
    return getThemeLabel(this, this.reviewThemeKey);
  }

  getReviewProgressSummary() {
    return this.t('reviewProgress', {
      current: Math.min(this.reviewQuestionPosition + 1, this.reviewQuestionIndices.length),
      total: this.reviewQuestionIndices.length,
      score: this.reviewScore
    });
  }

  getReviewConclusion() {
    return getThemeReviewEntry(this, this.reviewThemeKey).conclusion || this.t('reviewIntro');
  }

  toggleHistoricalNote() {
    if (!['feedback', 'review-feedback'].includes(this.screen)) return;
    this.historyExpanded = !this.historyExpanded;
    if (typeof this.renderScreen === 'function') this.renderScreen(this.screen);
    else this.render?.();
  }

  getBonusQuestionIndices() {
    const studiedThemes = new Set(this.getResultThemeStats().map((theme) => theme.key));
    return bonusQuestions
      .map((question, index) => (studiedThemes.has(question.themeKey) ? index : -1))
      .filter((index) => index >= 0);
  }

  getBonusQuestion() {
    const question = bonusQuestions[this.bonusQuestionIndices[this.bonusQuestionPosition]];
    return question?.[this.language] || question?.pt;
  }

  getBonusResultQuestion() {
    const questionIndex = this.bonusQuestionIndices[this.bonusQuestionIndices.length - 1];
    const question = bonusQuestions[questionIndex];
    return question?.[this.language] || question?.pt;
  }

  getBonusResultThemeLabel() {
    return this.getBonusResultQuestion()?.category || '';
  }

  getBonusThemeLabel() {
    return this.getBonusQuestion()?.category || '';
  }

  getBonusProgressSummary() {
    return this.t('bonusProgress', {
      current: Math.min(this.bonusQuestionPosition + 1, this.bonusQuestionIndices.length),
      total: this.bonusQuestionIndices.length
    });
  }

  renderBonusState() {
    if (typeof this.renderScreen === 'function') this.renderScreen(this.screen);
    else this.render();
  }

  startBonusRound() {
    const questionIndices = this.getBonusQuestionIndices();
    if (!questionIndices.length) {
      this.announce?.(getBonusCopy(this).bonusNoThemes);
      return;
    }
    unlockAchievements(this, ['bonus-explorer']);
    this.bonusQuestionIndices = questionIndices;
    this.bonusQuestionPosition = 0;
    this.bonusScore = 0;
    this.bonusFeedbackState = null;
    this.bonusReturnScreen = 'result';
    this.pausedScreen = null;
    this.audioWasPlayingBeforePause = false;
    this.screen = 'bonus';
    this.renderBonusState();
  }

  handleBonusAnswer(selectedIndex) {
    if (this.screen !== 'bonus') return;
    const questionIndex = this.bonusQuestionIndices[this.bonusQuestionPosition];
    const questionData = bonusQuestions[questionIndex];
    const q = this.getBonusQuestion();
    const correct = selectedIndex === questionData.correct;
    if (correct) {
      this.bonusScore += 1;
      this.playSound(this.correctSound);
    } else {
      this.playSound(this.incorrectSound);
    }
    this.bonusFeedbackState = { correct };
    this.screen = 'bonus-feedback';
    this.renderBonusState();
  }

  continueBonusRound() {
    if (this.screen !== 'bonus-feedback') return;
    this.playSound(this.continueSound);
    this.bonusQuestionPosition += 1;
    this.bonusFeedbackState = null;
    if (this.bonusQuestionPosition >= this.bonusQuestionIndices.length) this.showBonusResult();
    else {
      this.screen = 'bonus';
      this.renderBonusState();
    }
  }

  showBonusResult() {
    this.screen = 'bonus-result';
    this.renderBonusState();
  }

  returnFromBonusRound() {
    this.pausedScreen = null;
    this.bonusFeedbackState = null;
    this.screen = this.bonusReturnScreen || 'result';
    this.renderBonusState();
  }

  startThemeReview(themeKey, startQuestionIndex = null) {
    const questionIndices = getThemeQuestionIndices(themeKey, getMainQuestionSet(this));
    if (!questionIndices.length) return;
    this.reviewThemeKey = themeKey;
    this.reviewQuestionIndices = questionIndices;
    const requestedPosition = questionIndices.indexOf(startQuestionIndex);
    this.reviewQuestionPosition = requestedPosition >= 0 ? requestedPosition : 0;
    const originalTheme = this.getResultThemeStats().find((theme) => theme.key === themeKey);
    const originalScore = Number(originalTheme?.correct);
    this.reviewOriginalScoreCaptured = Number.isFinite(originalScore);
    this.reviewOriginalScore = this.reviewOriginalScoreCaptured ? Math.max(0, originalScore) : null;
    this.reviewScore = 0;
    this.reviewAnswerResults = [];
    this.reviewFeedbackState = null;
    this.reviewReturnScreen = 'result';
    this.reviewReturnSummary = null;
    this.bonusQuestionIndices = [];
    this.bonusQuestionPosition = 0;
    this.bonusScore = 0;
    this.bonusFeedbackState = null;
    this.bonusReturnScreen = 'result';
    this.pausedScreen = null;
    this.audioWasPlayingBeforePause = false;
    this.screen = 'review';
    this.render();
  }

  reviewAnswer(selectedIndex) {
    if (this.screen !== 'review') return;
    const questionIndex = this.reviewQuestionIndices[this.reviewQuestionPosition];
    const questionData = getMainQuestionSet(this)[questionIndex];
    const q = this.reviewQuestion();
    const correct = selectedIndex === questionData.correct;
    if (correct) {
      this.reviewScore += 1;
      this.playSound(this.correctSound);
    } else {
      this.playSound(this.incorrectSound);
    }
    this.reviewAnswerResults[this.reviewQuestionPosition] = correct;
    this.historyExpanded = false;
    this.reviewFeedbackState = { correct };
    this.screen = 'review-feedback';
    this.render();
  }

  continueThemeReview() {
    if (this.screen !== 'review-feedback') return;
    this.playSound(this.continueSound);
    this.reviewQuestionPosition += 1;
    this.reviewFeedbackState = null;
    if (this.reviewQuestionPosition >= this.reviewQuestionIndices.length) this.showReviewResult();
    else {
      this.screen = 'review';
      this.render();
    }
  }

  showReviewResult() {
    unlockAchievements(this, ['theme-reviewer']);
    this.reviewReturnSummary = buildThemeReviewReturnSummary(this);
    this.reviewFeedbackState = null;
    this.pausedScreen = null;
    this.screen = this.reviewReturnScreen || 'result';
    this.render();
  }

  returnFromThemeReview() {
    this.reviewReturnSummary = buildThemeReviewReturnSummary(this);
    this.pausedScreen = null;
    this.reviewFeedbackState = null;
    this.screen = this.reviewReturnScreen || 'result';
    this.render();
  }

  progressQuestion() {
    if (isBonusQuestionScreen(this.screen) || (this.screen === 'paused' && isBonusQuestionScreen(this.pausedScreen))) return this.getBonusQuestion();
    return isThemeReviewQuestionScreen(this.screen) || (this.screen === 'paused' && isThemeReviewQuestionScreen(this.pausedScreen))
      ? this.reviewQuestion()
      : this.question();
  }

  progressSummary() {
    if (isBonusQuestionScreen(this.screen) || (this.screen === 'paused' && isBonusQuestionScreen(this.pausedScreen))) return this.getBonusProgressSummary();
    return isThemeReviewQuestionScreen(this.screen) || (this.screen === 'paused' && isThemeReviewQuestionScreen(this.pausedScreen))
      ? this.getReviewProgressSummary()
      : getJourneyProgressSummary(this);
  }

  viewSavedJourney() {
    const saved = readLastJourney();
    if (!saved) return;
    this.savedJourney = saved;
    this.isViewingSavedJourney = true;
    if (UI[saved.language]) {
      this.language = saved.language;
      this.updateDocumentLanguage();
    }
    this.score = saved.score;
    this.answerResults = [...saved.answerResults];
    this.selectedAnswers = [...(saved.selectedAnswers || normalizeSelectedAnswers(saved))];
    this.questionMarkers = [...(saved.markedQuestions || normalizeQuestionMarkers(saved))];
    this.arrivalSoundPlayed = false;
    this.screen = 'result';
    this.render();
    this.announce(getLastJourneyAnnouncement(this, saved));
  }

  clearSavedJourney() {
    clearLastJourney();
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.screen = 'start';
    this.render();
    this.announce(formatLastJourneyText(this, 'cleared'));
  }

  openJourneyHistory() {
    openJourneyHistory(this);
  }

  dismissJourneyHistoryViewNotice() {
    hideJourneyHistoryViewNotice(this);
  }

  shareJourneyLink() {
    return shareJourneyLink(this);
  }

  openJourneySharePreview(payload) {
    return openJourneySharePreview(this, payload);
  }

  closeJourneySharePreview() {
    closeJourneySharePreview(this);
  }

  closeJourneyHistory() {
    closeJourneyHistory(this);
  }

  viewJourneyHistory(id) {
    viewJourneyHistoryEntry(this, id);
  }

  deleteJourneyHistory(id) {
    requestJourneyHistoryDeletion(this, id);
  }

  clearJourneyHistory() {
    requestClearAllJourneyHistory(this);
  }

  confirmJourneyHistoryAction() {
    confirmJourneyHistoryAction(this);
  }

  cancelJourneyHistoryConfirmation() {
    closeJourneyHistoryConfirmation(this);
  }

  downloadJourneyHistory() {
    downloadJourneyHistory(this);
  }

  copyJourneyHistory() {
    copyJourneyHistory(this);
  }

  updateJourneyHistoryImportText(text) {
    updateJourneyHistoryImportText(this, text);
  }

  loadJourneyHistoryImportFile(file) {
    loadJourneyHistoryImportFile(this, file);
  }

  validateJourneyHistoryImport() {
    validateJourneyHistoryImport(this);
  }

  applyJourneyHistoryImport(mode) {
    applyJourneyHistoryImport(this, mode);
  }

  cancelJourneyHistoryImport() {
    cancelJourneyHistoryImport(this);
  }

  startJourneyComparison() {
    if (readJourneyHistory().length < 2) return;
    this.historyCompareMode = true;
    this.historyComparisonOpen = false;
    this.historySelection = new Set();
    renderJourneyHistory(this);
  }

  toggleJourneyHistorySelection(id, checked) {
    if (!this.historyCompareMode || !id) return;
    if (checked && this.historySelection.size >= 2) {
      renderJourneyHistory(this);
      return;
    }
    if (checked) this.historySelection.add(id);
    else this.historySelection.delete(id);
    renderJourneyHistory(this);
  }

  compareSelectedJourneys() {
    if (!this.historyCompareMode || this.historySelection.size !== 2) {
      announceJourneyHistory(this, 'historyCompareNeedTwo');
      return;
    }
    this.historyComparisonOpen = true;
    renderJourneyHistory(this);
    announceJourneyHistory(this, 'historyCompareOpened');
  }

  cancelJourneyComparison() {
    this.historyCompareMode = false;
    this.historyComparisonOpen = false;
    this.historySelection = new Set();
    renderJourneyHistory(this);
  }

  backFromJourneyComparison() {
    this.historyComparisonOpen = false;
    this.historyCompareMode = true;
    renderJourneyHistory(this);
  }

  updateJourneyHistoryControl() {
    syncJourneyHistoryControl(this);
  }

  resumeDraft() {
    const draft = readJourneyDraft();
    if (!applyJourneyDraft(this, draft)) return;
    this.unlockAudio();
    this.render();
    showJourneyResumeNotice(this, draft);
  }

  startAnotherJourney() {
    clearJourneyDraft();
    this.unlockAudio();
    this.playSound(this.startSound);
    this.startNewJourney();
  }

  startAnotherReview() {
    const draft = readJourneyDraft();
    if (!isThemeReviewDraft(draft) || !applyJourneyDraft(this, draft) || !this.reviewThemeKey) return;
    this.unlockAudio();
    this.playSound(this.startSound);
    this.startThemeReview(this.reviewThemeKey);
  }

  discardDraft() {
    const draft = readJourneyDraft();
    if (!draft) return;
    clearJourneyDraft();
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.screen = 'start';
    this.render();
    this.announce(formatJourneyDraftText(this, draft, 'draftDiscarded'));
  }

  openDevotionalPause() {
    openDevotionalPause(this);
  }

  closeDevotionalPause() {
    closeDevotionalPause(this);
  }

  nextDevotionalPause() {
    moveDevotionalPause(this, 1);
  }

  previousDevotionalPause() {
    moveDevotionalPause(this, -1);
  }

  toggleDevotionalPause() {
    toggleDevotionalPause(this);
  }

  getCurrentVerseInfo() {
    if ((this.screen === 'feedback' || (this.screen === 'paused' && this.pausedScreen === 'feedback')) && this.feedbackState) {
      return { id: `question-${this.currentQuestionIndex}`, kind: 'question', round: 'main', questionIndex: this.currentQuestionIndex, verse: this.question().verse };
    }
    if ((this.screen === 'review-feedback' || (this.screen === 'paused' && this.pausedScreen === 'review-feedback')) && this.reviewFeedbackState) {
      const questionIndex = this.reviewQuestionIndices[this.reviewQuestionPosition];
      return { id: `review-question-${questionIndex}`, kind: 'question', round: 'review', questionIndex, verse: this.reviewQuestion().verse };
    }
    if ((this.screen === 'bonus-feedback' || (this.screen === 'paused' && this.pausedScreen === 'bonus-feedback')) && this.bonusFeedbackState) {
      const bonusQuestionIndex = this.bonusQuestionIndices[this.bonusQuestionPosition];
      return { id: `bonus-question-${bonusQuestionIndex}`, kind: 'bonus', bonusQuestionIndex, verse: this.getBonusQuestion().verse };
    }
    if (this.screen === 'bonus-result' && this.bonusQuestionIndices.length) {
      const bonusQuestionIndex = this.bonusQuestionIndices[this.bonusQuestionIndices.length - 1];
      const question = this.getBonusResultQuestion();
      return { id: `bonus-question-${bonusQuestionIndex}`, kind: 'bonus', bonusQuestionIndex, verse: question?.verse || '' };
    }
    if (this.screen === 'result') {
      return { id: `result-${this.getResultBand()}`, kind: 'result', round: 'result', band: this.getResultBand(), verse: this.getResultVerse() };
    }
    return null;
  }

  getFavorites() {
    return readFavoriteVerses();
  }

  toggleCurrentVerseFavorite() {
    toggleVerseFavorite(this);
  }

  openFavorites() {
    openFavorites(this);
  }

  closeFavorites() {
    closeFavorites(this);
  }

  removeFavorite(id) {
    removeFavorite(this, id);
  }

  updateVerseTools() {
    syncVerseTools(this);
  }

  updateDocumentLanguage() {
    const language = getLanguage(this.language);
    document.documentElement.lang = language.htmlLang;
    document.title = this.t('pageTitle');
  }

  applyHighContrastTheme() {
    document.documentElement.classList.toggle('high-contrast', this.highContrast);
    document.body.classList.toggle('high-contrast', this.highContrast);
    this.container.classList.toggle('high-contrast', this.highContrast);
  }

  bindEvents() {
    window.addEventListener('keydown', (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target.isContentEditable) return;
      if (getOpenDialogs().length) return;
      if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        this.toggleHighContrast();
      } else if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        this.toggleMute();
      } else if (event.key.toLowerCase() === 'p' && ['quiz', 'feedback', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(this.screen)) {
        event.preventDefault();
        this.pauseJourney();
      } else if (event.key.toLowerCase() === 'h' && ['feedback', 'review-feedback'].includes(this.screen)) {
        event.preventDefault();
        this.toggleHistoricalNote();
      } else if (this.screen === 'paused' && event.key === 'Escape') {
        event.preventDefault();
        this.resumeJourney();
      } else if (this.screen === 'quiz' && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault();
        this.answer(Number(event.key) - 1);
      } else if (this.screen === 'review' && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault();
        this.reviewAnswer(Number(event.key) - 1);
      } else if (this.screen === 'bonus' && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault();
        this.handleBonusAnswer(Number(event.key) - 1);
      }
    });
    const volumeInput = document.getElementById('music-volume');
    const muteButton = document.getElementById('audio-mute');
    const motionButton = document.getElementById('motion-toggle');
    volumeInput?.addEventListener('input', (event) => this.setMusicVolume(Number(event.target.value) / 100));
    muteButton?.addEventListener('click', () => this.toggleMute());
    document.getElementById('arrival-sound')?.addEventListener('click', () => this.playArrivalSound());
    motionButton?.addEventListener('click', () => this.toggleReducedMotion());
    document.getElementById('contrast-toggle')?.addEventListener('click', () => this.toggleHighContrast());
    document.getElementById('pause-journey')?.addEventListener('click', () => this.pauseJourney());
    this.updateAudioControl();
    this.updateMotionControl();
    this.updateContrastControl();
    this.updatePauseControl();
  }

  updatePauseControl() {
    const control = document.getElementById('pause-control');
    const button = document.getElementById('pause-journey');
    if (!control || !button) return;
    const visible = ['quiz', 'feedback', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(this.screen);
    const label = this.getPauseCopy().button;
    control.hidden = !visible;
    control.setAttribute('aria-label', label);
    button.textContent = `Ⅱ  ${label}`;
    button.setAttribute('aria-label', label);
    button.title = label;
  }

  setLanguage(code) {
    if (!UI[code] || code === this.language) return;
    this.playSound?.(this.languageSound);
    if (this.isViewingSavedJourney) {
      this.isViewingSavedJourney = false;
      this.savedJourney = null;
    }
    this.language = code;
    window.localStorage.setItem('sigo-com-fe-language', code);
    this.updateDocumentLanguage();
    this.render();
    syncAchievementCelebration(this);
    if (!document.getElementById('journey-history-panel')?.hidden) renderJourneyHistory(this);
    if (!document.getElementById('journey-history-confirmation')?.hidden) renderJourneyHistoryConfirmation(this);
  }

  createButton(label, action, secondary = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `fallback-button${secondary ? ' fallback-button--secondary' : ''}`;
    button.textContent = label;
    button.addEventListener('click', action);
    return button;
  }

  renderLanguageSelector(parent) {
    const nav = document.createElement('nav');
    nav.className = 'fallback-languages';
    nav.setAttribute('aria-label', this.t('selectLanguage'));
    LANGUAGES.forEach((language) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fallback-language';
      button.textContent = language.label;
      button.setAttribute('aria-label', `${this.t('selectLanguage')}: ${language.name}`);
      button.setAttribute('aria-pressed', String(language.code === this.language));
      button.addEventListener('click', () => this.setLanguage(language.code));
      nav.appendChild(button);
    });
    parent.appendChild(nav);
  }

  createFrame() {
    const shell = document.createElement('div');
    shell.className = 'fallback-shell';
    const card = document.createElement('article');
    card.className = 'fallback-card';
    card.setAttribute('aria-live', 'polite');
    const brand = document.createElement('div');
    brand.className = 'fallback-brand';
    brand.setAttribute('aria-label', this.t('brand'));
    const symbol = document.createElement('span');
    symbol.className = 'fallback-brand__symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = '✚';
    brand.append(symbol, document.createTextNode('Sigo com Fé'));
    card.appendChild(brand);
    const notice = document.createElement('p');
    notice.className = 'fallback-notice';
    notice.textContent = `${this.copy().title}: ${this.copy().message}`;
    card.appendChild(notice);
    if (this.modeRecovery) {
      const recovery = document.createElement('p');
      recovery.className = 'fallback-recovery';
      recovery.setAttribute('role', 'status');
      recovery.textContent = this.copy().modeRecovery;
      card.appendChild(recovery);
    }
    shell.appendChild(card);
    this.renderLanguageSelector(shell);
    this.container.replaceChildren(shell);
    this.card = card;
    this.card.id = 'fallback-journey';
    this.card.tabIndex = -1;
    const a11yControls = document.getElementById('a11y-controls');
    if (a11yControls) a11yControls.hidden = true;
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.href = '#fallback-journey';
      skipLink.textContent = this.copy().keyboard;
    }
    return card;
  }

  render() {
    persistJourneyDraft(this);
    const card = this.createFrame();
    if (this.screen === 'start') this.renderStart(card);
    else if (this.screen === 'quiz') this.renderQuiz(card);
    else if (this.screen === 'feedback') this.renderFeedback(card);
    else if (this.screen === 'review') this.renderReview(card);
    else if (this.screen === 'review-feedback') this.renderReviewFeedback(card);
    else if (this.screen === 'review-result') this.renderReviewResult(card);
    else if (this.screen === 'bonus') this.renderBonus(card);
    else if (this.screen === 'bonus-feedback') this.renderBonusFeedback(card);
    else if (this.screen === 'bonus-result') this.renderBonusResult(card);
    else if (this.screen === 'paused') this.renderPause(card);
    else this.renderResult(card);
    this.announce(this.getAnnouncement());
    this.updateAudioControl();
    this.updateMotionControl();
    this.updateContrastControl();
    this.updatePauseControl();
    this.updateArrivalControl();
    this.updateVerseTools();
    this.updateJourneyHistoryControl();
    syncJourneyAnswerReview(this);
    syncDevotionalPause(this);
    syncThemeReviewReturnNotice(this);
    syncJourneyHistoryViewNotice(this);
    syncJourneySharePreview(this);
    syncHelpPanel(this);
    if (this.screen === 'result') scheduleResultPreparation(this, null, { includeCard: false });
  }

  renderStart(card) {
    const history = readJourneyHistory();
    const saved = history[0];
    const draft = readJourneyDraft();
    const kicker = document.createElement('p');
    kicker.className = 'fallback-kicker';
    kicker.textContent = this.t('brand');
    card.appendChild(kicker);
    const title = document.createElement('h1');
    title.className = 'fallback-title';
    title.textContent = this.t('quizTitle');
    card.appendChild(title);
    const subtitle = document.createElement('p');
    subtitle.className = 'fallback-subtitle';
    subtitle.textContent = this.t('subtitle');
    card.appendChild(subtitle);
    const description = document.createElement('p');
    description.className = 'fallback-subtitle';
    description.textContent = this.t('startDescription');
    card.appendChild(description);

    if (draft) {
      const draftPanel = document.createElement('section');
      draftPanel.className = 'fallback-draft-journey';
      draftPanel.setAttribute('aria-labelledby', 'fallback-draft-journey-title');
      const draftTitle = document.createElement('h2');
      draftTitle.id = 'fallback-draft-journey-title';
      draftTitle.className = 'fallback-draft-journey__title';
      draftTitle.textContent = formatJourneyDraftText(this, draft, 'draftTitle');
      const draftIntro = document.createElement('p');
      draftIntro.className = 'fallback-draft-journey__intro';
      draftIntro.textContent = formatJourneyDraftText(this, draft, 'draftIntro');
      const draftSummary = document.createElement('p');
      draftSummary.className = 'fallback-draft-journey__summary';
      draftSummary.textContent = getJourneyDraftSummary(this, draft);
      const draftActions = document.createElement('div');
      draftActions.className = 'fallback-actions fallback-draft-journey__actions';
      draftActions.append(
        this.createButton(formatJourneyDraftText(this, draft, 'draftResume'), () => {
          this.unlockAudio();
          this.playSound(this.continueSound);
          this.resumeDraft();
        }),
        this.createButton(formatJourneyDraftText(this, draft, 'draftNew'), () => isThemeReviewDraft(draft) ? this.startAnotherReview() : this.startAnotherJourney(), true),
        this.createButton(formatJourneyDraftText(this, draft, 'draftDiscard'), () => this.discardDraft(), true)
      );
      draftPanel.append(draftTitle, draftIntro, draftSummary, draftActions);
      card.appendChild(draftPanel);
    } else {
      const actions = document.createElement('div');
      actions.className = 'fallback-actions';
      actions.appendChild(this.createButton(saved ? formatLastJourneyText(this, 'newJourney') : this.copy().start, () => {
        this.unlockAudio();
        this.playSound(this.startSound);
        this.startNewJourney();
      }));
      card.appendChild(actions);
    }

    if (saved) {
      const savedPanel = document.createElement('section');
      savedPanel.className = 'fallback-saved-journey';
      savedPanel.setAttribute('aria-labelledby', 'fallback-saved-journey-title');
      const savedTitle = document.createElement('h2');
      savedTitle.id = 'fallback-saved-journey-title';
      savedTitle.className = 'fallback-saved-journey__title';
      savedTitle.textContent = this.t('historyTitle');
      const savedIntro = document.createElement('p');
      savedIntro.className = 'fallback-saved-journey__intro';
      savedIntro.textContent = this.t('historyIntro');
      const savedSummary = document.createElement('p');
      savedSummary.className = 'fallback-saved-journey__summary';
      savedSummary.textContent = `${this.t('historyEntry', { date: formatJourneyDate(this, saved.completedAt), score: saved.score, total: questions.length, rank: getJourneyRankForScore(this, saved.score), language: getSavedJourneyLanguageName(saved) })} · ${this.t('markerHistory', { count: getQuestionMarkerCount(saved) })}`;
      const savedActions = document.createElement('div');
      savedActions.className = 'fallback-actions fallback-saved-journey__actions';
      savedActions.append(
        this.createButton(this.t('historyOpen'), () => this.viewJourneyHistory(saved.id), true),
        this.createButton(this.t('historyClear'), () => this.clearJourneyHistory(), true)
      );
      savedPanel.append(savedTitle, savedIntro, savedSummary, savedActions);
      card.appendChild(savedPanel);
    }
  }

  appendProgressSummary(parent) {
    const progress = document.createElement('section');
    progress.className = 'fallback-progress';
    progress.setAttribute('aria-label', this.t('progressTitle'));

    const title = document.createElement('p');
    title.className = 'fallback-progress__title';
    title.textContent = this.t('progressTitle');

    const summary = document.createElement('p');
    summary.className = 'fallback-progress__summary';
    summary.textContent = this.progressSummary();

    const encouragement = document.createElement('p');
    encouragement.className = 'fallback-progress__encouragement';
    encouragement.textContent = this.t('progressEncouragement');

    progress.append(title, summary, encouragement);
    parent.appendChild(progress);
  }

  renderQuiz(card) {
    this.appendProgressSummary(card);
    const q = this.question();
    const meta = document.createElement('div');
    meta.className = 'fallback-meta';
    const category = document.createElement('span');
    category.textContent = q.category;
    const progress = document.createElement('span');
    progress.textContent = this.copy().questionProgress.replace('{current}', this.currentQuestionIndex + 1).replace('{total}', questions.length);
    meta.append(category, progress);
    card.appendChild(meta);
    const title = document.createElement('h1');
    title.className = 'fallback-question';
    title.textContent = q.question;
    card.appendChild(title);
    createQuestionMarkerControl(this, card, this.currentQuestionIndex);
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'fallback-options';
    const legend = document.createElement('legend');
    legend.textContent = `${this.copy().answerLabel}. ${this.copy().keyboard}`;
    fieldset.appendChild(legend);
    q.options.forEach((option, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'fallback-option';
      const button = this.createButton(`${String.fromCharCode(65 + index)} · ${option}`, () => this.answer(index));
      button.setAttribute('aria-label', `${String.fromCharCode(65 + index)}: ${option}`);
      wrapper.appendChild(button);
      fieldset.appendChild(wrapper);
    });
    card.appendChild(fieldset);
  }

  renderBonus(card) {
    const heading = document.createElement('h1');
    heading.className = 'fallback-title';
    heading.textContent = this.t('bonusTitle');
    card.appendChild(heading);
    const intro = document.createElement('p');
    intro.className = 'fallback-subtitle';
    intro.textContent = `${this.t('bonusRoundLabel')} · ${this.t('bonusIntro')}`;
    card.appendChild(intro);
    const progress = document.createElement('p');
    progress.className = 'fallback-meta';
    progress.textContent = `${this.getBonusThemeLabel()} · ${this.getBonusProgressSummary()}`;
    card.appendChild(progress);
    const q = this.getBonusQuestion();
    const title = document.createElement('h2');
    title.className = 'fallback-question';
    title.textContent = q.question;
    card.appendChild(title);
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'fallback-options';
    const legend = document.createElement('legend');
    legend.textContent = this.t('bonusChooseHint');
    fieldset.appendChild(legend);
    q.options.forEach((option, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'fallback-option';
      const button = this.createButton(`${String.fromCharCode(65 + index)} · ${option}`, () => this.handleBonusAnswer(index));
      button.setAttribute('aria-label', `${String.fromCharCode(65 + index)}: ${option}`);
      wrapper.appendChild(button);
      fieldset.appendChild(wrapper);
    });
    card.appendChild(fieldset);
  }

  renderBonusFeedback(card) {
    const progress = document.createElement('p');
    progress.className = 'fallback-meta';
    progress.textContent = `${this.getBonusThemeLabel()} · ${this.getBonusProgressSummary()}`;
    card.appendChild(progress);
    const q = this.getBonusQuestion();
    const correct = this.bonusFeedbackState?.correct;
    const questionData = bonusQuestions[this.bonusQuestionIndices[this.bonusQuestionPosition]];
    const panel = document.createElement('section');
    panel.className = `fallback-feedback fallback-feedback--${correct ? 'correct' : 'incorrect'}`;
    panel.setAttribute('aria-labelledby', 'fallback-bonus-feedback-title');
    const title = document.createElement('h2');
    title.id = 'fallback-bonus-feedback-title';
    title.textContent = correct ? this.t('bonusCorrect') : this.t('bonusAlmost');
    panel.appendChild(title);
    const message = document.createElement('p');
    message.textContent = correct ? this.t('correctMessage') : `${this.t('bonusCorrectAnswer')} ${q.options[questionData.correct]}`;
    panel.appendChild(message);
    const reflectionLabel = document.createElement('p');
    reflectionLabel.className = 'fallback-section-label';
    reflectionLabel.textContent = this.t('bonusReflectionTitle');
    panel.appendChild(reflectionLabel);
    const reflection = document.createElement('p');
    reflection.className = 'fallback-copy';
    reflection.textContent = q.reflection;
    panel.appendChild(reflection);
    const verse = document.createElement('p');
    verse.className = 'fallback-verse';
    verse.textContent = q.verse;
    panel.appendChild(verse);
    panel.appendChild(this.createButton(this.bonusQuestionPosition === this.bonusQuestionIndices.length - 1 ? this.t('bonusFinish') : this.t('continue'), () => this.continueBonusRound()));
    card.appendChild(panel);
  }

  renderBonusResult(card) {
    const title = document.createElement('h1');
    title.className = 'fallback-title';
    title.textContent = this.t('bonusResultTitle');
    card.appendChild(title);
    const score = document.createElement('p');
    score.className = 'fallback-result-score';
    score.textContent = `${this.bonusScore} / ${this.bonusQuestionIndices.length}`;
    score.setAttribute('aria-label', `${this.t('bonusScore')}: ${this.bonusScore} / ${this.bonusQuestionIndices.length}`);
    card.appendChild(score);
    const scoreLabel = document.createElement('p');
    scoreLabel.className = 'fallback-result-rank';
    scoreLabel.textContent = this.t('bonusScore');
    card.appendChild(scoreLabel);
    this.appendLabeledText(card, this.t('bonusNoScore'), this.t('bonusResultMessage'), false, 'fallback-result-synthesis');
    this.appendLabeledText(card, this.t('bonusInvitation'), this.t('bonusInvitation'), false);
    const verse = this.getBonusResultQuestion();
    if (verse) {
      this.appendLabeledText(card, `${this.t('bonusVerseTitle')} · ${this.getBonusResultThemeLabel()} · ${this.t('favoriteRound')}: ${this.t('favoriteRoundBonus')}`, verse.verse, true, 'fallback-bonus-verse');
      const verseInfo = this.getCurrentVerseInfo();
      const saved = verseInfo && readFavoriteVerses().some((favorite) => favorite.id === verseInfo.id);
      const verseAction = this.createButton(saved ? this.t('removeFavorite') : this.t('bonusSaveVerse'), () => {
        this.toggleCurrentVerseFavorite();
        this.render();
        window.requestAnimationFrame(() => document.getElementById('fallback-bonus-verse-favorite')?.focus({ preventScroll: true }));
      });
      verseAction.id = 'fallback-bonus-verse-favorite';
      verseAction.classList.add('fallback-button--secondary');
      card.appendChild(verseAction);
    }
    renderAchievementCollection(this, card, { idPrefix: 'journey-achievements-bonus-result', clearParent: false });
    const actions = document.createElement('div');
    actions.className = 'fallback-actions';
    actions.append(
      this.createButton(this.t('bonusBack'), () => this.returnFromBonusRound()),
      this.createButton(this.t('bonusAgain'), () => this.startBonusRound(), true)
    );
    card.appendChild(actions);
  }

  renderReview(card) {
    const heading = document.createElement('h1');
    heading.className = 'fallback-title';
    heading.textContent = this.t('reviewTitle');
    card.appendChild(heading);
    const intro = document.createElement('p');
    intro.className = 'fallback-subtitle';
    intro.textContent = `${this.getReviewThemeLabel()} · ${this.t('reviewIntro')}`;
    card.appendChild(intro);
    const progress = document.createElement('p');
    progress.className = 'fallback-meta';
    progress.textContent = this.getReviewProgressSummary();
    card.appendChild(progress);
    const q = this.reviewQuestion();
    const title = document.createElement('h2');
    title.className = 'fallback-question';
    title.textContent = q.question;
    card.appendChild(title);
    createQuestionMarkerControl(this, card, this.reviewQuestionIndices[this.reviewQuestionPosition]);
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'fallback-options';
    const legend = document.createElement('legend');
    legend.textContent = `${this.copy().answerLabel}. ${this.t('reviewChooseHint')}`;
    fieldset.appendChild(legend);
    q.options.forEach((option, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'fallback-option';
      const button = this.createButton(`${String.fromCharCode(65 + index)} · ${option}`, () => this.reviewAnswer(index));
      button.setAttribute('aria-label', `${String.fromCharCode(65 + index)}: ${option}`);
      wrapper.appendChild(button);
      fieldset.appendChild(wrapper);
    });
    card.appendChild(fieldset);
  }

  appendHistoricalNote(parent, q) {
    const history = document.createElement('details');
    history.className = 'fallback-history';
    history.open = this.historyExpanded;
    history.addEventListener('toggle', () => {
      this.historyExpanded = history.open;
      this.announce(this.getAnnouncement());
    });
    const summary = document.createElement('summary');
    summary.textContent = this.t('historicalTitle');
    const note = document.createElement('p');
    note.className = 'fallback-copy';
    note.textContent = q.historicalNote;
    history.append(summary, note);
    parent.appendChild(history);
  }

  renderReviewFeedback(card) {
    const progress = document.createElement('p');
    progress.className = 'fallback-meta';
    progress.textContent = `${this.getReviewThemeLabel()} · ${this.getReviewProgressSummary()}`;
    card.appendChild(progress);
    const q = this.reviewQuestion();
    const correct = this.reviewFeedbackState?.correct;
    const panel = document.createElement('section');
    panel.className = `fallback-feedback fallback-feedback--${correct ? 'correct' : 'incorrect'}`;
    panel.setAttribute('aria-labelledby', 'fallback-review-feedback-title');
    const title = document.createElement('h2');
    title.id = 'fallback-review-feedback-title';
    title.textContent = correct ? this.t('correct') : this.t('almost');
    panel.appendChild(title);
    const message = document.createElement('p');
    message.textContent = correct ? this.t('correctMessage') : `${this.t('correctAnswer')} ${q.options[getMainQuestionSet(this)[this.reviewQuestionIndices[this.reviewQuestionPosition]].correct]}`;
    panel.appendChild(message);
    const explanationLabel = document.createElement('p');
    explanationLabel.className = 'fallback-section-label';
    explanationLabel.textContent = this.t('explanationTitle');
    panel.appendChild(explanationLabel);
    const explanation = document.createElement('p');
    explanation.className = 'fallback-copy';
    explanation.textContent = q.explanation;
    panel.appendChild(explanation);
    this.appendHistoricalNote(panel, q);
    const devotional = document.createElement('p');
    devotional.className = 'fallback-section-label';
    devotional.textContent = this.t('devotional');
    panel.appendChild(devotional);
    const verse = document.createElement('p');
    verse.className = 'fallback-verse';
    verse.textContent = q.verse;
    panel.appendChild(verse);
    createQuestionMarkerControl(this, panel, this.reviewQuestionIndices[this.reviewQuestionPosition]);
    panel.appendChild(this.createButton(this.reviewQuestionPosition === this.reviewQuestionIndices.length - 1 ? this.t('reviewFinish') : this.copy().continue, () => this.continueThemeReview()));
    card.appendChild(panel);
  }

  renderReviewResult(card) {
    const title = document.createElement('h1');
    title.className = 'fallback-title';
    title.textContent = this.t('reviewTitle');
    card.appendChild(title);
    const theme = document.createElement('h2');
    theme.className = 'fallback-question';
    theme.textContent = this.getReviewThemeLabel();
    card.appendChild(theme);
    const score = document.createElement('p');
    score.className = 'fallback-result-score fallback-review-score';
    score.textContent = `${this.reviewScore} / ${this.reviewQuestionIndices.length}`;
    score.setAttribute('aria-label', `${this.t('reviewScore')}: ${this.reviewScore} / ${this.reviewQuestionIndices.length}`);
    card.appendChild(score);
    renderAchievementCollection(this, card, { idPrefix: 'journey-achievements-review-result', clearParent: false });
    card.appendChild(createMarkedQuestionsSection(this, {
      themeKey: this.reviewThemeKey,
      idPrefix: 'journey-marked-review-questions-fallback'
    }));

    const comparison = document.createElement('section');
    comparison.className = 'fallback-review-comparison';
    comparison.setAttribute('aria-labelledby', 'fallback-review-comparison-title');
    const comparisonTitle = document.createElement('h2');
    comparisonTitle.id = 'fallback-review-comparison-title';
    comparisonTitle.className = 'fallback-review-comparison__title';
    comparisonTitle.textContent = this.t('reviewComparisonTitle');
    const comparisonCards = document.createElement('div');
    comparisonCards.className = 'fallback-review-comparison__cards';
    [[this.t('reviewOriginal'), getThemeReviewOriginalScore(this)], [this.t('reviewCurrent'), this.reviewScore]].forEach(([label, value]) => {
      const comparisonCard = document.createElement('article');
      comparisonCard.className = 'fallback-review-comparison__card';
      const comparisonLabel = document.createElement('p');
      comparisonLabel.className = 'fallback-review-comparison__label';
      comparisonLabel.textContent = label;
      const comparisonScore = document.createElement('p');
      comparisonScore.className = 'fallback-review-comparison__score';
      comparisonScore.textContent = `${value} / ${this.reviewQuestionIndices.length}`;
      comparisonCard.append(comparisonLabel, comparisonScore);
      comparisonCards.appendChild(comparisonCard);
    });
    const comparisonMessage = document.createElement('p');
    comparisonMessage.className = 'fallback-review-comparison__message';
    comparisonMessage.textContent = getThemeReviewComparisonMessage(this);
    comparison.append(comparisonTitle, comparisonCards, comparisonMessage);
    card.appendChild(comparison);

    this.appendLabeledText(card, this.t('reviewConclusionTitle'), this.getReviewConclusion(), false, 'fallback-result-synthesis');
    const actions = document.createElement('div');
    actions.className = 'fallback-actions';
    actions.append(
      this.createButton(this.t('reviewBack'), () => this.returnFromThemeReview()),
      this.createButton(this.t('reviewAgain'), () => this.startThemeReview(this.reviewThemeKey), true)
    );
    card.appendChild(actions);
  }

  renderFeedback(card) {
    this.appendProgressSummary(card);
    const q = this.question();
    const correct = this.feedbackState?.correct;
    const panel = document.createElement('section');
    panel.className = `fallback-feedback fallback-feedback--${correct ? 'correct' : 'incorrect'}`;
    panel.setAttribute('aria-labelledby', 'fallback-feedback-title');
    const title = document.createElement('h2');
    title.id = 'fallback-feedback-title';
    title.textContent = correct ? this.t('correct') : this.t('almost');
    panel.appendChild(title);
    const message = document.createElement('p');
    message.textContent = correct ? this.t('correctMessage') : `${this.t('correctAnswer')} ${q.options[getMainQuestionSet(this)[this.currentQuestionIndex].correct]}`;
    panel.appendChild(message);
    const explanationLabel = document.createElement('p');
    explanationLabel.className = 'fallback-section-label';
    explanationLabel.textContent = this.t('explanationTitle');
    panel.appendChild(explanationLabel);
    const explanation = document.createElement('p');
    explanation.className = 'fallback-copy';
    explanation.textContent = q.explanation;
    panel.appendChild(explanation);
    this.appendHistoricalNote(panel, q);
    const devotional = document.createElement('p');
    devotional.className = 'fallback-section-label';
    devotional.textContent = this.t('devotional');
    panel.appendChild(devotional);
    const verse = document.createElement('p');
    verse.className = 'fallback-verse';
    verse.textContent = q.verse;
    panel.appendChild(verse);
    createQuestionMarkerControl(this, panel, this.currentQuestionIndex);
    panel.appendChild(this.createButton(this.currentQuestionIndex === questions.length - 1 ? this.t('seeScore') : this.copy().continue, () => {
      this.playSound(this.continueSound);
      this.currentQuestionIndex += 1;
      this.feedbackState = null;
      if (this.currentQuestionIndex >= questions.length) this.showResults();
      else {
        this.screen = 'quiz';
        this.render();
      }
    }));
    card.appendChild(panel);
  }

  renderPause(card) {
    const pauseCopy = this.getPauseCopy();
    const title = document.createElement('h1');
    title.className = 'fallback-title';
    title.textContent = pauseCopy.title;
    card.appendChild(title);

    const message = document.createElement('p');
    message.className = 'fallback-subtitle';
    message.textContent = pauseCopy.message;
    card.appendChild(message);

    this.appendProgressSummary(card);
    const questionLabel = document.createElement('p');
    questionLabel.className = 'fallback-section-label';
    questionLabel.textContent = pauseCopy.questionLabel;
    card.appendChild(questionLabel);

    const question = document.createElement('p');
    question.className = 'fallback-question';
    question.textContent = this.progressQuestion().question;
    card.appendChild(question);

    if (this.pausedScreen === 'feedback' || this.pausedScreen === 'review-feedback' || this.pausedScreen === 'bonus-feedback') {
      const context = document.createElement('p');
      context.className = 'fallback-copy';
      context.textContent = pauseCopy.reflectionContext;
      card.appendChild(context);
    }

    const actions = document.createElement('div');
    actions.className = 'fallback-actions';
    actions.appendChild(this.createButton(pauseCopy.resume, () => this.resumeJourney()));
    actions.appendChild(this.createButton(pauseCopy.restart, () => this.restartJourney(), true));
    card.appendChild(actions);
  }

  appendResultThemeMap(parent) {
    const section = document.createElement('section');
    section.className = 'fallback-theme-map';
    section.setAttribute('aria-labelledby', 'fallback-theme-map-title');
    const title = document.createElement('h2');
    title.id = 'fallback-theme-map-title';
    title.className = 'fallback-theme-map__title';
    title.textContent = getThemeMapCopy(this).title;
    const intro = document.createElement('p');
    intro.className = 'fallback-theme-map__intro';
    intro.textContent = getThemeMapCopy(this).intro;
    const list = document.createElement('div');
    list.className = 'fallback-theme-map__list';
    this.getResultThemeStats().forEach((theme) => {
      const row = document.createElement('article');
      row.className = 'fallback-theme-map__row';
      const head = document.createElement('div');
      head.className = 'fallback-theme-map__row-head';
      const label = document.createElement('h3');
      label.className = 'fallback-theme-map__label';
      label.textContent = theme.label;
      const count = document.createElement('span');
      count.className = 'fallback-theme-map__count';
      count.textContent = formatThemeMapCount(this, theme);
      head.append(label, count);
      const progress = document.createElement('div');
      progress.className = 'fallback-theme-map__progress';
      progress.setAttribute('role', 'progressbar');
      progress.setAttribute('aria-label', `${formatThemeMapText(this, 'progressLabel', theme)} · ${this.t('markerThemeCount', { count: getThemeMarkedCount(this, theme.key) })}`);
      progress.setAttribute('aria-valuemin', '0');
      progress.setAttribute('aria-valuemax', String(theme.total));
      progress.setAttribute('aria-valuenow', String(theme.correct));
      const fill = document.createElement('span');
      fill.className = 'fallback-theme-map__fill';
      fill.style.width = `${theme.total ? (theme.correct / theme.total) * 100 : 0}%`;
      progress.appendChild(fill);
      const reviewButton = this.createButton(getThemeMapCopy(this).reviewAction, () => this.startThemeReview(theme.key), true);
      reviewButton.className += ' fallback-theme-map__review';
      reviewButton.setAttribute('aria-label', `${getThemeMapCopy(this).reviewAction}: ${theme.label}`);
      row.append(head, progress, reviewButton);
      list.appendChild(row);
    });
    section.append(title, intro, list);
    parent.appendChild(section);
  }

  appendResultNextStep(parent) {
    const weakestTheme = this.getResultWeakestTheme();
    if (!weakestTheme) return;
    const section = document.createElement('section');
    section.className = 'fallback-next-step';
    section.setAttribute('aria-labelledby', 'fallback-next-step-title');
    const title = document.createElement('h2');
    title.id = 'fallback-next-step-title';
    title.className = 'fallback-next-step__title';
    title.textContent = this.t('nextStepTitle');
    const message = document.createElement('p');
    message.className = 'fallback-next-step__message';
    message.textContent = this.getResultNextStepMessage();
    const action = this.createButton(this.t('nextStepAction'), () => this.startThemeReview(weakestTheme.key));
    action.className += ' fallback-next-step__button';
    action.setAttribute('aria-label', `${this.t('nextStepAction')}: ${this.getResultWeakestThemeLabel()}`);
    section.append(title, message, action);
    parent.appendChild(section);
  }

  renderResult(card) {
    const title = document.createElement('h1');
    title.className = 'fallback-title';
    title.textContent = this.t('resultTitle');
    card.appendChild(title);
    const score = document.createElement('p');
    score.className = 'fallback-result-score';
    score.textContent = `${this.score} / ${questions.length}`;
    score.setAttribute('aria-label', `${this.t('discipleScore')}: ${this.score} / ${questions.length}`);
    card.appendChild(score);
    const rank = document.createElement('p');
    rank.className = 'fallback-result-rank';
    rank.textContent = `${this.t('discipleScore')} · ${this.getRank()}`;
    card.appendChild(rank);
    this.appendResultThemeMap(card);
    renderAchievementCollection(this, card, { idPrefix: 'journey-achievements-result', clearParent: false });
    card.appendChild(createJourneyAnswerReview(this));
    card.appendChild(createMarkedQuestionsSection(this, { idPrefix: 'journey-marked-questions-fallback' }));
    this.appendLabeledText(card, this.t('reflectionTitle'), this.getResultSynthesis(), false, 'fallback-result-synthesis');
    this.appendResultNextStep(card);
    this.appendLabeledText(card, this.t('carryVerseTitle'), this.getResultVerse(), true);
    this.appendLabeledText(card, this.t('arrivalMessage'), this.t('arrivalMessage'));
    const actions = document.createElement('div');
    actions.id = 'fallback-result-actions';
    actions.className = 'fallback-actions';
    actions.appendChild(this.createButton(this.copy().share, () => this.shareScore(), true));
    actions.appendChild(this.createButton(`⌁  ${this.t('journeyShareLabel')}`, () => this.shareJourneyLink(), true));
    actions.appendChild(this.createButton(this.copy().restart, () => this.startNewJourney()));
    const articles = this.createButton(this.copy().openArticles, () => window.open('https://sigocomfe.com', '_blank', 'noopener'), true);
    actions.appendChild(articles);
    card.appendChild(actions);
    const status = document.createElement('p');
    status.id = 'fallback-result-action-status';
    status.className = 'fallback-action-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    card.appendChild(status);
  }

  appendLabeledText(parent, label, text, verse = false, sectionClass = '') {
    const section = document.createElement('section');
    if (sectionClass) section.className = sectionClass;
    const heading = document.createElement('h2');
    heading.className = 'fallback-section-label';
    heading.textContent = label;
    const content = document.createElement('p');
    content.className = `fallback-copy${verse ? ' fallback-copy--verse' : ''}`;
    content.textContent = text;
    section.append(heading, content);
    parent.appendChild(section);
  }

  startNewJourney() {
    clearJourneyDraft();
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.startQuiz();
  }

  startQuiz() {
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.pausedScreen = null;
    this.audioWasPlayingBeforePause = false;
    this.currentQuestionIndex = 0;
    this.questionSet = pickJourneyQuestions(questions.length);
    this.score = 0;
    this.speedPoints = 0;
    this.answerTimes = normalizeAnswerTimes([]);
    this.questionStartedAt = performance.now();
    this.hasRecordedResult = false;
    this.answerResults = [];
    this.selectedAnswers = [];
    this.questionMarkers = [];
    this.answerReviewStatus = 'all';
    this.answerReviewTheme = 'all';
    this.feedbackState = null;
    this.arrivalSoundPlayed = false;
    this.screen = 'quiz';
    this.render();
    window.ProgressLogger?.logProgress?.('quiz_started', { mode: 'accessible-fallback' });
  }

  answer(selectedIndex) {
    if (this.screen !== 'quiz') return;
    const questionData = getMainQuestionSet(this)[this.currentQuestionIndex];
    const correct = selectedIndex === questionData.correct;
    if (correct) {
      this.score += 1;
      this.playSound(this.correctSound);
    } else {
      this.playSound(this.incorrectSound);
    }
    this.selectedAnswers[this.currentQuestionIndex] = selectedIndex;
    this.answerResults[this.currentQuestionIndex] = correct;
    this.historyExpanded = false;
    this.feedbackState = { correct };
    this.screen = 'feedback';
    this.render();
  }

  pauseJourney() {
    if (!['quiz', 'feedback', 'review', 'review-feedback', 'bonus', 'bonus-feedback'].includes(this.screen)) return;
    this.playSound?.(this.pauseSound);
    this.pausedScreen = this.screen;
    this.audioWasPlayingBeforePause = Boolean(this.bgMusic && !this.bgMusic.paused && !this.bgMusic.ended);
    if (this.audioWasPlayingBeforePause) this.bgMusic.pause();
    this.screen = 'paused';
    this.render();
  }

  resumeJourney() {
    if (this.screen !== 'paused') return;
    const resumeDraft = buildJourneyDraft(this);
    const nextScreen = this.pausedScreen || 'quiz';
    const shouldResumeAudio = this.audioWasPlayingBeforePause;
    this.pausedScreen = null;
    this.audioWasPlayingBeforePause = false;
    this.screen = nextScreen;
    this.render();
    showJourneyResumeNotice(this, resumeDraft);
    if (shouldResumeAudio && !this.isMuted) {
      const playback = this.bgMusic?.play();
      playback?.catch?.(() => this.showAudioNotice('music'));
    }
  }

  restartJourney() {
    if (this.screen !== 'paused') return;
    this.bgMusic?.pause?.();
    this.audioWasPlayingBeforePause = false;
    this.unlockAudio();
    if (isBonusQuestionScreen(this.pausedScreen)) this.startBonusRound();
    else if (isThemeReviewQuestionScreen(this.pausedScreen)) this.startThemeReview(this.reviewThemeKey);
    else this.startQuiz();
  }

  showResults() {
    this.savedJourney = null;
    this.isViewingSavedJourney = false;
    this.arrivalSoundPlayed = false;
    this.screen = 'result';
    unlockAchievements(this, ['first-journey']);
    const journeyRecord = buildLastJourneyRecord(this);
    writeLastJourney(journeyRecord);
    appendJourneyHistory(journeyRecord);
    this.render();
    window.ProgressLogger?.logProgress?.('quiz_completed', { score: this.score, rank: this.getRank(), mode: 'accessible-fallback' });
  }

  getRank() {
    if (this.score === 10) return this.t('master');
    if (this.score >= 7) return this.t('scholar');
    if (this.score >= 4) return this.t('beginner');
    return this.t('seed');
  }

  getResultBand() {
    if (this.score >= 8) return 'deep';
    if (this.score >= 4) return 'growing';
    return 'beginning';
  }

  getResultThemeStats() {
    if (this.isViewingSavedJourney && this.savedJourney?.themes?.length) return this.savedJourney.themes.map((theme) => ({ ...theme }));
    return buildResultThemeStats(this);
  }

  getResultWeakestTheme() {
    return getWeakestTheme(this.getResultThemeStats());
  }

  getResultWeakestThemeLabel() {
    const theme = this.getResultWeakestTheme();
    return theme ? (getThemeLabel(this, theme.key) || theme.label) : '';
  }

  getResultNextStepMessage() {
    const theme = this.getResultWeakestTheme();
    return theme
      ? this.t('nextStepMessage', { theme: this.getResultWeakestThemeLabel(), correct: theme.correct, total: theme.total })
      : '';
  }

  getResultThemes() {
    return [...this.getResultThemeStats()]
      .sort((a, b) => b.correct - a.correct || b.total - a.total || a.first - b.first)
      .slice(0, 3)
      .map((theme) => theme.label);
  }

  getResultCopy() {
    const copy = RESULT_COPY[this.language] || RESULT_COPY.pt;
    return copy[this.getResultBand()] || copy.growing;
  }

  getResultSynthesis() {
    if (this.isViewingSavedJourney && this.savedJourney?.synthesis) return this.savedJourney.synthesis;
    return this.getResultCopy().reflection.replaceAll('{themes}', this.getResultThemes().join(' · '));
  }

  getResultReflection() {
    return this.getResultSynthesis();
  }

  getResultVerse() {
    if (this.isViewingSavedJourney && this.savedJourney?.verse) return this.savedJourney.verse;
    return this.getResultCopy().verse;
  }

  getAnnouncement() {
    if (this.screen === 'start') {
      const draft = readJourneyDraft();
      return draft
        ? `${getJourneyDraftAnnouncement(this, draft)} ${formatJourneyDraftText(this, draft, 'draftResume')}. ${formatJourneyDraftText(this, draft, 'draftNew')}. ${formatJourneyDraftText(this, draft, 'draftDiscard')}.`
        : `${this.copy().title}. ${this.copy().message}`;
    }
    if (this.screen === 'quiz') return `${getJourneyProgressAnnouncement(this)} ${this.t('question')} ${this.currentQuestionIndex + 1} / ${questions.length}. ${this.question().question}. ${this.copy().keyboard}`;
    if (this.screen === 'feedback') {
      const q = this.question();
      const history = `${this.t('historicalTitle')}. ${this.historyExpanded ? q.historicalNote : this.t('historicalExpand')}`;
      return `${getJourneyProgressAnnouncement(this)} ${this.feedbackState?.correct ? this.t('correct') : this.t('almost')}. ${this.t('explanationTitle')}. ${q.explanation} ${history}. ${this.t('devotional')}. ${q.verse}`;
    }
    if (this.screen === 'review') {
      const q = this.reviewQuestion();
      return `${this.getReviewThemeLabel()}. ${this.getReviewProgressSummary()} ${this.t('question')} ${this.reviewQuestionPosition + 1}. ${q.question}. ${this.copy().keyboard}`;
    }
    if (this.screen === 'review-feedback') {
      const q = this.reviewQuestion();
      const history = `${this.t('historicalTitle')}. ${this.historyExpanded ? q.historicalNote : this.t('historicalExpand')}`;
      return `${this.getReviewThemeLabel()}. ${this.getReviewProgressSummary()} ${this.reviewFeedbackState?.correct ? this.t('correct') : this.t('almost')}. ${this.t('explanationTitle')}. ${q.explanation} ${history}. ${this.t('devotional')}. ${q.verse}`;
    }
    if (this.screen === 'bonus') {
      const q = this.getBonusQuestion();
      const copy = getBonusCopy(this);
      return `${copy.bonusTitle}. ${this.getBonusThemeLabel()}. ${this.getBonusProgressSummary()} ${this.t('question')} ${this.bonusQuestionPosition + 1}. ${q.question}. ${copy.bonusChooseHint} ${this.copy().keyboard}`;
    }
    if (this.screen === 'bonus-feedback') {
      const q = this.getBonusQuestion();
      const copy = getBonusCopy(this);
      return `${copy.bonusTitle}. ${this.getBonusThemeLabel()}. ${this.getBonusProgressSummary()} ${this.bonusFeedbackState?.correct ? copy.bonusCorrect : copy.bonusAlmost}. ${copy.bonusReflectionTitle}. ${q.reflection} ${this.t('devotional')}. ${q.verse}`;
    }
    if (this.screen === 'paused') {
      const pauseCopy = this.getPauseCopy();
      const reflection = this.pausedScreen === 'feedback' || this.pausedScreen === 'review-feedback' || this.pausedScreen === 'bonus-feedback' ? ` ${pauseCopy.reflectionContext}` : '';
      return `${pauseCopy.title}. ${pauseCopy.message} ${this.progressSummary()} ${pauseCopy.questionLabel}: ${this.progressQuestion().question}.${reflection}`;
    }
    if (this.screen === 'review-result') {
      return `${this.t('reviewTitle')}. ${this.getReviewThemeLabel()}. ${this.t('reviewComparisonTitle')}. ${this.t('reviewOriginal')}: ${getThemeReviewOriginalScore(this)} / ${this.reviewQuestionIndices.length}. ${this.t('reviewCurrent')}: ${this.reviewScore} / ${this.reviewQuestionIndices.length}. ${getThemeReviewComparisonMessage(this)} ${this.getReviewConclusion()} ${getAchievementSummaryText(this)}`;
    }
    if (this.screen === 'bonus-result') {
      const copy = getBonusCopy(this);
      return `${copy.bonusResultTitle}. ${this.bonusScore} / ${this.bonusQuestionIndices.length}. ${copy.bonusNoScore} ${copy.bonusResultMessage} ${copy.bonusInvitation} ${this.t('bonusVerseTitle')}. ${this.getBonusResultThemeLabel()}. ${this.getBonusResultQuestion()?.verse || ''}. ${this.t('bonusSaveVerse')}. ${getAchievementSummaryText(this)}`;
    }
    return `${this.t('resultTitle')}. ${this.score} / ${questions.length}. ${this.getRank()}. ${getThemeMapAnnouncement(this)} ${this.getResultSynthesis()} ${this.getResultNextStepMessage()} ${this.getResultVerse()} ${getAchievementSummaryText(this)}`;
  }

  announce(message) {
    const status = document.getElementById('a11y-status');
    if (status) status.textContent = message;
  }

  announceResultAction(message, { copyText = '', labelText = '', helpText = '', recovery = null, keepRecovery = false } = {}) {
    const status = document.getElementById('fallback-result-action-status');
    if (status) status.textContent = message;
    if (!keepRecovery) clearShareRecoveryActions();
    if (copyText) showManualCopyAlternative(this, copyText, { labelText, helpText });
    else clearManualCopyAlternative();
    if (recovery) showShareRecoveryActions(this, { ...recovery, message: recovery.message || message });
    this.announce(message);
  }

  unlockAudio() {
    if (this.audioEnabled || this.audioUnlockPending || this.isMuted || !this.bgMusic) return;
    const token = (this.audioProgressToken || 0) + 1;
    this.audioProgressToken = token;
    const targets = getAudioButtons(this, 'ambient');
    this.audioActionPending = true;
    this.audioActionKind = 'ambient';
    setProgressState(this, 'audio', 'preparing', { targets });
    this.audioUnlockPending = true;
    let playback;
    try {
      playback = this.bgMusic.play();
    } catch {
      this.audioUnlockPending = false;
      this.audioActionPending = false;
      this.audioActionKind = null;
      targets.forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
      this.showAudioNotice('music');
      return;
    }
    setProgressState(this, 'audio', 'loading', { targets });
    const complete = () => {
      if (this.audioProgressToken !== token) return;
      this.audioUnlockPending = false;
      this.audioEnabled = true;
      this.audioActionPending = false;
      this.audioActionKind = null;
      setProgressState(this, 'audio', 'complete', { targets: getAudioButtons(this, 'ambient') });
    };
    if (!playback?.then) {
      complete();
      return;
    }
    playback.then(complete).catch(() => {
      if (this.audioProgressToken !== token) return;
      this.audioUnlockPending = false;
      this.audioEnabled = false;
      this.audioActionPending = false;
      this.audioActionKind = null;
      targets.forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
      this.showAudioNotice('music');
    });
  }

  playSound(sound) {
    if (this.isMuted || !sound) return;
    try {
      sound.currentTime = 0;
      const playback = sound.play();
      playback?.catch?.(() => this.showAudioNotice('effect'));
    } catch {
      this.showAudioNotice('effect');
    }
  }

  setMusicVolume(value) {
    const clamped = clampAudioVolume(value, this.musicVolume);
    if (clamped > 0) {
      this.musicVolume = clamped;
      this.lastAudibleMusicVolume = clamped;
      this.isMuted = false;
      this.bgMusic.muted = false;
      this.bgMusic.volume = Math.max(0, Math.min(1, clamped));
    } else {
      if (this.musicVolume > 0) this.lastAudibleMusicVolume = this.musicVolume;
      this.musicVolume = 0;
      this.isMuted = true;
      this.bgMusic.volume = 0;
      this.bgMusic.muted = true;
    }
    syncAudioMuteState(this);
    writeAudioPreference({ volume: this.musicVolume, lastAudibleVolume: this.lastAudibleMusicVolume, muted: this.isMuted });
    persistJourneyDraft(this);
    this.updateAudioControl();
  }

  toggleMute() {
    if (this.isMuted || this.musicVolume === 0) this.setMusicVolume(this.lastAudibleMusicVolume || DEFAULT_AUDIO_VOLUME);
    else this.setMusicVolume(0);
  }

  showAudioNotice(kind = 'music') {
    if (this.audioNoticeKind === kind) return;
    this.audioNoticeKind = kind;
    const copy = AUDIO_COPY[this.language] || AUDIO_COPY.pt;
    const message = kind === 'effect' ? copy.effectUnavailable : copy.musicUnavailable;
    const status = document.getElementById('audio-status');
    if (status) status.textContent = message;
    this.announce(message);
    window.clearTimeout(this.audioNoticeTimer);
    this.audioNoticeTimer = window.setTimeout(() => {
      if (status && this.audioNoticeKind === kind) {
        status.textContent = '';
        this.audioNoticeKind = null;
      }
    }, 6500);
  }

  updateAudioControl() {
    syncAudioControlVisibility(this);
    const copy = AUDIO_COPY[this.language] || AUDIO_COPY.pt;
    const audioControl = document.getElementById('audio-control');
    const label = document.getElementById('audio-label');
    const value = document.getElementById('audio-value');
    const input = document.getElementById('music-volume');
    const mute = document.getElementById('audio-mute');
    const level = copy.level.replace('{value}', String(Math.round(this.musicVolume * 100)));
    if (label) label.textContent = copy.label;
    if (value) value.textContent = level;
    if (input) {
      input.value = String(Math.round(this.musicVolume * 100));
      input.setAttribute('aria-label', `${copy.label}: ${level}`);
      input.setAttribute('aria-valuetext', level);
    }
    if (mute) {
      mute.textContent = this.isMuted ? '🔇' : '♫';
      mute.setAttribute('aria-label', this.isMuted ? copy.unmute : copy.mute);
      mute.setAttribute('aria-pressed', String(this.isMuted));
    }
    const status = document.getElementById('audio-status');
    if (status && this.audioNoticeKind) {
      status.textContent = this.audioNoticeKind === 'effect' ? copy.effectUnavailable : copy.musicUnavailable;
    }
  }

  updateArrivalControl() {
    const control = document.getElementById('arrival-control');
    const button = document.getElementById('arrival-sound');
    if (!control || !button) return;
    const copy = ARRIVAL_COPY[this.language] || ARRIVAL_COPY.pt;
    const label = this.arrivalSoundPlayed ? copy.replay : copy.button;
    control.hidden = this.screen !== 'result';
    control.setAttribute('aria-label', copy.label);
    button.textContent = `♫  ${label}`;
    button.setAttribute('aria-label', label);
    button.title = label;
  }

  playArrivalSound() {
    if (this.screen !== 'result' || !this.arrivalSound || this.isMuted || this.audioActionKind === 'arrival') return;
    const token = (this.audioProgressToken || 0) + 1;
    this.audioProgressToken = token;
    const targets = getAudioButtons(this, 'arrival');
    this.audioActionPending = true;
    this.audioActionKind = 'arrival';
    setProgressState(this, 'audio', 'preparing', { targets });
    this.arrivalSound.currentTime = 0;
    this.arrivalSound.volume = Math.max(0, Math.min(1, 0.24));
    setProgressState(this, 'audio', 'loading', { targets });
    let playback;
    try {
      playback = this.arrivalSound.play();
    } catch {
      this.audioActionPending = false;
      this.audioActionKind = null;
      targets.forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
      this.showAudioNotice('effect');
      return;
    }
    const complete = () => {
      if (this.audioProgressToken !== token) return;
      this.audioActionPending = false;
      this.audioActionKind = null;
      this.arrivalSoundPlayed = true;
      this.updateArrivalControl();
      const copy = ARRIVAL_COPY[this.language] || ARRIVAL_COPY.pt;
      setProgressState(this, 'audio', 'complete', { targets: getAudioButtons(this, 'arrival') });
      this.announce(`${copy.label}. ${copy.played}.`);
    };
    if (!playback?.then) {
      complete();
      return;
    }
    playback.then(complete).catch(() => {
      if (this.audioProgressToken !== token) return;
      this.audioActionPending = false;
      this.audioActionKind = null;
      targets.forEach((button) => { button.disabled = false; button.setAttribute('aria-busy', 'false'); });
      this.showAudioNotice('effect');
    });
  }

  updateMotionControl() {
    const copy = MOTION_COPY[this.language] || MOTION_COPY.pt;
    const label = document.getElementById('motion-label');
    const status = document.getElementById('motion-status');
    const button = document.getElementById('motion-toggle');
    const statusText = this.reducedMotion ? copy.reduced : copy.full;
    const buttonText = this.reducedMotion ? copy.allow : copy.reduce;
    if (label) label.textContent = copy.label;
    if (status) status.textContent = statusText;
    if (button) {
      button.textContent = buttonText;
      button.setAttribute('aria-label', buttonText);
      button.setAttribute('aria-pressed', String(this.reducedMotion));
      button.title = statusText;
    }
  }

  toggleReducedMotion() {
    this.reducedMotion = !this.reducedMotion;
    this.motionPreferenceExplicit = true;
    window.localStorage.setItem('sigo-com-fe-reduced-motion', String(this.reducedMotion));
    persistJourneyDraft(this);
    this.updateMotionControl();
    const motionCopy = MOTION_COPY[this.language] || MOTION_COPY.pt;
    this.announce(this.reducedMotion ? motionCopy.reduced : motionCopy.full);
  }

  updateContrastControl() {
    const copy = getContrastCopy(this);
    const label = document.getElementById('contrast-label');
    const status = document.getElementById('contrast-status');
    const button = document.getElementById('contrast-toggle');
    const buttonText = getContrastToggleLabel(this);
    if (label) label.textContent = copy.label;
    if (status) status.textContent = getContrastStatus(this);
    if (button) {
      button.textContent = buttonText;
      button.setAttribute('aria-label', buttonText);
      button.setAttribute('aria-pressed', String(this.highContrast));
      button.setAttribute('aria-keyshortcuts', 'C');
      button.title = getContrastStatus(this);
    }
  }

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    writeHighContrastPreference(this.highContrast);
    this.applyHighContrastTheme();
    this.render();
    this.updateContrastControl();
    this.announce(getContrastStatus(this));
  }

  async shareScore() {
    const text = this.t('shareText', { score: this.score, total: questions.length });
    const shareUrl = window.location.href;
    const capabilityCopy = getCapabilityCopy(this);
    const essentialText = getEssentialResultText(this);
    if (!essentialText.trim()) {
      this.announceResultAction(capabilityCopy.resultEmpty, {
        recovery: { retry: () => this.shareScore() }
      });
      return false;
    }
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: this.t('pageTitle'), text, url: shareUrl });
        this.announceResultAction(this.copy().shared);
        return true;
      } catch (error) {
        if (error?.name === 'AbortError') return false;
      }
    }
    const shareContent = `${text} ${shareUrl}`;
    const copied = await copyResultText(shareContent);
    this.announceResultAction(copied ? capabilityCopy.copied : capabilityCopy.shareFailed, {
      copyText: copied ? '' : shareContent,
      recovery: { copyText: essentialText, retry: () => this.shareScore() }
    });
    return copied;
  }
}

function fallbackStateFrom(source) {
  if (!source) return {};
  return {
    language: source.language,
    screen: source.screen,
    pausedScreen: source.pausedScreen,
    audioWasPlayingBeforePause: source.audioWasPlayingBeforePause,
    currentQuestionIndex: source.currentQuestionIndex,
    score: source.score,
    answerResults: source.answerResults,
    selectedAnswers: source.selectedAnswers,
    questionMarkers: source.questionMarkers,
    answerReviewStatus: source.answerReviewStatus,
    answerReviewTheme: source.answerReviewTheme,
    feedbackState: source.feedbackState,
    reviewThemeKey: source.reviewThemeKey,
    reviewQuestionIndices: source.reviewQuestionIndices,
    reviewQuestionPosition: source.reviewQuestionPosition,
    reviewScore: source.reviewScore,
    reviewOriginalScore: source.reviewOriginalScore,
    reviewOriginalScoreCaptured: source.reviewOriginalScoreCaptured,
    reviewAnswerResults: source.reviewAnswerResults,
    reviewFeedbackState: source.reviewFeedbackState,
    reviewReturnScreen: source.reviewReturnScreen,
    bonusQuestionIndices: source.bonusQuestionIndices,
    bonusQuestionPosition: source.bonusQuestionPosition,
    bonusScore: source.bonusScore,
    bonusFeedbackState: source.bonusFeedbackState,
    bonusReturnScreen: source.bonusReturnScreen,
    historyExpanded: source.historyExpanded,
    savedJourney: source.savedJourney,
    isViewingSavedJourney: source.isViewingSavedJourney,
    highContrast: source.highContrast,
    reducedMotion: source.reducedMotion,
    motionPreferenceExplicit: source.motionPreferenceExplicit,
    isMuted: source.isMuted,
    musicVolume: source.musicVolume,
    lastAudibleMusicVolume: source.lastAudibleMusicVolume,
    arrivalSoundPlayed: source.arrivalSoundPlayed,
    sharePreviewOpen: source.sharePreviewOpen,
    sharedJourneyPreview: source.sharedJourneyPreview,
    audioControlOpen: source.audioControlOpen,
    modeRecovery: true
  };
}

function useAccessibleFallback(container, source = null) {
  const state = fallbackStateFrom(source);
  if (source?.helpOpen) closeHelpPanel(source, { restoreFocus: false, announce: false });
  source?.deactivate?.();
  container.replaceChildren();
  window.sigoQuiz = new AccessibleFallbackQuiz(container, state);
}

function bootQuiz() {
  const container = document.getElementById('game-container');
  if (!container) return;
  ensureHelpControls();
  ensureAudioControls();
  ensureJourneyShareControls();
  ensureDialogFocusManagement();
  ensureAchievementCelebrationControls();
  const sharedJourney = readJourneyShareFromLocation();
  try {
    const testCanvas = document.createElement('canvas');
    const context = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    testCanvas.remove();
    if (!context) throw new Error('WebGL is unavailable.');
    window.sigoQuiz = new BibleQuiz3D(container);
  } catch (error) {
    console.info('Sigo com Fé: usando o modo contemplativo simplificado.', error?.message || error);
    useAccessibleFallback(container);
  }
  if (sharedJourney && window.sigoQuiz) openJourneySharePreview(window.sigoQuiz, sharedJourney);
}

window.addEventListener('sigo-webgl-lost', (event) => {
  const source = event.detail?.source;
  const container = document.getElementById('game-container');
  if (container && source && source === window.sigoQuiz) useAccessibleFallback(container, source);
});

window.addEventListener('load', bootQuiz);
