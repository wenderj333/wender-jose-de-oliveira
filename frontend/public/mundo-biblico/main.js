
/**
 * Mundo Bíblico: Pequenos Heróis
 * A Christian children's adventure game.
 */

class Game {
    constructor() {
        this.canvas = document.createElement('canvas');
        document.getElementById('game-container').appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.width = 0;
        this.height = 0;
        this.dpr = 1;
        
        this.state = 'START'; // START, GARDEN, OASIS, RIVER, END
        this.assets = {};
        this.audio = {};
        this.entities = [];
        this.player = null;
        
        this.stamps = {
            love: false,
            faith: false,
            joy: false,
            kindness: false
        };
        this.memories = {
            lambCare: false,
            footsteps: false,
            praiseJoy: false,
            riverFlowers: false
        };
        this.passportStorageKey = 'mundo-biblico-passaporte-v1';
        this.memoryStorageKey = 'mundo-biblico-memorias-v1';
        this.adventureStorageKey = 'mundo-biblico-aventura-v1';
        this.journeyStorageKey = 'mundo-biblico-jornada-v1';
        this.adventureProgress = null;
        this.adventureProgressSignature = '';
        this.celebrationTimeout = null;
        
        this.collectedApples = 0;
        this.totalApples = 3;
        this.dialogTimeout = null;
        this.musicEnabled = true;
        this.effectsEnabled = true;
        this.currentStory = null;
        this.speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
        this.oasisStep = 0;
        this.oasisTrailIndex = 0;
        this.oasisRestIndex = 0;
        this.oasisLambFollowing = false;
        this.oasisWater = null;
        this.oasisTrail = [];
        this.oasisRestSpots = [];
        this.musicBeatIndex = 0;
        this.musicNotes = [];
        this.musicActivityComplete = false;
        this.gardenChoiceActive = false;
        this.gardenChoiceSelected = null;
        this.gardenChoiceComplete = false;
        this.gardenHelper = null;
        this.gardenChoiceSpots = [];
        this.riverFlowers = [];
        this.riverAnimals = [];
        this.riverFlowerIndex = 0;
        this.riverFlowerHeld = false;
        this.riverMissionComplete = false;
        this.effects = [];
        this.journeyUnlocked = { GARDEN: true, OASIS: false, RIVER: false };
        this.journeyCompleted = { GARDEN: false, OASIS: false, RIVER: false };
        this.revisitingCompletedScene = false;
        this.pathOpen = false;
        this.matchingOpen = false;
        this.matchingSelected = null;
        this.matchingMatches = 0;
        this.matchingLocked = false;
        this.matchingPairs = { lamb: 'LOVE', footsteps: 'FAITH', music: 'JOY' };
        this.focusReturnElement = null;
        
        this.touchX = null;
        this.touchY = null;
        
        this.init();
    }
    
    async init() {
        this.resize();
        this.loadSavedStamps();
        this.loadSavedMemories();
        this.loadSavedJourneyProgress();
        this.loadSavedAdventureProgress();
        this.updatePassportUI();
        window.addEventListener('resize', () => this.resize());
        
        // Setup UI
        document.getElementById('start-btn').onclick = () => this.startGame();
        document.getElementById('continue-adventure-btn').onclick = () => this.continueAdventure();
        document.getElementById('passport-btn').onclick = () => this.togglePassport(true);
        document.getElementById('close-passport').onclick = () => this.togglePassport(false);
        document.getElementById('final-open-passport').onclick = () => {
            this.hideStampCelebration();
            this.togglePassport(true, document.getElementById('passport-btn'));
            window.ProgressLogger.logProgress('final_celebration_passport_opened');
        };
        document.getElementById('final-new-adventure').onclick = () => {
            this.hideStampCelebration();
            this.startGame();
            window.ProgressLogger.logProgress('final_celebration_new_adventure_started');
        };
        document.getElementById('listen-story').onclick = () => {
            this.playSound('tap');
            this.speakStory();
        };
        document.getElementById('music-toggle').onclick = () => this.toggleMusic();
        document.getElementById('effects-toggle').onclick = () => this.toggleEffects();
        document.querySelectorAll('[data-journey-scene]').forEach(card => {
            card.onclick = () => this.selectJourneyScene(card.dataset.journeyScene);
        });
        document.querySelectorAll('[data-passport-scene]').forEach(card => {
            card.onclick = () => this.selectPassportJourneyScene(card.dataset.passportScene);
        });
        document.getElementById('journey-return-btn').onclick = () => {
            if (this.state === 'GARDEN' || this.state === 'OASIS' || this.state === 'RIVER') {
                this.openJourneyPath(this.state);
            }
        };
        document.querySelectorAll('[data-match-card]').forEach(card => {
            card.onclick = () => this.selectMatchingCard(card);
        });
        document.querySelectorAll('[data-match-target]').forEach(target => {
            target.onclick = () => this.selectMatchingTarget(target);
        });
        document.getElementById('matching-finish').onclick = () => this.finishMatchingActivity();
        
        // Sigo com Fé badge click
        document.querySelectorAll('.sigo-com-fe-badge').forEach(badge => {
            badge.style.pointerEvents = 'auto';
            badge.style.cursor = 'pointer';
            badge.onclick = () => {
                this.playSound('success');
                this.showDialog("Deus te abençoe! Você é muito especial.");
                this.earnStamp('joy');
            };
        });
        
        await this.loadAssets();
        
        this.loop();
    }
    
    resize() {
        const previousWidth = this.width;
        const previousHeight = this.height;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = Math.floor(this.width * this.dpr);
        this.canvas.height = Math.floor(this.height * this.dpr);
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        if (previousWidth > 0 && previousHeight > 0 &&
            (previousWidth !== this.width || previousHeight !== this.height)) {
            this.relayoutActiveScene(previousWidth, previousHeight);
        }
    }

    relayoutActiveScene(previousWidth, previousHeight) {
        if (!['GARDEN', 'OASIS', 'RIVER'].includes(this.state)) return;

        const scaleX = this.width / previousWidth;
        const scaleY = this.height / previousHeight;
        const scalePoint = (point) => {
            if (!point) return;
            point.x *= scaleX;
            point.y *= scaleY;
        };

        this.entities.forEach(entity => {
            entity.x *= scaleX;
            entity.y *= scaleY;
            entity.targetX *= scaleX;
            entity.targetY *= scaleY;
        });
        this.apples?.forEach(scalePoint);
        this.gardenChoiceSpots?.forEach(scalePoint);
        this.oasisTrail?.forEach(scalePoint);
        this.oasisRestSpots?.forEach(scalePoint);
        this.musicNotes?.forEach(scalePoint);
        this.riverFlowers?.forEach(scalePoint);
        this.riverAnimals?.forEach(scalePoint);
        if (this.oasisWater) {
            scalePoint(this.oasisWater);
            this.oasisWater.radius *= Math.min(scaleX, scaleY);
        }
    }
    
    async loadAssets() {
        const imageList = {
            garden: 'assets/garden_background.webp',
            oasis: 'assets/oasis_background.webp',
            river: 'assets/kindness_river_background.webp',
            hero: 'assets/hero_child.webp',
            lamb: 'assets/lamb_sprite.webp',
            seal: 'assets/sigo_com_fe_seal.webp'
        };
        
        const audioList = {
            music: 'assets/audio/peaceful_adventure_music.mp3',
            success: 'assets/audio/sparkle_success_sfx.mp3',
            tap: 'assets/audio/soft_tap_ui_sfx.mp3'
        };
        
        // Load images
        for (const [key, src] of Object.entries(imageList)) {
            this.assets[key] = await this.loadImage(src);
        }
        
        // Load audio
        for (const [key, src] of Object.entries(audioList)) {
            const a = new Audio(src);
            a.crossOrigin = 'anonymous';
            this.audio[key] = a;
        }
        
        this.audio.music.loop = true;
        this.audio.music.volume = Math.max(0, Math.min(1, 0.4));
    }

    loadSavedStamps() {
        try {
            const saved = JSON.parse(localStorage.getItem(this.passportStorageKey) || '{}');
            Object.keys(this.stamps).forEach(type => {
                this.stamps[type] = saved[type] === true;
            });
        } catch (error) {
            this.stamps = { love: false, faith: false, joy: false, kindness: false };
        }
    }

    saveStamps() {
        try {
            localStorage.setItem(this.passportStorageKey, JSON.stringify(this.stamps));
        } catch (error) {
            // O jogo continua normalmente mesmo se o navegador bloquear o armazenamento local.
        }
    }

    loadSavedMemories() {
        try {
            const saved = JSON.parse(localStorage.getItem(this.memoryStorageKey) || '{}');
            Object.keys(this.memories).forEach(memory => {
                this.memories[memory] = saved[memory] === true;
            });

            // Older passports only stored stamps. Give those heroes the
            // matching memory without asking them to repeat a completed path.
            const stampMemoryMap = {
                love: 'lambCare',
                faith: 'footsteps',
                joy: 'praiseJoy',
                kindness: 'riverFlowers'
            };
            Object.entries(stampMemoryMap).forEach(([stamp, memory]) => {
                if (this.stamps[stamp]) this.memories[memory] = true;
            });
            this.saveMemories();
        } catch (error) {
            // O jogo continua normalmente mesmo se o navegador bloquear o armazenamento local.
        }
    }

    saveMemories() {
        try {
            localStorage.setItem(this.memoryStorageKey, JSON.stringify(this.memories));
        } catch (error) {
            // O jogo continua normalmente mesmo se o navegador bloquear o armazenamento local.
        }
    }

    loadSavedJourneyProgress() {
        const defaultUnlocked = { GARDEN: true, OASIS: false, RIVER: false };
        const defaultCompleted = { GARDEN: false, OASIS: false, RIVER: false };
        try {
            const saved = JSON.parse(localStorage.getItem(this.journeyStorageKey) || 'null');
            const completed = { ...defaultCompleted, ...(saved?.completed || {}) };
            const unlocked = { ...defaultUnlocked, ...(saved?.unlocked || {}) };

            // Migrate rewards earned by earlier versions into the journey map.
            completed.GARDEN = completed.GARDEN || this.stamps.love || this.memories.lambCare;
            completed.OASIS = completed.OASIS || this.stamps.joy || this.memories.praiseJoy;
            completed.RIVER = completed.RIVER || this.stamps.kindness || this.memories.riverFlowers;
            unlocked.GARDEN = true;
            unlocked.OASIS = unlocked.OASIS || completed.GARDEN;
            unlocked.RIVER = unlocked.RIVER || completed.OASIS;

            this.journeyCompleted = Object.fromEntries(
                Object.keys(defaultCompleted).map(scene => [scene, completed[scene] === true])
            );
            this.journeyUnlocked = Object.fromEntries(
                Object.keys(defaultUnlocked).map(scene => [scene, unlocked[scene] === true])
            );
            this.saveJourneyProgress();
        } catch (error) {
            this.journeyUnlocked = defaultUnlocked;
            this.journeyCompleted = defaultCompleted;
        }
    }

