const BOXES = [
  {
    id: 'gold',
    label: 'Caixa dourada',
    intention: 'Coragem',
    description: 'Sigo com fé.',
    src: 'assets/gold-box-closed.webp',
    messages: [
      'Seja forte e corajoso; não tenha medo, pois o Senhor, seu Deus, estará com você. (Josué 1:9)',
      'Tudo posso naquele que me fortalece. (Filipenses 4:13)',
      'O Senhor é a minha luz e a minha salvação; de quem terei medo? (Salmo 27:1)',
      'Quando eu estiver com medo, confiarei em ti. (Salmo 56:3)'
    ]
  },
  {
    id: 'blue',
    label: 'Caixa azul-céu',
    intention: 'Direcionamento',
    description: 'Para respirar fundo e descansar o coração.',
    src: 'assets/blue-box-closed.webp',
    messages: [
      'Deixo com vocês a paz; a minha paz dou a vocês. (João 14:27)',
      'O Senhor dará força ao seu povo; o Senhor abençoará o seu povo com paz. (Salmo 29:11)',
      'Em paz me deito e logo adormeço, pois só tu, Senhor, me fazes viver em segurança. (Salmo 4:8)',
      'A paz de Deus guardará o coração e a mente de vocês. (Filipenses 4:7)'
    ]
  },
  {
    id: 'lilac',
    label: 'Caixa lilás',
    intention: 'Gratidão',
    description: 'Para reconhecer as bênçãos de cada dia.',
    src: 'assets/lilac-box-closed.webp',
    messages: [
      'Deem graças ao Senhor, porque ele é bom; o seu amor dura para sempre. (Salmo 107:1)',
      'Este é o dia que o Senhor fez; alegremo-nos e exultemos nele. (Salmo 118:24)',
      'Em tudo deem graças, pois esta é a vontade de Deus. (1 Tessalonicenses 5:18)',
      'Bendiga o Senhor a minha alma, e não se esqueça de nenhuma de suas bênçãos. (Salmo 103:2)'
    ]
  }
];

const ASSETS = {
  star: 'assets/star-particle.webp',
  diamond: 'assets/diamond-particle.webp',
  music: 'assets/audio/calm-faith-ambience.mp3',
  chime: 'assets/audio/magic-chime-reward.mp3'
};

class FaithSurpriseGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.audioStarted = false;
    this.isMuted = false;
    this.openedIntentions = new Set();
    this.messagesReceived = 0;
    this.bgMusic = new Audio(ASSETS.music);
    this.bgMusic.loop = true;
    this.chime = new Audio(ASSETS.chime);
    this.init();
  }

  init() {
    this.createUI();
    this.addListeners();
    this.logProgress('game_initialized');
  }

  createUI() {
    const card = document.createElement('main');
    card.className = 'surpresa-card';
    card.setAttribute('aria-labelledby', 'surpresa-title');
    card.innerHTML = `
      <header class="surpresa-header">
        <h1 id="surpresa-title">palavra que</h1>
        <p>Abra uma caixa e receba uma mensagem especial.</p>
        <section class="collection-progress" aria-labelledby="collection-title">
          <div class="collection-heading">
            <span class="collection-title" id="collection-title">Sua coleção de fé</span>
            <strong class="collection-count" id="collection-count" aria-live="polite">0 de 3 caixas abertas</strong>
          </div>
          <p class="collection-hint" id="collection-hint">Descubra cada intenção no seu tempo.</p>
          <div class="intention-indicators" id="intention-indicators" aria-label="Progresso das intenções">
            ${BOXES.map(box => `
              <span class="intention-indicator intention-${box.id}" data-intention="${box.intention}" aria-label="${box.intention}: ainda não descoberta">
                <span class="indicator-dot" aria-hidden="true">✦</span>
                <span class="indicator-copy">
                  <strong>${box.intention}</strong>
                  <small class="indicator-state">Falta descobrir</small>
                </span>
              </span>
            `).join('')}
          </div>
          <section class="session-summary" aria-labelledby="session-summary-title">
            <div class="summary-heading">
              <span class="summary-icon" aria-hidden="true">♡</span>
              <strong id="session-summary-title">Resumo desta sessão</strong>
            </div>
            <p class="summary-discovered" id="summary-discovered" aria-live="polite">Intenções descobertas: nenhuma ainda.</p>
            <p class="summary-messages" id="summary-messages" aria-live="polite">Você ainda não recebeu uma mensagem.</p>
            <p class="summary-next" id="summary-next">Sua primeira descoberta espera por você.</p>
          </section>
        </section>
      </header>
      <div class="boxes-container" id="boxes-container" aria-label="Caixas de surpresa da fé">
        ${BOXES.map(box => this.renderBox(box)).join('')}
      </div>
      <button class="reset-btn" id="reset-btn" type="button">Tentar novamente</button>
    `;
    this.container.appendChild(card);
    this.collectionCount = card.querySelector('#collection-count');
    this.collectionHint = card.querySelector('#collection-hint');
    this.indicators = new Map(
      Array.from(card.querySelectorAll('.intention-indicator')).map(indicator => [indicator.dataset.intention, indicator])
    );
    this.summaryDiscovered = card.querySelector('#summary-discovered');
    this.summaryMessages = card.querySelector('#summary-messages');
    this.summaryNext = card.querySelector('#summary-next');
    this.updateProgress();

    const audioBtn = document.createElement('button');
    audioBtn.id = 'audio-controls';
    audioBtn.type = 'button';
    audioBtn.setAttribute('aria-pressed', 'false');
    audioBtn.setAttribute('aria-label', 'Desligar sons');
    audioBtn.title = 'Desligar sons';
    audioBtn.innerHTML = '<span class="audio-icon" aria-hidden="true">🔊</span><span class="audio-label">Som ligado</span>';
    this.container.appendChild(audioBtn);
    this.audioBtn = audioBtn;
  }

  renderBox(box) {
    return `
      <button class="box-wrapper idle" data-id="${box.id}" type="button"
        aria-label="Abrir ${box.label.toLowerCase()} de ${box.intention.toLowerCase()}" aria-expanded="false">
        <img src="${box.src}" class="box-img" alt="" aria-hidden="true">
        <span class="box-label">${box.label}</span>
        <span class="box-intention"><span aria-hidden="true">✦</span> ${box.intention}</span>
        <span class="box-description">${box.description}</span>
        <span class="box-state">Fechada · pressione Enter</span>
        <span class="message-display" role="status" aria-live="polite" aria-hidden="true">
          <span class="message-eyebrow">Mensagem de ${box.intention.toLowerCase()}</span>
          <span class="message-text"></span>
        </span>
        <span class="particles-container" aria-hidden="true"></span>
      </button>
    `;
  }

  addListeners() {
    this.wrappers = Array.from(document.querySelectorAll('.box-wrapper'));
    this.wrappers.forEach((wrapper, index) => {
      wrapper.addEventListener('click', () => this.handleBoxClick(wrapper));
      wrapper.addEventListener('keydown', event => this.handleBoxKeydown(event, index));
    });

    document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
    this.audioBtn.addEventListener('click', () => this.toggleAudio());

    // A primeira interação libera o áudio sem exigir uma etapa extra do jogador.
    document.addEventListener('click', () => this.startAudio(), { once: true });
    document.addEventListener('keydown', () => this.startAudio(), { once: true });
  }

  handleBoxKeydown(event, index) {
    let nextIndex = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % this.wrappers.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + this.wrappers.length) % this.wrappers.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = this.wrappers.length - 1;

    if (nextIndex >= 0) {
      event.preventDefault();
      this.wrappers[nextIndex].focus();
    }
  }

  handleBoxClick(wrapper) {
    if (wrapper.classList.contains('opened')) return;

    this.startAudio();
    this.playChime();
    wrapper.classList.remove('idle');
    wrapper.classList.add('opened');
    wrapper.setAttribute('aria-expanded', 'true');
    const box = this.getBox(wrapper);
    wrapper.setAttribute('aria-label', `${box.label} de ${box.intention} aberta. Mensagem revelada.`);

    const message = box.messages[Math.floor(Math.random() * box.messages.length)];
    wrapper.querySelector('.message-text').textContent = message;
    wrapper.querySelector('.message-display').setAttribute('aria-hidden', 'false');
    wrapper.querySelector('.box-state').textContent = 'Aberta · mensagem revelada';
    this.openedIntentions.add(box.intention);
    this.messagesReceived += 1;
    this.updateProgress();
    this.spawnParticles(wrapper);
    this.logProgress('box_opened', { boxId: wrapper.dataset.id, intention: box.intention });
  }

  updateProgress() {
    const openedCount = this.openedIntentions.size;
    const discoveredBoxes = BOXES.filter(box => this.openedIntentions.has(box.intention));
    const missingBox = BOXES.find(box => !this.openedIntentions.has(box.intention));
    this.collectionCount.textContent = `${openedCount} de ${BOXES.length} caixas abertas`;
    this.collectionHint.textContent = openedCount === BOXES.length
      ? 'Coleção completa! Que estas três intenções acompanhem o seu dia.'
      : openedCount === 0
        ? 'Descubra cada intenção no seu tempo.'
        : `Ainda faltam ${BOXES.length - openedCount} intenção${BOXES.length - openedCount === 1 ? '' : 'ões'} para completar a coleção.`;

    this.indicators.forEach((indicator, intention) => {
      const discovered = this.openedIntentions.has(intention);
      indicator.classList.toggle('discovered', discovered);
      indicator.setAttribute('aria-label', `${intention}: ${discovered ? 'descoberta' : 'ainda não descoberta'}`);
      indicator.querySelector('.indicator-state').textContent = discovered ? 'Descoberta' : 'Falta descobrir';
    });

    const discoveredNames = discoveredBoxes.map(box => box.intention);
    this.summaryDiscovered.textContent = discoveredNames.length
      ? `Intenções descobertas: ${discoveredNames.join(' · ')}.`
      : 'Intenções descobertas: nenhuma ainda.';
    this.summaryMessages.textContent = this.messagesReceived === 0
      ? 'Você ainda não recebeu uma mensagem.'
      : this.messagesReceived === 1
        ? 'Você recebeu 1 mensagem especial nesta sessão.'
        : `Você recebeu ${this.messagesReceived} mensagens especiais nesta sessão.`;
    this.summaryNext.textContent = missingBox
      ? 'Tire a sua palavra hoje e veja o que Deus tem para você.'
      : 'Caminho completo: você acolheu Coragem, Direcionamento e Gratidão.';
    this.summaryNext.classList.toggle('summary-complete', !missingBox);
  }

  getBox(wrapper) {
    return BOXES.find(box => box.id === wrapper.dataset.id) || BOXES[0];
  }

  getBoxLabel(wrapper) {
    return this.getBox(wrapper).label;
  }

  spawnParticles(wrapper) {
    const container = wrapper.querySelector('.particles-container');
    for (let i = 0; i < 20; i += 1) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.style.backgroundImage = `url(${Math.random() > 0.5 ? ASSETS.star : ASSETS.diamond})`;

      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const duration = 1 + Math.random() * 1.5;
      container.appendChild(particle);

      particle.animate([
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
        { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.5)`, opacity: 1, offset: 0.2 },
        { transform: `translate(calc(-50% + ${x * 1.2}px), calc(-50% + ${y * 1.2}px)) scale(0)`, opacity: 0 }
      ], { duration: duration * 1000, easing: 'ease-out', fill: 'forwards' });

      window.setTimeout(() => particle.remove(), duration * 1000);
    }
  }

  resetGame() {
    this.openedIntentions.clear();
    this.messagesReceived = 0;
    this.wrappers.forEach(wrapper => {
      wrapper.classList.remove('opened');
      wrapper.classList.add('idle');
      wrapper.setAttribute('aria-expanded', 'false');
      const box = this.getBox(wrapper);
      wrapper.setAttribute('aria-label', `Abrir ${box.label.toLowerCase()} de ${box.intention.toLowerCase()}`);
      wrapper.querySelector('.box-state').textContent = 'Fechada · pressione Enter';
      wrapper.querySelector('.message-text').textContent = '';
      wrapper.querySelector('.message-display').setAttribute('aria-hidden', 'true');
      wrapper.querySelector('.particles-container').replaceChildren();
    });
    this.updateProgress();
    this.logProgress('game_reset');
  }

  startAudio() {
    if (this.audioStarted) return;
    this.bgMusic.muted = this.isMuted;
    this.bgMusic.play().catch(() => {});
    this.audioStarted = true;
  }

  playChime() {
    if (this.isMuted) return;
    this.chime.currentTime = 0;
    this.chime.play().catch(() => {});
  }

  toggleAudio() {
    this.startAudio();
    this.isMuted = !this.isMuted;
    this.bgMusic.muted = this.isMuted;
    this.chime.muted = this.isMuted;
    this.audioBtn.classList.toggle('is-muted', this.isMuted);
    this.audioBtn.setAttribute('aria-pressed', String(this.isMuted));
    this.audioBtn.setAttribute('aria-label', this.isMuted ? 'Ativar sons' : 'Desligar sons');
    this.audioBtn.title = this.isMuted ? 'Ativar sons' : 'Desligar sons';
    this.audioBtn.querySelector('.audio-icon').textContent = this.isMuted ? '🔇' : '🔊';
    this.audioBtn.querySelector('.audio-label').textContent = this.isMuted ? 'Som desligado' : 'Som ligado';
  }

  logProgress(event, data = {}) {
    if (window.ProgressLogger) window.ProgressLogger.logProgress(event, data);
  }
}

window.addEventListener('load', () => new FaithSurpriseGame());