    saveJourneyProgress() {
        try {
            localStorage.setItem(this.journeyStorageKey, JSON.stringify({
                version: 1,
                unlocked: this.journeyUnlocked,
                completed: this.journeyCompleted,
                updatedAt: Date.now()
            }));
        } catch (error) {
            // O jogo continua normalmente mesmo se o navegador bloquear o armazenamento local.
        }
        this.updatePassportJourneyUI();
    }

    loadSavedAdventureProgress() {
        try {
            const saved = JSON.parse(localStorage.getItem(this.adventureStorageKey) || 'null');
            const validScenes = ['GARDEN', 'OASIS', 'RIVER'];
            if (!saved || !validScenes.includes(saved.scene)) return;
            this.adventureProgress = {
                scene: saved.scene,
                title: saved.title || this.getJourneyScenes()[saved.scene]?.title || 'Sua aventura',
                icon: saved.icon || '📖',
                stage: saved.stage || 'Etapa da aventura',
                stageLabel: saved.stageLabel || 'Caminho da jornada',
                objective: saved.objective || 'Continuar a aventura',
                updatedAt: Number(saved.updatedAt) || null
            };
            this.adventureProgressSignature = JSON.stringify({
                scene: this.adventureProgress.scene,
                title: this.adventureProgress.title,
                icon: this.adventureProgress.icon,
                stage: this.adventureProgress.stage,
                stageLabel: this.adventureProgress.stageLabel,
                objective: this.adventureProgress.objective
            });
        } catch (error) {
            this.adventureProgress = null;
            this.adventureProgressSignature = '';
        }
    }

    getCurrentAdventureSnapshot() {
        const scenes = this.getJourneyScenes();
        const scene = scenes[this.state];
        if (!scene) return null;

        const snapshot = {
            scene: this.state,
            title: scene.title,
            icon: scene.icon,
            stage: 'Começando a aventura',
            stageLabel: 'Caminho da jornada',
            objective: 'Explorar o cenário e descobrir a primeira missão.'
        };

        if (this.pathOpen) {
            snapshot.stage = 'Caminho da jornada';
            snapshot.stageLabel = 'Próxima escolha';
            snapshot.objective = 'Escolher um cenário.';
            return snapshot;
        }

        if (this.revisitingCompletedScene && this.journeyCompleted[this.state]) {
            snapshot.stage = `${scene.title} completo`;
            snapshot.stageLabel = 'Etapa concluída';
            snapshot.objective = 'Revisitar ou voltar ao caminho.';
            return snapshot;
        }

        if (this.state === 'GARDEN') {
            snapshot.stageLabel = 'Cenário 1 de 3';
            if (this.matchingOpen) {
                snapshot.stage = 'Atividade Amor, Fé e Alegria';
                snapshot.objective = 'Combinar imagem e valor.';
            } else if (this.gardenChoiceActive && !this.gardenChoiceComplete) {
                snapshot.stage = 'Cuidado com o cordeirinho';
                snapshot.objective = 'Escolher como cuidar.';
            } else if (this.gardenChoiceComplete) {
                snapshot.stage = 'Atividade Amor, Fé e Alegria';
                snapshot.objective = 'Tocar em Continuar.';
            } else {
                snapshot.stage = 'Colheita do amor';
                snapshot.objective = `Tocar nas maçãs (${this.collectedApples}/${this.totalApples}).`;
            }
        } else if (this.state === 'OASIS') {
            snapshot.stageLabel = 'Cenário 2 de 3';
            if (this.oasisStep === 0) {
                snapshot.stage = 'Trilha da fé';
                snapshot.objective = 'Seguir a pegada brilhante.';
            } else if (this.oasisStep === 1) {
                snapshot.stage = 'Cuidar no oásis';
                snapshot.objective = this.oasisLambFollowing
                    ? 'Tocar na água azul.'
                    : 'Chamar o cordeirinho.';
            } else if (this.oasisStep === 2 && this.oasisRestIndex < this.oasisRestSpots.length) {
                snapshot.stage = 'Descanso no oásis';
                snapshot.objective = 'Tocar no item destacado.';
            } else if (this.oasisStep === 2) {
                snapshot.stage = 'Louvor com alegria';
                snapshot.objective = 'Tocar as notas na ordem.';
            } else {
                snapshot.stage = 'Oásis completo';
                snapshot.stageLabel = 'Etapa concluída';
                snapshot.objective = 'Escolher um cenário.';
            }
        } else if (this.state === 'RIVER') {
            snapshot.stageLabel = 'Cenário 3 de 3';
            const flower = this.riverFlowers[this.riverFlowerIndex];
            const animal = this.riverAnimals[this.riverFlowerIndex];
            if (this.riverMissionComplete) {
                snapshot.stage = 'Rio completo';
                snapshot.stageLabel = 'Etapa concluída';
                snapshot.objective = 'Revisitar ou escolher um cenário.';
            } else if (this.riverFlowerHeld && flower && animal) {
                snapshot.stage = 'Entrega de bondade';
                snapshot.objective = `Entregar ao ${animal.label}.`;
            } else if (flower && animal) {
                snapshot.stage = 'Compartilhar bondade';
                snapshot.objective = `Tocar na flor e levar ao ${animal.label}.`;
            }
        }

        return snapshot;
    }

    saveCurrentAdventureProgress() {
        const snapshot = this.getCurrentAdventureSnapshot();
        if (!snapshot) return;
        const signature = JSON.stringify(snapshot);
        if (signature === this.adventureProgressSignature) return;

        this.adventureProgress = { ...snapshot, updatedAt: Date.now() };
        this.adventureProgressSignature = signature;
        try {
            localStorage.setItem(this.adventureStorageKey, JSON.stringify(this.adventureProgress));
        } catch (error) {
            // O jogo continua normalmente mesmo se o navegador bloquear o armazenamento local.
        }
        this.updateResumeUI();
    }

    updateResumeUI() {
        const progress = this.adventureProgress;
        const resumeCard = document.getElementById('resume-card');
        const passportResume = document.getElementById('passport-resume');
        if (!progress) {
            if (resumeCard) resumeCard.style.display = 'none';
            if (passportResume) passportResume.style.display = 'none';
            return;
        }

        const sceneTitle = progress.title || 'Sua aventura';
        const sceneLine = `${progress.icon || '📖'} ${sceneTitle}`;
        const resumeTitle = document.getElementById('resume-title');
        const resumeStage = document.getElementById('resume-stage');
        const resumeObjective = document.getElementById('resume-objective');
        const passportScene = document.getElementById('passport-resume-scene');
        const passportStage = document.getElementById('passport-resume-stage');
        const passportObjective = document.getElementById('passport-resume-objective');

        if (resumeCard) resumeCard.style.display = 'block';
        if (resumeTitle) resumeTitle.textContent = `Continuar em ${sceneTitle}`;
        if (resumeStage) resumeStage.textContent = `${progress.stageLabel} · ${progress.stage}`;
        if (resumeObjective) resumeObjective.textContent = progress.objective;
        if (passportResume) passportResume.style.display = 'block';
        if (passportScene) passportScene.textContent = sceneLine;
        if (passportStage) passportStage.textContent = `${progress.stageLabel} · ${progress.stage}`;
        if (passportObjective) passportObjective.textContent = progress.objective;
    }

    updatePassportUI() { 
        const stampNames = { love: 'Amor', faith: 'Fé', joy: 'Alegria', kindness: 'Bondade' };
        const types = Object.keys(this.stamps);
        const earnedCount = types.filter(type => this.stamps[type]).length;
        const total = types.length;
        const memoryTypes = Object.keys(this.memories);
        const rememberedCount = memoryTypes.filter(memory => this.memories[memory]).length;
        const progressText = `${earnedCount} de ${total} selos conquistados`;
        const isPassportComplete = earnedCount === total;
        const savedProgress = document.getElementById('saved-progress');
        const passport = document.getElementById('passport-modal');
        const passportProgress = document.getElementById('passport-progress');

        if (passport) passport.classList.toggle('passport-complete', isPassportComplete);
        if (savedProgress) {
            savedProgress.textContent = earnedCount > 0 || rememberedCount > 0
                ? `Seu passaporte guarda ${progressText} e ${rememberedCount} de ${memoryTypes.length} lembranças. Sua história está guardada neste dispositivo!`
                : 'Seu Passaporte Bíblico está esperando por você.';
        }
        if (passportProgress) passportProgress.textContent = progressText;

        types.forEach(type => {
            const slot = document.getElementById(`stamp-${type}`);
            if (!slot) return;
            slot.classList.toggle('earned', this.stamps[type]);
            slot.setAttribute('aria-label', `${stampNames[type]}: ${this.stamps[type] ? 'conquistado' : 'a conquistar'}`);
        });
        this.updatePassportMemories();
        this.updatePassportJourneyUI();
        this.updateResumeUI();
    }

    updatePassportMemories() {
        const memories = Object.keys(this.memories);
        const rememberedCount = memories.filter(memory => this.memories[memory]).length;
        const count = document.getElementById('passport-memory-count');
        if (count) count.textContent = `${rememberedCount} de ${memories.length} lembranças guardadas`;

        document.querySelectorAll('[data-memory]').forEach(card => {
            const memory = card.dataset.memory;
            const earned = this.memories[memory] === true;
            const status = card.querySelector('.memory-card-status');
            card.classList.toggle('is-locked', !earned);
            card.classList.toggle('is-earned', earned);
            card.setAttribute('aria-label', earned
                ? `${card.querySelector('.memory-card-title')?.textContent || 'Lembrança'}: guardada no Passaporte Bíblico`
                : `${card.querySelector('.memory-card-title')?.textContent || 'Lembrança'}: complete a aventura para descobrir`);
            if (status) status.textContent = earned ? '✓ Lembrança guardada' : '🔒 Lembrança a descobrir';
        });
    }
    
    updatePassportJourneyUI() {
        const sceneCopy = {
            GARDEN: {
                status: '🌱 Comece por aqui.',
                locked: '🌱 Primeiro caminho da jornada.'
            },
            OASIS: {
                status: '✨ Caminho aberto. Continue quando quiser.',
                locked: '🔒 Complete o Jardim para abrir este caminho.'
            },
            RIVER: {
                status: '✨ Caminho aberto. Continue quando quiser.',
                locked: '🔒 Complete o Oásis para abrir este caminho.'
            }
        };

        document.querySelectorAll('[data-passport-scene]').forEach(card => {
            const scene = card.dataset.passportScene;
            const status = card.querySelector('.passport-journey-status');
            const action = card.querySelector('.passport-journey-action');
            const unlocked = this.journeyUnlocked[scene] === true;
            const completed = this.journeyCompleted[scene] === true;
            const copy = sceneCopy[scene];
            if (!copy) return;

            card.disabled = !unlocked;
            card.classList.toggle('is-locked', !unlocked);
            card.classList.toggle('is-completed', completed);
            if (status) status.textContent = completed ? '✓ Cenário concluído · pode revisitar' : unlocked ? copy.status : copy.locked;
            if (action) action.textContent = completed ? '↺ Revisitar sem refazer' : unlocked ? '▶ Continuar aventura' : 'Caminho fechado';
            card.setAttribute('aria-label', `${card.querySelector('.passport-journey-name')?.textContent || 'Cenário'}. ${status?.textContent || ''}. ${action?.textContent || ''}`);
        });
    }

    loadImage(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.src = src;
        });
    }
    
    startGame() {
        this.startAdventureAt('GARDEN', false, true);
    }

    selectPassportJourneyScene(sceneKey) {
        if (!this.journeyUnlocked[sceneKey]) return;
        this.playSound('tap');
        document.getElementById('passport-modal').style.display = 'none';
        this.startAdventureAt(sceneKey, false, false);
        window.ProgressLogger.logProgress(`passport_scene_selected_${sceneKey.toLowerCase()}`);
    }

    continueAdventure() {
        const progress = this.adventureProgress;
        const scene = progress?.scene;
        if (!scene) return this.startGame();
        if (progress.stage === 'Caminho da jornada' || progress.stageLabel === 'Etapa concluída') {
            this.playSound('tap');
            document.getElementById('start-screen').style.display = 'none';
            this.state = scene;
            this.pathOpen = false;
            this.openJourneyPath(scene);
            window.ProgressLogger.logProgress('adventure_path_resumed');
            return;
        }
        this.startAdventureAt(scene, true);
    }

    startAdventureAt(scene, isResume = false, forceFresh = false) {
        if (!['GARDEN', 'OASIS', 'RIVER'].includes(scene)) return;
        this.playSound('tap');
        const resumeObjective = this.adventureProgress?.objective;
        const revisiting = !forceFresh && this.journeyCompleted[scene] === true;
        this.revisitingCompletedScene = revisiting;
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('passport-modal').style.display = 'none';
        document.getElementById('journey-screen').style.display = 'none';
        this.pathOpen = false;
        this.state = scene;
        this.showJourneyReturnButton(revisiting);

        if (scene === 'GARDEN') {
            this.setupGarden(revisiting);
            this.showStory('GARDEN', true);
            this.showDialog(isResume
                ? `Que bom ter você de volta ao Jardim do Amor! Próximo objetivo: ${resumeObjective || 'continuar a aventura'}`
                : revisiting
                    ? 'Você já conquistou o Jardim do Amor! Esta é uma visita especial, sem precisar refazer etapas.'
                    : 'Bem-vindo ao Jardim do Éden! Ajude-me a colher as maçãs do amor.');
        } else if (scene === 'OASIS') {
            this.setupOasis(revisiting);
            if (isResume) {
                this.showDialog(`Que bom ter você de volta ao Oásis da Fé! Próximo objetivo: ${resumeObjective || 'continuar a aventura'}`);
            } else if (revisiting) {
                this.showDialog('Você já conquistou o Oásis da Fé! Explore este lugar de novo sem refazer as etapas.');
            }
        } else {
            this.setupRiver(revisiting);
            if (isResume) {
                this.showDialog(`Que bom ter você de volta ao Rio da Bondade! Próximo objetivo: ${resumeObjective || 'continuar a aventura'}`);
            } else if (revisiting) {
                this.showDialog('Você já conquistou o Rio da Bondade! Visite os amigos e reveja sua conquista.');
            }
        }

        this.saveCurrentAdventureProgress();
        if (this.musicEnabled && this.audio.music) {
            this.audio.music.play().catch(() => {});
        }
        window.ProgressLogger.logProgress(isResume ? 'adventure_resumed' : revisiting ? 'adventure_revisited' : 'game_started');
    }
    
    showJourneyReturnButton(show) {
        const button = document.getElementById('journey-return-btn');
        if (button) button.style.display = show ? 'block' : 'none';
    }

    playSound(key) {
        if (!this.effectsEnabled || !this.audio[key]) return;
        this.audio[key].currentTime = 0;
        this.audio[key].play().catch(() => {});
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        const button = document.getElementById('music-toggle');
        button.textContent = this.musicEnabled ? '🎵 Música: sim' : '🎵 Música: não';
        button.classList.toggle('off', !this.musicEnabled);
        button.setAttribute('aria-pressed', String(this.musicEnabled));
        if (this.audio.music) {
            if (this.musicEnabled && this.state !== 'START') {
                this.audio.music.play().catch(() => {});
            } else {
                this.audio.music.pause();
            }
        }
        this.playSound('tap');
    }

    toggleEffects() {
        this.effectsEnabled = !this.effectsEnabled;
        const button = document.getElementById('effects-toggle');
        button.textContent = this.effectsEnabled ? '✨ Efeitos: sim' : '✨ Efeitos: não';
        button.classList.toggle('off', !this.effectsEnabled);
        button.setAttribute('aria-pressed', String(this.effectsEnabled));
        if (this.effectsEnabled) this.playSound('tap');
    }
    
    setupGarden(revisit = false) {
        document.getElementById('mission-panel').style.display = 'none';
        this.entities = [];
        this.effects = [];
        this.collectedApples = 0;
        this.gardenChoiceActive = false;
        this.gardenChoiceSelected = null;
        this.gardenChoiceComplete = false;
        this.gardenHelper = null;
        this.gardenChoiceSpots = [];
        this.matchingOpen = false;
        this.matchingSelected = null;
        this.matchingMatches = 0;
        this.matchingLocked = false;
        document.getElementById('matching-activity').style.display = 'none';
        
        // Player
        this.player = new Entity(this.width / 2, this.height * 0.7, 100, 200, this.assets.hero);
        this.entities.push(this.player);
        
        // Apples (Interactive dots or small circles since we don't have apple sprites)
        // I'll draw them as red circles on top of the tree positions
        this.apples = [
            { x: this.width * 0.2, y: this.height * 0.4, collected: false },
            { x: this.width * 0.8, y: this.height * 0.35, collected: false },
            { x: this.width * 0.5, y: this.height * 0.3, collected: false }
        ];

        if (revisit) {
            this.collectedApples = this.totalApples;
            this.apples.forEach(apple => { apple.collected = true; });
            this.gardenChoiceActive = true;
            this.gardenChoiceComplete = true;
            this.gardenChoiceSpots = [
                { x: this.width * 0.30, y: this.height * 0.48, icon: '💧', label: 'Dar água', color: '#69c9e8' },
                { x: this.width * 0.70, y: this.height * 0.48, icon: '💛', label: 'Fazer carinho', color: '#f3b84b' }
            ];
            this.gardenChoiceSelected = this.gardenChoiceSpots[0];
            this.gardenHelper = new Entity(this.width * 0.50, this.height * 0.72, 78, 88, this.assets.lamb);
            this.gardenHelper.type = 'garden-lamb';
            this.gardenHelper.bob = true;
            this.gardenHelper.happy = true;
            this.gardenHelper.resting = true;
            this.entities.push(this.gardenHelper);
            this.updateMissionPanel();
        }
        
        this.canvas.onpointerdown = (e) => {
            this.touchX = e.clientX;
            this.touchY = e.clientY;
            if (this.matchingOpen) return;
            
            // Interaction check
            if (this.state === 'GARDEN') {
                if (this.gardenChoiceActive) {
                    this.handleGardenChoicePointer(this.touchX, this.touchY);
                } else {
                    this.apples.forEach(apple => {
                        if (!apple.collected) {
                            const dist = Math.hypot(this.touchX - apple.x, this.touchY - apple.y);
                            if (dist < 50) {
                                apple.collected = true;
                                this.collectedApples++;
                                this.saveCurrentAdventureProgress();
                                this.playSound('success');
                                if (this.collectedApples >= this.totalApples) {
                                    this.earnStamp('love');
                                    this.startGardenChoice();
                                }
                            }
                        }
                    });
                }
            } else if (this.state === 'OASIS') {
                this.handleOasisPointer(this.touchX, this.touchY);
            } else if (this.state === 'RIVER') {
                this.handleRiverPointer(this.touchX, this.touchY);
            }
            
            this.player.targetX = this.touchX;
            this.player.targetY = this.touchY;
        };
        this.updateMissionPanel();
        this.saveCurrentAdventureProgress();
    }

    startGardenChoice() {
        this.gardenChoiceActive = true;
        this.gardenChoiceSelected = null;
        this.gardenChoiceComplete = false;
        this.gardenChoiceSpots = [
            { x: this.width * 0.30, y: this.height * 0.48, icon: '💧', label: 'Dar água', color: '#69c9e8' },
            { x: this.width * 0.70, y: this.height * 0.48, icon: '💛', label: 'Fazer carinho', color: '#f3b84b' }
        ];
        this.gardenHelper = new Entity(this.width * 0.50, this.height * 0.72, 78, 88, this.assets.lamb);
        this.gardenHelper.type = 'garden-lamb';
        this.gardenHelper.bob = true;
        this.entities.push(this.gardenHelper);
        this.updateMissionPanel();
        this.showMissionFeedback('O cordeirinho precisa de ajuda. Escolha um jeito gentil de cuidar.');
        this.showDialog('Você pode dar água ou fazer carinho. As duas escolhas mostram amor!');
        window.ProgressLogger.logProgress('garden_kind_choice_started');
    }

    handleGardenChoicePointer(x, y) {
        if (!this.gardenChoiceActive || this.gardenChoiceComplete) return;
        const choice = this.gardenChoiceSpots.find((spot) => Math.hypot(x - spot.x, y - spot.y) < 82);
        if (!choice) {
            this.showDialog('Toque em uma das duas maneiras gentis de ajudar.');
            return;
        }

        this.gardenChoiceSelected = choice;
        this.gardenChoiceComplete = true;
        this.earnMemory('lambCare');
        this.gardenHelper.happy = true;
        this.gardenHelper.resting = true;
        this.playSound('success');
        this.addOasisEffect(choice.x, choice.y, '✨', choice.color);
        this.addGardenTransformationEffects();
        this.updateMissionPanel();
        this.showMissionFeedback('Muito bem! O amor transforma o jardim.');
        this.showDialog('“Façam tudo com amor.” — 1 Coríntios 16:14. O cordeirinho sorriu e novas flores nasceram!');
        window.ProgressLogger.logProgress(`garden_kind_choice_${choice.label === 'Dar água' ? 'water' : 'care'}`);
        window.ProgressLogger.logProgress('garden_kind_choice_complete');
        setTimeout(() => this.startMatchingActivity(), 1600);
    }

    startMatchingActivity() {
        if (this.matchingOpen) return;
        this.matchingOpen = true;
        this.matchingSelected = null;
        this.matchingMatches = 0;
        this.matchingLocked = false;
        const activity = document.getElementById('matching-activity');
        const feedback = document.getElementById('matching-feedback');
        const verse = document.getElementById('matching-verse');
        activity.classList.remove('is-finished');
        activity.style.display = 'flex';
        feedback.textContent = 'Você consegue! Qual cartão vamos combinar primeiro?';
        verse.textContent = 'Cada valor ensina um jeito bonito de viver.';
        document.querySelectorAll('[data-match-card], [data-match-target]').forEach(button => {
            button.disabled = false;
            button.classList.remove('is-selected', 'is-matched', 'is-wrong');
        });
        document.querySelectorAll('.matching-progress-dot').forEach(dot => dot.classList.remove('is-done'));
        document.getElementById('mission-panel').style.display = 'none';
        document.getElementById('dialog-box').style.display = 'none';
        this.saveCurrentAdventureProgress();
        this.playSound('tap');
        window.ProgressLogger.logProgress('garden_matching_activity_started');
        this.setMatchingActiveControl(document.querySelector('[data-match-card]:not(:disabled)'));
    }

    setMatchingActiveControl(control) {
        document.querySelectorAll('[data-match-card], [data-match-target], #matching-finish').forEach(item => {
            item.classList.remove('is-next-command');
            item.removeAttribute('aria-current');
        });
        if (!control) return;
        control.classList.add('is-next-command');
        control.setAttribute('aria-current', 'step');
        requestAnimationFrame(() => {
            if (this.matchingOpen && !control.disabled) control.focus({ preventScroll: true });
        });
    }

    selectMatchingCard(card) {
        if (!this.matchingOpen || this.matchingLocked || card.disabled || card.classList.contains('is-matched')) return;
        document.querySelectorAll('[data-match-card]').forEach(item => item.classList.remove('is-selected', 'is-wrong'));
        this.matchingSelected = card.dataset.matchCard;
        card.classList.add('is-selected');
        document.getElementById('matching-feedback').textContent = 'Agora escolha o valor que combina com esta imagem.';
        document.getElementById('matching-verse').textContent = 'Amor, Fé e Alegria aparecem em atitudes do dia a dia.';
        this.playSound('tap');
        this.setMatchingActiveControl(document.querySelector('[data-match-target]:not(:disabled)'));
    }

    selectMatchingTarget(target) {
        if (!this.matchingOpen || this.matchingLocked || target.disabled || target.classList.contains('is-matched')) return;
        if (!this.matchingSelected) {
            document.getElementById('matching-feedback').textContent = 'Primeiro escolha um cartão de imagem.';
            document.getElementById('matching-verse').textContent = 'Depois toque em um dos três alvos coloridos.';
            this.playSound('tap');
            this.setMatchingActiveControl(document.querySelector('[data-match-card]:not(:disabled)'));
            return;
        }

        const card = document.querySelector(`[data-match-card="${this.matchingSelected}"]`);
        const expected = this.matchingPairs[this.matchingSelected];
        if (target.dataset.matchTarget !== expected) {
            target.classList.remove('is-wrong');
            requestAnimationFrame(() => target.classList.add('is-wrong'));
            if (card) {
                card.classList.remove('is-wrong');
                requestAnimationFrame(() => card.classList.add('is-wrong'));
            }
            document.getElementById('matching-feedback').textContent = 'Quase! Vamos olhar com calma e tentar de novo.';
            document.getElementById('matching-verse').textContent = 'Errar faz parte de aprender. Você pode tentar outra vez!';
            this.playSound('tap');
            this.setMatchingActiveControl(target);
            setTimeout(() => {
                target.classList.remove('is-wrong');
                if (card) card.classList.remove('is-wrong');
            }, 500);
            return;
        }

        const matchCopy = {
            lamb: {
                feedback: 'Muito bem! Cuidar do cordeirinho mostra Amor.',
                verse: '“Façam tudo com amor.” — 1 Coríntios 16:14.',
                color: '#f08aa8'
            },
            footsteps: {
                feedback: 'Isso! Seguir as pegadas pede Fé e confiança.',
                verse: '“Confia no Senhor de todo o teu coração.” — Provérbios 3:5.',
                color: '#70c9e8'
            },
            music: {
                feedback: 'Que bonito! Cantar pode espalhar Alegria.',
                verse: '“Alegrem-se sempre no Senhor.” — Filipenses 4:4.',
                color: '#f3b84b'
            }
        };
        const copy = matchCopy[this.matchingSelected];
        this.matchingLocked = true;
        card.classList.remove('is-selected');
        card.classList.add('is-matched');
        card.disabled = true;
        target.classList.add('is-matched');
        target.disabled = true;
        this.matchingMatches += 1;
        const progressDots = document.querySelectorAll('.matching-progress-dot');
        if (progressDots[this.matchingMatches - 1]) progressDots[this.matchingMatches - 1].classList.add('is-done');
        document.getElementById('matching-feedback').textContent = copy.feedback;
        document.getElementById('matching-verse').textContent = copy.verse;
        this.renderMatchingBurst(copy.color);
        this.playSound('success');
        window.ProgressLogger.logProgress(`garden_matching_correct_${this.matchingSelected}`);
        this.matchingSelected = null;

        setTimeout(() => {
            this.matchingLocked = false;
            if (this.matchingMatches >= 3) {
                this.completeMatchingActivity();
            } else {
                this.setMatchingActiveControl(document.querySelector('[data-match-card]:not(:disabled)'));
            }
        }, 650);
    }

    renderMatchingBurst(color) {
        const layer = document.getElementById('matching-burst-layer');
        if (!layer) return;
        for (let index = 0; index < 12; index += 1) {
            const spark = document.createElement('span');
            spark.className = 'matching-burst';
            spark.style.setProperty('--burst-color', index % 2 ? color : '#ffd34f');
            spark.style.setProperty('--burst-angle', `${index * 30}deg`);
            layer.appendChild(spark);
            setTimeout(() => spark.remove(), 900);
        }
    }

    completeMatchingActivity() {
        if (!this.matchingOpen) return;
        this.matchingLocked = true;
        const activity = document.getElementById('matching-activity');
        activity.classList.add('is-finished');
        document.getElementById('matching-title').textContent = 'Você combinou tudo! 🌈';
        document.getElementById('matching-instruction').textContent = 'Amor cuida, Fé confia e Alegria agradece. Esses valores podem acompanhar você todos os dias!';
        document.getElementById('matching-feedback').textContent = 'Parabéns, Pequeno Herói! Você aprendeu brincando.';
        document.getElementById('matching-verse').textContent = 'Leve este ensinamento: um coração amoroso, confiante e alegre faz o bem crescer.';
        this.renderMatchingBurst('#71c993');
        this.renderMatchingBurst('#9d9af5');
        this.playSound('success');
        this.setMatchingActiveControl(document.getElementById('matching-finish'));
        window.ProgressLogger.logProgress('garden_matching_activity_complete');
    }

    finishMatchingActivity() {
        if (!this.matchingOpen || !document.getElementById('matching-activity').classList.contains('is-finished')) return;
        this.matchingOpen = false;
        this.matchingLocked = false;
        this.matchingSelected = null;
        document.getElementById('matching-activity').style.display = 'none';
        document.getElementById('matching-activity').classList.remove('is-finished');
        this.playSound('tap');
        this.showDialog('Muito bem! Amor, Fé e Alegria agora fazem parte da sua aventura.');
        setTimeout(() => this.openJourneyPath('GARDEN'), 900);
    }

    addGardenTransformationEffects() {
        const colors = ['#ffcf55', '#ff8fb8', '#7ed8c2', '#9d9af5'];
        for (let index = 0; index < 14; index += 1) {
            const angle = (Math.PI * 2 * index) / 14;
            const radius = 28 + (index % 4) * 12;
            this.effects.push({
                kind: 'particle',
                x: this.gardenHelper.x,
                y: this.gardenHelper.y - 28,
                vx: Math.cos(angle) * (0.5 + (index % 3) * 0.3),
                vy: Math.sin(angle) * (0.5 + (index % 2) * 0.35) - 0.5,
                color: colors[index % colors.length],
                size: 3 + (index % 3),
                life: 1.8,
                maxLife: 1.8
            });
        }
        this.addOasisEffect(this.gardenHelper.x - 48, this.gardenHelper.y - 54, '🌸', '#ff8fb8');
        this.addOasisEffect(this.gardenHelper.x + 48, this.gardenHelper.y - 46, '🌼', '#ffcf55');
        this.addOasisEffect(this.gardenHelper.x, this.gardenHelper.y - 80, '💖', '#ff8fb8');
    }
    
    setupOasis(revisit = false) {
        this.state = 'OASIS';
        this.gardenChoiceActive = false;
        this.entities = [];
        this.effects = [];
        this.oasisStep = 0;
        this.oasisTrailIndex = 0;
        this.oasisRestIndex = 0;
        this.musicBeatIndex = 0;
        this.musicActivityComplete = false;
        this.oasisLambFollowing = false;
        this.oasisWater = { x: this.width * 0.52, y: this.height * 0.71, radius: 76 };
        this.oasisTrail = [
            { x: this.width * 0.70, y: this.height * 0.73 },
            { x: this.width * 0.62, y: this.height * 0.70 },
            { x: this.width * 0.55, y: this.height * 0.68 }
        ];
        this.oasisRestSpots = [
            { x: this.width * 0.42, y: this.height * 0.68, icon: '🌸', label: 'flor' },
            { x: this.width * 0.60, y: this.height * 0.64, icon: '💛', label: 'carinho' }
        ];
        this.musicNotes = [
            { x: this.width * 0.34, y: this.height * 0.43, icon: '★', color: '#ffd34f' },
            { x: this.width * 0.52, y: this.height * 0.33, icon: '♪', color: '#ff83b5' },
            { x: this.width * 0.70, y: this.height * 0.43, icon: '♫', color: '#70d5ed' }
        ];

        if (revisit) {
            this.oasisStep = 3;
            this.oasisTrailIndex = this.oasisTrail.length;
            this.oasisRestIndex = this.oasisRestSpots.length;
            this.oasisLambFollowing = true;
            this.musicBeatIndex = this.musicNotes.length;
            this.musicActivityComplete = true;
            this.oasisRestSpots.forEach(spot => { spot.done = true; });
            this.musicNotes.forEach(note => { note.hit = true; });
        }

        this.player = new Entity(this.width * 0.1, this.height * 0.7, 100, 200, this.assets.hero);
        this.entities.push(this.player);
        
        const lamb = new Entity(this.width * 0.80, this.height * 0.73, 84, 94, this.assets.lamb);
        lamb.type = 'lamb';
        lamb.bob = true;
        if (revisit) {
            lamb.x = this.oasisWater.x;
            lamb.y = this.oasisWater.y;
            lamb.targetX = lamb.x;
            lamb.targetY = lamb.y;
            lamb.following = true;
            lamb.resting = true;
        }
        this.entities.push(lamb);
        
        this.updateMissionPanel();
        this.showStory('OASIS', true);
        this.showDialog("Chegamos ao Oásis! Siga as pegadas brilhantes para ajudar o cordeirinho.");
        window.ProgressLogger.logProgress('oasis_reached');
    }

    setupRiver(revisit = false) {
        this.state = 'RIVER';
        this.entities = [];
        this.effects = [];
        this.riverFlowerIndex = 0;
        this.riverFlowerHeld = false;
        this.riverMissionComplete = false;
        this.riverFlowers = [
            { x: this.width * 0.28, y: this.height * 0.46, color: '#ff8fb8', icon: '🌸', label: 'flor rosa', phase: 0.2, collected: false },
            { x: this.width * 0.52, y: this.height * 0.36, color: '#ffd34f', icon: '🌼', label: 'flor amarela', phase: 1.7, collected: false },
            { x: this.width * 0.74, y: this.height * 0.49, color: '#9d9af5', icon: '🌺', label: 'flor roxa', phase: 3.1, collected: false }
        ];
        this.riverAnimals = [
            { x: this.width * 0.18, y: this.height * 0.70, kind: 'coelho', label: 'coelhinho', color: '#f4d7bd', icon: '🐰', flowerReceived: false },
            { x: this.width * 0.50, y: this.height * 0.76, kind: 'passaro', label: 'passarinho', color: '#70c9e8', icon: '🐦', flowerReceived: false },
            { x: this.width * 0.82, y: this.height * 0.68, kind: 'tartaruga', label: 'tartaruguinha', color: '#78c98a', icon: '🐢', flowerReceived: false }
        ];
        if (revisit) {
            this.riverFlowerIndex = this.riverFlowers.length;
            this.riverMissionComplete = true;
            this.riverFlowers.forEach(flower => { flower.collected = true; });
            this.riverAnimals.forEach(animal => { animal.flowerReceived = true; });
        }
        this.player = new Entity(this.width * 0.50, this.height * 0.86, 100, 200, this.assets.hero);
        this.entities.push(this.player);
        this.canvas.onpointerdown = (e) => {
            this.touchX = e.clientX;
            this.touchY = e.clientY;
            if (this.state === 'RIVER') this.handleRiverPointer(this.touchX, this.touchY);
            this.player.targetX = this.touchX;
            this.player.targetY = this.touchY;
        };
        this.updateMissionPanel();
        this.showStory('RIVER', true);
        this.showDialog('Chegamos ao Rio da Bondade! Vamos levar flores aos amigos que estão esperando.');
        window.ProgressLogger.logProgress('river_of_kindness_reached');
    }

    getJourneyScenes() {
        return {
            GARDEN: {
                title: 'Jardim do Amor',
                value: 'Selo do Amor',
                art: 'assets/garden_background.webp',
                alt: 'Jardim verde com árvores, flores e água brilhante',
                icon: '🌿'
            },
            OASIS: {
                title: 'Oásis da Fé',
                value: 'Selos da Fé e da Alegria',
                art: 'assets/oasis_background.webp',
                alt: 'Oásis ensolarado com palmeiras, areia dourada e água azul',
                icon: '💧'
            },
            RIVER: {
                title: 'Rio da Bondade',
                value: 'Selo da Bondade',
                art: 'assets/kindness_river_background.webp',
                alt: 'Rio azul ensolarado com flores coloridas e margens verdes',
                icon: '🌸'
            }
        };
    }

    openJourneyPath(completedScene) {
        const scenes = this.getJourneyScenes();
        if (!scenes[completedScene]) return;

        const order = ['GARDEN', 'OASIS', 'RIVER'];
        const completedIndex = order.indexOf(completedScene);
        this.journeyCompleted[completedScene] = true;
        if (completedIndex >= 0 && completedIndex < order.length - 1) {
            this.journeyUnlocked[order[completedIndex + 1]] = true;
        }
        this.saveJourneyProgress();
        this.revisitingCompletedScene = false;

        this.pathOpen = true;
        this.showJourneyReturnButton(false);
        document.getElementById('mission-panel').style.display = 'none';
        document.getElementById('dialog-box').style.display = 'none';
        document.getElementById('journey-screen').style.display = 'flex';
        this.updateJourneyPath(completedScene);
        this.saveCurrentAdventureProgress();
        window.ProgressLogger.logProgress(`journey_path_opened_after_${completedScene.toLowerCase()}`);
    }

    updateJourneyPath(completedScene) {
        const scenes = this.getJourneyScenes();
        const order = ['GARDEN', 'OASIS', 'RIVER'];
        const nextScene = order[order.indexOf(completedScene) + 1];
        const allComplete = order.every(scene => this.journeyCompleted[scene]);
        const title = document.getElementById('journey-title');
        const message = document.getElementById('journey-message');

        title.textContent = allComplete
            ? 'A jornada inteira está completa!'
            : `Muito bem! O caminho continua para ${scenes[nextScene]?.title || 'uma nova aventura'}.`;
        message.textContent = allComplete
            ? 'Escolha uma aventura para reviver ou visite novamente seu cenário favorito.'
            : 'Toque em um cartão para avançar ou revisitar uma aventura já conhecida.';

        document.querySelectorAll('[data-journey-scene]').forEach(card => {
            const sceneKey = card.dataset.journeyScene;
            const scene = scenes[sceneKey];
            const isUnlocked = this.journeyUnlocked[sceneKey];
            const isCompleted = this.journeyCompleted[sceneKey];
            const isNext = sceneKey === nextScene && isUnlocked;
            const status = card.querySelector('.journey-card-status');
            const action = card.querySelector('.journey-card-action');
            const art = card.querySelector('.journey-card-art');
            const seal = card.querySelector('.journey-card-seal');

            card.disabled = !isUnlocked;
            card.classList.toggle('is-locked', !isUnlocked);
            card.classList.toggle('is-completed', isCompleted);
            card.classList.toggle('is-next', isNext);
            art.src = scene.art;
            art.alt = scene.alt;
            seal.alt = `${scene.value} do ${scene.title}`;
            status.textContent = isCompleted
                ? '✓ Etapa concluída'
                : isNext
                    ? '✨ Próximo caminho'
                    : '🔒 Complete o caminho anterior';
            action.textContent = isCompleted
                ? '↺ Revisitar aventura'
                : isNext
                    ? `Avançar para ${scene.title}`
                    : 'Caminho bloqueado';
            card.setAttribute('aria-label', `${scene.title}. ${scene.value}. ${status.textContent}. ${action.textContent}`);
        });
    }

    selectJourneyScene(sceneKey) {
        if (!this.pathOpen || !this.journeyUnlocked[sceneKey]) return;
        const scenes = this.getJourneyScenes();
        if (!scenes[sceneKey]) return;

        this.playSound('tap');
        this.pathOpen = false;
        document.getElementById('journey-screen').style.display = 'none';
        this.hideStampCelebration();
        this.startAdventureAt(sceneKey, false, false);

        window.ProgressLogger.logProgress(`journey_scene_selected_${sceneKey.toLowerCase()}`);
    }

    handleRiverPointer(x, y) {
        // Keep the panel synchronized even when the child taps the wrong place.
        this.updateMissionPanel();
        if (this.riverMissionComplete) return;
        const flower = this.riverFlowers[this.riverFlowerIndex];
        const animal = this.riverAnimals[this.riverFlowerIndex];
        if (!flower || !animal) return;

        if (!this.riverFlowerHeld) {
            if (Math.hypot(x - flower.x, y - flower.y) < 76) {
                this.riverFlowerHeld = true;
                flower.collected = true;
                this.playSound('tap');
                this.addOasisEffect(flower.x, flower.y - 8, '✨', flower.color);
                this.showMissionFeedback(`Você encontrou uma flor! Agora entregue-a ao ${animal.label}.`);
                this.showDialog(`Que flor bonita! Toque no ${animal.label} para oferecer este carinho.`);
                this.saveCurrentAdventureProgress();
                window.ProgressLogger.logProgress(`river_flower_collected_${this.riverFlowerIndex + 1}`);
            } else {
                this.showDialog('Procure a flor que está flutuando perto do rio.');
            }
            return;
        }

        if (Math.hypot(x - animal.x, y - animal.y) < 92) {
            this.riverFlowerHeld = false;
            animal.flowerReceived = true;
            this.playSound('success');
            this.addRiverKindnessBurst(animal.x, animal.y, flower.color);
            this.addOasisEffect(animal.x, animal.y - 54, '💛', '#ffd34f');
            this.riverFlowerIndex += 1;
            if (this.riverFlowerIndex >= this.riverFlowers.length) {
                this.riverMissionComplete = true;
                this.earnMemory('riverFlowers');
                this.earnStamp('kindness');
                this.showMissionFeedback('Que lindo! Você espalhou bondade pelo rio inteiro.');
                this.showDialog('Você ajudou todos os amigos! A bondade cresce quando é compartilhada.');
                window.ProgressLogger.logProgress('river_of_kindness_complete');
                this.updateMissionPanel();
                setTimeout(() => this.openJourneyPath('RIVER'), 2200);
            } else {
                this.showMissionFeedback(`O ${animal.label} ficou feliz! Encontre a próxima flor.`);
                this.showDialog('Muito bem! A bondade chegou a mais um amigo. Vamos continuar?');
            }
        } else {
            this.showDialog(`Toque no ${animal.label} que está esperando a flor.`);
        }
    }

    addRiverKindnessBurst(x, y, color) {
        for (let index = 0; index < 12; index += 1) {
            const angle = (Math.PI * 2 * index) / 12;
            const speed = 0.8 + (index % 3) * 0.35;
            this.effects.push({
                kind: 'particle',
                x,
                y: y - 24,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.45,
                color,
                size: 3 + (index % 3),
                life: 1.3,
                maxLife: 1.3
            });
        }
    }

    handleOasisPointer(x, y) {
        const lamb = this.entities.find(entity => entity.type === 'lamb');
        if (!lamb) return;

        if (this.oasisStep === 0) {
            const clue = this.oasisTrail[this.oasisTrailIndex];
            if (clue && Math.hypot(x - clue.x, y - clue.y) < 70) {
                this.addOasisEffect(clue.x, clue.y, '✨');
                this.playSound('success');
                this.oasisTrailIndex += 1;
                if (this.oasisTrailIndex >= this.oasisTrail.length) {
                    this.oasisStep = 1;
                    this.earnMemory('footsteps');
                    this.showMissionFeedback('Muito bem! Agora chame o cordeirinho e leve-o até a água.');
                    this.showDialog('Você seguiu as pistas! Toque no cordeirinho para chamá-lo com carinho.');
                } else {
                    this.showMissionFeedback('Encontrou uma pista! Siga a próxima pegada brilhante.');
                }
            } else {
                this.showDialog('Procure a pegada que está brilhando!');
            }
            return;
        }

        if (this.oasisStep === 1) {
            const lambDistance = Math.hypot(x - lamb.x, y - lamb.y);
            const waterDistance = Math.hypot(x - this.oasisWater.x, y - this.oasisWater.y);
            if (!this.oasisLambFollowing && lambDistance < 100) {
                this.oasisLambFollowing = true;
                lamb.following = true;
                this.playSound('success');
                this.addOasisEffect(lamb.x, lamb.y, '💛');
                this.showMissionFeedback('O cordeirinho está seguindo você! Toque na água azul.');
                this.showDialog('Muito carinho! Agora leve o cordeirinho até a água fresquinha.');
            } else if (this.oasisLambFollowing && waterDistance < this.oasisWater.radius + 30) {
                lamb.targetX = this.oasisWater.x;
                lamb.targetY = this.oasisWater.y;
                lamb.movingToWater = true;
                this.playSound('success');
                this.addOasisEffect(this.oasisWater.x, this.oasisWater.y, '💧');
                this.showMissionFeedback('A água está pertinho! Vamos esperar o cordeirinho chegar.');
            } else if (!this.oasisLambFollowing) {
                this.showDialog('Primeiro, toque no cordeirinho para chamá-lo.');
            } else {
                this.showDialog('Toque na água azul para mostrar o caminho.');
            }
            return;
        }

        if (this.oasisStep === 2) {
            if (this.oasisRestIndex >= this.oasisRestSpots.length) {
                this.handleMusicPointer(x, y);
                return;
            }

            const restSpot = this.oasisRestSpots[this.oasisRestIndex];
            if (restSpot && !restSpot.done && Math.hypot(x - restSpot.x, y - restSpot.y) < 64) {
                restSpot.done = true;
                this.oasisRestIndex += 1;
                this.playSound('success');
                this.addOasisEffect(restSpot.x, restSpot.y, restSpot.icon);
                if (this.oasisRestIndex >= this.oasisRestSpots.length) {
                    this.earnStamp('faith');
                    this.showMissionFeedback('Que cuidado bonito! Agora vamos louvar com alegria.');
                    this.showDialog('Você cuidou com carinho. Toque nas estrelas e notas grandes na ordem: 1, 2, 3!');
                } else {
                    this.showMissionFeedback(`Que cuidado bonito! Ajude com mais um toque suave.`);
                }
            } else {
                this.showDialog('Toque em uma flor ou no coração para cuidar do cordeirinho.');
            }
        }
    }

    handleMusicPointer(x, y) {
        const note = this.musicNotes[this.musicBeatIndex];
        if (!note || this.musicActivityComplete) return;

        if (Math.hypot(x - note.x, y - note.y) < 78) {
            note.hit = true;
            this.musicBeatIndex += 1;
            this.playSound('tap');
            this.addOasisEffect(note.x, note.y, note.icon, note.color);
            this.addMusicBurst(note.x, note.y, note.color);

            if (this.musicBeatIndex >= this.musicNotes.length) {
                this.musicActivityComplete = true;
                this.earnMemory('praiseJoy');
                this.playSound('success');
                this.earnStamp('joy');
                this.showMissionFeedback('Que alegria! Louvar também é uma forma de agradecer.');
                this.showDialog('Muito bem! Louvar também pode ser uma expressão de alegria. O cordeirinho ficou feliz!');
                window.ProgressLogger.logProgress('oasis_music_activity_complete');
                window.ProgressLogger.logProgress('oasis_care_mission_complete');
                setTimeout(() => {
                    const lamb = this.entities.find(entity => entity.type === 'lamb');
                    if (lamb) lamb.resting = true;
                    this.oasisStep = 3;
                    this.updateMissionPanel();
                    setTimeout(() => this.openJourneyPath('OASIS'), 2600);
                }, 700);
            } else {
                this.showMissionFeedback(`Batida ${this.musicBeatIndex}! Agora procure a próxima nota brilhante.`);
            }
        } else {
            this.showDialog('Vamos seguir a sequência: toque na estrela ou nota que está brilhando!');
        }
    }

    addMusicBurst(x, y, color) {
        for (let index = 0; index < 10; index += 1) {
            const angle = (Math.PI * 2 * index) / 10;
            const speed = 1.2 + (index % 3) * 0.45;
            this.effects.push({
                kind: 'particle',
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.4,
                color,
                size: 3 + (index % 2) * 2,
                life: 1,
                maxLife: 1
            });
        }
    }

    addOasisEffect(x, y, icon, color = '#ffffff') {
        this.effects.push({ x, y, icon, color, life: 1, maxLife: 1 });
    }

    showMissionFeedback(message) {
        const panel = document.getElementById('mission-panel');
        this.updateMissionPanel();
        const feedback = document.getElementById('mission-feedback');
        if (feedback) feedback.textContent = message;
        panel.classList.remove('mission-pop');
        requestAnimationFrame(() => panel.classList.add('mission-pop'));
    }

    updateMissionPanel() {
        const panel = document.getElementById('mission-panel');
        if (this.state !== 'GARDEN' && this.state !== 'OASIS' && this.state !== 'RIVER') {
            panel.style.display = 'none';
            this.saveCurrentAdventureProgress();
            return;
        }
        panel.style.display = 'block';
        const title = document.getElementById('mission-title');
        const hint = document.getElementById('mission-hint');
        const target = document.getElementById('mission-target');
        const targetIcon = document.getElementById('mission-target-icon');
        const targetLabel = document.getElementById('mission-target-label');
        const progress = document.getElementById('mission-progress');
        const feedback = document.getElementById('mission-feedback');
        if (feedback) feedback.textContent = '';

        const setTarget = (icon, label) => {
            if (targetIcon) targetIcon.textContent = icon;
            if (targetLabel) targetLabel.textContent = label;
            if (target) target.setAttribute('aria-label', `Alvo ativo: ${label}`);
        };

        if (this.state === 'GARDEN') {
            if (this.gardenChoiceActive) {
                title.textContent = this.gardenChoiceComplete ? 'Jardim do Amor · escolha feita' : 'Jardim do Amor · cuidado';
                hint.textContent = this.gardenChoiceComplete ? 'Toque em Continuar.' : 'Escolha como cuidar.';
                setTarget('💧💛', this.gardenChoiceComplete ? 'Cuidado escolhido' : 'Água ou carinho');
                progress.textContent = this.gardenChoiceComplete ? '✓' : '○ ○';
            } else {
                title.textContent = 'Jardim do Amor · 1';
                hint.textContent = 'Toque nas maçãs brilhantes.';
                setTarget('🍎', 'Maçãs destacadas');
                progress.textContent = `${this.collectedApples}/${this.totalApples} maçãs`;
            }
        } else if (this.state === 'OASIS' && this.oasisStep === 0) {
            title.textContent = 'Oásis da Fé · 1';
            hint.textContent = 'Toque na pegada brilhante.';
            setTarget('👣', 'Próxima pegada');
            progress.textContent = `${this.oasisTrailIndex}/${this.oasisTrail.length} pegadas`;
        } else if (this.state === 'OASIS' && this.oasisStep === 1) {
            title.textContent = 'Oásis da Fé · 2';
            hint.textContent = this.oasisLambFollowing ? 'Toque na água azul.' : 'Toque no cordeirinho.';
            setTarget(this.oasisLambFollowing ? '💧' : '🐑', this.oasisLambFollowing ? 'Água azul' : 'Cordeirinho');
            progress.textContent = '● ● ○';
        } else if (this.state === 'OASIS' && this.oasisStep === 2 && this.oasisRestIndex < this.oasisRestSpots.length) {
            title.textContent = 'Oásis da Fé · 3';
            hint.textContent = 'Toque no item destacado.';
            const spot = this.oasisRestSpots[this.oasisRestIndex];
            setTarget(spot?.icon || '✨', spot?.label === 'flor' ? 'Flor destacada' : 'Carinho destacado');
            progress.textContent = `${this.oasisRestIndex}/${this.oasisRestSpots.length} cuidados · ○ ○ ○`;
        } else if (this.state === 'OASIS' && this.oasisStep === 2) {
            title.textContent = 'Oásis da Fé · música';
            hint.textContent = this.musicActivityComplete ? 'Atividade completa.' : 'Toque na nota brilhante.';
            setTarget(this.musicActivityComplete ? '✓' : '🎵', this.musicActivityComplete ? 'Louvor completo' : `Nota ${this.musicBeatIndex + 1} destacada`);
            progress.textContent = `${this.musicBeatIndex}/${this.musicNotes.length} notas`;
        } else if (this.state === 'RIVER') {
            const totalFlowers = this.riverFlowers.length;
            const flower = this.riverFlowers[this.riverFlowerIndex];
            const animal = this.riverAnimals[this.riverFlowerIndex];
            const step = this.riverFlowerIndex + 1;

            if (this.riverMissionComplete) {
                title.textContent = 'Rio da Bondade · completo';
                hint.textContent = 'Missão completa!';
                setTarget('✓', 'Todos os amigos ajudados');
                progress.textContent = `${totalFlowers}/${totalFlowers} entregues`;
            } else if (flower && animal && this.riverFlowerHeld) {
                title.textContent = `Rio da Bondade · ${step}/${totalFlowers}`;
                hint.textContent = `Toque no ${animal.label}.`;
                setTarget(animal.icon, `${animal.label} destacado`);
                progress.textContent = `${this.riverFlowerIndex}/${totalFlowers} entregues · ${flower.icon} na mão`;
            } else if (flower && animal) {
                title.textContent = `Rio da Bondade · ${step}/${totalFlowers}`;
                hint.textContent = 'Toque na flor destacada.';
                setTarget(flower.icon, `${flower.label} destacada`);
                progress.textContent = `${this.riverFlowerIndex}/${totalFlowers} entregues`;
            } else {
                title.textContent = 'Rio da Bondade · completo';
                hint.textContent = 'Missão completa!';
                setTarget('✓', 'Todos os amigos ajudados');
                progress.textContent = `${totalFlowers}/${totalFlowers} entregues`;
            }
        } else {
            title.textContent = 'Oásis da Fé · completo';
            hint.textContent = 'Missão completa!';
            setTarget('✓', 'Cordeirinho descansando');
            progress.textContent = '● ● ●';
        }
        this.saveCurrentAdventureProgress();
    }

    showStory(scene, animate = false) {
        const stories = {
            GARDEN: {
                title: 'O Jardim do Amor',
                text: 'No jardim bonito, Deus criou flores, árvores e água brilhante. Vamos cuidar de tudo com amor e colher três maçãs!',
                art: 'assets/garden_background.webp',
                alt: 'Jardim verde com árvores, flores, rio e arco-íris',
                dots: '● ○ ○',
                label: 'Cenário 1 de 3'
            },
            OASIS: {
                title: 'O Oásis da Fé',
                text: 'Depois do jardim, chegamos à água fresquinha. Um cordeirinho precisa de ajuda. Com fé e carinho, vamos encontrá-lo!',
                art: 'assets/oasis_background.webp',
                alt: 'Oásis ensolarado com palmeiras, areia dourada e água azul',
                dots: '● ● ○',
                label: 'Cenário 2 de 3'
            },
            RIVER: {
                title: 'O Rio da Bondade',
                text: 'No rio ensolarado, flores flutuam pela água. Vamos levar cada uma a um amigo e descobrir como a bondade se espalha!',
                art: 'assets/kindness_river_background.webp',
                alt: 'Rio azul e ensolarado com flores coloridas e margens verdes',
                dots: '● ● ●',
                label: 'Cenário 3 de 3'
            }
        };
        const story = stories[scene];
        if (!story) return;
        this.currentStory = story;
        document.getElementById('story-title').textContent = story.title;
        document.getElementById('story-text').textContent = story.text;
        document.getElementById('story-art').src = story.art;
        document.getElementById('story-art').alt = story.alt;
        document.getElementById('story-dots').textContent = story.dots;
        document.getElementById('story-dots').setAttribute('aria-label', story.label);
        document.getElementById('story-card').style.display = 'grid';
        if (animate) {
            const card = document.getElementById('story-card');
            card.classList.remove('scene-change');
            requestAnimationFrame(() => card.classList.add('scene-change'));
        }
        this.speakStory();
    }

    speakStory() {
        if (!this.currentStory) return;
        if (!this.speechAvailable) {
            this.showDialog('A história está aqui para você acompanhar. Peça a um adulto para ler em voz alta.');
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`${this.currentStory.title}. ${this.currentStory.text}`);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.82;
        utterance.pitch = 1.08;
        utterance.volume = 1;
        const button = document.getElementById('listen-story');
        utterance.onstart = () => {
            button.textContent = '🔊 Ouvindo...';
            button.classList.add('is-speaking');
        };
        utterance.onend = () => {
            button.textContent = '🔊 Ouvir novamente';
            button.classList.remove('is-speaking');
        };
        utterance.onerror = () => {
            button.textContent = '🔊 Ouvir novamente';
            button.classList.remove('is-speaking');
        };
        window.speechSynthesis.speak(utterance);
    }
    
    showDialog(text) {
        const db = document.getElementById('dialog-box');
        const dt = document.getElementById('dialog-text');
        dt.innerText = text;
        db.style.display = 'block';
        
        if (this.dialogTimeout) clearTimeout(this.dialogTimeout);
        this.dialogTimeout = setTimeout(() => {
            db.style.display = 'none';
        }, 5000);
    }
    
    showStampCelebration(type) {
        const celebrationCopy = {
            love: { title: 'Selo do Amor conquistado!', message: 'Você cuidou com carinho. Sua jornada está guardada.' },
            faith: { title: 'Selo da Fé conquistado!', message: 'Você seguiu com cuidado. Sua jornada está guardada.' },
            joy: { title: 'Selo da Alegria conquistado!', message: 'Que momento feliz! Sua jornada está guardada.' },
            kindness: { title: 'Selo da Bondade conquistado!', message: 'Você espalhou cuidado pelo rio. Sua jornada está guardada.' }
        };
        const celebration = document.getElementById('stamp-celebration');
        if (!celebration) return;

        if (Object.values(this.stamps).every(Boolean)) {
            this.showFinalCelebration();
            return;
        }

        const copy = celebrationCopy[type];
        if (!copy) return;
        document.getElementById('celebration-title').textContent = copy.title;
        document.getElementById('celebration-message').textContent = copy.message;
        celebration.classList.remove('final-celebration', 'visible');
        requestAnimationFrame(() => celebration.classList.add('visible'));

        if (this.celebrationTimeout) clearTimeout(this.celebrationTimeout);
        this.celebrationTimeout = setTimeout(() => {
            celebration.classList.remove('visible');
        }, 3600);
    }

    showFinalCelebration() {
        const celebration = document.getElementById('stamp-celebration');
        if (!celebration) return;
        if (this.celebrationTimeout) clearTimeout(this.celebrationTimeout);
        this.celebrationTimeout = null;
        document.getElementById('final-celebration-title').textContent = 'Você é um Pequeno Herói!';
        document.getElementById('final-celebration-message').textContent = 'Que orgulho! Você reuniu Amor, Fé, Alegria e Bondade e deixou a sua jornada ainda mais bonita.';
        celebration.classList.remove('visible');
        celebration.classList.add('final-celebration');
        requestAnimationFrame(() => {
            celebration.classList.add('visible');
            const firstAction = document.getElementById('final-open-passport');
            if (firstAction) firstAction.focus({ preventScroll: true });
        });
        window.ProgressLogger.logProgress('passport_complete_final_celebration');
    }

    hideStampCelebration() {
        const celebration = document.getElementById('stamp-celebration');
        if (!celebration) return;
        if (this.celebrationTimeout) clearTimeout(this.celebrationTimeout);
        this.celebrationTimeout = null;
        celebration.classList.remove('visible', 'final-celebration');
    }

    earnMemory(type) {
        if (!Object.prototype.hasOwnProperty.call(this.memories, type) || this.memories[type]) return;
        this.memories[type] = true;
        this.saveMemories();
        this.updatePassportUI();
        window.ProgressLogger.logProgress(`memory_earned_${type}`);
    }

    earnStamp(type) {
        if (!this.stamps[type]) {
            this.stamps[type] = true;
            this.saveStamps();
            this.updatePassportUI();
            this.playSound('success');
            this.showStampCelebration(type);
            window.ProgressLogger.logProgress(`stamp_earned_${type}`);
        }
    }
    
    togglePassport(show, opener = document.activeElement) {
        this.playSound('tap');
        this.updatePassportUI();
        const passport = document.getElementById('passport-modal');
        if (!passport) return;
        const passportButton = document.getElementById('passport-btn');
        if (show) {
            this.focusReturnElement = opener && typeof opener.focus === 'function' ? opener : passportButton;
            passport.style.display = 'flex';
            if (passportButton) passportButton.setAttribute('aria-expanded', 'true');
            requestAnimationFrame(() => {
                const firstCommand = passport.querySelector('[data-passport-scene]:not(:disabled)') || document.getElementById('close-passport');
                if (firstCommand) firstCommand.focus({ preventScroll: true });
            });
        } else {
            passport.style.display = 'none';
            if (passportButton) passportButton.setAttribute('aria-expanded', 'false');
            const returnElement = this.focusReturnElement;
            this.focusReturnElement = null;
            if (returnElement && typeof returnElement.focus === 'function') {
                requestAnimationFrame(() => returnElement.focus({ preventScroll: true }));
            }
        }
    }
    
    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
    
    update() {
        if (this.pathOpen || this.matchingOpen) return;
        this.entities.forEach(e => e.update());
        this.effects = this.effects.filter(effect => {
            effect.life -= effect.kind === 'particle' ? 0.035 : 0.025;
            if (effect.kind === 'particle') {
                effect.x += effect.vx;
                effect.y += effect.vy;
                effect.vy += 0.02;
            } else {
                effect.y -= 0.7;
            }
            return effect.life > 0;
        });

        if (this.state === 'OASIS' && this.oasisStep === 1) {
            const lamb = this.entities.find(entity => entity.type === 'lamb');
            if (lamb && lamb.movingToWater && Math.hypot(lamb.x - this.oasisWater.x, lamb.y - this.oasisWater.y) < 14) {
                lamb.movingToWater = false;
                this.oasisStep = 2;
                this.oasisRestIndex = 0;
                lamb.resting = false;
                this.playSound('success');
                this.addOasisEffect(this.oasisWater.x, this.oasisWater.y, '💧');
                this.showMissionFeedback('Ele chegou à água! Agora ajude-o a descansar com toques gentis.');
                this.showDialog('Que bom! A água ajudou. Toque na flor, no coração e na canção suave.');
            }
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw Background
        const bg = this.state === 'OASIS'
            ? this.assets.oasis
            : this.state === 'RIVER'
                ? this.assets.river
                : this.assets.garden;
        this.drawBackground(bg);
        
        // Draw Garden Apples
        if (this.state === 'GARDEN') {
            this.apples.forEach(apple => {
                if (!apple.collected) {
                    this.ctx.fillStyle = '#FF4D4D';
                    this.ctx.beginPath();
                    this.ctx.arc(apple.x, apple.y, 15, 0, Math.PI * 2);
                    this.ctx.fill();
                    // Sparkle effect
                    const time = Date.now() * 0.005;
                    this.ctx.strokeStyle = '#FFF';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(apple.x, apple.y, 20 + Math.sin(time) * 5, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            });
            if (this.gardenChoiceActive) this.drawGardenChoice();
        }

        if (this.state === 'OASIS') this.drawOasisGuides();
        if (this.state === 'RIVER') this.drawRiverGuides();
        
        // Draw Entities
        this.entities.forEach(e => e.draw(this.ctx));
        if (this.state === 'OASIS' || this.state === 'GARDEN' || this.state === 'RIVER') this.drawOasisEffects();
    }

    drawGardenChoice() {
        const ctx = this.ctx;
        const time = Date.now() * 0.004;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.gardenChoiceComplete) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
            ctx.beginPath();
            ctx.ellipse(this.width * 0.5, this.height * 0.34, Math.min(this.width * 0.39, 250), 32, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e88946';
            ctx.font = '600 18px Fredoka, sans-serif';
            ctx.fillText('O amor transforma o jardim!', this.width * 0.5, this.height * 0.34);
            this.drawGardenBloom(this.width * 0.24, this.height * 0.62, '#ff8fb8');
            this.drawGardenBloom(this.width * 0.76, this.height * 0.62, '#ffcf55');
            this.drawGardenBloom(this.width * 0.34, this.height * 0.76, '#9d9af5');
            this.drawGardenBloom(this.width * 0.66, this.height * 0.76, '#7ed8c2');
            this.drawGardenCareDetail();
        } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
            ctx.beginPath();
            ctx.ellipse(this.width * 0.5, this.height * 0.33, Math.min(this.width * 0.39, 250), 34, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#31516f';
            ctx.font = '600 18px Fredoka, sans-serif';
            ctx.fillText('Como podemos ajudar?', this.width * 0.5, this.height * 0.33);
        }

        this.gardenChoiceSpots.forEach((spot, index) => {
            const active = !this.gardenChoiceComplete || this.gardenChoiceSelected === spot;
            const pulse = active && !this.gardenChoiceComplete ? Math.sin(time + index) * 5 : 0;
            const radius = 48 + pulse;
            ctx.globalAlpha = active ? 1 : 0.45;
            ctx.fillStyle = this.gardenChoiceSelected === spot ? '#78cf9d' : '#fff';
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = this.gardenChoiceSelected === spot ? '#fff' : spot.color;
            ctx.lineWidth = active ? 5 : 3;
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, radius + 7 + pulse * 0.3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = this.gardenChoiceSelected === spot ? '#fff' : '#31516f';
            ctx.font = this.gardenChoiceSelected === spot ? '38px sans-serif' : '34px sans-serif';
            ctx.fillText(this.gardenChoiceSelected === spot ? '✓' : spot.icon, spot.x, spot.y - 2);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#31516f';
            ctx.font = '600 15px Fredoka, sans-serif';
            ctx.fillText(`${index + 1}. ${spot.label}`, spot.x, spot.y + 78);
        });

        if (!this.gardenChoiceComplete) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
            ctx.beginPath();
            ctx.roundRect(this.width * 0.5 - 92, this.height * 0.60 - 18, 184, 36, 18);
            ctx.fill();
            ctx.fillStyle = '#31516f';
            ctx.font = '600 14px Fredoka, sans-serif';
            ctx.fillText('O cordeirinho precisa de ajuda', this.width * 0.5, this.height * 0.60);
        }
        ctx.restore();
    }

    drawGardenCareDetail() {
        const ctx = this.ctx;
        const x = this.gardenHelper.x;
        const y = this.gardenHelper.y + 52;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (this.gardenChoiceSelected && this.gardenChoiceSelected.label === 'Dar água') {
            ctx.fillStyle = '#69c9e8';
            ctx.beginPath();
            ctx.ellipse(x - 62, y - 2, 25, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = '#31516f';
            ctx.font = '600 13px Fredoka, sans-serif';
            ctx.fillText('água', x - 62, y - 24);
        } else {
            ctx.fillStyle = '#ff7faf';
            ctx.font = '34px sans-serif';
            ctx.fillText('♥', x + 62, y - 4);
            ctx.strokeStyle = '#ffd34f';
            ctx.lineWidth = 3;
            for (let index = 0; index < 4; index += 1) {
                const angle = (Math.PI * 2 * index) / 4;
                ctx.beginPath();
                ctx.moveTo(x + 62 + Math.cos(angle) * 24, y - 4 + Math.sin(angle) * 24);
                ctx.lineTo(x + 62 + Math.cos(angle) * 34, y - 4 + Math.sin(angle) * 34);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    drawGardenBloom(x, y, color) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = color;
        for (let index = 0; index < 5; index += 1) {
            const angle = (Math.PI * 2 * index) / 5;
            ctx.beginPath();
            ctx.ellipse(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10, 8, 13, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#ffd34f';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#5aa96e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.lineTo(x, y + 29);
        ctx.stroke();
        ctx.restore();
    }

    drawOasisGuides() {
        const ctx = this.ctx;
        const time = Date.now() * 0.004;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.oasisStep === 0) {
            this.oasisTrail.forEach((clue, index) => {
                if (index < this.oasisTrailIndex) {
                    this.drawCheckMark(clue.x, clue.y, 18);
                } else if (index === this.oasisTrailIndex) {
                    const pulse = 28 + Math.sin(time) * 7;
                    ctx.strokeStyle = 'rgba(255, 236, 112, 0.95)';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(clue.x, clue.y, pulse, 0, Math.PI * 2);
                    ctx.stroke();
                    this.drawFootprint(clue.x, clue.y, 1);
                    ctx.fillStyle = '#fff';
                    ctx.font = '600 15px Fredoka, sans-serif';
                    ctx.fillText('toque', clue.x, clue.y - 42);
                } else {
                    this.drawFootprint(clue.x, clue.y, 0.35);
                }
            });
        } else if (this.oasisStep === 1) {
            const waterPulse = this.oasisWater.radius + Math.sin(time) * 7;
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.oasisWater.x, this.oasisWater.y, waterPulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = '600 16px Fredoka, sans-serif';
            ctx.fillText('ÁGUA', this.oasisWater.x, this.oasisWater.y);
            if (!this.oasisLambFollowing) {
                const lamb = this.entities.find(entity => entity.type === 'lamb');
                if (lamb) {
                    ctx.strokeStyle = '#ffe77d';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.arc(lamb.x, lamb.y, 58 + Math.sin(time) * 5, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        } else if (this.oasisStep === 2) {
            this.oasisRestSpots.forEach((spot, index) => {
                if (spot.done) {
                    this.drawCheckMark(spot.x, spot.y, 20);
                } else {
                    const pulse = 25 + Math.sin(time + index) * 5;
                    ctx.fillStyle = 'rgba(255,255,255,0.86)';
                    ctx.beginPath();
                    ctx.arc(spot.x, spot.y, 28, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffd86b';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(spot.x, spot.y, pulse, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.font = '28px sans-serif';
                    ctx.fillText(spot.icon, spot.x, spot.y + 1);
                }
            });
            if (this.oasisRestIndex >= this.oasisRestSpots.length) {
                this.drawMusicActivity();
            }
        }
        ctx.restore();
    }

    drawMusicActivity() {
        const ctx = this.ctx;
        const time = Date.now() * 0.006;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = 'rgba(49, 81, 111, 0.9)';
        ctx.font = '600 18px Fredoka, sans-serif';
        ctx.fillText('TOQUE NA ORDEM · 1  2  3', this.width * 0.52, this.height * 0.22);

        this.musicNotes.forEach((note, index) => {
            const done = index < this.musicBeatIndex;
            const active = index === this.musicBeatIndex && !this.musicActivityComplete;
            const pulse = active ? Math.sin(time) * 7 : 0;
            const radius = (active ? 45 : 39) + pulse;

            ctx.fillStyle = done ? 'rgba(113, 201, 147, 0.96)' : active ? note.color : 'rgba(255, 255, 255, 0.88)';
            ctx.beginPath();
            ctx.arc(note.x, note.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = done ? '#fff' : note.color;
            ctx.lineWidth = active ? 5 : 3;
            ctx.beginPath();
            ctx.arc(note.x, note.y, radius + 5 + (active ? pulse * 0.45 : 0), 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = done ? '#fff' : '#31516f';
            ctx.font = '42px sans-serif';
            ctx.fillText(done ? '✓' : note.icon, note.x, note.y - 1);
            ctx.font = '600 14px Fredoka, sans-serif';
            ctx.fillText(String(index + 1), note.x, note.y + 62);
        });
        ctx.restore();
    }

    drawRiverGuides() {
        const ctx = this.ctx;
        const time = Date.now() * 0.003;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const currentFlower = this.riverFlowers[this.riverFlowerIndex];
        this.riverFlowers.forEach((flower, index) => {
            if (flower.collected || index !== this.riverFlowerIndex) return;
            const bob = Math.sin(time + flower.phase) * 7;
            const pulse = 29 + Math.sin(time * 1.4 + flower.phase) * 5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
            ctx.beginPath();
            ctx.arc(flower.x, flower.y + bob, 28, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = flower.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(flower.x, flower.y + bob, pulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.font = '32px sans-serif';
            ctx.fillText(flower.icon, flower.x, flower.y + bob);
            ctx.fillStyle = '#31516f';
            ctx.font = '600 14px Fredoka, sans-serif';
            ctx.fillText(this.riverFlowerHeld ? 'flor na mão' : 'toque na flor', flower.x, flower.y + bob + 48);
        });

        this.riverAnimals.forEach((animal, index) => {
            const active = !this.riverMissionComplete && this.riverFlowerHeld && index === this.riverFlowerIndex;
            this.drawRiverAnimal(animal, active, time);
        });

        if (this.riverFlowerHeld && currentFlower) {
            ctx.font = '30px sans-serif';
            ctx.fillText(currentFlower.icon, this.player.x, this.player.y - 112);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.roundRect(this.width * 0.5 - 150, this.height * 0.19 - 18, 300, 36, 18);
        ctx.fill();
        ctx.fillStyle = '#31516f';
        ctx.font = '600 15px Fredoka, sans-serif';
        ctx.fillText(this.riverMissionComplete ? 'A bondade chegou a todos!' : 'Uma flor, um amigo, muita bondade', this.width * 0.5, this.height * 0.19);
        ctx.restore();
    }

    drawRiverAnimal(animal, active, time) {
        const ctx = this.ctx;
        const bob = Math.sin(time * 1.3 + animal.x * 0.01) * 2;
        const x = animal.x;
        const y = animal.y + bob;
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.beginPath();
        ctx.ellipse(0, 38, 42, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        if (active) {
            ctx.strokeStyle = '#ffe77d';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(0, 0, 58 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (animal.kind === 'coelho') {
            ctx.fillStyle = animal.color;
            ctx.beginPath();
            ctx.ellipse(0, 5, 34, 27, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-16, -31, 10, 27, -0.18, 0, Math.PI * 2);
            ctx.ellipse(16, -31, 10, 27, 0.18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f2a8b1';
            ctx.beginPath();
            ctx.ellipse(-16, -31, 4, 17, -0.18, 0, Math.PI * 2);
            ctx.ellipse(16, -31, 4, 17, 0.18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(0, -2, 25, 0, Math.PI * 2);
            ctx.fill();
        } else if (animal.kind === 'passaro') {
            ctx.fillStyle = animal.color;
            ctx.beginPath();
            ctx.ellipse(0, 4, 34, 24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(-24, 5, 22, 11, -0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f4b642';
            ctx.beginPath();
            ctx.moveTo(28, 2);
            ctx.lineTo(45, 10);
            ctx.lineTo(28, 16);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(12, -7, 9, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = animal.color;
            ctx.beginPath();
            ctx.ellipse(0, 8, 39, 24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#65ae74';
            ctx.beginPath();
            ctx.arc(35, 0, 19, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#9be0a0';
            ctx.beginPath();
            ctx.arc(-20, -2, 12, 0, Math.PI * 2);
            ctx.arc(0, -7, 12, 0, Math.PI * 2);
            ctx.arc(20, -2, 12, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#31516f';
        ctx.beginPath();
        ctx.arc(8, -6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e88946';
        ctx.font = '600 14px Fredoka, sans-serif';
        ctx.fillText(animal.flowerReceived ? 'Obrigado!' : animal.label, 0, 62);
        if (animal.flowerReceived) {
            ctx.fillStyle = '#ff7faf';
            ctx.font = '26px sans-serif';
            ctx.fillText('♥', 25, -38);
        }
        ctx.restore();
    }

    drawFootprint(x, y, alpha) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffe36f';
        ctx.beginPath();
        ctx.ellipse(x - 7, y + 5, 6, 10, -0.35, 0, Math.PI * 2);
        ctx.ellipse(x + 7, y - 5, 6, 10, -0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawCheckMark(x, y, radius) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(113, 201, 147, 0.95)';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x - 2, y + 7);
        ctx.lineTo(x + 10, y - 8);
        ctx.stroke();
        ctx.restore();
    }

    drawOasisEffects() {
        const ctx = this.ctx;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this.effects.forEach(effect => {
            ctx.globalAlpha = Math.max(0, effect.life);
            if (effect.kind === 'particle') {
                ctx.fillStyle = effect.color;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = effect.color || '#ffffff';
                ctx.font = '30px sans-serif';
                ctx.fillText(effect.icon, effect.x, effect.y);
            }
        });
        ctx.restore();
    }
    
    drawBackground(img) {
        const scale = Math.max(this.width / img.width, this.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        this.ctx.drawImage(img, (this.width - w) / 2, (this.height - h) / 2, w, h);
    }
}

class Entity {
    constructor(x, y, w, h, img) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img = img;
        this.targetX = x;
        this.targetY = y;
        this.speed = 4;
        this.flip = false;
        this.bob = false;
        this.following = false;
        this.movingToWater = false;
        this.resting = false;
        this.happy = false;
    }
    
    update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 5) {
            const vx = (dx / dist) * this.speed;
            const vy = (dy / dist) * this.speed;
            this.x += vx;
            this.y += vy;
            
            if (vx < 0) this.flip = true;
            if (vx > 0) this.flip = false;
        }
    }
    
    draw(ctx) {
        ctx.save();
        const bob = this.bob ? Math.sin(Date.now() * 0.004) * (this.resting ? 2 : 4) : 0;
        ctx.translate(this.x, this.y + bob);
        if (this.flip) ctx.scale(-1, 1);
        
        if (this.resting) {
            ctx.strokeStyle = 'rgba(255, 232, 125, 0.85)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, this.w * 0.62 + Math.sin(Date.now() * 0.003) * 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (this.happy) {
            ctx.fillStyle = '#ff7faf';
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('♥', this.w * 0.42, -this.h * 0.38);
        }
        
        // Ground shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(0, this.h / 2, this.w / 2, this.w / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}

// Start Game
new Game();
