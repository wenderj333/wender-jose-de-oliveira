
import { init, id } from '@instantdb/core';
import { INSTANT_DB_APP_ID } from './instant_db_config.js';

// --- Initialization ---
const db = init({ appId: INSTANT_DB_APP_ID });

// --- Configuration & Constants ---
const LANGUAGES = {
    pt: { name: 'Português', flag: '🇧🇷' },
    es: { name: 'Español', flag: '🇪🇸' },
    en: { name: 'English', flag: '🇺🇸' },
    fr: { name: 'Français', flag: '🇫🇷' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    it: { name: 'Italiano', flag: '🇮🇹' },
    ro: { name: 'Română', flag: '🇷🇴' }
};

const TRANSLATIONS = {
    pt: {
        welcome: "Bem-vindo ao Duelo Bíblico",
        selectLanguage: "Selecione seu idioma para começar",
        start: "Entrar no Lobby",
        onlinePlayers: "Jogadores Online",
        chat: "Chat da Sala",
        challenge: "Desafiar",
        searching: "Procurando adversário...",
        cancelSearch: "Cancelar Procura",
        autoMatch: "Procura Automática",
        inviteSent: "Convite enviado! Ele expira em 60 segundos.",
        inviteReceived: "te desafiou para um duelo!",
        inviteExpires: "Este convite expira em 60 segundos.",
        inviteExpired: "O convite de {name} expirou e foi removido.",
        inviteAlreadyPending: "Você já enviou um convite pendente para este jogador.",
        queueDeadline: "A fila é removida após 30 segundos sem renovação.",
        accept: "Aceitar",
        decline: "Recusar",
        question: "Pergunta",
        score: "Pontos",
        opponentScore: "Adversário",
        waitingOpponent: "Aguardando adversário...",
        gameOver: "Fim de Jogo!",
        victory: "Vitória!",
        defeat: "Derrota!",
        draw: "Empate!",
        rematch: "Jogar Novamente",
        exit: "Sair",
        ranking: "Ranking Geral",
        medals: "Minhas Medalhas",
        rewards: "Recompensas",
        typeMessage: "Digite sua mensagem...",
        send: "Enviar"
    },
    es: {
        welcome: "Bienvenido al Duelo Bíblico",
        selectLanguage: "Selecciona tu idioma para comenzar",
        start: "Entrar al Lobby",
        onlinePlayers: "Jugadores en Línea",
        chat: "Chat de la Sala",
        challenge: "Desafiar",
        searching: "Buscando adversario...",
        cancelSearch: "Cancelar Búsqueda",
        autoMatch: "Búsqueda Automática",
        inviteSent: "¡Invitación enviada! Caduca en 60 segundos.",
        inviteReceived: "¡te ha desafiado a un duelo!",
        inviteExpires: "Esta invitación caduca en 60 segundos.",
        inviteExpired: "La invitación de {name} caducó y fue eliminada.",
        inviteAlreadyPending: "Ya enviaste una invitación pendiente a este jugador.",
        queueDeadline: "La cola se elimina tras 30 segundos sin renovación.",
        accept: "Aceptar",
        decline: "Rechazar",
        question: "Pregunta",
        score: "Puntos",
        opponentScore: "Adversario",
        waitingOpponent: "Esperando al adversario...",
        gameOver: "¡Fin del Juego!",
        victory: "¡Victoria!",
        defeat: "¡Derrota!",
        draw: "¡Empate!",
        rematch: "Jugar de Nuevo",
        exit: "Salir",
        ranking: "Ranking General",
        medals: "Mis Medallas",
        rewards: "Recompensas",
        typeMessage: "Escribe tu mensaje...",
        send: "Enviar"
    },
    en: {
        welcome: "Welcome to Bible Duel",
        selectLanguage: "Select your language to start",
        start: "Enter Lobby",
        onlinePlayers: "Online Players",
        chat: "Room Chat",
        challenge: "Challenge",
        searching: "Searching for opponent...",
        cancelSearch: "Cancel Search",
        autoMatch: "Auto Matchmaking",
        inviteSent: "Invite sent! It expires in 60 seconds.",
        inviteReceived: "challenged you to a duel!",
        inviteExpires: "This invite expires in 60 seconds.",
        inviteExpired: "The invite from {name} expired and was removed.",
        inviteAlreadyPending: "You already sent a pending invite to this player.",
        queueDeadline: "The queue is removed after 30 seconds without renewal.",
        accept: "Accept",
        decline: "Decline",
        question: "Question",
        score: "Score",
        opponentScore: "Opponent",
        waitingOpponent: "Waiting for opponent...",
        gameOver: "Game Over!",
        victory: "Victory!",
        defeat: "Defeat!",
        draw: "Draw!",
        rematch: "Play Again",
        exit: "Exit",
        ranking: "Global Ranking",
        medals: "My Medals",
        rewards: "Rewards",
        typeMessage: "Type your message...",
        send: "Send"
    },
    fr: {
        welcome: "Bienvenue au Duel Biblique",
        selectLanguage: "Sélectionnez votre langue pour commencer",
        start: "Entrer dans le Lobby",
        onlinePlayers: "Joueurs en Ligne",
        chat: "Chat de la Salle",
        challenge: "Défier",
        searching: "Recherche d'un adversaire...",
        cancelSearch: "Annuler la Recherche",
        autoMatch: "Matchmaking Automatique",
        inviteSent: "Invitation envoyée ! Elle expire dans 60 secondes.",
        inviteReceived: "vous a défié en duel !",
        inviteExpires: "Cette invitation expire dans 60 secondes.",
        inviteExpired: "L’invitation de {name} a expiré et a été supprimée.",
        inviteAlreadyPending: "Vous avez déjà envoyé une invitation en attente à ce joueur.",
        queueDeadline: "La file est supprimée après 30 secondes sans renouvellement.",
        accept: "Accepter",
        decline: "Décliner",
        question: "Question",
        score: "Points",
        opponentScore: "Adversaire",
        waitingOpponent: "En attente de l'adversaire...",
        gameOver: "Fin du Jeu !",
        victory: "Victoire !",
        defeat: "Défaite !",
        draw: "Égalité !",
        rematch: "Rejouer",
        exit: "Quitter",
        ranking: "Classement Général",
        medals: "Mes Médailles",
        rewards: "Récompenses",
        typeMessage: "Tapez votre message...",
        send: "Envoyer"
    },
    de: {
        welcome: "Willkommen zum Bibel-Duell",
        selectLanguage: "Wählen Sie Ihre Sprache, um zu beginnen",
        start: "Lobby betreten",
        onlinePlayers: "Online-Spieler",
        chat: "Raum-Chat",
        challenge: "Herausfordern",
        searching: "Suche Gegner...",
        cancelSearch: "Suche abbrechen",
        autoMatch: "Automatische Suche",
        inviteSent: "Einladung gesendet! Sie läuft in 60 Sekunden ab.",
        inviteReceived: "hat dich zu einem Duell herausgefordert!",
        inviteExpires: "Diese Einladung läuft in 60 Sekunden ab.",
        inviteExpired: "Die Einladung von {name} ist abgelaufen und wurde entfernt.",
        inviteAlreadyPending: "Du hast diesem Spieler bereits eine offene Einladung gesendet.",
        queueDeadline: "Die Warteschlange wird nach 30 Sekunden ohne Erneuerung entfernt.",
        accept: "Annehmen",
        decline: "Ablehnen",
        question: "Frage",
        score: "Punkte",
        opponentScore: "Gegner",
        waitingOpponent: "Warten auf Gegner...",
        gameOver: "Spiel vorbei!",
        victory: "Sieg!",
        defeat: "Niederlage!",
        draw: "Unentschieden!",
        rematch: "Erneut spielen",
        exit: "Verlassen",
        ranking: "Gesamtranking",
        medals: "Meine Medaillen",
        rewards: "Belohnungen",
        typeMessage: "Nachricht eingeben...",
        send: "Senden"
    },
    it: {
        welcome: "Benvenuto al Duello Biblico",
        selectLanguage: "Seleziona la tua lingua per iniziare",
        start: "Entra nella Lobby",
        onlinePlayers: "Giocatori Online",
        chat: "Chat della Stanza",
        challenge: "Sfida",
        searching: "Ricerca avversario...",
        cancelSearch: "Annulla Ricerca",
        autoMatch: "Ricerca Automatica",
        inviteSent: "Invito inviato! Scade tra 60 secondi.",
        inviteReceived: "ti ha sfidato a un duello!",
        inviteExpires: "Questo invito scade tra 60 secondi.",
        inviteExpired: "L’invito di {name} è scaduto ed è stato rimosso.",
        inviteAlreadyPending: "Hai già inviato un invito in sospeso a questo giocatore.",
        queueDeadline: "La coda viene rimossa dopo 30 secondi senza rinnovo.",
        accept: "Accetta",
        decline: "Rifiuta",
        question: "Domanda",
        score: "Punti",
        opponentScore: "Avversario",
        waitingOpponent: "In attesa dell'avversario...",
        gameOver: "Fine del Gioco!",
        victory: "Vittoria!",
        defeat: "Sconfitta!",
        draw: "Pareggio!",
        rematch: "Gioca Ancora",
        exit: "Esci",
        ranking: "Classifica Generale",
        medals: "Le Mie Medaglie",
        rewards: "Premi",
        typeMessage: "Scrivi un messaggio...",
        send: "Invia"
    },
    ro: {
        welcome: "Bun venit la Duelul Biblic",
        selectLanguage: "Selectați limba pentru a începe",
        start: "Intră în Lobby",
        onlinePlayers: "Jucători Online",
        chat: "Chat-ul Camerei",
        challenge: "Provoacă",
        searching: "Se caută adversar...",
        cancelSearch: "Anulează Căutarea",
        autoMatch: "Căutare Automată",
        inviteSent: "Invitație trimisă! Expiră în 60 de secunde.",
        inviteReceived: "te-a provocat la un duel!",
        inviteExpires: "Această invitație expiră în 60 de secunde.",
        inviteExpired: "Invitația de la {name} a expirat și a fost eliminată.",
        inviteAlreadyPending: "Ai trimis deja o invitație în așteptare acestui jucător.",
        queueDeadline: "Coada este eliminată după 30 de secunde fără reînnoire.",
        accept: "Acceptă",
        decline: "Refuză",
        question: "Întrebare",
        score: "Puncte",
        opponentScore: "Adversar",
        waitingOpponent: "Se așteaptă adversarul...",
        gameOver: "Joc Terminat!",
        victory: "Victorie!",
        defeat: "Înfrângere!",
        draw: "Egalitate!",
        rematch: "Joacă din nou",
        exit: "Ieșire",
        ranking: "Clasament General",
        medals: "Medaliile Mele",
        rewards: "Recompense",
        typeMessage: "Scrie un mesaj...",
        send: "Trimite"
    }
};

const QUESTION_UI_TRANSLATIONS = {
    pt: { sharedReview: 'Revisão compartilhada', reviewWaiting: 'Aguardando a revisão do adversário...', correctAnswer: 'Alternativa correta', reference: 'Referência', explanation: 'Explicação' },
    es: { sharedReview: 'Revisión compartida', reviewWaiting: 'Esperando la revisión del adversario...', correctAnswer: 'Alternativa correcta', reference: 'Referencia', explanation: 'Explicación' },
    en: { sharedReview: 'Shared review', reviewWaiting: 'Waiting for the opponent to receive the review...', correctAnswer: 'Correct answer', reference: 'Reference', explanation: 'Explanation' },
    fr: { sharedReview: 'Révision partagée', reviewWaiting: "En attente de la réception de la révision par l'adversaire...", correctAnswer: 'Bonne réponse', reference: 'Référence', explanation: 'Explication' },
    de: { sharedReview: 'Gemeinsame Auswertung', reviewWaiting: 'Warten, bis der Gegner die Auswertung erhält...', correctAnswer: 'Richtige Antwort', reference: 'Bibelstelle', explanation: 'Erklärung' },
    it: { sharedReview: 'Revisione condivisa', reviewWaiting: 'In attesa che l’avversario riceva la revisione...', correctAnswer: 'Risposta corretta', reference: 'Riferimento', explanation: 'Spiegazione' },
    ro: { sharedReview: 'Recapitulare comună', reviewWaiting: 'Se așteaptă ca adversarul să primească recapitularea...', correctAnswer: 'Răspunsul corect', reference: 'Referință', explanation: 'Explicație' }
};

function questionUiText(key) {
    return QUESTION_UI_TRANSLATIONS[currentLanguage]?.[key] || QUESTION_UI_TRANSLATIONS.pt[key] || key;
}

const ROUND_TRANSLATIONS = {
    pt: {
        time: 'Tempo',
        seconds: 'seg',
        timeUp: 'Tempo esgotado',
        roundEnded: 'Rodada encerrada',
        noResponse: 'Sem resposta',
        advanceNotice: 'A partida segue para a próxima pergunta.',
        noResponseSummary: 'Perguntas sem resposta'
    },
    es: {
        time: 'Tiempo',
        seconds: 's',
        timeUp: 'Tiempo agotado',
        roundEnded: 'Ronda terminada',
        noResponse: 'Sin respuesta',
        advanceNotice: 'La partida continúa con la siguiente pregunta.',
        noResponseSummary: 'Preguntas sin respuesta'
    },
    en: {
        time: 'Time',
        seconds: 'sec',
        timeUp: 'Time is up',
        roundEnded: 'Round ended',
        noResponse: 'No response',
        advanceNotice: 'The match continues to the next question.',
        noResponseSummary: 'Questions without a response'
    },
    fr: {
        time: 'Temps',
        seconds: 's',
        timeUp: 'Temps écoulé',
        roundEnded: 'Manche terminée',
        noResponse: 'Sans réponse',
        advanceNotice: 'Le duel continue avec la question suivante.',
        noResponseSummary: 'Questions sans réponse'
    },
    de: {
        time: 'Zeit',
        seconds: 'Sek.',
        timeUp: 'Zeit abgelaufen',
        roundEnded: 'Runde beendet',
        noResponse: 'Keine Antwort',
        advanceNotice: 'Das Duell geht mit der nächsten Frage weiter.',
        noResponseSummary: 'Fragen ohne Antwort'
    },
    it: {
        time: 'Tempo',
        seconds: 's',
        timeUp: 'Tempo scaduto',
        roundEnded: 'Round terminato',
        noResponse: 'Nessuna risposta',
        advanceNotice: 'Il duello continua con la domanda successiva.',
        noResponseSummary: 'Domande senza risposta'
    },
    ro: {
        time: 'Timp',
        seconds: 'sec',
        timeUp: 'Timpul a expirat',
        roundEnded: 'Runda s-a încheiat',
        noResponse: 'Fără răspuns',
        advanceNotice: 'Duelul continuă cu următoarea întrebare.',
        noResponseSummary: 'Întrebări fără răspuns'
    }
};

function roundText(key) {
    return ROUND_TRANSLATIONS[currentLanguage]?.[key] || ROUND_TRANSLATIONS.pt[key] || key;
}

const REMATCH_TRANSLATIONS = {
    pt: {
        inviteTitle: 'Convite de revanche pendente',
        inviteBody: 'Seu adversário quer jogar novamente. Confirme para iniciar uma nova partida.',
        waitingTitle: 'Você confirmou a revanche',
        waitingBody: 'Aguardando a confirmação do adversário.',
        confirmed: 'Revanche confirmada! Preparando a nova partida...',
        declined: 'O convite de revanche foi recusado.',
        confirm: 'Aceitar revanche',
        decline: 'Recusar revanche'
    },
    es: {
        inviteTitle: 'Invitación de revancha pendiente',
        inviteBody: 'Tu adversario quiere jugar de nuevo. Confirma para iniciar una nueva partida.',
        waitingTitle: 'Has confirmado la revancha',
        waitingBody: 'Esperando la confirmación del adversario.',
        confirmed: '¡Revancha confirmada! Preparando la nueva partida...',
        declined: 'La invitación de revancha fue rechazada.',
        confirm: 'Aceptar revancha',
        decline: 'Rechazar revancha'
    },
    en: {
        inviteTitle: 'Rematch invitation pending',
        inviteBody: 'Your opponent wants to play again. Confirm to start a new match.',
        waitingTitle: 'You confirmed the rematch',
        waitingBody: 'Waiting for your opponent to confirm.',
        confirmed: 'Rematch confirmed! Preparing the new match...',
        declined: 'The rematch invitation was declined.',
        confirm: 'Accept rematch',
        decline: 'Decline rematch'
    },
    fr: {
        inviteTitle: 'Invitation de revanche en attente',
        inviteBody: 'Votre adversaire veut rejouer. Confirmez pour commencer une nouvelle partie.',
        waitingTitle: 'Vous avez confirmé la revanche',
        waitingBody: "En attente de la confirmation de l'adversaire.",
        confirmed: 'Revanche confirmée ! Préparation de la nouvelle partie...',
        declined: "L'invitation de revanche a été refusée.",
        confirm: 'Accepter la revanche',
        decline: 'Refuser la revanche'
    },
    de: {
        inviteTitle: 'Rückspiel-Einladung ausstehend',
        inviteBody: 'Dein Gegner möchte erneut spielen. Bestätige, um ein neues Spiel zu starten.',
        waitingTitle: 'Du hast das Rückspiel bestätigt',
        waitingBody: 'Warten auf die Bestätigung des Gegners.',
        confirmed: 'Rückspiel bestätigt! Neues Spiel wird vorbereitet...',
        declined: 'Die Rückspiel-Einladung wurde abgelehnt.',
        confirm: 'Rückspiel annehmen',
        decline: 'Rückspiel ablehnen'
    },
    it: {
        inviteTitle: 'Invito alla rivincita in attesa',
        inviteBody: 'Il tuo avversario vuole giocare ancora. Conferma per iniziare una nuova partita.',
        waitingTitle: 'Hai confermato la rivincita',
        waitingBody: 'In attesa della conferma dell’avversario.',
        confirmed: 'Rivincita confermata! Preparazione della nuova partita...',
        declined: 'L’invito alla rivincita è stato rifiutato.',
        confirm: 'Accetta rivincita',
        decline: 'Rifiuta rivincita'
    },
    ro: {
        inviteTitle: 'Invitație de revanșă în așteptare',
        inviteBody: 'Adversarul vrea să joace din nou. Confirmă pentru a începe o partidă nouă.',
        waitingTitle: 'Ai confirmat revanșa',
        waitingBody: 'Se așteaptă confirmarea adversarului.',
        confirmed: 'Revanșa a fost confirmată! Se pregătește partida nouă...',
        declined: 'Invitația de revanșă a fost refuzată.',
        confirm: 'Acceptă revanșa',
        decline: 'Refuză revanșa'
    }
};

function rematchText(key) {
    return REMATCH_TRANSLATIONS[currentLanguage]?.[key] || REMATCH_TRANSLATIONS.pt[key] || key;
}

const PROGRESS_TRANSLATIONS = {
    pt: {
        saved: 'Progresso salvo',
        recording: 'Registrando esta partida...',
        matchGain: 'Ganho desta partida',
        xpEarned: 'XP ganho',
        streak: 'Sequência atual',
        bestStreak: 'Melhor sequência',
        totalXp: 'XP acumulado',
        totalDuels: 'Duelos concluídos',
        rewardsEarned: 'Recompensas recebidas',
        rewardParticipation: 'XP de participação',
        rewardVictory: 'Medalha de vitória',
        rewardDraw: 'Medalha de honra',
        rewardPractice: 'Distintivo de perseverança',
        rewardStreak: 'Bônus de sequência',
        historyTitle: 'Últimos duelos',
        historySubtitle: 'Acompanhe seus resultados e conquistas',
        historyEmpty: 'Seus duelos concluídos aparecerão aqui.',
        progressOverview: 'Meu progresso',
        wins: 'Vitórias',
        resultWin: 'Vitória',
        resultLoss: 'Derrota',
        resultDraw: 'Empate',
        versus: 'contra',
        unknownOpponent: 'Adversário',
        trendTitle: 'Momento recente',
        trendSubtitle: 'Leitura dos últimos 5 duelos',
        filterAll: 'Todos',
        filterWins: 'Vitórias',
        filterLosses: 'Derrotas',
        filterDraws: 'Empates',
        trendWins: 'Vitórias recentes',
        trendXp: 'XP recente',
        trendPeak: 'Pico de sequência',
        trendForm: 'Forma recente',
        nextChallenge: 'Próximo desafio',
        trendPositive: 'Você está em alta. Encare um adversário mais forte para testar sua sequência.',
        trendSteady: 'Seu momento está equilibrado. Um novo duelo pode abrir a próxima sequência.',
        trendRecovery: 'Use o próximo duelo para recuperar ritmo e transformar experiência em vitória.',
        trendEmpty: 'Complete alguns duelos para desbloquear suas tendências.'
    },
    es: {
        saved: 'Progreso guardado',
        recording: 'Registrando esta partida...',
        matchGain: 'Ganancia de esta partida',
        xpEarned: 'XP ganado',
        streak: 'Racha actual',
        bestStreak: 'Mejor racha',
        totalXp: 'XP acumulado',
        totalDuels: 'Duelos completados',
        rewardsEarned: 'Recompensas recibidas',
        rewardParticipation: 'XP de participación',
        rewardVictory: 'Medalla de victoria',
        rewardDraw: 'Medalla de honor',
        rewardPractice: 'Insignia de perseverancia',
        rewardStreak: 'Bono de racha',
        historyTitle: 'Últimos duelos',
        historySubtitle: 'Sigue tus resultados y logros',
        historyEmpty: 'Tus duelos completados aparecerán aquí.',
        progressOverview: 'Mi progreso',
        wins: 'Victorias',
        resultWin: 'Victoria',
        resultLoss: 'Derrota',
        resultDraw: 'Empate',
        versus: 'contra',
        unknownOpponent: 'Adversario',
        trendTitle: 'Momento reciente',
        trendSubtitle: 'Lectura de los últimos 5 duelos',
        filterAll: 'Todos',
        filterWins: 'Victorias',
        filterLosses: 'Derrotas',
        filterDraws: 'Empates',
        trendWins: 'Victorias recientes',
        trendXp: 'XP reciente',
        trendPeak: 'Pico de racha',
        trendForm: 'Forma reciente',
        nextChallenge: 'Próximo desafío',
        trendPositive: 'Estás en racha. Enfrenta a un rival más fuerte para ponerla a prueba.',
        trendSteady: 'Tu momento está equilibrado. Un nuevo duelo puede iniciar la próxima racha.',
        trendRecovery: 'Usa el próximo duelo para recuperar ritmo y convertir experiencia en victoria.',
        trendEmpty: 'Completa algunos duelos para desbloquear tus tendencias.'
    },
    en: {
        saved: 'Progress saved',
        recording: 'Recording this match...',
        matchGain: 'This match gain',
        xpEarned: 'XP earned',
        streak: 'Current streak',
        bestStreak: 'Best streak',
        totalXp: 'Total XP',
        totalDuels: 'Completed duels',
        rewardsEarned: 'Rewards received',
        rewardParticipation: 'Participation XP',
        rewardVictory: 'Victory medal',
        rewardDraw: 'Honor medal',
        rewardPractice: 'Perseverance badge',
        rewardStreak: 'Streak bonus',
        historyTitle: 'Recent duels',
        historySubtitle: 'Track your results and achievements',
        historyEmpty: 'Your completed duels will appear here.',
        progressOverview: 'My progress',
        wins: 'Wins',
        resultWin: 'Victory',
        resultLoss: 'Defeat',
        resultDraw: 'Draw',
        versus: 'against',
        unknownOpponent: 'Opponent',
        trendTitle: 'Recent momentum',
        trendSubtitle: 'Reading your last 5 duels',
        filterAll: 'All',
        filterWins: 'Wins',
        filterLosses: 'Defeats',
        filterDraws: 'Draws',
        trendWins: 'Recent wins',
        trendXp: 'Recent XP',
        trendPeak: 'Streak peak',
        trendForm: 'Recent form',
        nextChallenge: 'Next challenge',
        trendPositive: 'You are on a roll. Face a stronger opponent to test your streak.',
        trendSteady: 'Your momentum is balanced. A new duel can start the next streak.',
        trendRecovery: 'Use the next duel to regain rhythm and turn experience into a win.',
        trendEmpty: 'Complete a few duels to unlock your trends.'
    },
    fr: {
        saved: 'Progression enregistrée',
        recording: 'Enregistrement de cette partie...',
        matchGain: 'Gain de cette partie',
        xpEarned: 'XP gagné',
        streak: 'Série actuelle',
        bestStreak: 'Meilleure série',
        totalXp: 'XP total',
        totalDuels: 'Duels terminés',
        rewardsEarned: 'Récompenses reçues',
        rewardParticipation: 'XP de participation',
        rewardVictory: 'Médaille de victoire',
        rewardDraw: "Médaille d'honneur",
        rewardPractice: 'Badge de persévérance',
        rewardStreak: 'Bonus de série',
        historyTitle: 'Derniers duels',
        historySubtitle: 'Suivez vos résultats et vos réussites',
        historyEmpty: 'Vos duels terminés apparaîtront ici.',
        progressOverview: 'Ma progression',
        wins: 'Victoires',
        resultWin: 'Victoire',
        resultLoss: 'Défaite',
        resultDraw: 'Égalité',
        versus: 'contre',
        unknownOpponent: 'Adversaire',
        trendTitle: 'Dynamique récente',
        trendSubtitle: 'Lecture de vos 5 derniers duels',
        filterAll: 'Tous',
        filterWins: 'Victoires',
        filterLosses: 'Défaites',
        filterDraws: 'Égalités',
        trendWins: 'Victoires récentes',
        trendXp: 'XP récent',
        trendPeak: 'Pic de série',
        trendForm: 'Forme récente',
        nextChallenge: 'Prochain défi',
        trendPositive: 'Vous êtes en forme. Affrontez un adversaire plus fort pour tester votre série.',
        trendSteady: 'Votre dynamique est équilibrée. Un nouveau duel peut lancer la prochaine série.',
        trendRecovery: 'Utilisez le prochain duel pour retrouver votre rythme et viser la victoire.',
        trendEmpty: 'Terminez quelques duels pour débloquer vos tendances.'
    },
    de: {
        saved: 'Fortschritt gespeichert',
        recording: 'Dieses Spiel wird gespeichert...',
        matchGain: 'Gewinn aus diesem Spiel',
        xpEarned: 'XP erhalten',
        streak: 'Aktuelle Serie',
        bestStreak: 'Beste Serie',
        totalXp: 'Gesamt-XP',
        totalDuels: 'Abgeschlossene Duelle',
        rewardsEarned: 'Erhaltene Belohnungen',
        rewardParticipation: 'Teilnahme-XP',
        rewardVictory: 'Siegermedaille',
        rewardDraw: 'Ehrenmedaille',
        rewardPractice: 'Ausdauer-Abzeichen',
        rewardStreak: 'Serienbonus',
        historyTitle: 'Letzte Duelle',
        historySubtitle: 'Verfolge deine Ergebnisse und Erfolge',
        historyEmpty: 'Deine abgeschlossenen Duelle erscheinen hier.',
        progressOverview: 'Mein Fortschritt',
        wins: 'Siege',
        resultWin: 'Sieg',
        resultLoss: 'Niederlage',
        resultDraw: 'Unentschieden',
        versus: 'gegen',
        unknownOpponent: 'Gegner',
        trendTitle: 'Aktuelle Form',
        trendSubtitle: 'Auswertung der letzten 5 Duelle',
        filterAll: 'Alle',
        filterWins: 'Siege',
        filterLosses: 'Niederlagen',
        filterDraws: 'Unentschieden',
        trendWins: 'Aktuelle Siege',
        trendXp: 'Aktuelle XP',
        trendPeak: 'Serienhöhepunkt',
        trendForm: 'Aktuelle Form',
        nextChallenge: 'Nächste Herausforderung',
        trendPositive: 'Du bist in Form. Fordere einen stärkeren Gegner heraus, um deine Serie zu testen.',
        trendSteady: 'Deine Form ist ausgeglichen. Ein neues Duell kann die nächste Serie starten.',
        trendRecovery: 'Nutze das nächste Duell, um deinen Rhythmus zurückzugewinnen und zu siegen.',
        trendEmpty: 'Schließe einige Duelle ab, um deine Trends zu sehen.'
    },
    it: {
        saved: 'Progressi salvati',
        recording: 'Registrazione della partita...',
        matchGain: 'Guadagno di questa partita',
        xpEarned: 'XP guadagnati',
        streak: 'Serie attuale',
        bestStreak: 'Migliore serie',
        totalXp: 'XP totali',
        totalDuels: 'Duelli completati',
        rewardsEarned: 'Premi ricevuti',
        rewardParticipation: 'XP partecipazione',
        rewardVictory: 'Medaglia della vittoria',
        rewardDraw: "Medaglia d'onore",
        rewardPractice: 'Distintivo di perseveranza',
        rewardStreak: 'Bonus serie',
        historyTitle: 'Ultimi duelli',
        historySubtitle: 'Segui i tuoi risultati e i tuoi traguardi',
        historyEmpty: 'I tuoi duelli completati appariranno qui.',
        progressOverview: 'I miei progressi',
        wins: 'Vittorie',
        resultWin: 'Vittoria',
        resultLoss: 'Sconfitta',
        resultDraw: 'Pareggio',
        versus: 'contro',
        unknownOpponent: 'Avversario',
        trendTitle: 'Momento recente',
        trendSubtitle: 'Lettura degli ultimi 5 duelli',
        filterAll: 'Tutti',
        filterWins: 'Vittorie',
        filterLosses: 'Sconfitte',
        filterDraws: 'Pareggi',
        trendWins: 'Vittorie recenti',
        trendXp: 'XP recenti',
        trendPeak: 'Picco della serie',
        trendForm: 'Forma recente',
        nextChallenge: 'Prossima sfida',
        trendPositive: 'Sei in forma. Sfida un avversario più forte per mettere alla prova la tua serie.',
        trendSteady: 'Il tuo momento è equilibrato. Un nuovo duello può iniziare la prossima serie.',
        trendRecovery: 'Usa il prossimo duello per ritrovare il ritmo e trasformare l’esperienza in vittoria.',
        trendEmpty: 'Completa alcuni duelli per sbloccare le tue tendenze.'
    },
    ro: {
        saved: 'Progres salvat',
        recording: 'Se înregistrează această partidă...',
        matchGain: 'Câștigul acestei partide',
        xpEarned: 'XP câștigat',
        streak: 'Serie actuală',
        bestStreak: 'Cea mai bună serie',
        totalXp: 'XP total',
        totalDuels: 'Dueluri finalizate',
        rewardsEarned: 'Recompense primite',
        rewardParticipation: 'XP de participare',
        rewardVictory: 'Medalie pentru victorie',
        rewardDraw: 'Medalie de onoare',
        rewardPractice: 'Insignă de perseverență',
        rewardStreak: 'Bonus de serie',
        historyTitle: 'Ultimele dueluri',
        historySubtitle: 'Urmărește-ți rezultatele și realizările',
        historyEmpty: 'Duelurile finalizate vor apărea aici.',
        progressOverview: 'Progresul meu',
        wins: 'Victorii',
        resultWin: 'Victorie',
        resultLoss: 'Înfrângere',
        resultDraw: 'Egalitate',
        versus: 'contra',
        unknownOpponent: 'Adversar',
        trendTitle: 'Forma recentă',
        trendSubtitle: 'Privirea asupra ultimelor 5 dueluri',
        filterAll: 'Toate',
        filterWins: 'Victorii',
        filterLosses: 'Înfrângeri',
        filterDraws: 'Egalități',
        trendWins: 'Victorii recente',
        trendXp: 'XP recent',
        trendPeak: 'Vârful seriei',
        trendForm: 'Forma recentă',
        nextChallenge: 'Următoarea provocare',
        trendPositive: 'Ești într-o formă bună. Provoacă un adversar mai puternic pentru a-ți testa seria.',
        trendSteady: 'Forma ta este echilibrată. Un nou duel poate începe următoarea serie.',
        trendRecovery: 'Folosește următorul duel pentru a-ți recăpăta ritmul și a transforma experiența în victorie.',
        trendEmpty: 'Finalizează câteva dueluri pentru a-ți debloca tendințele.'
    }
};

function progressText(key) {
    return PROGRESS_TRANSLATIONS[currentLanguage]?.[key] || PROGRESS_TRANSLATIONS.pt[key] || key;
}

const MILESTONE_TRANSLATIONS = {
    pt: {
        nextMilestone: 'Próximo marco',
        goalProgress: '{current} de {target}',
        rewardLabel: 'Recompensa',
        collectionTitle: 'Coleção desbloqueada',
        collectionEmpty: 'Conclua um duelo para começar sua coleção.',
        celebrationTitle: 'Novo marco desbloqueado!',
        celebrationBody: 'Você alcançou “{name}” e conquistou {reward}.',
        milestoneFirstDuel: 'Primeiro passo',
        milestoneFirstWin: 'Primeira vitória',
        milestoneStreak3: 'Chama da constância',
        milestoneDuels5: 'Caminho fiel',
        milestoneWins3: 'Tríplice vitória',
        milestoneStreak5: 'Firme na jornada',
        milestoneDuels10: 'Guardião do conhecimento',
        rewardSeed: 'Semente da fé',
        rewardLight: 'Luz da vitória',
        rewardStar: 'Estrela da constância',
        rewardPath: 'Caminho fiel',
        rewardCrown: 'Coroa do triunfo',
        rewardFlame: 'Chama da perseverança',
        rewardHeart: 'Coração sábio'
    },
    es: {
        nextMilestone: 'Próximo hito',
        goalProgress: '{current} de {target}',
        rewardLabel: 'Recompensa',
        collectionTitle: 'Colección desbloqueada',
        collectionEmpty: 'Completa un duelo para comenzar tu colección.',
        celebrationTitle: '¡Nuevo hito desbloqueado!',
        celebrationBody: 'Alcanzaste “{name}” y ganaste {reward}.',
        milestoneFirstDuel: 'Primer paso',
        milestoneFirstWin: 'Primera victoria',
        milestoneStreak3: 'Llama de constancia',
        milestoneDuels5: 'Camino fiel',
        milestoneWins3: 'Triple victoria',
        milestoneStreak5: 'Firme en el camino',
        milestoneDuels10: 'Guardián del conocimiento',
        rewardSeed: 'Semilla de fe',
        rewardLight: 'Luz de victoria',
        rewardStar: 'Estrella de constancia',
        rewardPath: 'Camino fiel',
        rewardCrown: 'Corona del triunfo',
        rewardFlame: 'Llama de perseverancia',
        rewardHeart: 'Corazón sabio'
    },
    en: {
        nextMilestone: 'Next milestone',
        goalProgress: '{current} of {target}',
        rewardLabel: 'Reward',
        collectionTitle: 'Unlocked collection',
        collectionEmpty: 'Complete a duel to begin your collection.',
        celebrationTitle: 'New milestone unlocked!',
        celebrationBody: 'You reached “{name}” and earned {reward}.',
        milestoneFirstDuel: 'First step',
        milestoneFirstWin: 'First victory',
        milestoneStreak3: 'Steady flame',
        milestoneDuels5: 'Faithful path',
        milestoneWins3: 'Triple victory',
        milestoneStreak5: 'Steadfast journey',
        milestoneDuels10: 'Keeper of knowledge',
        rewardSeed: 'Seed of faith',
        rewardLight: 'Light of victory',
        rewardStar: 'Steady star',
        rewardPath: 'Faithful path',
        rewardCrown: 'Crown of triumph',
        rewardFlame: 'Flame of perseverance',
        rewardHeart: 'Wise heart'
    },
    fr: {
        nextMilestone: 'Prochain jalon',
        goalProgress: '{current} sur {target}',
        rewardLabel: 'Récompense',
        collectionTitle: 'Collection débloquée',
        collectionEmpty: 'Terminez un duel pour commencer votre collection.',
        celebrationTitle: 'Nouveau jalon débloqué !',
        celebrationBody: 'Vous avez atteint « {name} » et gagné {reward}.',
        milestoneFirstDuel: 'Premier pas',
        milestoneFirstWin: 'Première victoire',
        milestoneStreak3: 'Flamme de constance',
        milestoneDuels5: 'Chemin fidèle',
        milestoneWins3: 'Triple victoire',
        milestoneStreak5: 'Fidèle dans le chemin',
        milestoneDuels10: 'Gardien du savoir',
        rewardSeed: 'Graine de foi',
        rewardLight: 'Lumière de victoire',
        rewardStar: 'Étoile de constance',
        rewardPath: 'Chemin fidèle',
        rewardCrown: 'Couronne du triomphe',
        rewardFlame: 'Flamme de persévérance',
        rewardHeart: 'Cœur sage'
    },
    de: {
        nextMilestone: 'Nächster Meilenstein',
        goalProgress: '{current} von {target}',
        rewardLabel: 'Belohnung',
        collectionTitle: 'Freigeschaltete Sammlung',
        collectionEmpty: 'Schließe ein Duell ab, um deine Sammlung zu beginnen.',
        celebrationTitle: 'Neuer Meilenstein freigeschaltet!',
        celebrationBody: 'Du hast „{name}“ erreicht und {reward} erhalten.',
        milestoneFirstDuel: 'Erster Schritt',
        milestoneFirstWin: 'Erster Sieg',
        milestoneStreak3: 'Flamme der Beständigkeit',
        milestoneDuels5: 'Treuer Weg',
        milestoneWins3: 'Dreifachsieg',
        milestoneStreak5: 'Standhaft unterwegs',
        milestoneDuels10: 'Hüter des Wissens',
        rewardSeed: 'Same des Glaubens',
        rewardLight: 'Licht des Sieges',
        rewardStar: 'Stern der Beständigkeit',
        rewardPath: 'Treuer Weg',
        rewardCrown: 'Krone des Triumphs',
        rewardFlame: 'Flamme der Ausdauer',
        rewardHeart: 'Weises Herz'
    },
    it: {
        nextMilestone: 'Prossimo traguardo',
        goalProgress: '{current} su {target}',
        rewardLabel: 'Ricompensa',
        collectionTitle: 'Collezione sbloccata',
        collectionEmpty: 'Completa un duello per iniziare la tua collezione.',
        celebrationTitle: 'Nuovo traguardo sbloccato!',
        celebrationBody: 'Hai raggiunto “{name}” e conquistato {reward}.',
        milestoneFirstDuel: 'Primo passo',
        milestoneFirstWin: 'Prima vittoria',
        milestoneStreak3: 'Fiamma della costanza',
        milestoneDuels5: 'Cammino fedele',
        milestoneWins3: 'Tripla vittoria',
        milestoneStreak5: 'Saldi nel cammino',
        milestoneDuels10: 'Custode della conoscenza',
        rewardSeed: 'Seme della fede',
        rewardLight: 'Luce della vittoria',
        rewardStar: 'Stella della costanza',
        rewardPath: 'Cammino fedele',
        rewardCrown: 'Corona del trionfo',
        rewardFlame: 'Fiamma della perseveranza',
        rewardHeart: 'Cuore saggio'
    },
    ro: {
        nextMilestone: 'Următorul prag',
        goalProgress: '{current} din {target}',
        rewardLabel: 'Recompensă',
        collectionTitle: 'Colecție deblocată',
        collectionEmpty: 'Finalizează un duel pentru a începe colecția.',
        celebrationTitle: 'Prag nou deblocat!',
        celebrationBody: 'Ai atins „{name}” și ai câștigat {reward}.',
        milestoneFirstDuel: 'Primul pas',
        milestoneFirstWin: 'Prima victorie',
        milestoneStreak3: 'Flacăra statorniciei',
        milestoneDuels5: 'Calea credincioasă',
        milestoneWins3: 'Victorie triplă',
        milestoneStreak5: 'Neclintit pe drum',
        milestoneDuels10: 'Păzitorul cunoașterii',
        rewardSeed: 'Sămânța credinței',
        rewardLight: 'Lumina victoriei',
        rewardStar: 'Steaua statorniciei',
        rewardPath: 'Calea credincioasă',
        rewardCrown: 'Coroana triumfului',
        rewardFlame: 'Flacăra perseverenței',
        rewardHeart: 'Inimă înțeleaptă'
    }
};

function milestoneText(key) {
    return MILESTONE_TRANSLATIONS[currentLanguage]?.[key] || MILESTONE_TRANSLATIONS.pt[key] || key;
}

function milestoneTemplate(key, values = {}) {
    return Object.entries(values).reduce((text, [token, value]) => text.replaceAll(`{${token}}`, String(value)), milestoneText(key));
}

const MILESTONE_CATALOG = [
    { id: 'duels_1', metric: 'duels', target: 1, reward: 'seed_of_faith', icon: '🌱', titleKey: 'milestoneFirstDuel', rewardKey: 'rewardSeed' },
    { id: 'wins_1', metric: 'wins', target: 1, reward: 'victory_light', icon: '🏅', titleKey: 'milestoneFirstWin', rewardKey: 'rewardLight' },
    { id: 'streak_3', metric: 'streak', target: 3, reward: 'steady_star', icon: '🔥', titleKey: 'milestoneStreak3', rewardKey: 'rewardStar' },
    { id: 'duels_5', metric: 'duels', target: 5, reward: 'faithful_path', icon: '📖', titleKey: 'milestoneDuels5', rewardKey: 'rewardPath' },
    { id: 'wins_3', metric: 'wins', target: 3, reward: 'triumph_crown', icon: '👑', titleKey: 'milestoneWins3', rewardKey: 'rewardCrown' },
    { id: 'streak_5', metric: 'streak', target: 5, reward: 'perseverance_flame', icon: '✨', titleKey: 'milestoneStreak5', rewardKey: 'rewardFlame' },
    { id: 'duels_10', metric: 'duels', target: 10, reward: 'wise_heart', icon: '💙', titleKey: 'milestoneDuels10', rewardKey: 'rewardHeart' }
];

const PLAYER_PROFILE_STORAGE_KEY = 'sigo-com-fe-duelo-biblico-player-v1';

function readStoredPlayerProfile() {
    try {
        const stored = JSON.parse(localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY) || 'null');
        return stored && typeof stored === 'object' ? stored : null;
    } catch (error) {
        return null;
    }
}

function saveStoredPlayerProfile() {
    if (!currentUser) return;
    try {
        localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify({
            id: currentUser.id,
            name: currentUser.name,
            xp: Number(currentUser.xp || 0),
            wins: Number(currentUser.wins || 0),
            winStreak: Number(currentUser.winStreak || 0),
            bestStreak: Number(currentUser.bestStreak || 0),
            totalDuels: Number(currentUser.totalDuels || 0),
            unlockedMilestones: Array.isArray(currentUser.unlockedMilestones) ? currentUser.unlockedMilestones : [],
            collectibleRewards: Array.isArray(currentUser.collectibleRewards) ? currentUser.collectibleRewards : [],
            progressionVersion: Number(currentUser.progressionVersion || 1)
        }));
    } catch (error) {
        // Storage can be unavailable in privacy-restricted browser contexts.
    }
}

function milestoneStatsFor(userLike) {
    return {
        duels: Number(userLike?.totalDuels || 0),
        wins: Number(userLike?.wins || 0),
        streak: Number(userLike?.winStreak || 0),
        bestStreak: Number(userLike?.bestStreak || 0)
    };
}

function milestoneValue(milestone, stats, forUnlock = false) {
    if (milestone.metric === 'streak' && forUnlock) return stats.bestStreak;
    return stats[milestone.metric] || 0;
}

function progressionStateFor(userLike) {
    const stats = milestoneStatsFor(userLike);
    const unlocked = new Set(Array.isArray(userLike?.unlockedMilestones) ? userLike.unlockedMilestones : []);
    const rewards = new Set(Array.isArray(userLike?.collectibleRewards) ? userLike.collectibleRewards : []);
    MILESTONE_CATALOG.forEach((milestone) => {
        if (milestoneValue(milestone, stats, true) >= milestone.target) {
            unlocked.add(milestone.id);
            rewards.add(milestone.reward);
        }
    });
    return {
        stats,
        unlockedMilestones: MILESTONE_CATALOG.filter((milestone) => unlocked.has(milestone.id)).map((milestone) => milestone.id),
        collectibleRewards: MILESTONE_CATALOG.filter((milestone) => rewards.has(milestone.reward)).map((milestone) => milestone.reward)
    };
}

function milestoneTitle(milestone) {
    return milestoneText(milestone.titleKey);
}

function milestoneRewardLabel(milestone) {
    return milestoneText(milestone.rewardKey);
}

function nextMilestoneFor(userLike) {
    const state = progressionStateFor(userLike);
    return MILESTONE_CATALOG.find((milestone) => !state.unlockedMilestones.includes(milestone.id)) || null;
}

function renderMilestoneOverview() {
    const state = progressionStateFor(currentUser);
    const next = MILESTONE_CATALOG.find((milestone) => !state.unlockedMilestones.includes(milestone.id));
    const collection = MILESTONE_CATALOG.filter((milestone) => state.unlockedMilestones.includes(milestone.id));
    const nextMarkup = next ? `
        <div class="milestone-next-card">
            <div class="milestone-next-heading">
                <span class="milestone-icon">${next.icon}</span>
                <div><strong>${milestoneText('nextMilestone')}</strong><b>${escapeHtml(milestoneTitle(next))}</b></div>
            </div>
            <div class="milestone-progress-line"><span>${milestoneTemplate('goalProgress', { current: Math.min(milestoneValue(next, state.stats), next.target), target: next.target })}</span><strong>${milestoneText('rewardLabel')}: ${escapeHtml(milestoneRewardLabel(next))}</strong></div>
            <div class="milestone-progress-track"><span style="width:${Math.min(100, (milestoneValue(next, state.stats) / next.target) * 100)}%"></span></div>
        </div>
    ` : `<div class="milestone-complete-note">${milestoneText('collectionTitle')} ✨</div>`;
    const collectionMarkup = collection.length > 0
        ? collection.map((milestone) => `<span class="collection-chip" title="${escapeHtml(milestoneRewardLabel(milestone))}"><span>${milestone.icon}</span>${escapeHtml(milestoneRewardLabel(milestone))}</span>`).join('')
        : `<span class="collection-empty">${milestoneText('collectionEmpty')}</span>`;
    return `
        <section class="milestone-overview" aria-labelledby="milestone-overview-title">
            <div class="milestone-overview-heading"><h3 id="milestone-overview-title">${milestoneText('nextMilestone')}</h3><span>${collection.length}/${MILESTONE_CATALOG.length}</span></div>
            ${nextMarkup}
            <div class="collection-heading"><strong>${milestoneText('collectionTitle')}</strong></div>
            <div class="collection-chip-list">${collectionMarkup}</div>
        </section>
    `;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatDuelDate(timestamp) {
    const date = new Date(Number(timestamp));
    if (!Number.isFinite(date.getTime())) return '—';
    return new Intl.DateTimeFormat(currentLanguage, { day: '2-digit', month: 'short' }).format(date);
}

function resultLabel(result) {
    if (result === 'win') return progressText('resultWin');
    if (result === 'loss') return progressText('resultLoss');
    return progressText('resultDraw');
}

function resultClass(result) {
    if (result === 'win') return 'win';
    if (result === 'loss') return 'loss';
    return 'draw';
}

function opponentNameForResult(result) {
    if (result.opponentName) return result.opponentName;
    if (userDirectory[result.opponentId]?.name) return userDirectory[result.opponentId].name;
    if (result.opponentId) return `${progressText('unknownOpponent')} #${String(result.opponentId).slice(-4)}`;
    return progressText('unknownOpponent');
}

function playerNameForMatch(match, playerId) {
    if (playerId === currentUser?.id) return currentUser.name;
    if (playerId === currentOpponent?.id && currentOpponent?.name) return currentOpponent.name;
    if (userDirectory[playerId]?.name) return userDirectory[playerId].name;
    return playerId ? `${progressText('unknownOpponent')} #${String(playerId).slice(-4)}` : progressText('unknownOpponent');
}

function timeoutPlayerIds(match, questionIndex) {
    const stored = match?.roundTimeouts?.[questionIndex];
    const ids = Array.isArray(stored)
        ? stored
        : stored && typeof stored === 'object'
            ? Object.entries(stored).filter(([, value]) => Boolean(value)).map(([playerId]) => playerId)
            : [];
    return ids.filter((playerId) => !answerWasSubmitted(match, playerId, questionIndex));
}

function timeoutSummaryForMatch(match) {
    const rounds = match?.roundTimeouts || {};
    return Object.keys(rounds)
        .sort((a, b) => Number(a) - Number(b))
        .map((questionIndex) => {
            const ids = timeoutPlayerIds(match, Number(questionIndex));
            if (ids.length === 0) return '';
            const names = ids.map((playerId) => escapeHtml(playerNameForMatch(match, playerId))).join(', ');
            return `${t('question')} ${Number(questionIndex) + 1}: ${names}`;
        })
        .filter(Boolean);
}

const QUESTION_BANK_VERSION = 2;
const MATCH_ROUND_COUNT = 9;
const ROUND_DIFFICULTY_PATTERN = ['easy', 'medium', 'hard', 'easy', 'medium', 'hard', 'easy', 'medium', 'hard'];

// Every locale keeps the same option order and correct index. Only the displayed
// language changes, so the shared match never gives one language an advantage.
const QUESTIONS = [
    {
        id: 'q1', topic: 'torah', difficulty: 'easy',
        pt: { topic: 'Torá e criação', difficulty: 'Fácil', q: 'Quem construiu a arca?', a: ['Moisés', 'Noé', 'Abraão', 'Davi'], correct: 1, reference: 'Gênesis 6:14–22', explanation: 'Deus instruiu Noé a construir a arca para preservar sua família e os animais durante o dilúvio.' },
        es: { topic: 'Torá y creación', difficulty: 'Fácil', q: '¿Quién construyó el arca?', a: ['Moisés', 'Noé', 'Abraham', 'David'], correct: 1, reference: 'Génesis 6:14–22', explanation: 'Dios indicó a Noé que construyera el arca para preservar a su familia y a los animales durante el diluvio.' },
        en: { topic: 'Torah and creation', difficulty: 'Easy', q: 'Who built the ark?', a: ['Moses', 'Noah', 'Abraham', 'David'], correct: 1, reference: 'Genesis 6:14–22', explanation: 'God instructed Noah to build the ark to preserve his family and the animals during the flood.' },
        fr: { topic: 'Torah et création', difficulty: 'Facile', q: "Qui a construit l'arche ?", a: ['Moïse', 'Noé', 'Abraham', 'David'], correct: 1, reference: 'Genèse 6:14–22', explanation: "Dieu a demandé à Noé de construire l'arche pour préserver sa famille et les animaux pendant le déluge." },
        de: { topic: 'Tora und Schöpfung', difficulty: 'Leicht', q: 'Wer baute die Arche?', a: ['Mose', 'Noah', 'Abraham', 'David'], correct: 1, reference: '1. Mose 6,14–22', explanation: 'Gott beauftragte Noah, die Arche zu bauen, damit seine Familie und die Tiere die Flut überlebten.' },
        it: { topic: 'Torah e creazione', difficulty: 'Facile', q: "Chi ha costruito l'arca?", a: ['Mosè', 'Noè', 'Abramo', 'Davide'], correct: 1, reference: 'Genesi 6:14–22', explanation: 'Dio ordinò a Noè di costruire l’arca per salvare la sua famiglia e gli animali durante il diluvio.' },
        ro: { topic: 'Tora și creație', difficulty: 'Ușor', q: 'Cine a construit arca?', a: ['Moise', 'Noe', 'Avraam', 'David'], correct: 1, reference: 'Geneza 6:14–22', explanation: 'Dumnezeu i-a spus lui Noe să construiască arca pentru a-și salva familia și animalele de potop.' }
    },
    {
        id: 'q2', topic: 'torah', difficulty: 'easy',
        pt: { topic: 'Torá e criação', difficulty: 'Fácil', q: 'Qual é o primeiro livro da Bíblia?', a: ['Êxodo', 'Salmos', 'Gênesis', 'Mateus'], correct: 2, reference: 'Gênesis 1:1', explanation: 'Gênesis abre a Bíblia e começa narrando a criação dos céus e da terra.' },
        es: { topic: 'Torá y creación', difficulty: 'Fácil', q: '¿Cuál es el primer libro de la Biblia?', a: ['Éxodo', 'Salmos', 'Génesis', 'Mateo'], correct: 2, reference: 'Génesis 1:1', explanation: 'Génesis abre la Biblia y comienza narrando la creación de los cielos y la tierra.' },
        en: { topic: 'Torah and creation', difficulty: 'Easy', q: 'What is the first book of the Bible?', a: ['Exodus', 'Psalms', 'Genesis', 'Matthew'], correct: 2, reference: 'Genesis 1:1', explanation: 'Genesis opens the Bible and begins by telling of the creation of the heavens and the earth.' },
        fr: { topic: 'Torah et création', difficulty: 'Facile', q: 'Quel est le premier livre de la Bible ?', a: ['Exode', 'Psaumes', 'Genèse', 'Matthieu'], correct: 2, reference: 'Genèse 1:1', explanation: 'La Genèse ouvre la Bible et commence par le récit de la création des cieux et de la terre.' },
        de: { topic: 'Tora und Schöpfung', difficulty: 'Leicht', q: 'Was ist das erste Buch der Bibel?', a: ['Exodus', 'Psalmen', 'Genesis', 'Matthäus'], correct: 2, reference: '1. Mose 1,1', explanation: 'Das erste Buch Mose eröffnet die Bibel und erzählt vom Anfang der Schöpfung.' },
        it: { topic: 'Torah e creazione', difficulty: 'Facile', q: 'Qual è il primo libro della Bibbia?', a: ['Esodo', 'Salmi', 'Genesi', 'Matteo'], correct: 2, reference: 'Genesi 1:1', explanation: 'La Genesi apre la Bibbia e racconta per prima la creazione dei cieli e della terra.' },
        ro: { topic: 'Tora și creație', difficulty: 'Ușor', q: 'Care este prima carte a Bibliei?', a: ['Exodul', 'Psalmii', 'Geneza', 'Matei'], correct: 2, reference: 'Geneza 1:1', explanation: 'Geneza deschide Biblia și începe cu relatarea creației cerurilor și a pământului.' }
    },
    {
        id: 'q3', topic: 'gospels', difficulty: 'easy',
        pt: { topic: 'Evangelhos', difficulty: 'Fácil', q: 'Quantos apóstolos Jesus escolheu?', a: ['7', '10', '12', '40'], correct: 2, reference: 'Mateus 10:1–4', explanation: 'Jesus chamou doze apóstolos para acompanhá-lo e anunciar o Reino de Deus.' },
        es: { topic: 'Evangelios', difficulty: 'Fácil', q: '¿Cuántos apóstoles escogió Jesús?', a: ['7', '10', '12', '40'], correct: 2, reference: 'Mateo 10:1–4', explanation: 'Jesús llamó a doce apóstoles para que lo acompañaran y anunciaran el Reino de Dios.' },
        en: { topic: 'Gospels', difficulty: 'Easy', q: 'How many apostles did Jesus choose?', a: ['7', '10', '12', '40'], correct: 2, reference: 'Matthew 10:1–4', explanation: 'Jesus appointed twelve apostles to accompany him and proclaim the kingdom of God.' },
        fr: { topic: 'Évangiles', difficulty: 'Facile', q: 'Combien d’apôtres Jésus a-t-il choisis ?', a: ['7', '10', '12', '40'], correct: 2, reference: 'Matthieu 10:1–4', explanation: 'Jésus a appelé douze apôtres pour l’accompagner et annoncer le royaume de Dieu.' },
        de: { topic: 'Evangelien', difficulty: 'Leicht', q: 'Wie viele Apostel wählte Jesus?', a: ['7', '10', '12', '40'], correct: 2, reference: 'Matthäus 10,1–4', explanation: 'Jesus berief zwölf Apostel, die ihn begleiten und Gottes Reich verkünden sollten.' },
        it: { topic: 'Vangeli', difficulty: 'Facile', q: 'Quanti apostoli scelse Gesù?', a: ['7', '10', '12', '40'], correct: 2, reference: 'Matteo 10:1–4', explanation: 'Gesù scelse dodici apostoli perché lo accompagnassero e annunciassero il regno di Dio.' },
        ro: { topic: 'Evanghelii', difficulty: 'Ușor', q: 'Câți apostoli a ales Isus?', a: ['7', '10', '12', '40'], correct: 2, reference: 'Matei 10:1–4', explanation: 'Isus a ales doisprezece apostoli ca să-L însoțească și să vestească Împărăția lui Dumnezeu.' }
    },
    {
        id: 'q4', topic: 'history', difficulty: 'easy',
        pt: { topic: 'História de Israel', difficulty: 'Fácil', q: 'Quem derrotou o gigante Golias?', a: ['Saul', 'Salomão', 'Davi', 'Sansão'], correct: 2, reference: '1 Samuel 17:45–50', explanation: 'Davi enfrentou Golias confiando no Senhor e o venceu com uma pedra lançada pela funda.' },
        es: { topic: 'Historia de Israel', difficulty: 'Fácil', q: '¿Quién derrotó al gigante Goliat?', a: ['Saúl', 'Salomón', 'David', 'Sansón'], correct: 2, reference: '1 Samuel 17:45–50', explanation: 'David enfrentó a Goliat confiando en el Señor y lo venció con una piedra de su honda.' },
        en: { topic: 'History of Israel', difficulty: 'Easy', q: 'Who defeated the giant Goliath?', a: ['Saul', 'Solomon', 'David', 'Samson'], correct: 2, reference: '1 Samuel 17:45–50', explanation: 'David faced Goliath trusting in the Lord and defeated him with a stone from his sling.' },
        fr: { topic: 'Histoire d’Israël', difficulty: 'Facile', q: 'Qui a vaincu le géant Goliath ?', a: ['Saül', 'Salomon', 'David', 'Samson'], correct: 2, reference: '1 Samuel 17:45–50', explanation: 'David a affronté Goliath en faisant confiance au Seigneur et l’a vaincu avec une pierre de sa fronde.' },
        de: { topic: 'Israels Geschichte', difficulty: 'Leicht', q: 'Wer besiegte den Riesen Goliath?', a: ['Saul', 'Salomo', 'David', 'Simson'], correct: 2, reference: '1. Samuel 17,45–50', explanation: 'David vertraute auf den Herrn und besiegte Goliat mit einem Stein aus seiner Schleuder.' },
        it: { topic: 'Storia d’Israele', difficulty: 'Facile', q: 'Chi sconfisse il gigante Golia?', a: ['Saul', 'Salomone', 'Davide', 'Sansone'], correct: 2, reference: '1 Samuele 17:45–50', explanation: 'Davide affrontò Golia confidando nel Signore e lo sconfisse con una pietra della sua fionda.' },
        ro: { topic: 'Istoria lui Israel', difficulty: 'Ușor', q: 'Cine l-a învins pe uriașul Goliat?', a: ['Saul', 'Solomon', 'David', 'Samson'], correct: 2, reference: '1 Samuel 17:45–50', explanation: 'David l-a înfruntat pe Goliat cu încredere în Domnul și l-a învins cu o piatră din praștie.' }
    },
    {
        id: 'q5', topic: 'torah', difficulty: 'easy',
        pt: { topic: 'Torá e criação', difficulty: 'Fácil', q: 'Quantos mandamentos aparecem no Decálogo?', a: ['7', '10', '12', '40'], correct: 1, reference: 'Êxodo 20:1–17', explanation: 'O Decálogo é apresentado em dez mandamentos dados por Deus a Israel por meio de Moisés.' },
        es: { topic: 'Torá y creación', difficulty: 'Fácil', q: '¿Cuántos mandamientos aparecen en el Decálogo?', a: ['7', '10', '12', '40'], correct: 1, reference: 'Éxodo 20:1–17', explanation: 'El Decálogo presenta diez mandamientos dados por Dios a Israel por medio de Moisés.' },
        en: { topic: 'Torah and creation', difficulty: 'Easy', q: 'How many commandments are in the Decalogue?', a: ['7', '10', '12', '40'], correct: 1, reference: 'Exodus 20:1–17', explanation: 'The Decalogue presents ten commandments given by God to Israel through Moses.' },
        fr: { topic: 'Torah et création', difficulty: 'Facile', q: 'Combien de commandements compte le Décalogue ?', a: ['7', '10', '12', '40'], correct: 1, reference: 'Exode 20:1–17', explanation: 'Le Décalogue présente dix commandements donnés par Dieu à Israël par l’intermédiaire de Moïse.' },
        de: { topic: 'Tora und Schöpfung', difficulty: 'Leicht', q: 'Wie viele Gebote umfasst der Dekalog?', a: ['7', '10', '12', '40'], correct: 1, reference: '2. Mose 20,1–17', explanation: 'Der Dekalog enthält zehn Gebote, die Gott Israel durch Mose gab.' },
        it: { topic: 'Torah e creazione', difficulty: 'Facile', q: 'Quanti comandamenti contiene il Decalogo?', a: ['7', '10', '12', '40'], correct: 1, reference: 'Esodo 20:1–17', explanation: 'Il Decalogo presenta dieci comandamenti dati da Dio a Israele per mezzo di Mosè.' },
        ro: { topic: 'Tora și creație', difficulty: 'Ușor', q: 'Câte porunci cuprinde Decalogul?', a: ['7', '10', '12', '40'], correct: 1, reference: 'Exodul 20:1–17', explanation: 'Decalogul cuprinde zece porunci date de Dumnezeu lui Israel prin Moise.' }
    },
    {
        id: 'q6', topic: 'gospels', difficulty: 'easy',
        pt: { topic: 'Evangelhos', difficulty: 'Fácil', q: 'Em que cidade Jesus nasceu?', a: ['Nazaré', 'Belém', 'Jerusalém', 'Cafarnaum'], correct: 1, reference: 'Mateus 2:1–6', explanation: 'Jesus nasceu em Belém da Judeia, como anunciado pelos profetas.' },
        es: { topic: 'Evangelios', difficulty: 'Fácil', q: '¿En qué ciudad nació Jesús?', a: ['Nazaret', 'Belén', 'Jerusalén', 'Cafarnaúm'], correct: 1, reference: 'Mateo 2:1–6', explanation: 'Jesús nació en Belén de Judea, como habían anunciado los profetas.' },
        en: { topic: 'Gospels', difficulty: 'Easy', q: 'In which city was Jesus born?', a: ['Nazareth', 'Bethlehem', 'Jerusalem', 'Capernaum'], correct: 1, reference: 'Matthew 2:1–6', explanation: 'Jesus was born in Bethlehem of Judea, as the prophets had announced.' },
        fr: { topic: 'Évangiles', difficulty: 'Facile', q: 'Dans quelle ville Jésus est-il né ?', a: ['Nazareth', 'Bethléem', 'Jérusalem', 'Capernaüm'], correct: 1, reference: 'Matthieu 2:1–6', explanation: 'Jésus est né à Bethléem de Judée, comme les prophètes l’avaient annoncé.' },
        de: { topic: 'Evangelien', difficulty: 'Leicht', q: 'In welcher Stadt wurde Jesus geboren?', a: ['Nazareth', 'Bethlehem', 'Jerusalem', 'Kapernaum'], correct: 1, reference: 'Matthäus 2,1–6', explanation: 'Jesus wurde in Bethlehem in Judäa geboren, wie es die Propheten angekündigt hatten.' },
        it: { topic: 'Vangeli', difficulty: 'Facile', q: 'In quale città nacque Gesù?', a: ['Nazaret', 'Betlemme', 'Gerusalemme', 'Cafarnao'], correct: 1, reference: 'Matteo 2:1–6', explanation: 'Gesù nacque a Betlemme di Giudea, come avevano annunciato i profeti.' },
        ro: { topic: 'Evanghelii', difficulty: 'Ușor', q: 'În ce cetate S-a născut Isus?', a: ['Nazaret', 'Betleem', 'Ierusalim', 'Capernaum'], correct: 1, reference: 'Matei 2:1–6', explanation: 'Isus S-a născut în Betleemul Iudeii, așa cum anunțaseră profeții.' }
    },
    {
        id: 'q7', topic: 'wisdom', difficulty: 'medium',
        pt: { topic: 'Sabedoria e poesia', difficulty: 'Intermediário', q: 'Qual rei é tradicionalmente associado à maior parte dos Provérbios?', a: ['Saul', 'Salomão', 'Ezequias', 'Josias'], correct: 1, reference: '1 Reis 4:32; Provérbios 1:1', explanation: 'Salomão é descrito como autor de milhares de provérbios e sua sabedoria marcou essa coleção.' },
        es: { topic: 'Sabiduría y poesía', difficulty: 'Intermedio', q: '¿Qué rey se asocia tradicionalmente con la mayor parte de Proverbios?', a: ['Saúl', 'Salomón', 'Ezequías', 'Josías'], correct: 1, reference: '1 Reyes 4:32; Proverbios 1:1', explanation: 'Salomón es presentado como autor de miles de proverbios y su sabiduría marcó esta colección.' },
        en: { topic: 'Wisdom and poetry', difficulty: 'Medium', q: 'Which king is traditionally associated with most of Proverbs?', a: ['Saul', 'Solomon', 'Hezekiah', 'Josiah'], correct: 1, reference: '1 Kings 4:32; Proverbs 1:1', explanation: 'Solomon is described as composing thousands of proverbs, and his wisdom shaped this collection.' },
        fr: { topic: 'Sagesse et poésie', difficulty: 'Intermédiaire', q: 'À quel roi associe-t-on traditionnellement la majeure partie des Proverbes ?', a: ['Saül', 'Salomon', 'Ézéchias', 'Josias'], correct: 1, reference: '1 Rois 4:32 ; Proverbes 1:1', explanation: 'Salomon est présenté comme l’auteur de milliers de proverbes et sa sagesse a marqué cette collection.' },
        de: { topic: 'Weisheit und Dichtung', difficulty: 'Mittel', q: 'Welcher König wird traditionell mit dem größten Teil der Sprüche verbunden?', a: ['Saul', 'Salomo', 'Hiskia', 'Josia'], correct: 1, reference: '1. Könige 4,32; Sprüche 1,1', explanation: 'Salomo verfasste laut der Bibel Tausende von Sprüchen, und seine Weisheit prägte diese Sammlung.' },
        it: { topic: 'Sapienza e poesia', difficulty: 'Intermedio', q: 'A quale re è tradizionalmente associata la maggior parte dei Proverbi?', a: ['Saul', 'Salomone', 'Ezechia', 'Giosia'], correct: 1, reference: '1 Re 4:32; Proverbi 1:1', explanation: 'Salomone è presentato come autore di migliaia di proverbi e la sua sapienza ha segnato questa raccolta.' },
        ro: { topic: 'Înțelepciune și poezie', difficulty: 'Mediu', q: 'Cu ce rege este asociată în mod tradițional cea mai mare parte a Proverbelor?', a: ['Saul', 'Solomon', 'Ezechia', 'Iosia'], correct: 1, reference: '1 Împărați 4:32; Proverbe 1:1', explanation: 'Solomon este prezentat ca autor al miilor de proverbe, iar înțelepciunea lui a marcat această colecție.' }
    },
    {
        id: 'q8', topic: 'prophets', difficulty: 'medium',
        pt: { topic: 'Profetas', difficulty: 'Intermediário', q: 'Em qual monte Elias enfrentou os profetas de Baal?', a: ['Sinai', 'Carmelo', 'Oliveiras', 'Hermom'], correct: 1, reference: '1 Reis 18:19–39', explanation: 'No monte Carmelo, Elias chamou o povo a escolher o Senhor e Deus respondeu com fogo.' },
        es: { topic: 'Profetas', difficulty: 'Intermedio', q: '¿En qué monte Elías enfrentó a los profetas de Baal?', a: ['Sinaí', 'Carmelo', 'Olivos', 'Hermón'], correct: 1, reference: '1 Reyes 18:19–39', explanation: 'En el monte Carmelo, Elías llamó al pueblo a elegir al Señor y Dios respondió con fuego.' },
        en: { topic: 'Prophets', difficulty: 'Medium', q: 'On which mountain did Elijah confront the prophets of Baal?', a: ['Sinai', 'Carmel', 'Mount of Olives', 'Hermon'], correct: 1, reference: '1 Kings 18:19–39', explanation: 'On Mount Carmel, Elijah called the people to choose the Lord, and God answered with fire.' },
        fr: { topic: 'Prophètes', difficulty: 'Intermédiaire', q: 'Sur quelle montagne Élie a-t-il affronté les prophètes de Baal ?', a: ['Sinaï', 'Carmel', 'Oliviers', 'Hermon'], correct: 1, reference: '1 Rois 18:19–39', explanation: 'Au mont Carmel, Élie a appelé le peuple à choisir le Seigneur et Dieu a répondu par le feu.' },
        de: { topic: 'Propheten', difficulty: 'Mittel', q: 'Auf welchem Berg trat Elia gegen die Baalspropheten an?', a: ['Sinai', 'Karmel', 'Ölberg', 'Hermon'], correct: 1, reference: '1. Könige 18,19–39', explanation: 'Auf dem Karmel rief Elia das Volk auf, dem Herrn zu folgen, und Gott antwortete mit Feuer.' },
        it: { topic: 'Profeti', difficulty: 'Intermedio', q: 'Su quale monte Elia affrontò i profeti di Baal?', a: ['Sinai', 'Carmelo', 'Monte degli Ulivi', 'Ermon'], correct: 1, reference: '1 Re 18:19–39', explanation: 'Sul monte Carmelo Elia invitò il popolo a scegliere il Signore e Dio rispose con il fuoco.' },
        ro: { topic: 'Profeți', difficulty: 'Mediu', q: 'Pe ce munte i-a înfruntat Ilie pe profeții lui Baal?', a: ['Sinai', 'Carmel', 'Muntele Măslinilor', 'Hermon'], correct: 1, reference: '1 Împărați 18:19–39', explanation: 'Pe muntele Carmel, Ilie a chemat poporul să-L aleagă pe Domnul, iar Dumnezeu a răspuns prin foc.' }
    },
    {
        id: 'q9', topic: 'gospels', difficulty: 'medium',
        pt: { topic: 'Evangelhos', difficulty: 'Intermediário', q: 'Em qual parábola um viajante ferido é socorrido por um samaritano?', a: ['O semeador', 'O bom samaritano', 'As dez virgens', 'O filho pródigo'], correct: 1, reference: 'Lucas 10:25–37', explanation: 'Jesus contou a parábola do bom samaritano para ensinar que o próximo é aquele a quem oferecemos misericórdia.' },
        es: { topic: 'Evangelios', difficulty: 'Intermedio', q: '¿En qué parábola un viajero herido recibe ayuda de un samaritano?', a: ['El sembrador', 'El buen samaritano', 'Las diez vírgenes', 'El hijo pródigo'], correct: 1, reference: 'Lucas 10:25–37', explanation: 'Jesús contó la parábola del buen samaritano para enseñar que el prójimo es aquel a quien mostramos misericordia.' },
        en: { topic: 'Gospels', difficulty: 'Medium', q: 'In which parable is an injured traveler helped by a Samaritan?', a: ['The sower', 'The good Samaritan', 'The ten virgins', 'The prodigal son'], correct: 1, reference: 'Luke 10:25–37', explanation: 'Jesus told the parable of the good Samaritan to teach that our neighbor is the person to whom we show mercy.' },
        fr: { topic: 'Évangiles', difficulty: 'Intermédiaire', q: 'Dans quelle parabole un voyageur blessé est-il secouru par un Samaritain ?', a: ['Le semeur', 'Le bon Samaritain', 'Les dix vierges', 'Le fils prodigue'], correct: 1, reference: 'Luc 10:25–37', explanation: 'Jésus a raconté la parabole du bon Samaritain pour enseigner que le prochain est celui envers qui nous faisons preuve de miséricorde.' },
        de: { topic: 'Evangelien', difficulty: 'Mittel', q: 'In welchem Gleichnis hilft ein Samariter einem verletzten Reisenden?', a: ['Der Sämann', 'Der barmherzige Samariter', 'Die zehn Jungfrauen', 'Der verlorene Sohn'], correct: 1, reference: 'Lukas 10,25–37', explanation: 'Jesus erzählte das Gleichnis vom barmherzigen Samariter, um zu zeigen, dass Barmherzigkeit den Nächsten sichtbar macht.' },
        it: { topic: 'Vangeli', difficulty: 'Intermedio', q: 'In quale parabola un viaggiatore ferito viene soccorso da un samaritano?', a: ['Il seminatore', 'Il buon samaritano', 'Le dieci vergini', 'Il figlio prodigo'], correct: 1, reference: 'Luca 10:25–37', explanation: 'Gesù raccontò la parabola del buon samaritano per insegnare che il prossimo è colui verso il quale usiamo misericordia.' },
        ro: { topic: 'Evanghelii', difficulty: 'Mediu', q: 'În ce parabolă un călător rănit este ajutat de un samaritean?', a: ['Semănătorul', 'Samariteanul milostiv', 'Cele zece fecioare', 'Fiul risipitor'], correct: 1, reference: 'Luca 10:25–37', explanation: 'Isus a spus parabola samariteanului milostiv pentru a arăta că aproapele este cel căruia îi arătăm milă.' }
    },
    {
        id: 'q10', topic: 'acts', difficulty: 'medium',
        pt: { topic: 'Atos e igreja', difficulty: 'Intermediário', q: 'Quem é reconhecido como o primeiro mártir cristão?', a: ['Barnabé', 'Estêvão', 'Filipe', 'Silas'], correct: 1, reference: 'Atos 6:8–7:60', explanation: 'Estêvão testemunhou sobre Jesus diante do conselho e permaneceu fiel até sua morte.' },
        es: { topic: 'Hechos e iglesia', difficulty: 'Intermedio', q: '¿Quién es reconocido como el primer mártir cristiano?', a: ['Bernabé', 'Esteban', 'Felipe', 'Silas'], correct: 1, reference: 'Hechos 6:8–7:60', explanation: 'Esteban dio testimonio de Jesús ante el consejo y permaneció fiel hasta su muerte.' },
        en: { topic: 'Acts and the church', difficulty: 'Medium', q: 'Who is known as the first Christian martyr?', a: ['Barnabas', 'Stephen', 'Philip', 'Silas'], correct: 1, reference: 'Acts 6:8–7:60', explanation: 'Stephen testified about Jesus before the council and remained faithful until his death.' },
        fr: { topic: 'Actes et Église', difficulty: 'Intermédiaire', q: 'Qui est reconnu comme le premier martyr chrétien ?', a: ['Barnabas', 'Étienne', 'Philippe', 'Silas'], correct: 1, reference: 'Actes 6:8–7:60', explanation: 'Étienne a témoigné de Jésus devant le conseil et est resté fidèle jusqu’à sa mort.' },
        de: { topic: 'Apostelgeschichte und Kirche', difficulty: 'Mittel', q: 'Wer gilt als der erste christliche Märtyrer?', a: ['Barnabas', 'Stephanus', 'Philippus', 'Silas'], correct: 1, reference: 'Apostelgeschichte 6,8–7,60', explanation: 'Stephanus bezeugte Jesus vor dem Hohen Rat und blieb bis zu seinem Tod treu.' },
        it: { topic: 'Atti e Chiesa', difficulty: 'Intermedio', q: 'Chi è riconosciuto come il primo martire cristiano?', a: ['Barnaba', 'Stefano', 'Filippo', 'Sila'], correct: 1, reference: 'Atti 6:8–7:60', explanation: 'Stefano testimoniò di Gesù davanti al sinedrio e rimase fedele fino alla morte.' },
        ro: { topic: 'Faptele și Biserica', difficulty: 'Mediu', q: 'Cine este recunoscut drept primul martir creștin?', a: ['Barnaba', 'Ștefan', 'Filip', 'Sila'], correct: 1, reference: 'Faptele 6:8–7:60', explanation: 'Ștefan a mărturisit despre Isus înaintea sinedriului și a rămas credincios până la moarte.' }
    },
    {
        id: 'q11', topic: 'letters', difficulty: 'medium',
        pt: { topic: 'Cartas e vida cristã', difficulty: 'Intermediário', q: 'Segundo Paulo, qual é o maior entre fé, esperança e amor?', a: ['Fé', 'Esperança', 'Amor', 'Conhecimento'], correct: 2, reference: '1 Coríntios 13:13', explanation: 'Paulo conclui que permanecem a fé, a esperança e o amor, mas o maior deles é o amor.' },
        es: { topic: 'Cartas y vida cristiana', difficulty: 'Intermedio', q: 'Según Pablo, ¿cuál es mayor entre la fe, la esperanza y el amor?', a: ['Fe', 'Esperanza', 'Amor', 'Conocimiento'], correct: 2, reference: '1 Corintios 13:13', explanation: 'Pablo concluye que permanecen la fe, la esperanza y el amor, pero el mayor es el amor.' },
        en: { topic: 'Letters and Christian life', difficulty: 'Medium', q: 'According to Paul, which is greatest among faith, hope, and love?', a: ['Faith', 'Hope', 'Love', 'Knowledge'], correct: 2, reference: '1 Corinthians 13:13', explanation: 'Paul concludes that faith, hope, and love remain, but the greatest of these is love.' },
        fr: { topic: 'Lettres et vie chrétienne', difficulty: 'Intermédiaire', q: 'Selon Paul, lequel est le plus grand entre la foi, l’espérance et l’amour ?', a: ['La foi', 'L’espérance', 'L’amour', 'La connaissance'], correct: 2, reference: '1 Corinthiens 13:13', explanation: 'Paul conclut que demeurent la foi, l’espérance et l’amour, mais que le plus grand est l’amour.' },
        de: { topic: 'Briefe und christliches Leben', difficulty: 'Mittel', q: 'Was ist nach Paulus größer als Glaube, Hoffnung und Liebe?', a: ['Glaube', 'Hoffnung', 'Liebe', 'Erkenntnis'], correct: 2, reference: '1. Korinther 13,13', explanation: 'Paulus sagt, dass Glaube, Hoffnung und Liebe bleiben; die größte unter ihnen ist die Liebe.' },
        it: { topic: 'Lettere e vita cristiana', difficulty: 'Intermedio', q: 'Secondo Paolo, quale è più grande tra fede, speranza e amore?', a: ['Fede', 'Speranza', 'Amore', 'Conoscenza'], correct: 2, reference: '1 Corinzi 13:13', explanation: 'Paolo conclude che rimangono fede, speranza e amore, ma il più grande è l’amore.' },
        ro: { topic: 'Epistole și viață creștină', difficulty: 'Mediu', q: 'Potrivit lui Pavel, care este mai mare dintre credință, nădejde și dragoste?', a: ['Credința', 'Nădejdea', 'Dragostea', 'Cunoașterea'], correct: 2, reference: '1 Corinteni 13:13', explanation: 'Pavel spune că rămân credința, nădejdea și dragostea, iar cea mai mare este dragostea.' }
    },
    {
        id: 'q12', topic: 'history', difficulty: 'medium',
        pt: { topic: 'História de Israel', difficulty: 'Intermediário', q: 'Como se chamava a irmã de Moisés que também era profetisa?', a: ['Miriã', 'Débora', 'Ana', 'Hulda'], correct: 0, reference: 'Êxodo 15:20–21', explanation: 'Miriã, irmã de Moisés e Arão, liderou as mulheres em cânticos depois da travessia do mar.' },
        es: { topic: 'Historia de Israel', difficulty: 'Intermedio', q: '¿Cómo se llamaba la hermana de Moisés que también era profetisa?', a: ['Miriam', 'Débora', 'Ana', 'Hulda'], correct: 0, reference: 'Éxodo 15:20–21', explanation: 'Miriam, hermana de Moisés y Aarón, guio a las mujeres con cánticos después de cruzar el mar.' },
        en: { topic: 'History of Israel', difficulty: 'Medium', q: 'What was the name of Moses’ sister who was also a prophetess?', a: ['Miriam', 'Deborah', 'Hannah', 'Huldah'], correct: 0, reference: 'Exodus 15:20–21', explanation: 'Miriam, the sister of Moses and Aaron, led the women in song after the crossing of the sea.' },
        fr: { topic: 'Histoire d’Israël', difficulty: 'Intermédiaire', q: 'Comment s’appelait la sœur de Moïse qui était aussi prophétesse ?', a: ['Miriam', 'Déborah', 'Anne', 'Houlda'], correct: 0, reference: 'Exode 15:20–21', explanation: 'Miriam, sœur de Moïse et d’Aaron, a conduit les femmes dans des chants après la traversée de la mer.' },
        de: { topic: 'Israels Geschichte', difficulty: 'Mittel', q: 'Wie hieß die Schwester des Mose, die auch Prophetin war?', a: ['Mirjam', 'Debora', 'Hanna', 'Hulda'], correct: 0, reference: '2. Mose 15,20–21', explanation: 'Mirjam, die Schwester von Mose und Aaron, führte die Frauen nach der Durchquerung des Meeres im Gesang an.' },
        it: { topic: 'Storia d’Israele', difficulty: 'Intermedio', q: 'Come si chiamava la sorella di Mosè che era anche profetessa?', a: ['Miriam', 'Debora', 'Anna', 'Hulda'], correct: 0, reference: 'Esodo 15:20–21', explanation: 'Miriam, sorella di Mosè e Aronne, guidò le donne nei canti dopo l’attraversamento del mare.' },
        ro: { topic: 'Istoria lui Israel', difficulty: 'Mediu', q: 'Cum se numea sora lui Moise care era și prorociță?', a: ['Miriam', 'Debora', 'Ana', 'Hulda'], correct: 0, reference: 'Exodul 15:20–21', explanation: 'Miriam, sora lui Moise și Aaron, le-a condus pe femei în cântări după trecerea mării.' }
    },
    {
        id: 'q13', topic: 'torah', difficulty: 'hard',
        pt: { topic: 'Torá e criação', difficulty: 'Avançado', q: 'Qual rei de Salém abençoou Abraão e recebeu dele o dízimo?', a: ['Melquisedeque', 'Abimeleque', 'Bera', 'Adoni-Zedeque'], correct: 0, reference: 'Gênesis 14:18–20', explanation: 'Melquisedeque, rei de Salém e sacerdote do Deus Altíssimo, abençoou Abraão após a batalha.' },
        es: { topic: 'Torá y creación', difficulty: 'Avanzado', q: '¿Qué rey de Salem bendijo a Abraham y recibió de él el diezmo?', a: ['Melquisedec', 'Abimelec', 'Bera', 'Adoni-zedec'], correct: 0, reference: 'Génesis 14:18–20', explanation: 'Melquisedec, rey de Salem y sacerdote del Dios Altísimo, bendijo a Abraham después de la batalla.' },
        en: { topic: 'Torah and creation', difficulty: 'Advanced', q: 'Which king of Salem blessed Abraham and received a tenth from him?', a: ['Melchizedek', 'Abimelech', 'Bera', 'Adoni-zedek'], correct: 0, reference: 'Genesis 14:18–20', explanation: 'Melchizedek, king of Salem and priest of God Most High, blessed Abraham after the battle.' },
        fr: { topic: 'Torah et création', difficulty: 'Avancé', q: 'Quel roi de Salem a béni Abraham et a reçu de lui la dîme ?', a: ['Melchisédek', 'Abimélek', 'Béra', 'Adoni-Tsédek'], correct: 0, reference: 'Genèse 14:18–20', explanation: 'Melchisédek, roi de Salem et prêtre du Dieu Très-Haut, a béni Abraham après la bataille.' },
        de: { topic: 'Tora und Schöpfung', difficulty: 'Schwer', q: 'Welcher König von Salem segnete Abraham und erhielt von ihm den Zehnten?', a: ['Melchisedek', 'Abimelech', 'Bera', 'Adoni-Zedek'], correct: 0, reference: '1. Mose 14,18–20', explanation: 'Melchisedek, König von Salem und Priester des Höchsten Gottes, segnete Abraham nach der Schlacht.' },
        it: { topic: 'Torah e creazione', difficulty: 'Avanzato', q: 'Quale re di Salem benedisse Abramo e ricevette da lui la decima?', a: ['Melchisedec', 'Abimelec', 'Bera', 'Adoni-Zedec'], correct: 0, reference: 'Genesi 14:18–20', explanation: 'Melchisedec, re di Salem e sacerdote del Dio Altissimo, benedisse Abramo dopo la battaglia.' },
        ro: { topic: 'Tora și creație', difficulty: 'Avansat', q: 'Ce rege al Salemului l-a binecuvântat pe Avraam și a primit de la el zeciuiala?', a: ['Melhisedec', 'Abimelec', 'Bera', 'Adoni-Țedec'], correct: 0, reference: 'Geneza 14:18–20', explanation: 'Melhisedec, regele Salemului și preot al Dumnezeului Preaînalt, l-a binecuvântat pe Avraam după luptă.' }
    },
    {
        id: 'q14', topic: 'history', difficulty: 'hard',
        pt: { topic: 'História de Israel', difficulty: 'Avançado', q: 'Qual juiz de Israel fez um voto precipitado antes de uma batalha?', a: ['Jefté', 'Gideão', 'Otniel', 'Eúde'], correct: 0, reference: 'Juízes 11:29–40', explanation: 'Jefté fez um voto precipitado ao Senhor antes de lutar contra os amonitas; o episódio é um alerta sobre promessas impensadas.' },
        es: { topic: 'Historia de Israel', difficulty: 'Avanzado', q: '¿Qué juez de Israel hizo un voto precipitado antes de una batalla?', a: ['Jefté', 'Gedeón', 'Otoniel', 'Aod'], correct: 0, reference: 'Jueces 11:29–40', explanation: 'Jefté hizo un voto precipitado al Señor antes de luchar contra los amonitas; el relato advierte sobre las promesas irreflexivas.' },
        en: { topic: 'History of Israel', difficulty: 'Advanced', q: 'Which judge of Israel made a rash vow before a battle?', a: ['Jephthah', 'Gideon', 'Othniel', 'Ehud'], correct: 0, reference: 'Judges 11:29–40', explanation: 'Jephthah made a rash vow to the Lord before fighting the Ammonites; the account warns against thoughtless promises.' },
        fr: { topic: 'Histoire d’Israël', difficulty: 'Avancé', q: 'Quel juge d’Israël a fait un vœu précipité avant une bataille ?', a: ['Jephté', 'Gédéon', 'Othniel', 'Éhoud'], correct: 0, reference: 'Juges 11:29–40', explanation: 'Jephté a fait un vœu précipité au Seigneur avant de combattre les Ammonites ; le récit met en garde contre les promesses irréfléchies.' },
        de: { topic: 'Israels Geschichte', difficulty: 'Schwer', q: 'Welcher Richter Israels legte vor einer Schlacht ein voreiliges Gelübde ab?', a: ['Jiftach', 'Gideon', 'Otniël', 'Ehud'], correct: 0, reference: 'Richter 11,29–40', explanation: 'Jiftach legte vor dem Kampf gegen die Ammoniter ein voreiliges Gelübde ab; die Geschichte warnt vor unbedachten Versprechen.' },
        it: { topic: 'Storia d’Israele', difficulty: 'Avanzato', q: 'Quale giudice d’Israele fece un voto avventato prima di una battaglia?', a: ['Iefte', 'Gedeone', 'Otniel', 'Ehud'], correct: 0, reference: 'Giudici 11:29–40', explanation: 'Iefte fece un voto avventato al Signore prima di combattere gli Ammoniti; il racconto mette in guardia dalle promesse irriflessive.' },
        ro: { topic: 'Istoria lui Israel', difficulty: 'Avansat', q: 'Care judecător al lui Israel a făcut un jurământ pripit înainte de o luptă?', a: ['Iefta', 'Ghedeon', 'Otniel', 'Ehud'], correct: 0, reference: 'Judecători 11:29–40', explanation: 'Iefta a făcut un jurământ pripit Domnului înainte de lupta cu amoniții; relatarea avertizează asupra promisiunilor nechibzuite.' }
    },
    {
        id: 'q15', topic: 'wisdom', difficulty: 'hard',
        pt: { topic: 'Sabedoria e poesia', difficulty: 'Avançado', q: 'Qual é o capítulo mais longo do livro de Salmos?', a: ['Salmo 1', 'Salmo 23', 'Salmo 119', 'Salmo 150'], correct: 2, reference: 'Salmo 119:1–176', explanation: 'O Salmo 119 é um longo poema acróstico que celebra a palavra e a lei do Senhor.' },
        es: { topic: 'Sabiduría y poesía', difficulty: 'Avanzado', q: '¿Cuál es el capítulo más largo del libro de los Salmos?', a: ['Salmo 1', 'Salmo 23', 'Salmo 119', 'Salmo 150'], correct: 2, reference: 'Salmo 119:1–176', explanation: 'El Salmo 119 es un extenso poema acróstico que celebra la palabra y la ley del Señor.' },
        en: { topic: 'Wisdom and poetry', difficulty: 'Advanced', q: 'Which is the longest chapter in the book of Psalms?', a: ['Psalm 1', 'Psalm 23', 'Psalm 119', 'Psalm 150'], correct: 2, reference: 'Psalm 119:1–176', explanation: 'Psalm 119 is a lengthy acrostic poem celebrating the word and law of the Lord.' },
        fr: { topic: 'Sagesse et poésie', difficulty: 'Avancé', q: 'Quel est le chapitre le plus long du livre des Psaumes ?', a: ['Psaume 1', 'Psaume 23', 'Psaume 119', 'Psaume 150'], correct: 2, reference: 'Psaume 119:1–176', explanation: 'Le Psaume 119 est un long poème alphabétique qui célèbre la parole et la loi du Seigneur.' },
        de: { topic: 'Weisheit und Dichtung', difficulty: 'Schwer', q: 'Welches ist das längste Kapitel im Buch der Psalmen?', a: ['Psalm 1', 'Psalm 23', 'Psalm 119', 'Psalm 150'], correct: 2, reference: 'Psalm 119,1–176', explanation: 'Psalm 119 ist ein langes alphabetisches Gedicht über das Wort und das Gesetz des Herrn.' },
        it: { topic: 'Sapienza e poesia', difficulty: 'Avanzato', q: 'Qual è il capitolo più lungo del libro dei Salmi?', a: ['Salmo 1', 'Salmo 23', 'Salmo 119', 'Salmo 150'], correct: 2, reference: 'Salmo 119:1–176', explanation: 'Il Salmo 119 è un lungo poema alfabetico che celebra la parola e la legge del Signore.' },
        ro: { topic: 'Înțelepciune și poezie', difficulty: 'Avansat', q: 'Care este cel mai lung capitol din cartea Psalmilor?', a: ['Psalmul 1', 'Psalmul 23', 'Psalmul 119', 'Psalmul 150'], correct: 2, reference: 'Psalmul 119:1–176', explanation: 'Psalmul 119 este un poem acrostih amplu care celebrează cuvântul și legea Domnului.' }
    },
    {
        id: 'q16', topic: 'prophets', difficulty: 'hard',
        pt: { topic: 'Profetas', difficulty: 'Avançado', q: 'Qual profeta teve a visão de um vale de ossos secos?', a: ['Isaías', 'Jeremias', 'Ezequiel', 'Daniel'], correct: 2, reference: 'Ezequiel 37:1–14', explanation: 'A visão de Ezequiel simboliza a restauração de Israel e a ação vivificante do Espírito de Deus.' },
        es: { topic: 'Profetas', difficulty: 'Avanzado', q: '¿Qué profeta tuvo la visión de un valle de huesos secos?', a: ['Isaías', 'Jeremías', 'Ezequiel', 'Daniel'], correct: 2, reference: 'Ezequiel 37:1–14', explanation: 'La visión de Ezequiel simboliza la restauración de Israel y la acción vivificante del Espíritu de Dios.' },
        en: { topic: 'Prophets', difficulty: 'Advanced', q: 'Which prophet saw a vision of a valley of dry bones?', a: ['Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel'], correct: 2, reference: 'Ezekiel 37:1–14', explanation: 'Ezekiel’s vision symbolizes Israel’s restoration and the life-giving work of God’s Spirit.' },
        fr: { topic: 'Prophètes', difficulty: 'Avancé', q: 'Quel prophète a eu la vision d’une vallée d’ossements desséchés ?', a: ['Ésaïe', 'Jérémie', 'Ézéchiel', 'Daniel'], correct: 2, reference: 'Ézéchiel 37:1–14', explanation: 'La vision d’Ézéchiel symbolise la restauration d’Israël et l’action vivifiante de l’Esprit de Dieu.' },
        de: { topic: 'Propheten', difficulty: 'Schwer', q: 'Welcher Prophet sah ein Tal voller vertrockneter Knochen?', a: ['Jesaja', 'Jeremia', 'Hesekiel', 'Daniel'], correct: 2, reference: 'Hesekiel 37,1–14', explanation: 'Hesekiels Vision steht für die Wiederherstellung Israels und das lebensspendende Wirken von Gottes Geist.' },
        it: { topic: 'Profeti', difficulty: 'Avanzato', q: 'Quale profeta ebbe la visione di una valle di ossa secche?', a: ['Isaia', 'Geremia', 'Ezechiele', 'Daniele'], correct: 2, reference: 'Ezechiele 37:1–14', explanation: 'La visione di Ezechiele simboleggia la restaurazione d’Israele e l’opera vivificante dello Spirito di Dio.' },
        ro: { topic: 'Profeți', difficulty: 'Avansat', q: 'Ce profet a avut viziunea unei văi pline de oase uscate?', a: ['Isaia', 'Ieremia', 'Ezechiel', 'Daniel'], correct: 2, reference: 'Ezechiel 37:1–14', explanation: 'Viziunea lui Ezechiel simbolizează restaurarea lui Israel și lucrarea dătătoare de viață a Duhului lui Dumnezeu.' }
    },
    {
        id: 'q17', topic: 'gospels', difficulty: 'hard',
        pt: { topic: 'Evangelhos', difficulty: 'Avançado', q: 'Para qual povoado dois discípulos viajavam quando Jesus ressuscitado se aproximou deles?', a: ['Betânia', 'Emaús', 'Jericó', 'Betsaida'], correct: 1, reference: 'Lucas 24:13–35', explanation: 'No caminho de Emaús, Jesus explicou as Escrituras aos discípulos antes de ser reconhecido ao partir o pão.' },
        es: { topic: 'Evangelios', difficulty: 'Avanzado', q: '¿Hacia qué aldea viajaban dos discípulos cuando Jesús resucitado se acercó?', a: ['Betania', 'Emaús', 'Jericó', 'Betsaida'], correct: 1, reference: 'Lucas 24:13–35', explanation: 'En el camino a Emaús, Jesús explicó las Escrituras antes de ser reconocido al partir el pan.' },
        en: { topic: 'Gospels', difficulty: 'Advanced', q: 'To which village were two disciples traveling when the risen Jesus came near?', a: ['Bethany', 'Emmaus', 'Jericho', 'Bethsaida'], correct: 1, reference: 'Luke 24:13–35', explanation: 'On the road to Emmaus, Jesus explained the Scriptures before being recognized in the breaking of bread.' },
        fr: { topic: 'Évangiles', difficulty: 'Avancé', q: 'Vers quel village deux disciples se rendaient-ils lorsque Jésus ressuscité les a rejoints ?', a: ['Béthanie', 'Emmaüs', 'Jéricho', 'Bethsaïda'], correct: 1, reference: 'Luc 24:13–35', explanation: 'Sur le chemin d’Emmaüs, Jésus a expliqué les Écritures avant d’être reconnu à la fraction du pain.' },
        de: { topic: 'Evangelien', difficulty: 'Schwer', q: 'Zu welchem Dorf gingen zwei Jünger, als der auferstandene Jesus zu ihnen kam?', a: ['Bethanien', 'Emmaus', 'Jericho', 'Betsaida'], correct: 1, reference: 'Lukas 24,13–35', explanation: 'Auf dem Weg nach Emmaus erklärte Jesus die Schriften, bevor sie ihn beim Brotbrechen erkannten.' },
        it: { topic: 'Vangeli', difficulty: 'Avanzato', q: 'Verso quale villaggio viaggiavano due discepoli quando Gesù risorto si avvicinò?', a: ['Betania', 'Emmaus', 'Gerico', 'Betsaida'], correct: 1, reference: 'Luca 24:13–35', explanation: 'Sulla strada per Emmaus Gesù spiegò le Scritture, prima di essere riconosciuto nello spezzare il pane.' },
        ro: { topic: 'Evanghelii', difficulty: 'Avansat', q: 'Spre ce sat mergeau doi ucenici când li S-a alăturat Isus cel înviat?', a: ['Betania', 'Emaus', 'Ierihon', 'Betsaida'], correct: 1, reference: 'Luca 24:13–35', explanation: 'Pe drumul spre Emaus, Isus le-a explicat Scripturile înainte să fie recunoscut la frângerea pâinii.' }
    },
    {
        id: 'q18', topic: 'letters', difficulty: 'hard',
        pt: { topic: 'Cartas e vida cristã', difficulty: 'Avançado', q: 'A quem Paulo escreveu pedindo que Onésimo fosse recebido como irmão?', a: ['Filemom', 'Tito', 'Timóteo', 'Silas'], correct: 0, reference: 'Filemom 1:10–16', explanation: 'Na breve carta a Filemom, Paulo intercede por Onésimo e pede que ele seja acolhido como irmão amado.' },
        es: { topic: 'Cartas y vida cristiana', difficulty: 'Avanzado', q: '¿A quién escribió Pablo pidiendo que Onésimo fuera recibido como hermano?', a: ['Filemón', 'Tito', 'Timoteo', 'Silas'], correct: 0, reference: 'Filemón 1:10–16', explanation: 'En la breve carta a Filemón, Pablo intercede por Onésimo y pide que sea recibido como hermano amado.' },
        en: { topic: 'Letters and Christian life', difficulty: 'Advanced', q: 'To whom did Paul write, asking that Onesimus be received as a brother?', a: ['Philemon', 'Titus', 'Timothy', 'Silas'], correct: 0, reference: 'Philemon 1:10–16', explanation: 'In the short letter to Philemon, Paul appeals for Onesimus to be welcomed as a beloved brother.' },
        fr: { topic: 'Lettres et vie chrétienne', difficulty: 'Avancé', q: 'À qui Paul a-t-il écrit pour demander que Onésime soit accueilli comme un frère ?', a: ['Philémon', 'Tite', 'Timothée', 'Silas'], correct: 0, reference: 'Philémon 1:10–16', explanation: 'Dans sa brève lettre à Philémon, Paul intercède pour Onésime et demande qu’il soit accueilli comme un frère bien-aimé.' },
        de: { topic: 'Briefe und christliches Leben', difficulty: 'Schwer', q: 'An wen schrieb Paulus, dass Onesimus als Bruder aufgenommen werden solle?', a: ['Philemon', 'Titus', 'Timotheus', 'Silas'], correct: 0, reference: 'Philemon 1,10–16', explanation: 'Im kurzen Brief an Philemon bittet Paulus darum, Onesimus als geliebten Bruder aufzunehmen.' },
        it: { topic: 'Lettere e vita cristiana', difficulty: 'Avanzato', q: 'A chi scrisse Paolo chiedendo che Onesimo fosse accolto come fratello?', a: ['Filemone', 'Tito', 'Timoteo', 'Sila'], correct: 0, reference: 'Filemone 1:10–16', explanation: 'Nella breve lettera a Filemone, Paolo intercede per Onesimo e chiede che sia accolto come fratello amato.' },
        ro: { topic: 'Epistole și viață creștină', difficulty: 'Avansat', q: 'Cui i-a scris Pavel cerând ca Onisim să fie primit ca frate?', a: ['Filimon', 'Tit', 'Timotei', 'Sila'], correct: 0, reference: 'Filimon 1:10–16', explanation: 'În scurta scrisoare către Filimon, Pavel mijlocește pentru Onisim și cere să fie primit ca frate preaiubit.' }
    }
];

function seededShuffle(items, seed) {
    const result = [...items];
    let state = Number.parseInt(stableHash(String(seed)), 36) >>> 0;
    if (!state) state = 0x9e3779b9;
    for (let index = result.length - 1; index > 0; index -= 1) {
        state = (Math.imul(state ^ (state >>> 16), 2246822519) + 3266489917) >>> 0;
        const swapIndex = state % (index + 1);
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}

function buildQuestionOrder(playerA, playerB, nonce, excludedIds = []) {
    const players = [playerA, playerB].filter(Boolean).map(String).sort();
    const seed = `${QUESTION_BANK_VERSION}|${players.join('|')}|${nonce}`;
    const excluded = new Set(excludedIds);
    const usedIds = new Set();
    const usedTopicsByDifficulty = new Map();
    const buckets = Object.fromEntries(['easy', 'medium', 'hard'].map((difficulty) => [
        difficulty,
        seededShuffle(QUESTIONS.filter((question) => question.difficulty === difficulty && !excluded.has(question.id)), `${seed}|${difficulty}`)
    ]));

    return ROUND_DIFFICULTY_PATTERN.map((difficulty, roundIndex) => {
        const topicSet = usedTopicsByDifficulty.get(difficulty) || new Set();
        const available = buckets[difficulty].filter((question) => !usedIds.has(question.id));
        const freshTopic = available.find((question) => !topicSet.has(question.topic));
        const selected = freshTopic || available[0];
        if (!selected) return null;
        usedIds.add(selected.id);
        topicSet.add(selected.topic);
        usedTopicsByDifficulty.set(difficulty, topicSet);
        return selected.id;
    }).filter(Boolean);
}

function questionOrderForMatch(match) {
    return Array.isArray(match?.questionOrder) && match.questionOrder.length > 0
        ? match.questionOrder
        : QUESTIONS.map((question) => question.id);
}

function questionCountForMatch(match) {
    return questionOrderForMatch(match).length;
}

function questionForRound(match, questionIndex) {
    const questionId = questionOrderForMatch(match)[Number(questionIndex)];
    return QUESTIONS.find((question) => question.id === questionId) || QUESTIONS[Number(questionIndex)] || null;
}

const QUESTION_TIME_LIMIT_MS = 15000;
const TIMEOUT_GRACE_MS = 750;
const ROUND_REVIEW_DURATION_MS = 3200;
const INVITE_TTL_MS = 60000;
const MATCHMAKING_TTL_MS = 30000;
const LOBBY_CLEANUP_INTERVAL_MS = 5000;

// --- State Variables ---
let currentUser = null;
let currentLanguage = 'pt';
let gameState = 'language_selection'; // language_selection, lobby, matchmaking, in_game, game_over
let currentMatch = null;
let currentOpponent = null;
let onlineUsers = [];
let invites = [];
let duelHistory = [];
let userDirectory = {};
let progressFilter = 'all';

// All realtime resources are owned by the current session and are explicitly
// torn down before changing screens. This prevents old callbacks from racing
// with a new lobby/search/game.
let activeSubscriptions = new Set();
let heartbeatTimer = null;
let lobbyCleanupTimer = null;
let matchmakingTimer = null;
let matchmakingRequestId = null;
let sessionGeneration = 0;
let pendingAnswerKeys = new Set();
let scheduledAdvanceKeys = new Set();
let reconciledMatchIds = new Set();
let renderedInviteIds = new Set();
let recordedDuelIds = new Set();
let completionProgress = null;
let rematchState = null;
let rematchSubscriptionMatchId = null;
let rematchCreationIds = new Set();
let rematchActionKeys = new Set();
let rematchObservedInviteIds = new Set();
let inviteExpiryTimers = new Map();
let knownInviteIds = new Set();
let pendingInviteTargetIds = new Set();
let pendingInviteWrites = new Map();
let outgoingInvites = [];
let isSessionClosing = false;
let questionTimerInterval = null;
let questionTimerKey = null;
let timeoutResolutionKeys = new Set();
let reviewResolutionKeys = new Set();
let reviewSeenKeys = new Set();

// --- Helper Functions ---
function t(key) {
    return TRANSLATIONS[currentLanguage][key] || key;
}

function localizedTemplate(key, values = {}) {
    return Object.entries(values).reduce((text, [token, value]) => text.replaceAll(`{${token}}`, String(value)), t(key));
}

function inviteCreatedAt(invite) {
    const timestamp = Number(invite?.createdAt || invite?.timestamp || invite?.updatedAt || 0);
    return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
}

function inviteExpiresAt(invite) {
    const storedExpiry = Number(invite?.expiresAt);
    if (Number.isFinite(storedExpiry) && storedExpiry > 0) return storedExpiry;
    const createdAt = inviteCreatedAt(invite);
    return createdAt > 0 ? createdAt + INVITE_TTL_MS : 0;
}

function isPendingInvite(invite) {
    return Boolean(invite?.id) && invite.status !== 'declined' && invite.status !== 'expired';
}

function isInviteExpired(invite, now = Date.now()) {
    const expiresAt = inviteExpiresAt(invite);
    return !expiresAt || expiresAt <= now;
}

function inviteExpiryMessage(invite) {
    return localizedTemplate('inviteExpired', { name: invite?.fromName || progressText('unknownOpponent') });
}

function clearInviteExpiryTimer(inviteId) {
    const timer = inviteExpiryTimers.get(inviteId);
    if (timer) clearTimeout(timer);
    inviteExpiryTimers.delete(inviteId);
}

function removeInviteNotification(inviteId) {
    document.querySelector(`[data-invite-id="${inviteId}"]`)?.remove();
}

function showLobbyNotice(message) {
    const notice = document.createElement('div');
    notice.className = 'lobby-notice glass-card';
    notice.setAttribute('role', 'status');
    notice.textContent = message;
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 5000);
}

function expireInvite(invite, notify = false) {
    if (!invite?.id || !isPendingInvite(invite)) return;
    clearInviteExpiryTimer(invite.id);
    removeInviteNotification(invite.id);
    knownInviteIds.delete(invite.id);
    renderedInviteIds.delete(invite.id);
    pendingInviteWrites.delete(invite.id);
    if (invite.fromId === currentUser?.id) pendingInviteTargetIds.delete(invite.toId);
    if (rematchState?.inviteId === invite.id) {
        rematchState = { ...rematchState, status: 'expired' };
        updateRematchView();
    }
    transactSafe(db.tx.invites[invite.id].delete());
    if (notify && invite.toId === currentUser?.id) showLobbyNotice(inviteExpiryMessage(invite));
}

function scheduleInviteExpiry(invite) {
    if (!invite?.id || !isPendingInvite(invite)) return;
    clearInviteExpiryTimer(invite.id);
    const delay = Math.max(0, inviteExpiresAt(invite) - Date.now());
    inviteExpiryTimers.set(invite.id, setTimeout(() => expireInvite(invite, true), delay));
}

function clearInviteNotifications() {
    document.querySelectorAll('.invite-notification').forEach((notification) => notification.remove());
    inviteExpiryTimers.forEach((timer) => clearTimeout(timer));
    inviteExpiryTimers.clear();
    knownInviteIds.clear();
    renderedInviteIds.clear();
}

function stopLobbyCleanup() {
    if (lobbyCleanupTimer !== null) {
        clearInterval(lobbyCleanupTimer);
        lobbyCleanupTimer = null;
    }
}

function cleanupExpiredQueueEntries(entries = []) {
    const now = Date.now();
    (entries || []).forEach((entry) => {
        const expiresAt = Number(entry.expiresAt || (Number(entry.queuedAt || 0) + MATCHMAKING_TTL_MS));
        if (entry.state !== 'waiting' || !expiresAt || expiresAt > now) return;
        if (entry.id === currentUser?.id && entry.requestId === matchmakingRequestId) return;
        transactSafe(db.tx.matchmaking[entry.id].delete());
    });
}

function cleanupExpiredInvites(entries = []) {
    (entries || []).forEach((invite) => {
        if (isPendingInvite(invite) && isInviteExpired(invite)) {
            expireInvite(invite, knownInviteIds.has(invite.id));
        } else if (isPendingInvite(invite) && invite.toId === currentUser?.id) {
            scheduleInviteExpiry(invite);
        }
    });
}

function startLobbyCleanup() {
    stopLobbyCleanup();
    const tick = () => {
        if (!currentUser || !['lobby', 'matchmaking'].includes(gameState)) return;
        cleanupExpiredQueueEntries(lobbyQueueEntries);
        cleanupExpiredInvites(lobbyInviteEntries);
    };
    tick();
    lobbyCleanupTimer = setInterval(tick, LOBBY_CLEANUP_INTERVAL_MS);
}

let lobbyQueueEntries = [];
let lobbyInviteEntries = [];

let bgMusic = null;
function playBackgroundMusic() {
    if (bgMusic) return;
    bgMusic = new Audio('assets/audio/peaceful-background-music.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    bgMusic.play().catch(e => console.log("Music play blocked", e));
}

function playSound(name) {
    const audio = new Audio(`assets/audio/${name}.mp3`);
    audio.play().catch(e => console.log("Audio play blocked", e));
}

function stopHeartbeat() {
    if (heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

function stopMatchmaking() {
    if (matchmakingTimer !== null) {
        clearInterval(matchmakingTimer);
        matchmakingTimer = null;
    }
    matchmakingRequestId = null;
}

function stopQuestionTimer() {
    if (questionTimerInterval !== null) {
        clearInterval(questionTimerInterval);
        questionTimerInterval = null;
    }
    questionTimerKey = null;
}

function stopRealtime() {
    stopQuestionTimer();
    sessionGeneration += 1;
    for (const unsubscribe of activeSubscriptions) {
        try { if (typeof unsubscribe === 'function') unsubscribe(); } catch (error) { console.warn('Unable to unsubscribe', error); }
    }
    activeSubscriptions.clear();
    stopMatchmaking();
    stopLobbyCleanup();
    lobbyQueueEntries = [];
    lobbyInviteEntries = [];
    pendingInviteTargetIds.clear();
    pendingInviteWrites.clear();
    rematchObservedInviteIds.clear();
    clearInviteNotifications();
}

function ownSubscription(query, callback) {
    const generation = sessionGeneration;
    const unsubscribe = db.subscribeQuery(query, (result) => {
        if (generation !== sessionGeneration || !currentUser) return;
        callback(result);
    });
    if (typeof unsubscribe === 'function') activeSubscriptions.add(unsubscribe);
    return unsubscribe;
}

function transactSafe(txn) {
    return db.transact(txn)
        .then(() => true)
        .catch((error) => {
            console.warn('Realtime transaction failed', error);
            return false;
        });
}

function stableHash(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function makeMatchId(playerA, playerB, nonce) {
    const players = [String(playerA), String(playerB)].sort();
    return `match_${stableHash(`${players[0]}|${players[1]}|${nonce}`)}`;
}

function getPlayers(match) {
    return [match?.player1, match?.player2].filter(Boolean);
}

function isMyMatch(match) {
    return Boolean(currentUser && match && getPlayers(match).includes(currentUser.id));
}

function activeMatchesForMe(matches) {
    return (matches || []).filter((match) => match.status === 'active' && isMyMatch(match));
}

function questionDeadlineFor(match, questionIndex) {
    const indexedDeadline = Number(match?.questionDeadlines?.[questionIndex]);
    if (Number.isFinite(indexedDeadline) && indexedDeadline > 0) return indexedDeadline;

    if (Number(match?.currentQuestion) === Number(questionIndex)) {
        const currentDeadline = Number(match?.questionDeadlineAt);
        if (Number.isFinite(currentDeadline) && currentDeadline > 0) return currentDeadline;
    }

    const startedAt = Number(match?.questionStartedAt || match?.createdAt || Date.now());
    return (Number.isFinite(startedAt) ? startedAt : Date.now()) + QUESTION_TIME_LIMIT_MS;
}

function answerWasSubmitted(match, playerId, questionIndex) {
    const answer = match?.answers?.[playerId]?.[questionIndex];
    if (answer === undefined || answer === null) return false;

    const submittedAt = Number(match?.answerTimes?.[playerId]?.[questionIndex]);
    if (!Number.isFinite(submittedAt)) return true;
    return submittedAt <= questionDeadlineFor(match, questionIndex);
}

function roundReviewFor(match, questionIndex) {
    const review = match?.roundReviews?.[questionIndex];
    if (!review || typeof review !== 'object') return null;
    const readyAt = Number(review.readyAt);
    return Number.isFinite(readyAt) && readyAt > 0 ? review : null;
}

function reviewSeenByAll(match, questionIndex) {
    const review = roundReviewFor(match, questionIndex);
    const players = [match?.player1, match?.player2].filter(Boolean);
    return Boolean(review && players.length === 2 && players.every((playerId) => Boolean(review.seenBy?.[playerId])));
}

function markRoundReviewSeen(matchId, questionIndex) {
    if (!currentUser || !currentMatch || currentMatch.id !== matchId) return;
    const review = roundReviewFor(currentMatch, questionIndex);
    if (!review) return;

    const seenKey = `${matchId}:${questionIndex}:${currentUser.id}`;
    if (reviewSeenKeys.has(seenKey)) return;
    reviewSeenKeys.add(seenKey);
    if (review.seenBy?.[currentUser.id]) return;

    transactSafe(db.tx.matches[matchId].update({
        [`roundReviews.${questionIndex}.seenBy.${currentUser.id}`]: true
    })).then((success) => {
        if (!success) reviewSeenKeys.delete(seenKey);
    });
}

function roundResolutionFor(match, questionIndex) {
    const players = [match?.player1, match?.player2].filter(Boolean);
    const allAnswered = players.length === 2 && players.every((playerId) => answerWasSubmitted(match, playerId, questionIndex));
    const deadline = questionDeadlineFor(match, questionIndex);
    const graceExpired = Date.now() >= deadline + TIMEOUT_GRACE_MS;
    return { players, allAnswered, graceExpired };
}

function publishRoundReview(matchId, questionIndex) {
    if (!currentUser || !currentMatch || currentMatch.id !== matchId || currentMatch.status !== 'active' || currentMatch.currentQuestion !== questionIndex) return;
    if (roundReviewFor(currentMatch, questionIndex)) return;

    const resolution = roundResolutionFor(currentMatch, questionIndex);
    if (!resolution.allAnswered && !resolution.graceExpired) return;

    const resolutionKey = `${matchId}:${questionIndex}`;
    if (reviewResolutionKeys.has(resolutionKey)) return;
    reviewResolutionKeys.add(resolutionKey);

    const question = questionForRound(currentMatch, questionIndex);
    const readyAt = Date.now();
    const update = {
        [`scores.${currentMatch.player1}`]: scoreForPlayer(currentMatch, currentMatch.player1),
        [`scores.${currentMatch.player2}`]: scoreForPlayer(currentMatch, currentMatch.player2),
        [`roundReviews.${questionIndex}`]: {
            status: 'ready',
            questionId: question?.id || null,
            correctIndex: question?.pt?.correct ?? null,
            seenBy: {},
            readyAt,
            advanceAt: readyAt + ROUND_REVIEW_DURATION_MS
        },
        updatedAt: readyAt
    };

    if (resolution.graceExpired && !resolution.allAnswered) {
        resolution.players
            .filter((playerId) => !answerWasSubmitted(currentMatch, playerId, questionIndex))
            .forEach((playerId) => {
                update[`roundTimeouts.${questionIndex}.${playerId}`] = true;
            });
    }

    transactSafe(db.tx.matches[matchId].update(update)).then((success) => {
        if (!success) reviewResolutionKeys.delete(resolutionKey);
    });
}

function scoreForPlayer(match, playerId) {
    const playerAnswers = match?.answers?.[playerId] || {};
    return Object.entries(playerAnswers).reduce((total, [questionIndex, answerIndex]) => {
        const roundIndex = Number(questionIndex);
        const question = questionForRound(match, roundIndex);
        if (!question || !answerWasSubmitted(match, playerId, roundIndex)) return total;
        return total + (Number(answerIndex) === question.pt.correct ? 10 : 0);
    }, 0);
}

function outcomeForScores(myScore, opponentScore) {
    if (myScore > opponentScore) return 'win';
    if (myScore < opponentScore) return 'loss';
    return 'draw';
}

function xpForOutcome(outcome) {
    return outcome === 'win' ? 75 : outcome === 'draw' ? 45 : 25;
}

function rewardsForOutcome(outcome, nextStreak) {
    const rewards = ['participation_xp'];
    if (outcome === 'win') rewards.push('victory_medal');
    else if (outcome === 'draw') rewards.push('honor_medal');
    else rewards.push('practice_badge');
    if (nextStreak >= 3) rewards.push('streak_bonus');
    return rewards;
}

function rewardLabel(code) {
    const labels = {
        participation_xp: progressText('rewardParticipation'),
        victory_medal: progressText('rewardVictory'),
        honor_medal: progressText('rewardDraw'),
        practice_badge: progressText('rewardPractice'),
        streak_bonus: progressText('rewardStreak')
    };
    return labels[code] || code;
}

function createCompletionProgress(match) {
    const myId = currentUser.id;
    const opponentId = match.player1 === myId ? match.player2 : match.player1;
    const myScore = scoreForPlayer(match, myId);
    const opponentScore = scoreForPlayer(match, opponentId);
    const result = outcomeForScores(myScore, opponentScore);
    const streak = result === 'win' ? Number(currentUser.winStreak || 0) + 1 : 0;
    const xpEarned = xpForOutcome(result);
    const rewards = rewardsForOutcome(result, streak);
    const totalXp = Number(currentUser.xp || 0) + xpEarned;
    const totalDuels = Number(currentUser.totalDuels || 0) + 1;
    const wins = Number(currentUser.wins || 0) + (result === 'win' ? 1 : 0);
    const bestStreak = Math.max(Number(currentUser.bestStreak || 0), streak);
    const beforeMilestones = progressionStateFor(currentUser);
    const afterState = progressionStateFor({
        ...currentUser,
        wins,
        winStreak: streak,
        bestStreak,
        totalDuels
    });
    const newMilestones = MILESTONE_CATALOG.filter((milestone) =>
        afterState.unlockedMilestones.includes(milestone.id) && !beforeMilestones.unlockedMilestones.includes(milestone.id)
    );

    return {
        matchId: match.id,
        userId: myId,
        opponentId,
        result,
        myScore,
        opponentScore,
        xpEarned,
        streak,
        bestStreak,
        totalXp,
        totalDuels,
        rewards,
        wins,
        unlockedMilestones: afterState.unlockedMilestones,
        collectibleRewards: afterState.collectibleRewards,
        newMilestones,
        recorded: false
    };
}

function recordCompletedDuel(match) {
    if (!currentUser || !match || match.status !== 'finished' || !isMyMatch(match)) return completionProgress;
    if (completionProgress?.matchId === match.id) return completionProgress;

    const progress = createCompletionProgress(match);
    completionProgress = progress;
    const resultId = `duel_result_${stableHash(`${match.id}|${currentUser.id}`)}`;
    if (recordedDuelIds.has(resultId)) return progress;
    recordedDuelIds.add(resultId);

    const resultRecord = db.tx.duelResults[resultId].update({
        matchId: match.id,
        userId: progress.userId,
        opponentId: progress.opponentId,
        opponentName: userDirectory[progress.opponentId]?.name || currentOpponent?.name || progressText('unknownOpponent'),
        result: progress.result,
        score: progress.myScore,
        opponentScore: progress.opponentScore,
        xpEarned: progress.xpEarned,
        winStreak: progress.streak,
        bestStreak: progress.bestStreak,
        rewards: progress.rewards,
        milestones: progress.newMilestones.map((milestone) => milestone.id),
        collectibleRewards: progress.newMilestones.map((milestone) => milestone.reward),
        recordedAt: Date.now()
    });
    const userUpdate = db.tx.users[currentUser.id].update({
        xp: progress.totalXp,
        wins: progress.wins,
        winStreak: progress.streak,
        bestStreak: progress.bestStreak,
        totalDuels: progress.totalDuels,
        unlockedMilestones: progress.unlockedMilestones,
        collectibleRewards: progress.collectibleRewards,
        progressionVersion: 1,
        lastDuelAt: Date.now()
    });

    transactSafe([resultRecord, userUpdate]).then((success) => {
        if (!success) {
            recordedDuelIds.delete(resultId);
            completionProgress = null;
            if (gameState === 'game_over' && currentMatch?.id === match.id) render();
            return;
        }
        currentUser.xp = progress.totalXp;
        currentUser.wins = progress.wins;
        currentUser.winStreak = progress.streak;
        currentUser.bestStreak = progress.bestStreak;
        currentUser.totalDuels = progress.totalDuels;
        currentUser.unlockedMilestones = progress.unlockedMilestones;
        currentUser.collectibleRewards = progress.collectibleRewards;
        currentUser.progressionVersion = 1;
        saveStoredPlayerProfile();
        progress.recorded = true;
        if (gameState === 'game_over' && currentMatch?.id === match.id) render();
    });
    return progress;
}

function chooseCanonicalMatch(matches) {
    return [...matches].sort((a, b) => {
        const aKey = a.matchKey || a.id || '';
        const bKey = b.matchKey || b.id || '';
        return String(aKey).localeCompare(String(bKey));
    })[0] || null;
}

function cleanupDuplicateMatches(matches) {
    const mine = activeMatchesForMe(matches);
    const canonical = chooseCanonicalMatch(mine);
    if (!canonical || mine.length < 2) return canonical;

    const duplicates = mine.filter((match) => match.id !== canonical.id);
    const deletions = duplicates
        .filter((match) => !reconciledMatchIds.has(match.id))
        .map((match) => match.id);
    deletions.forEach((matchId) => reconciledMatchIds.add(matchId));
    if (deletions.length > 0) {
        transactSafe(deletions.map((matchId) => db.tx.matches[matchId].delete()));
    }
    return canonical;
}

function removeOwnQueue() {
    if (!currentUser) return Promise.resolve();
    return transactSafe(db.tx.matchmaking[currentUser.id].delete());
}

function startHeartbeat() {
    stopHeartbeat();
    const beat = () => {
        if (!currentUser) return;
        transactSafe(db.tx.users[currentUser.id].update({
            lastSeen: Date.now(),
            language: currentLanguage
        }));
        if (gameState === 'matchmaking' && matchmakingRequestId) {
            const queuedAt = Date.now();
            transactSafe(db.tx.matchmaking[currentUser.id].update({
                playerId: currentUser.id,
                requestId: matchmakingRequestId,
                queuedAt,
                expiresAt: queuedAt + MATCHMAKING_TTL_MS,
                state: 'waiting'
            }));
        }
    };
    beat();
    heartbeatTimer = setInterval(beat, 5000);
}

// --- UI Rendering ---
const container = document.getElementById('game-container');

function render() {
    container.innerHTML = '';
    container.style.backgroundImage = `url('assets/game-background.webp')`;
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';

    const overlay = document.createElement('div');
    overlay.className = 'ui-overlay';
    container.appendChild(overlay);

    switch (gameState) {
        case 'language_selection':
            renderLanguageSelection(overlay);
            break;
        case 'lobby':
            renderLobby(overlay);
            break;
        case 'matchmaking':
            renderMatchmaking(overlay);
            break;
        case 'in_game':
            renderGame(overlay);
            break;
        case 'game_over':
            renderGameOver(overlay);
            break;
    }
}

function renderLanguageSelection(el) {
    const card = document.createElement('div');
    card.className = 'glass-card centered-card';
    card.innerHTML = `
        <img src="assets/bible-logo.webp" class="logo-large" />
        <h1>${t('welcome')}</h1>
        <p>${t('selectLanguage')}</p>
        <div class="language-grid"></div>
        <button class="primary-btn mt-20" id="start-btn">${t('start')}</button>
    `;
    el.appendChild(card);

    const grid = card.querySelector('.language-grid');
    Object.entries(LANGUAGES).forEach(([code, lang]) => {
        const btn = document.createElement('div');
        btn.className = `language-item ${currentLanguage === code ? 'active' : ''}`;
        btn.innerHTML = `<span>${lang.flag}</span> ${lang.name}`;
        btn.onclick = () => {
            currentLanguage = code;
            render();
        };
        grid.appendChild(btn);
    });

    card.querySelector('#start-btn').onclick = () => {
        enterLobby();
    };
}

async function enterLobby() {
    playBackgroundMusic();
    isSessionClosing = false;
    stopRealtime();
    if (!currentUser) {
        const storedProfile = readStoredPlayerProfile();
        currentUser = {
            id: storedProfile?.id || id(),
            name: storedProfile?.name || `User_${Math.floor(Math.random() * 1000)}`,
            language: currentLanguage,
            wins: Number(storedProfile?.wins || 0),
            score: 0,
            xp: Number(storedProfile?.xp || 0),
            winStreak: Number(storedProfile?.winStreak || 0),
            bestStreak: Number(storedProfile?.bestStreak || 0),
            totalDuels: Number(storedProfile?.totalDuels || 0),
            unlockedMilestones: Array.isArray(storedProfile?.unlockedMilestones) ? storedProfile.unlockedMilestones : [],
            collectibleRewards: Array.isArray(storedProfile?.collectibleRewards) ? storedProfile.collectibleRewards : [],
            progressionVersion: Number(storedProfile?.progressionVersion || 1),
            lastSeen: Date.now()
        };
    }

    currentUser.xp = Number(currentUser.xp || 0);
    currentUser.winStreak = Number(currentUser.winStreak || 0);
    currentUser.bestStreak = Number(currentUser.bestStreak || 0);
    currentUser.totalDuels = Number(currentUser.totalDuels || 0);
    currentUser.wins = Number(currentUser.wins || 0);
    const normalizedProgression = progressionStateFor(currentUser);
    currentUser.unlockedMilestones = normalizedProgression.unlockedMilestones;
    currentUser.collectibleRewards = normalizedProgression.collectibleRewards;
    currentUser.progressionVersion = 1;
    saveStoredPlayerProfile();
    currentMatch = null;
    pendingAnswerKeys.clear();
    scheduledAdvanceKeys.clear();
    completionProgress = null;
    duelHistory = [];
    userDirectory = {};
    outgoingInvites = [];
    lobbyQueueEntries = [];
    lobbyInviteEntries = [];
    progressFilter = 'all';
    gameState = 'lobby';
    render();
    removeOwnQueue();

    transactSafe(db.tx.users[currentUser.id].update({
        ...currentUser,
        lastSeen: Date.now(),
        language: currentLanguage
    }));
    startHeartbeat();

    ownSubscription({ users: {} }, (res) => {
        if (!res.data || !currentUser) return;
        const users = res.data.users || [];
        userDirectory = Object.fromEntries(users.map((user) => [user.id, user]));
        onlineUsers = users.filter((user) =>
            user.id !== currentUser.id && Date.now() - (user.lastSeen || 0) < 10000
        );
        if (gameState === 'lobby') {
            renderLobbyUI();
            renderLobbyHistory();
        }
    });

    ownSubscription({ duelResults: { where: { userId: currentUser.id } } }, (res) => {
        if (!currentUser) return;
        duelHistory = (res.data?.duelResults || [])
            .slice()
            .sort((a, b) => Number(b.recordedAt || 0) - Number(a.recordedAt || 0));
        if (gameState === 'lobby') renderLobbyHistory();
    });

    ownSubscription({ invites: { where: { toId: currentUser.id } } }, (res) => {
        const incoming = res.data?.invites || [];
        invites = incoming;
        lobbyInviteEntries = [...incoming, ...outgoingInvites];
        cleanupExpiredInvites(incoming);
        const activeIds = new Set(incoming.filter(isPendingInvite).map((invite) => invite.id));
        document.querySelectorAll('.invite-notification').forEach((notification) => {
            if (!activeIds.has(notification.dataset.inviteId)) notification.remove();
        });
        incoming.forEach((invite) => {
            if (!isPendingInvite(invite) || isInviteExpired(invite)) return;
            knownInviteIds.add(invite.id);
            scheduleInviteExpiry(invite);
            if (!renderedInviteIds.has(invite.id) && gameState !== 'in_game') {
                renderedInviteIds.add(invite.id);
                if (invite.kind === 'rematch') showRematchInviteNotification(invite);
                else showInviteNotification(invite);
            }
        });
    });

    ownSubscription({ invites: { where: { fromId: currentUser.id } } }, (res) => {
        outgoingInvites = res.data?.invites || [];
        outgoingInvites.forEach((invite) => {
            if (pendingInviteWrites.has(invite.id)) pendingInviteWrites.delete(invite.id);
        });
        const writeLockedTargets = new Set(pendingInviteWrites.values());
        pendingInviteTargetIds.forEach((targetId) => {
            if (writeLockedTargets.has(targetId)) return;
            const hasPendingInvite = outgoingInvites.some((invite) =>
                invite.toId === targetId && isPendingInvite(invite) && !isInviteExpired(invite)
            );
            if (!hasPendingInvite) pendingInviteTargetIds.delete(targetId);
        });
        lobbyInviteEntries = [...invites, ...outgoingInvites];
        cleanupExpiredInvites(outgoingInvites);
    });

    ownSubscription({ matchmaking: {} }, (res) => {
        lobbyQueueEntries = res.data?.matchmaking || [];
        cleanupExpiredQueueEntries(lobbyQueueEntries);
    });
    startLobbyCleanup();

    // One authoritative stream is enough for both player slots. It also lets
    // every participant converge on the same match if two clients race.
    ownSubscription({ matches: {} }, (res) => {
        const matches = res.data?.matches || [];
        const canonical = cleanupDuplicateMatches(matches);
        if (!canonical) return;

        if (gameState === 'lobby' || gameState === 'matchmaking') {
            startMatch(canonical);
        } else if (gameState === 'in_game' && currentMatch?.id === canonical.id) {
            currentMatch = canonical;
            renderGameUI();
        }
    });

    setupChat();
}

function renderLobby(el) {
    const mainLayout = document.createElement('div');
    mainLayout.className = 'lobby-layout';
    el.appendChild(mainLayout);

    const leftPanel = document.createElement('div');
    leftPanel.className = 'glass-card side-panel players-panel';
    leftPanel.id = 'players-panel';
    mainLayout.appendChild(leftPanel);

    const centerPanel = document.createElement('div');
    centerPanel.className = 'center-panel lobby-main-panel';
    mainLayout.appendChild(centerPanel);

    const rightPanel = document.createElement('div');
    rightPanel.className = 'glass-card side-panel chat-panel lobby-chat-panel';
    rightPanel.id = 'chat-panel';
    mainLayout.appendChild(rightPanel);

    renderLobbyUI();
}

function renderLobbyUI() {
    const playersPanel = document.getElementById('players-panel');
    if (playersPanel) {
        playersPanel.innerHTML = `<h3>${t('onlinePlayers')}</h3><div class="player-list"></div>`;
        const list = playersPanel.querySelector('.player-list');
        onlineUsers.forEach((u) => {
            const item = document.createElement('div');
            item.className = 'player-item';
            const flag = LANGUAGES[u.language]?.flag || '🌐';
            item.innerHTML = `
                <span>${escapeHtml(u.name)} (${flag})</span>
                <button class="small-btn">${t('challenge')}</button>
            `;
            item.querySelector('button').onclick = () => sendInvite(u);
            list.appendChild(item);
        });
    }

    const centerPanel = document.querySelector('.center-panel');
    if (centerPanel) {
        centerPanel.innerHTML = `
            <div class="glass-card main-lobby-card">
                <img src="assets/bible-logo.webp" class="logo-medium" />
                <h2>${t('welcome')}, ${escapeHtml(currentUser.name)}!</h2>
                <div class="stats-row">
                    <div class="stat-item"><img src="assets/medal-gold.webp" /> ${currentUser.wins} ${progressText('wins')}</div>
                    <div class="stat-item"><img src="assets/medal-silver.webp" /> ${currentUser.totalDuels} ${progressText('totalDuels')}</div>
                </div>
                <section class="lobby-progress-overview" aria-labelledby="progress-overview-title">
                    <div class="progress-overview-heading">
                        <h3 id="progress-overview-title">${progressText('progressOverview')}</h3>
                        <span class="trend-window-label">${progressText('trendSubtitle')}</span>
                    </div>
                    <div class="lobby-progress-grid">
                        <div class="lobby-progress-stat xp"><span>${progressText('totalXp')}</span><strong>${currentUser.xp} XP</strong></div>
                        <div class="lobby-progress-stat"><span>${progressText('streak')}</span><strong>${currentUser.winStreak}</strong></div>
                        <div class="lobby-progress-stat"><span>${progressText('bestStreak')}</span><strong>${currentUser.bestStreak}</strong></div>
                    </div>
                    <div class="trend-overview" id="trend-overview"></div>
                </section>
                ${renderMilestoneOverview()}
                <button class="primary-btn large-btn" id="auto-match-btn">${t('autoMatch')}</button>
            </div>
            <section class="glass-card lobby-history-card" id="duel-history-card" aria-labelledby="duel-history-title">
                <div class="lobby-history-heading">
                    <div>
                        <h3 id="duel-history-title">${progressText('historyTitle')}</h3>
                        <p>${progressText('historySubtitle')}</p>
                    </div>
                    <span class="history-count">${Math.min(duelHistory.length, 8)}</span>
                </div>
                <div class="duel-history-list" id="duel-history-list"></div>
            </section>
        `;
        centerPanel.querySelector('#auto-match-btn').onclick = startAutoMatchmaking;
        renderLobbyHistory();
    }

    const chatPanel = document.getElementById('chat-panel');
    if (chatPanel) {
        chatPanel.innerHTML = `
            <h3>${t('chat')}</h3>
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input-row">
                <input type="text" id="chat-input" placeholder="${t('typeMessage')}" />
                <button id="chat-send">${t('send')}</button>
            </div>
        `;
        setupChat();
    }
}

function renderLobbyHistory() {
    const list = document.getElementById('duel-history-list');
    const count = document.querySelector('.history-count');
    const trendOverview = document.getElementById('trend-overview');
    if (!list) return;

    const recentRecords = duelHistory.slice(0, 5);
    const records = progressFilter === 'all'
        ? duelHistory.slice(0, 8)
        : duelHistory.filter((duel) => (duel.result || 'draw') === progressFilter).slice(0, 8);
    if (count) count.textContent = String(records.length);

    if (trendOverview) {
        const filterOptions = [
            ['all', progressText('filterAll')],
            ['win', progressText('filterWins')],
            ['loss', progressText('filterLosses')],
            ['draw', progressText('filterDraws')]
        ];
        const filteredRecent = progressFilter === 'all'
            ? recentRecords
            : recentRecords.filter((duel) => (duel.result || 'draw') === progressFilter);
        const recentWins = filteredRecent.filter((duel) => duel.result === 'win').length;
        const recentXp = filteredRecent.reduce((total, duel) => total + Number(duel.xpEarned || 0), 0);
        const peakStreak = filteredRecent.reduce((peak, duel) => Math.max(peak, Number(duel.winStreak || 0)), 0);
        const overallWins = recentRecords.filter((duel) => duel.result === 'win').length;
        const overallLosses = recentRecords.filter((duel) => duel.result === 'loss').length;
        const recommendation = recentRecords.length === 0
            ? progressText('trendEmpty')
            : overallWins > overallLosses
                ? progressText('trendPositive')
                : overallLosses > overallWins
                    ? progressText('trendRecovery')
                    : progressText('trendSteady');

        trendOverview.innerHTML = `
            <div class="trend-heading-row">
                <div>
                    <strong>${progressText('trendTitle')}</strong>
                    <span>${progressText('trendSubtitle')}</span>
                </div>
                <span class="trend-sample-size">${recentRecords.length}/5</span>
            </div>
            <div class="trend-filter-row" role="group" aria-label="${progressText('trendTitle')}">
                ${filterOptions.map(([value, label]) => `
                    <button class="trend-filter-btn ${progressFilter === value ? 'active' : ''}" data-trend-filter="${value}" aria-pressed="${progressFilter === value}">${label}</button>
                `).join('')}
            </div>
            ${filteredRecent.length > 0 ? `
                <div class="trend-stat-row">
                    <div class="trend-stat"><span>${progressText('trendWins')}</span><strong>${recentWins}/${filteredRecent.length}</strong></div>
                    <div class="trend-stat xp"><span>${progressText('trendXp')}</span><strong>+${recentXp}</strong></div>
                    <div class="trend-stat"><span>${progressText('trendPeak')}</span><strong>${peakStreak}</strong></div>
                </div>
            ` : `<div class="trend-no-data">${recentRecords.length === 0 ? progressText('trendEmpty') : progressText('historyEmpty')}</div>`}
            <div class="trend-form-row">
                <span>${progressText('trendForm')}</span>
                <div class="trend-form-dots" aria-label="${progressText('trendForm')}">
                    ${recentRecords.length > 0 ? recentRecords.map((duel) => {
                        const result = duel.result || 'draw';
                        return `<span class="trend-dot ${resultClass(result)}" title="${resultLabel(result)}" aria-label="${resultLabel(result)}"></span>`;
                    }).join('') : '<span class="trend-dot-placeholder">—</span>'}
                </div>
            </div>
            <div class="trend-next-challenge">
                <strong>${progressText('nextChallenge')}</strong>
                <span>${recommendation}</span>
            </div>
        `;
        trendOverview.querySelectorAll('[data-trend-filter]').forEach((button) => {
            button.onclick = () => {
                progressFilter = button.dataset.trendFilter || 'all';
                renderLobbyHistory();
            };
        });
    }

    if (records.length === 0) {
        list.innerHTML = `<div class="history-empty"><span class="history-empty-icon">✦</span><p>${progressText('historyEmpty')}</p></div>`;
        return;
    }

    list.innerHTML = records.map((duel) => {
        const result = duel.result || 'draw';
        const rewards = Array.isArray(duel.rewards) ? duel.rewards : [];
        const opponent = opponentNameForResult(duel);
        const dateValue = Number(duel.recordedAt || 0);
        const date = Number.isFinite(dateValue) ? new Date(dateValue) : null;
        const isoDate = date && Number.isFinite(date.getTime()) ? date.toISOString() : '';
        return `
            <article class="duel-history-item ${resultClass(result)}">
                <div class="duel-history-topline">
                    <div class="duel-history-result">
                        <span class="result-dot" aria-hidden="true"></span>
                        <strong>${resultLabel(result)}</strong>
                        <span class="duel-history-opponent">${progressText('versus')} ${escapeHtml(opponent)}</span>
                    </div>
                    <time datetime="${isoDate}">${formatDuelDate(dateValue)}</time>
                </div>
                <div class="duel-history-metrics">
                    <span><b>${t('score')}</b> ${Number(duel.score || 0)}–${Number(duel.opponentScore || 0)}</span>
                    <span><b>${progressText('xpEarned')}</b> +${Number(duel.xpEarned || 0)} XP</span>
                    <span><b>${progressText('streak')}</b> ${Number(duel.winStreak || 0)}</span>
                </div>
                <div class="duel-history-rewards">
                    ${rewards.map((reward) => `<span class="history-reward-chip">${escapeHtml(rewardLabel(reward))}</span>`).join('')}
                </div>
            </article>
        `;
    }).join('');
}

function setupChat() {
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');
    if (!input || !send) return;

    ownSubscription({ messages: { $: { order: { serverCreatedAt: 'desc' }, limit: 20 } } }, (res) => {
        const messages = document.getElementById('chat-messages');
        if (!messages || !res.data) return;
        messages.innerHTML = '';
        (res.data.messages || [])
            .sort((a, b) => (a.serverCreatedAt || 0) - (b.serverCreatedAt || 0))
            .forEach((message) => {
                const div = document.createElement('div');
                div.className = 'chat-msg';
                div.textContent = `${message.user}: ${message.text}`;
                messages.appendChild(div);
            });
        messages.scrollTop = messages.scrollHeight;
    });

    const sendMessage = () => {
        const text = input.value.trim();
        if (!text || !currentUser || gameState !== 'lobby') return;
        transactSafe(db.tx.messages[id()].update({
            user: currentUser.name,
            text,
            serverCreatedAt: Date.now()
        }));
        input.value = '';
    };

    send.onclick = sendMessage;
    input.onkeydown = (event) => { if (event.key === 'Enter') sendMessage(); };
}

function sendInvite(user) {
    if (!currentUser || !user?.id || user.id === currentUser.id || gameState !== 'lobby') return;
    const existing = outgoingInvites.find((invite) =>
        invite.fromId === currentUser.id && invite.toId === user.id && isPendingInvite(invite)
    );
    if (pendingInviteTargetIds.has(user.id) || (existing && !isInviteExpired(existing))) {
        alert(t('inviteAlreadyPending'));
        return;
    }

    const createdAt = Date.now();
    const inviteId = `invite_${stableHash(`${currentUser.id}|${user.id}|${Math.floor(createdAt / INVITE_TTL_MS)}`)}`;
    const invite = {
        fromId: currentUser.id,
        fromName: currentUser.name,
        toId: user.id,
        kind: 'duel',
        status: 'pending',
        createdAt,
        timestamp: createdAt,
        expiresAt: createdAt + INVITE_TTL_MS
    };
    pendingInviteTargetIds.add(user.id);
    pendingInviteWrites.set(inviteId, user.id);
    transactSafe(db.tx.invites[inviteId].update(invite)).then((success) => {
        if (!success) {
            pendingInviteWrites.delete(inviteId);
            pendingInviteTargetIds.delete(user.id);
        }
    });
    alert(t('inviteSent'));
}

function showInviteNotification(invite) {
    if (invite.kind === 'rematch') {
        showRematchInviteNotification(invite);
        return;
    }
    if (!isPendingInvite(invite) || isInviteExpired(invite)) return;
    scheduleInviteExpiry(invite);
    if (document.querySelector(`[data-invite-id="${invite.id}"]`)) return;
    const notification = document.createElement('div');
    notification.className = 'invite-notification glass-card';
    notification.dataset.inviteId = invite.id;
    notification.innerHTML = `
        <p><strong>${escapeHtml(invite.fromName || progressText('unknownOpponent'))}</strong> ${t('inviteReceived')}<br><small>${t('inviteExpires')}</small></p>
        <div class="btn-row">
            <button class="small-btn success" id="accept-invite">${t('accept')}</button>
            <button class="small-btn danger" id="decline-invite">${t('decline')}</button>
        </div>
    `;
    document.body.appendChild(notification);

    notification.querySelector('#accept-invite').onclick = () => {
        acceptInvite(invite);
        notification.remove();
    };
    notification.querySelector('#decline-invite').onclick = () => {
        renderedInviteIds.delete(invite.id);
        knownInviteIds.delete(invite.id);
        clearInviteExpiryTimer(invite.id);
        transactSafe(db.tx.invites[invite.id].delete());
        notification.remove();
    };
}

function showRematchInviteNotification(invite) {
    if (!isPendingInvite(invite) || isInviteExpired(invite)) return;
    scheduleInviteExpiry(invite);
    if (document.querySelector(`[data-invite-id="${invite.id}"]`)) return;
    const notification = document.createElement('div');
    notification.className = 'invite-notification glass-card';
    notification.dataset.inviteId = invite.id;
    notification.innerHTML = `
        <p><strong>${rematchText('inviteTitle')}</strong><br>${rematchText('inviteBody')}<br><small>${t('inviteExpires')}</small></p>
        <div class="btn-row">
            <button class="small-btn success" id="accept-rematch-invite">${rematchText('confirm')}</button>
            <button class="small-btn danger" id="decline-rematch-invite">${rematchText('decline')}</button>
        </div>
    `;
    document.body.appendChild(notification);

    notification.querySelector('#accept-rematch-invite').onclick = () => {
        acceptRematchInvite(invite);
        notification.remove();
    };
    notification.querySelector('#decline-rematch-invite').onclick = () => {
        declineRematchInvite(invite);
        clearInviteExpiryTimer(invite.id);
        notification.remove();
    };
}

function rematchPlayers(match) {
    return [match?.player1, match?.player2].filter(Boolean).sort();
}

function rematchInviteId(match) {
    const players = rematchPlayers(match);
    return `rematch_${stableHash(`${match.id}|${players.join('|')}`)}`;
}

function rematchMatchId(invite) {
    const players = rematchPlayers(invite);
    return makeMatchId(players[0], players[1], `rematch:${invite.matchId}`);
}

function updateRematchView() {
    if (gameState === 'game_over') render();
}

function handleRematchInvite(invite, match) {
    if (!invite || !match || invite.matchId !== match.id || !isMyMatch(match)) return;
    if (isPendingInvite(invite)) {
        if (isInviteExpired(invite)) {
            expireInvite(invite, invite.toId === currentUser?.id);
            return;
        }
        scheduleInviteExpiry(invite);
    }

    const players = rematchPlayers(match);
    const confirmations = invite.confirmations || {};
    const myConfirmed = Boolean(confirmations[currentUser.id]);
    const opponentId = players.find((playerId) => playerId !== currentUser.id);
    const opponentConfirmed = Boolean(opponentId && confirmations[opponentId]);
    const bothConfirmed = invite.status !== 'declined' && myConfirmed && opponentConfirmed;

    rematchState = {
        inviteId: invite.id,
        matchId: match.id,
        status: invite.status === 'declined' ? 'declined' : (bothConfirmed ? 'accepted' : 'pending'),
        myConfirmed,
        opponentConfirmed,
        expiresAt: inviteExpiresAt(invite)
    };

    if (bothConfirmed) {
        ensureRematchMatchCreated(invite);
    } else {
        updateRematchView();
    }
}

function watchRematchInvite(match) {
    if (!currentUser || !match || !isMyMatch(match) || rematchSubscriptionMatchId === match.id) return;
    rematchSubscriptionMatchId = match.id;
    const inviteId = rematchInviteId(match);
    ownSubscription({ invites: { where: { id: inviteId } } }, (res) => {
        const invite = res.data?.invites?.[0];
        if (invite) {
            rematchObservedInviteIds.add(inviteId);
            handleRematchInvite(invite, match);
            return;
        }
        if (rematchObservedInviteIds.has(inviteId) && rematchState?.inviteId === inviteId && rematchState.status === 'pending') {
            clearInviteExpiryTimer(inviteId);
            rematchState = { ...rematchState, status: 'expired' };
            updateRematchView();
        }
    });
}

function ensureRematchMatchCreated(invite) {
    const newMatchId = rematchMatchId(invite);
    if (rematchCreationIds.has(newMatchId)) return;
    rematchCreationIds.add(newMatchId);
    if (rematchState) rematchState.status = 'starting';
    updateRematchView();

    ownSubscription({ matches: { where: { id: newMatchId } } }, (res) => {
        const newMatch = res.data?.matches?.[0];
        if (newMatch && isMyMatch(newMatch)) startMatch(newMatch);
    });

    const players = rematchPlayers(invite);
    const questionOrder = buildQuestionOrder(players[0], players[1], `rematch:${invite.matchId}`, invite.previousQuestionOrder || []);
    const questionStartedAt = Date.now();
    const questionDeadlineAt = questionStartedAt + QUESTION_TIME_LIMIT_MS;
    const transaction = db.tx.matches[newMatchId].update({
        matchKey: newMatchId,
        player1: players[0],
        player2: players[1],
        status: 'active',
        currentQuestion: 0,
        questionBankVersion: QUESTION_BANK_VERSION,
        roundCount: MATCH_ROUND_COUNT,
        questionOrder,
        scores: { [players[0]]: 0, [players[1]]: 0 },
        answers: {},
        answerTimes: {},
        roundTimeouts: {},
        roundReviews: {},
        questionDeadlines: { 0: questionDeadlineAt },
        questionStartedAt,
        questionDeadlineAt,
        createdAt: questionStartedAt,
        updatedAt: questionStartedAt,
        rematchOf: invite.matchId
    });

    transactSafe([
        transaction,
        db.tx.invites[invite.id].delete()
    ]).then((success) => {
        if (!success) {
            rematchCreationIds.delete(newMatchId);
            if (rematchState?.matchId === invite.matchId) {
                rematchState.status = 'pending';
                updateRematchView();
            }
        }
    });
}

function requestRematch() {
    if (!currentUser || !currentMatch || currentMatch.status !== 'finished' || rematchState?.status === 'starting') return;
    const players = rematchPlayers(currentMatch);
    const opponentId = players.find((playerId) => playerId !== currentUser.id);
    if (!opponentId) return;

    const inviteId = rematchInviteId(currentMatch);
    const actionKey = `${inviteId}:${currentUser.id}:request`;
    if (rematchActionKeys.has(actionKey)) return;
    rematchActionKeys.add(actionKey);
    const createdAt = Date.now();
    rematchState = {
        inviteId,
        matchId: currentMatch.id,
        status: 'pending',
        myConfirmed: true,
        opponentConfirmed: false,
        expiresAt: createdAt + INVITE_TTL_MS
    };
    updateRematchView();
    scheduleInviteExpiry({
        id: inviteId,
        kind: 'rematch',
        fromId: currentUser.id,
        fromName: currentUser.name,
        toId: opponentId,
        status: 'pending',
        createdAt,
        expiresAt: createdAt + INVITE_TTL_MS
    });

    transactSafe(db.tx.invites[inviteId].update({
        kind: 'rematch',
        matchId: currentMatch.id,
        player1: players[0],
        player2: players[1],
        fromId: currentUser.id,
        fromName: currentUser.name,
        toId: opponentId,
        status: 'pending',
        [`confirmations.${currentUser.id}`]: true,
        previousQuestionOrder: questionOrderForMatch(currentMatch),
        updatedAt: createdAt,
        createdAt,
        expiresAt: createdAt + INVITE_TTL_MS
    })).then((success) => {
        if (!success) {
            rematchActionKeys.delete(actionKey);
            rematchState = null;
            updateRematchView();
        }
    });
}

function acceptRematchInvite(invite) {
    if (!currentUser || !currentMatch || invite?.kind !== 'rematch' || invite.matchId !== currentMatch.id) return;
    const effectiveInvite = {
        ...invites.find((item) => item.id === invite.id),
        ...invite,
        expiresAt: invite.expiresAt || rematchState?.expiresAt
    };
    if (!isPendingInvite(effectiveInvite)) return;
    if (isInviteExpired(effectiveInvite)) {
        expireInvite(effectiveInvite, true);
        return;
    }
    const actionKey = `${invite.id}:${currentUser.id}:accept`;
    if (rematchActionKeys.has(actionKey)) return;
    rematchActionKeys.add(actionKey);
    transactSafe(db.tx.invites[invite.id].update({
        status: 'pending',
        [`confirmations.${currentUser.id}`]: true,
        acceptedBy: currentUser.id,
        updatedAt: Date.now()
    })).then((success) => {
        if (!success) rematchActionKeys.delete(actionKey);
    });
}

function declineRematchInvite(invite) {
    if (!currentUser || !currentMatch || invite?.kind !== 'rematch' || invite.matchId !== currentMatch.id) return;
    const actionKey = `${invite.id}:${currentUser.id}:decline`;
    if (rematchActionKeys.has(actionKey)) return;
    rematchActionKeys.add(actionKey);
    transactSafe(db.tx.invites[invite.id].update({
        status: 'declined',
        declinedBy: currentUser.id,
        updatedAt: Date.now()
    }));
}

function createMatchTransaction(playerA, playerB, nonce) {
    const players = [playerA, playerB].sort();
    const matchId = makeMatchId(players[0], players[1], nonce);
    const questionOrder = buildQuestionOrder(players[0], players[1], nonce);
    const questionStartedAt = Date.now();
    const questionDeadlineAt = questionStartedAt + QUESTION_TIME_LIMIT_MS;
    return {
        matchId,
        transaction: db.tx.matches[matchId].update({
            matchKey: matchId,
            player1: players[0],
            player2: players[1],
            status: 'active',
            currentQuestion: 0,
            questionBankVersion: QUESTION_BANK_VERSION,
            questionOrder,
            scores: { [players[0]]: 0, [players[1]]: 0 },
            answers: {},
            answerTimes: {},
            roundTimeouts: {},
            roundReviews: {},
            questionDeadlines: { 0: questionDeadlineAt },
            questionStartedAt,
            questionDeadlineAt,
            createdAt: questionStartedAt,
            updatedAt: questionStartedAt
        })
    };
}

function acceptInvite(invite) {
    if (!currentUser || gameState !== 'lobby' || invite?.toId !== currentUser.id || !isPendingInvite(invite) || reconciledMatchIds.has(invite.id)) return;
    if (isInviteExpired(invite)) {
        expireInvite(invite, true);
        return;
    }
    reconciledMatchIds.add(invite.id);
    renderedInviteIds.delete(invite.id);
    knownInviteIds.delete(invite.id);
    clearInviteExpiryTimer(invite.id);
    const { transaction } = createMatchTransaction(invite.fromId, invite.toId, `invite:${invite.id}`);
    const relatedInvites = invites.filter((candidate) =>
        candidate.id !== invite.id && candidate.fromId === invite.fromId && candidate.toId === invite.toId && isPendingInvite(candidate)
    );
    transactSafe([
        transaction,
        db.tx.invites[invite.id].delete(),
        ...relatedInvites.map((candidate) => db.tx.invites[candidate.id].delete()),
        db.tx.matchmaking[currentUser.id].delete()
    ]).then((success) => {
        if (!success) reconciledMatchIds.delete(invite.id);
    });
}

function findQueueCandidate(queueEntries, matches) {
    const occupied = new Set((matches || [])
        .filter((match) => match.status === 'active')
        .flatMap(getPlayers));
    const now = Date.now();
    return (queueEntries || [])
        .filter((entry) => {
            const playerId = entry.playerId || entry.id;
            const expiresAt = Number(entry.expiresAt || (Number(entry.queuedAt || 0) + MATCHMAKING_TTL_MS));
            return entry.state === 'waiting' && playerId && playerId !== currentUser.id &&
                !occupied.has(playerId) && expiresAt > now;
        })
        .sort((a, b) => {
            const timeDiff = (a.queuedAt || 0) - (b.queuedAt || 0);
            return timeDiff || String(a.playerId || a.id).localeCompare(String(b.playerId || b.id));
        })[0] || null;
}

function tryMatchFromQueue(queueEntries, matches, generation) {
    if (generation !== sessionGeneration || gameState !== 'matchmaking' || !currentUser || !matchmakingRequestId) return;
    const candidate = findQueueCandidate(queueEntries, matches);
    if (!candidate) return;

    const otherId = candidate.playerId || candidate.id;
    const requestIds = [matchmakingRequestId, candidate.requestId || otherId].sort();
    const nonce = `auto:${requestIds.join(':')}`;
    const matchId = makeMatchId(currentUser.id, otherId, nonce);
    if (reconciledMatchIds.has(matchId)) return;
    reconciledMatchIds.add(matchId);

    const { transaction } = createMatchTransaction(currentUser.id, otherId, nonce);
    transactSafe([
        transaction,
        db.tx.matchmaking[currentUser.id].delete(),
        db.tx.matchmaking[otherId].delete()
    ]);
}

function startAutoMatchmaking() {
    if (!currentUser || gameState === 'matchmaking') return;
    stopRealtime();
    removeOwnQueue();
    matchmakingRequestId = id();
    gameState = 'matchmaking';
    render();

    const generation = sessionGeneration;
    let latestQueue = [];
    let latestMatches = [];
    const queue = () => {
        if (generation !== sessionGeneration || gameState !== 'matchmaking') return;
        const queuedAt = Date.now();
        return transactSafe(db.tx.matchmaking[currentUser.id].update({
            playerId: currentUser.id,
            requestId: matchmakingRequestId,
            queuedAt,
            expiresAt: queuedAt + MATCHMAKING_TTL_MS,
            state: 'waiting'
        }));
    };
    queue();

    const tryCurrentSnapshot = () => tryMatchFromQueue(latestQueue, latestMatches, generation);
    ownSubscription({ matchmaking: {} }, (res) => {
        latestQueue = res.data?.matchmaking || [];
        tryCurrentSnapshot();
    });
    ownSubscription({ matches: {} }, (res) => {
        latestMatches = res.data?.matches || [];
        const canonical = cleanupDuplicateMatches(latestMatches);
        if (canonical) startMatch(canonical);
        else tryCurrentSnapshot();
    });
    matchmakingTimer = setInterval(queue, 5000);
}

function renderMatchmaking(el) {
    const card = document.createElement('div');
    card.className = 'glass-card centered-card';
    card.innerHTML = `
        <div class="spinner"></div>
        <h2>${t('searching')}</h2>
        <button class="secondary-btn mt-20" id="cancel-match-btn">${t('cancelSearch')}</button>
    `;
    el.appendChild(card);
    card.querySelector('#cancel-match-btn').onclick = () => {
        stopRealtime();
        removeOwnQueue();
        enterLobby();
    };
}

function startMatch(match) {
    if (!match || !isMyMatch(match)) return;
    if (gameState === 'in_game' && currentMatch?.id === match.id) {
        currentMatch = match;
        renderGameUI();
        return;
    }

    stopRealtime();
    removeOwnQueue();
    currentMatch = match;
    currentOpponent = match.player1 === currentUser.id
        ? userDirectory[match.player2] || { id: match.player2, name: '' }
        : userDirectory[match.player1] || { id: match.player1, name: '' };
    pendingAnswerKeys.clear();
    scheduledAdvanceKeys.clear();
    timeoutResolutionKeys.clear();
    reviewResolutionKeys.clear();
    reviewSeenKeys.clear();
    completionProgress = null;
    rematchState = null;
    rematchSubscriptionMatchId = null;
    gameState = 'in_game';
    playSound('match-found-sound');
    render();

    ownSubscription({ matches: { where: { id: match.id } } }, (res) => {
        const updated = res.data?.matches?.[0];
        if (!updated || !isMyMatch(updated)) return;
        currentMatch = updated;
        const answered = updated.answers?.[currentUser.id] || {};
        Object.keys(answered).forEach((questionIndex) => {
            pendingAnswerKeys.delete(`${updated.id}:${currentUser.id}:${questionIndex}`);
        });
        if (updated.status === 'finished') {
            stopQuestionTimer();
            gameState = 'game_over';
            watchRematchInvite(updated);
            render();
        } else if (gameState === 'in_game') {
            renderGameUI();
        }
    });
}

function renderGame(el) {
    const gameLayout = document.createElement('div');
    gameLayout.className = 'game-layout';
    gameLayout.id = 'game-ui-container';
    el.appendChild(gameLayout);
    renderGameUI();
}

function updateQuestionTimerDisplay(matchId, qIndex, deadline) {
    const timer = document.querySelector(`[data-question-timer="${matchId}:${qIndex}"]`);
    if (!timer) return;
    const remainingSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    timer.textContent = `${remainingSeconds} ${roundText('seconds')}`;
    timer.classList.toggle('urgent', remainingSeconds <= 5);
    timer.classList.toggle('expired', remainingSeconds === 0);
}

function startQuestionTimer(matchId, qIndex, deadline) {
    const timerKey = `${matchId}:${qIndex}`;
    if (questionTimerKey === timerKey && questionTimerInterval !== null) {
        updateQuestionTimerDisplay(matchId, qIndex, deadline);
        return;
    }

    stopQuestionTimer();
    questionTimerKey = timerKey;
    const tick = () => {
        if (!currentMatch || currentMatch.id !== matchId || currentMatch.status !== 'active' || currentMatch.currentQuestion !== qIndex) {
            stopQuestionTimer();
            return;
        }
        updateQuestionTimerDisplay(matchId, qIndex, deadline);
        if (Date.now() >= deadline + TIMEOUT_GRACE_MS) resolveExpiredQuestion(matchId, qIndex);
    };
    tick();
    questionTimerInterval = setInterval(tick, 250);
}

function resolveExpiredQuestion(matchId, qIndex) {
    if (!currentMatch || currentMatch.id !== matchId || currentMatch.status !== 'active' || currentMatch.currentQuestion !== qIndex) return;
    const deadline = questionDeadlineFor(currentMatch, qIndex);
    if (Date.now() < deadline + TIMEOUT_GRACE_MS) return;
    publishRoundReview(matchId, qIndex);
}

function renderGameUI() {
    const el = document.getElementById('game-ui-container');
    if (!el || !currentMatch) return;

    const qIndex = currentMatch.currentQuestion;
    const questionData = questionForRound(currentMatch, qIndex);
    if (!questionData) {
        stopQuestionTimer();
        if (currentMatch.status !== 'finished') {
            transactSafe(db.tx.matches[currentMatch.id].update({
                status: 'finished',
                finishedAt: Date.now(),
                updatedAt: Date.now()
            }));
        }
        return;
    }

    const myId = currentUser.id;
    const opponentId = currentMatch.player1 === myId ? currentMatch.player2 : currentMatch.player1;
    const answers = currentMatch.answers || {};
    const myScore = scoreForPlayer(currentMatch, myId);
    const oppScore = scoreForPlayer(currentMatch, opponentId);
    const qLocal = questionData[currentLanguage] || questionData.pt;
    const deadline = questionDeadlineFor(currentMatch, qIndex);
    const expired = Date.now() >= deadline;
    const hasAnswered = answerWasSubmitted(currentMatch, myId, qIndex);
    const answerKey = `${currentMatch.id}:${myId}:${qIndex}`;
    const pending = pendingAnswerKeys.has(answerKey);
    const currentTimeoutIds = timeoutPlayerIds(currentMatch, qIndex);
    const previousTimeoutIds = qIndex > 0 ? timeoutPlayerIds(currentMatch, qIndex - 1) : [];
    const review = roundReviewFor(currentMatch, qIndex);
    const reviewReady = Boolean(review);
    const reviewSeenByEveryone = reviewReady && reviewSeenByAll(currentMatch, qIndex);

    el.innerHTML = `
        <div class="game-header">
            <div class="score-card">
                <span class="score-label">${t('score')}</span>
                <span class="score-value">${myScore}</span>
            </div>
            <div class="vs-text">VS</div>
            <div class="score-card opponent">
                <span class="score-label">${t('opponentScore')}</span>
                <span class="score-value">${oppScore}</span>
            </div>
        </div>
        <div class="question-container glass-card">
            <div class="q-header">
                <span>${t('question')} ${qIndex + 1} / ${questionCountForMatch(currentMatch)}</span>
                <span class="question-timer" data-question-timer="${currentMatch.id}:${qIndex}" aria-live="polite">
                    <span>${roundText('time')}</span> <strong>0 ${roundText('seconds')}</strong>
                </span>
            </div>
            <div class="question-meta" aria-label="${escapeHtml(qLocal.topic)}">
                <span class="topic-chip">${escapeHtml(qLocal.topic)}</span>
                <span class="difficulty-chip ${questionData.difficulty}">${escapeHtml(qLocal.difficulty)}</span>
            </div>
            <h2 class="q-text">${escapeHtml(qLocal.q)}</h2>
            <div class="answers-grid"></div>
        </div>
    `;

    const grid = el.querySelector('.answers-grid');
    qLocal.a.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.innerText = ans;
        if (hasAnswered || pending || expired || reviewReady) {
            btn.disabled = true;
            if (reviewReady && hasAnswered) {
                const myAns = answers[myId]?.[qIndex];
                if (idx === qLocal.correct) btn.classList.add('correct');
                else if (idx === myAns) btn.classList.add('wrong');
            }
        } else {
            btn.onclick = () => submitAnswer(qIndex, idx);
        }
        grid.appendChild(btn);
    });

    if (reviewReady) {
        const learning = document.createElement('aside');
        learning.className = 'question-learning shared-review';
        learning.setAttribute('aria-live', 'polite');
        learning.innerHTML = `
            <strong>📖 ${questionUiText('sharedReview')}</strong>
            <span><b>${questionUiText('correctAnswer')}:</b> ${escapeHtml(qLocal.a[qLocal.correct])}</span>
            <span><b>${questionUiText('reference')}:</b> ${escapeHtml(qLocal.reference)}</span>
            <span><b>${questionUiText('explanation')}:</b> ${escapeHtml(qLocal.explanation)}</span>
        `;
        el.querySelector('.question-container').appendChild(learning);
    }

    const expiredTimeoutIds = expired
        ? [currentMatch.player1, currentMatch.player2].filter((playerId) => !answerWasSubmitted(currentMatch, playerId, qIndex))
        : [];
    const noticeTimeoutIds = [...new Set([...previousTimeoutIds, ...currentTimeoutIds, ...expiredTimeoutIds])];
    if (noticeTimeoutIds.length > 0 || expired) {
        const notice = document.createElement('div');
        notice.className = 'round-notice timeout';
        const names = noticeTimeoutIds.length > 0
            ? noticeTimeoutIds.map((playerId) => escapeHtml(playerNameForMatch(currentMatch, playerId))).join(', ')
            : roundText('timeUp');
        notice.innerHTML = `<strong>${roundText('roundEnded')}</strong><span>${roundText('noResponse')}: ${names}</span><small>${reviewReady ? roundText('advanceNotice') : t('waitingOpponent')}</small>`;
        el.appendChild(notice);
    } else if (!reviewReady && (hasAnswered || pending)) {
        const waitMsg = document.createElement('div');
        waitMsg.className = 'waiting-msg';
        waitMsg.innerText = t('waitingOpponent');
        el.appendChild(waitMsg);
    } else if (reviewReady && !reviewSeenByEveryone) {
        const waitMsg = document.createElement('div');
        waitMsg.className = 'waiting-msg';
        waitMsg.innerText = questionUiText('reviewWaiting');
        el.appendChild(waitMsg);
    }

    if (reviewReady) {
        markRoundReviewSeen(currentMatch.id, qIndex);
        if (reviewSeenByEveryone) scheduleQuestionAdvance(currentMatch.id, qIndex);
        stopQuestionTimer();
    } else {
        publishRoundReview(currentMatch.id, qIndex);
        startQuestionTimer(currentMatch.id, qIndex, deadline);
    }
}

function scheduleQuestionAdvance(matchId, qIndex) {
    const advanceKey = `${matchId}:${qIndex}`;
    if (scheduledAdvanceKeys.has(advanceKey)) return;

    const review = roundReviewFor(currentMatch, qIndex);
    if (!review) return;
    const advanceAt = Number(review.advanceAt) || (Number(review.readyAt) + ROUND_REVIEW_DURATION_MS);
    const delay = Math.max(0, advanceAt - Date.now());
    scheduledAdvanceKeys.add(advanceKey);

    setTimeout(() => {
        if (!currentMatch || currentMatch.id !== matchId || currentMatch.status !== 'active' || currentMatch.currentQuestion !== qIndex) return;
        const latestReview = roundReviewFor(currentMatch, qIndex);
        if (!latestReview) {
            scheduledAdvanceKeys.delete(advanceKey);
            return;
        }
        const latestAdvanceAt = Number(latestReview.advanceAt) || (Number(latestReview.readyAt) + ROUND_REVIEW_DURATION_MS);
        if (Date.now() < latestAdvanceAt) {
            scheduledAdvanceKeys.delete(advanceKey);
            scheduleQuestionAdvance(matchId, qIndex);
            return;
        }

        const nextQuestion = qIndex + 1;
        if (nextQuestion < questionCountForMatch(currentMatch)) {
            const questionStartedAt = Date.now();
            const questionDeadlineAt = questionStartedAt + QUESTION_TIME_LIMIT_MS;
            transactSafe(db.tx.matches[matchId].update({
                currentQuestion: nextQuestion,
                questionStartedAt,
                questionDeadlineAt,
                [`questionDeadlines.${nextQuestion}`]: questionDeadlineAt,
                updatedAt: Date.now()
            })).then((success) => {
                if (!success) scheduledAdvanceKeys.delete(advanceKey);
            });
        } else {
            transactSafe(db.tx.matches[matchId].update({
                status: 'finished',
                finishedAt: Date.now(),
                updatedAt: Date.now()
            })).then((success) => {
                if (!success) scheduledAdvanceKeys.delete(advanceKey);
            });
        }
    }, delay);
}

function submitAnswer(qIndex, answerIndex) {
    if (!currentUser || !currentMatch || currentMatch.status !== 'active' || currentMatch.currentQuestion !== qIndex) return;
    const deadline = questionDeadlineFor(currentMatch, qIndex);
    const submittedAt = Date.now();
    if (submittedAt > deadline) {
        renderGameUI();
        return;
    }

    const myId = currentUser.id;
    const answerKey = `${currentMatch.id}:${myId}:${qIndex}`;
    const existingAnswer = currentMatch.answers?.[myId]?.[qIndex];
    if (existingAnswer !== undefined || pendingAnswerKeys.has(answerKey)) return;

    pendingAnswerKeys.add(answerKey);
    renderGameUI();
    const question = questionForRound(currentMatch, qIndex);
    const isCorrect = (question?.[currentLanguage] || question?.pt)?.correct === answerIndex;
    const newScore = scoreForPlayer(currentMatch, myId) + (isCorrect ? 10 : 0);
    if (isCorrect) playSound('correct-sound');

    transactSafe(db.tx.matches[currentMatch.id].update({
        [`scores.${myId}`]: newScore,
        [`answers.${myId}.${qIndex}`]: answerIndex,
        [`answerTimes.${myId}.${qIndex}`]: submittedAt,
        updatedAt: submittedAt
    })).then((success) => {
        // Keep the local lock until the realtime snapshot contains the answer.
        // Only a rejected transaction allows an immediate retry.
        if (!success) {
            pendingAnswerKeys.delete(answerKey);
            renderGameUI();
        }
    });
}

function leaveMatchToLobby() {
    const match = currentMatch;
    const pendingRematch = rematchState;
    if (pendingRematch && (pendingRematch.status === 'pending' || pendingRematch.status === 'declined')) {
        transactSafe(db.tx.invites[pendingRematch.inviteId].delete());
    }
    stopRealtime();
    currentMatch = null;
    pendingAnswerKeys.clear();
    scheduledAdvanceKeys.clear();
    rematchState = null;
    rematchSubscriptionMatchId = null;
    if (match && match.status === 'active') {
        transactSafe(db.tx.matches[match.id].update({
            status: 'finished',
            finishedAt: Date.now(),
            endedBy: currentUser?.id || null,
            endReason: 'left',
            updatedAt: Date.now()
        }));
    }
    removeOwnQueue();
    enterLobby();
}

function renderGameOver(el) {
    if (!currentMatch) return;
    watchRematchInvite(currentMatch);

    const progress = recordCompletedDuel(currentMatch) || completionProgress;
    if (!progress) return;

    let resultText = t('draw');
    if (progress.result === 'win') resultText = t('victory');
    else if (progress.result === 'loss') resultText = t('defeat');
    const timeoutRounds = timeoutSummaryForMatch(currentMatch);

    const card = document.createElement('div');
    card.className = 'glass-card centered-card animated-in';
    card.innerHTML = `
        <h1 class="result-title">${resultText}</h1>
        <div class="final-scores">
            <div class="final-score-item">
                <span class="label">Você</span>
                <span class="value">${progress.myScore}</span>
            </div>
            <div class="final-score-item">
                <span class="label">${t('opponentScore')}</span>
                <span class="value">${progress.opponentScore}</span>
            </div>
        </div>
        ${timeoutRounds.length > 0 ? `
            <section class="timeout-summary" aria-live="polite">
                <strong>${roundText('noResponseSummary')}</strong>
                <div>${timeoutRounds.join(' • ')}</div>
            </section>
        ` : ''}
        <section class="progress-summary" aria-live="polite">
            <div class="progress-summary-heading">
                <h3>${progressText('matchGain')}</h3>
                <span class="progress-save-state ${progress.recorded ? 'saved' : 'recording'}">
                    ${progress.recorded ? progressText('saved') : progressText('recording')}
                </span>
            </div>
            <div class="progress-grid">
                <div class="progress-stat highlight">
                    <span>${progressText('xpEarned')}</span>
                    <strong>+${progress.xpEarned} XP</strong>
                </div>
                <div class="progress-stat">
                    <span>${progressText('streak')}</span>
                    <strong>${progress.streak}</strong>
                </div>
                <div class="progress-stat">
                    <span>${progressText('totalXp')}</span>
                    <strong>${progress.totalXp}</strong>
                </div>
                <div class="progress-stat">
                    <span>${progressText('totalDuels')}</span>
                    <strong>${progress.totalDuels}</strong>
                </div>
            </div>
            <div class="progress-streak-line">
                <span>${progressText('bestStreak')}</span>
                <strong>${progress.bestStreak}</strong>
            </div>
            <div class="progress-rewards">
                <strong>${progressText('rewardsEarned')}</strong>
                <div class="reward-chip-list">
                    ${progress.rewards.map((reward) => `<span class="reward-chip">${rewardLabel(reward)}</span>`).join('')}
                </div>
            </div>
            ${progress.newMilestones.length > 0 ? `
                <section class="milestone-celebration" aria-live="assertive">
                    <div class="milestone-celebration-title">🎉 ${milestoneText('celebrationTitle')}</div>
                    ${progress.newMilestones.map((milestone) => `
                        <div class="milestone-unlocked-row">
                            <span class="milestone-icon">${milestone.icon}</span>
                            <div><strong>${escapeHtml(milestoneTitle(milestone))}</strong><span>${escapeHtml(milestoneTemplate('celebrationBody', { name: milestoneTitle(milestone), reward: milestoneRewardLabel(milestone) }))}</span></div>
                        </div>
                    `).join('')}
                </section>
            ` : ''}
        </section>
        <div class="rematch-panel" id="rematch-panel"></div>
        <div class="btn-row mt-20">
            <button class="secondary-btn" id="exit-btn">${t('exit')}</button>
        </div>
    `;
    el.appendChild(card);

    const rematchPanel = card.querySelector('#rematch-panel');
    const state = rematchState;
    if (!state) {
        rematchPanel.innerHTML = `<button class="primary-btn" id="rematch-btn">${t('rematch')}</button>`;
        rematchPanel.querySelector('#rematch-btn').onclick = requestRematch;
    } else if (state.status === 'pending' && state.myConfirmed) {
        rematchPanel.innerHTML = `
            <div class="rematch-status">
                <strong>${rematchText('waitingTitle')}</strong>
                <span>${rematchText('waitingBody')}</span>
            </div>
            <button class="primary-btn" disabled>${rematchText('waitingTitle')}</button>
        `;
    } else if (state.status === 'pending') {
        rematchPanel.innerHTML = `
            <div class="rematch-status">
                <strong>${rematchText('inviteTitle')}</strong>
                <span>${rematchText('inviteBody')}</span>
            </div>
            <div class="btn-row">
                <button class="primary-btn" id="accept-rematch-btn">${rematchText('confirm')}</button>
                <button class="secondary-btn" id="decline-rematch-btn">${rematchText('decline')}</button>
            </div>
        `;
        rematchPanel.querySelector('#accept-rematch-btn').onclick = () => acceptRematchInvite({
            id: state.inviteId,
            kind: 'rematch',
            matchId: state.matchId
        });
        rematchPanel.querySelector('#decline-rematch-btn').onclick = () => declineRematchInvite({
            id: state.inviteId,
            kind: 'rematch',
            matchId: state.matchId
        });
    } else if (state.status === 'starting' || state.status === 'accepted') {
        rematchPanel.innerHTML = `<div class="rematch-status confirmed"><strong>${rematchText('confirmed')}</strong></div>`;
    } else if (state.status === 'declined') {
        rematchPanel.innerHTML = `<div class="rematch-status declined"><strong>${rematchText('declined')}</strong></div>`;
    } else if (state.status === 'expired') {
        rematchPanel.innerHTML = `<div class="rematch-status declined"><strong>${escapeHtml(localizedTemplate('inviteExpired', { name: currentOpponent?.name || progressText('unknownOpponent') }))}</strong></div>`;
    }

    card.querySelector('#exit-btn').onclick = leaveMatchToLobby;
}

// --- CSS Styles ---
const style = document.createElement('style');
style.textContent = `
    :root {
        --primary: #2196F3;
        --primary-dark: #1976D2;
        --secondary: #90CAF9;
        --success: #66BB6A;
        --danger: #EF5350;
        --gold: #FFD700;
        --text: #333;
        --bg-glass: rgba(255, 255, 255, 0.85);
    }

    body {
        margin: 0;
        font-family: 'Inter', sans-serif;
        color: var(--text);
        overflow: hidden;
    }

    .ui-overlay {
        position: relative;
        width: 100%;
        min-height: 100%;
        height: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: clamp(12px, 2vw, 28px);
        box-sizing: border-box;
        flex: 0 0 auto;
    }

    .glass-card {
        background: var(--bg-glass);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        padding: 30px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        border: 1px solid rgba(255,255,255,0.3);
    }

    .centered-card {
        width: 100%;
        max-width: 500px;
        text-align: center;
        animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .logo-large { width: 120px; margin-bottom: 20px; }
    .logo-medium { width: 80px; margin-bottom: 15px; }

    .language-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 20px;
    }

    .language-item {
        min-height: 44px;
        box-sizing: border-box;
        padding: 12px;
        border-radius: 12px;
        border: 2px solid transparent;
        background: rgba(0,0,0,0.05);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
    }

    .language-item:hover { background: rgba(0,0,0,0.1); }
    .language-item.active { border-color: var(--primary); background: white; color: var(--primary); }

    .primary-btn,
    .secondary-btn,
    .small-btn {
        min-height: 44px;
        font-family: inherit;
        line-height: 1.2;
        touch-action: manipulation;
    }

    .primary-btn {
        background: var(--primary);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 800;
        cursor: pointer;
        font-size: 1rem;
        transition: transform 0.1s;
    }

    .primary-btn:active { transform: scale(0.98); }
    .primary-btn.large-btn { padding: 16px 24px; font-size: clamp(1rem, 2vw, 1.2rem); width: 100%; margin-top: 20px; }

    .secondary-btn {
        background: rgba(0,0,0,0.1);
        color: var(--text);
        border: none;
        padding: 10px 20px;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
    }

    .small-btn {
        padding: 9px 12px;
        border-radius: 8px;
        border: none;
        background: var(--primary);
        color: white;
        cursor: pointer;
        font-size: 0.85rem;
        white-space: nowrap;
    }
    .small-btn.success { background: var(--success); }
    .small-btn.danger { background: var(--danger); }

    .lobby-layout {
        display: grid;
        grid-template-areas: "players main chat";
        grid-template-columns: minmax(210px, 0.85fr) minmax(360px, 1.55fr) minmax(230px, 0.95fr);
        width: min(100%, 1280px);
        height: min(82vh, 760px);
        min-height: 540px;
        gap: clamp(12px, 1.8vw, 24px);
        align-self: center;
    }

    .side-panel,
    .center-panel {
        min-width: 0;
        min-height: 0;
    }
    .side-panel {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .players-panel { grid-area: players; }
    .lobby-main-panel {
        grid-area: main;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: 14px;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding-right: 3px;
    }
    .lobby-chat-panel { grid-area: chat; }

    .player-list {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        margin-top: 10px;
        padding-right: 3px;
        overscroll-behavior: contain;
    }
    .player-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: white;
        margin-bottom: 8px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .player-item span { min-width: 0; overflow-wrap: anywhere; }
    .player-item .small-btn { flex: 0 0 auto; }

    .chat-messages {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        background: white;
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 10px;
        overscroll-behavior: contain;
    }
    .chat-msg { margin-bottom: 8px; font-size: 0.9rem; overflow-wrap: anywhere; }
    .chat-input-row { display: flex; gap: 8px; align-items: stretch; }
    .chat-input-row input {
        flex: 1 1 auto;
        min-width: 0;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 8px 10px;
        min-height: 44px;
        box-sizing: border-box;
        font: inherit;
        font-size: 16px;
    }
    .chat-input-row button { flex: 0 0 auto; min-width: 64px; }

    .main-lobby-card { width: 100%; text-align: center; box-sizing: border-box; }
    .main-lobby-card h2 { font-size: clamp(1.15rem, 2.4vw, 1.7rem); overflow-wrap: anywhere; }
    .lobby-progress-overview {
        margin-top: 18px;
        padding: 14px;
        border-radius: 15px;
        background: rgba(33, 150, 243, 0.07);
        border: 1px solid rgba(33, 150, 243, 0.14);
        text-align: left;
    }
    .lobby-progress-overview h3 { margin: 0; color: var(--primary-dark); font-size: 0.95rem; }
    .progress-overview-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
    .trend-window-label { color: #78858d; font-size: 0.68rem; text-align: right; }
    .lobby-progress-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .trend-overview { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(33, 150, 243, 0.14); }
    .trend-heading-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .trend-heading-row > div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .trend-heading-row strong { color: var(--text); font-size: 0.78rem; }
    .trend-heading-row span { color: #78858d; font-size: 0.67rem; }
    .trend-sample-size { flex: 0 0 auto; padding: 3px 6px; border-radius: 999px; background: rgba(33, 150, 243, 0.1); color: var(--primary-dark) !important; font-weight: 800; }
    .trend-filter-row { display: flex; flex-wrap: wrap; gap: 5px; margin: 9px 0; }
    .trend-filter-btn { min-height: 30px; padding: 5px 8px; border: 1px solid rgba(33, 150, 243, 0.16); border-radius: 999px; background: rgba(255, 255, 255, 0.65); color: #60717c; cursor: pointer; font: inherit; font-size: 0.68rem; font-weight: 700; touch-action: manipulation; }
    .trend-filter-btn:hover, .trend-filter-btn.active { background: var(--primary); border-color: var(--primary); color: white; }
    .trend-filter-btn:focus-visible { outline: 3px solid rgba(33, 150, 243, 0.28); outline-offset: 2px; }
    .trend-stat-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
    .trend-stat { display: flex; flex-direction: column; gap: 3px; min-width: 0; padding: 8px; border-radius: 9px; background: rgba(255, 255, 255, 0.66); }
    .trend-stat.xp { background: rgba(255, 215, 0, 0.16); }
    .trend-stat span { color: #73808a; font-size: 0.63rem; line-height: 1.2; }
    .trend-stat strong { color: var(--text); font-size: 0.9rem; }
    .trend-stat.xp strong { color: #9a7200; }
    .trend-no-data { padding: 8px; border-radius: 9px; background: rgba(255, 255, 255, 0.55); color: #78858d; font-size: 0.7rem; line-height: 1.35; }
    .trend-form-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 9px; color: #73808a; font-size: 0.67rem; }
    .trend-form-dots { display: flex; align-items: center; gap: 5px; }
    .trend-dot { width: 10px; height: 10px; border-radius: 50%; background: #e0a62b; box-shadow: 0 0 0 2px rgba(255,255,255,0.65); }
    .trend-dot.win { background: var(--success); }
    .trend-dot.loss { background: var(--danger); }
    .trend-dot.draw { background: #e0a62b; }
    .trend-dot-placeholder { color: #a8b0b5; font-size: 0.85rem; }
    .trend-next-challenge { display: flex; flex-direction: column; gap: 3px; margin-top: 9px; padding: 8px 9px; border-left: 3px solid var(--primary); border-radius: 0 8px 8px 0; background: rgba(33, 150, 243, 0.08); }
    .trend-next-challenge strong { color: var(--primary-dark); font-size: 0.68rem; }
    .trend-next-challenge span { color: #596871; font-size: 0.68rem; line-height: 1.35; }
    .milestone-overview {
        padding: 14px;
        border-radius: 15px;
        background: linear-gradient(135deg, rgba(255, 215, 0, 0.14), rgba(33, 150, 243, 0.08));
        border: 1px solid rgba(255, 193, 7, 0.25);
        text-align: left;
    }
    .milestone-overview-heading,
    .milestone-progress-line,
    .collection-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .milestone-overview-heading h3 { margin: 0; color: #806300; font-size: 0.95rem; }
    .milestone-overview-heading > span { padding: 3px 7px; border-radius: 999px; background: rgba(255, 255, 255, 0.7); color: #806300; font-size: 0.68rem; font-weight: 800; }
    .milestone-next-card { margin-top: 10px; padding: 11px; border-radius: 12px; background: rgba(255, 255, 255, 0.7); }
    .milestone-next-heading { display: flex; align-items: center; gap: 9px; }
    .milestone-next-heading > div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .milestone-next-heading strong { color: #88704a; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .milestone-next-heading b { color: var(--text); font-size: 0.84rem; overflow-wrap: anywhere; }
    .milestone-icon { font-size: 1.45rem; line-height: 1; }
    .milestone-progress-line { margin-top: 10px; color: #65727a; font-size: 0.7rem; }
    .milestone-progress-line strong { color: #806300; font-size: 0.68rem; text-align: right; }
    .milestone-progress-track { height: 7px; margin-top: 7px; overflow: hidden; border-radius: 999px; background: rgba(33, 150, 243, 0.12); }
    .milestone-progress-track span { display: block; height: 100%; min-width: 3px; border-radius: inherit; background: linear-gradient(90deg, #2196f3, #66bb6a); transition: width 0.3s ease; }
    .collection-heading { margin-top: 13px; color: var(--primary-dark); font-size: 0.73rem; }
    .collection-chip-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .collection-chip { display: inline-flex; align-items: center; gap: 4px; min-height: 25px; padding: 4px 8px; border-radius: 999px; background: rgba(102, 187, 106, 0.16); color: #2e7d32; font-size: 0.68rem; font-weight: 700; }
    .collection-chip > span { font-size: 0.88rem; }
    .collection-empty, .milestone-complete-note { color: #687580; font-size: 0.72rem; line-height: 1.35; }
    .milestone-complete-note { margin-top: 10px; padding: 9px; border-radius: 10px; background: rgba(102, 187, 106, 0.12); color: #2e7d32; font-weight: 700; }
    .milestone-celebration { margin-top: 13px; padding: 12px; border-radius: 12px; background: linear-gradient(135deg, rgba(255, 215, 0, 0.22), rgba(102, 187, 106, 0.14)); border: 1px solid rgba(255, 193, 7, 0.35); }
    .milestone-celebration-title { color: #806300; font-size: 0.86rem; font-weight: 900; }
    .milestone-unlocked-row { display: flex; align-items: flex-start; gap: 8px; margin-top: 9px; }
    .milestone-unlocked-row > div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .milestone-unlocked-row strong { color: #2e7d32; font-size: 0.78rem; }
    .milestone-unlocked-row span { color: #596871; font-size: 0.72rem; line-height: 1.35; }
    .lobby-progress-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        padding: 10px;
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.72);
    }
    .lobby-progress-stat span { color: #667; font-size: 0.7rem; line-height: 1.25; }
    .lobby-progress-stat strong { font-size: 1.05rem; overflow-wrap: anywhere; }
    .lobby-progress-stat.xp { background: rgba(255, 215, 0, 0.2); }
    .lobby-progress-stat.xp strong { color: #9a7200; }
    .lobby-history-card { width: 100%; box-sizing: border-box; padding: 20px; }
    .lobby-history-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .lobby-history-heading h3 { margin: 0; color: var(--primary-dark); font-size: 1.05rem; }
    .lobby-history-heading p { margin: 4px 0 0; color: #687580; font-size: 0.78rem; line-height: 1.35; }
    .history-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        padding: 0 7px;
        box-sizing: border-box;
        border-radius: 999px;
        background: rgba(33, 150, 243, 0.12);
        color: var(--primary-dark);
        font-size: 0.78rem;
        font-weight: 800;
    }
    .duel-history-list { display: flex; flex-direction: column; gap: 9px; }
    .duel-history-item {
        position: relative;
        padding: 12px 12px 11px 15px;
        border-radius: 13px;
        background: rgba(255, 255, 255, 0.78);
        border: 1px solid rgba(0, 0, 0, 0.06);
        overflow: hidden;
    }
    .duel-history-item::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--primary); }
    .duel-history-item.win::before { background: var(--success); }
    .duel-history-item.loss::before { background: var(--danger); }
    .duel-history-item.draw::before { background: #e0a62b; }
    .duel-history-topline { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .duel-history-result { display: flex; align-items: center; gap: 6px; min-width: 0; }
    .duel-history-result strong { font-size: 0.83rem; white-space: nowrap; }
    .duel-history-item.win .duel-history-result strong { color: #2e7d32; }
    .duel-history-item.loss .duel-history-result strong { color: #c62828; }
    .duel-history-item.draw .duel-history-result strong { color: #946b00; }
    .result-dot { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 50%; background: var(--primary); }
    .win .result-dot { background: var(--success); }
    .loss .result-dot { background: var(--danger); }
    .draw .result-dot { background: #e0a62b; }
    .duel-history-opponent { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #687580; font-size: 0.76rem; }
    .duel-history-topline time { flex: 0 0 auto; color: #82909a; font-size: 0.7rem; }
    .duel-history-metrics { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 9px; color: #4f5c65; font-size: 0.74rem; }
    .duel-history-metrics b { color: #7d8990; font-size: 0.68rem; font-weight: 600; }
    .duel-history-rewards { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
    .history-reward-chip { padding: 3px 7px; border-radius: 999px; background: rgba(102, 187, 106, 0.13); color: #2e7d32; font-size: 0.68rem; font-weight: 700; }
    .history-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px; padding: 10px; border-radius: 12px; background: rgba(255, 255, 255, 0.55); color: #73808a; text-align: center; }
    .history-empty-icon { color: var(--gold); font-size: 1.6rem; }
    .history-empty p { max-width: 240px; margin: 7px 0 0; font-size: 0.82rem; line-height: 1.4; }
    .stats-row { flex-wrap: wrap; }
    .center-panel .stats-row { margin-inline: auto; }
    .stats-row { display: flex; justify-content: center; gap: 20px; margin: 20px 0; }
    .stat-item { display: flex; align-items: center; gap: 5px; font-weight: 700; }
    .stat-item img { width: 24px; }

    .invite-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        border-left: 5px solid var(--primary);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    }

    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    .game-layout {
        width: 100%;
        max-width: 800px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .game-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
    }

    .score-card {
        background: white;
        padding: 10px 25px;
        border-radius: 50px;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        min-width: 100px;
    }

    .score-card.opponent { border: 2px solid var(--danger); }
    .score-label { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; color: #888; }
    .score-value { font-size: 1.5rem; font-weight: 900; color: var(--primary); }
    .vs-text { font-size: 1.5rem; font-weight: 900; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }

    .question-container { text-align: center; }
    .q-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 0.9rem; color: #888; margin-bottom: 16px; font-weight: 600; }
    .question-timer { display: inline-flex; align-items: baseline; gap: 5px; padding: 7px 11px; border-radius: 999px; background: rgba(33, 150, 243, 0.1); color: var(--primary-dark); font-size: 0.75rem; white-space: nowrap; }
    .question-timer strong { font-size: 1rem; color: var(--primary-dark); font-variant-numeric: tabular-nums; }
    .question-timer.urgent { background: rgba(239, 83, 80, 0.13); color: #c62828; animation: timerPulse 1s ease-in-out infinite; }
    .question-timer.urgent strong { color: #c62828; }
    .question-timer.expired { animation: none; background: rgba(117, 117, 117, 0.14); color: #626b70; }
    .question-timer.expired strong { color: #626b70; }
    @keyframes timerPulse { 50% { transform: scale(1.04); } }
    .question-meta { display: flex; justify-content: center; flex-wrap: wrap; gap: 7px; margin: 2px 0 14px; }
    .topic-chip, .difficulty-chip { padding: 5px 9px; border-radius: 999px; font-size: 0.68rem; font-weight: 800; }
    .topic-chip { background: rgba(33, 150, 243, 0.1); color: var(--primary-dark); }
    .difficulty-chip { background: rgba(102, 187, 106, 0.14); color: #2e7d32; }
    .difficulty-chip.medium { background: rgba(255, 193, 7, 0.16); color: #8a6500; }
    .difficulty-chip.hard { background: rgba(239, 83, 80, 0.13); color: #b52d2a; }
    .q-text { font-size: 1.8rem; margin-bottom: 30px; }
    .question-learning { display: flex; flex-direction: column; gap: 6px; margin-top: 16px; padding: 13px 15px; border-radius: 13px; background: rgba(255, 193, 7, 0.12); border: 1px solid rgba(255, 193, 7, 0.28); color: #5f510e; text-align: left; line-height: 1.45; }
    .question-learning.shared-review { background: linear-gradient(135deg, rgba(255, 193, 7, 0.16), rgba(33, 150, 243, 0.1)); border-color: rgba(33, 150, 243, 0.24); }
    .question-learning strong { font-size: 0.78rem; color: #7a6200; }
    .question-learning.shared-review > strong { color: var(--primary-dark); }
    .question-learning span { font-size: 0.8rem; }

    .answers-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }

    .answer-btn {
        background: white;
        border: 2px solid #eee;
        padding: 20px;
        border-radius: 15px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .answer-btn:hover { border-color: var(--primary); background: var(--secondary); color: white; }
    .answer-btn.correct { background: var(--success); color: white; border-color: var(--success); }
    .answer-btn.wrong { background: var(--danger); color: white; border-color: var(--danger); }
    .answer-btn:disabled { cursor: default; }

    .waiting-msg { text-align: center; color: white; font-weight: 600; font-style: italic; margin-top: 10px; }
    .round-notice { display: flex; flex-direction: column; gap: 4px; margin-top: 12px; padding: 11px 13px; border-radius: 12px; text-align: left; line-height: 1.35; }
    .round-notice.timeout { background: rgba(239, 83, 80, 0.13); border: 1px solid rgba(239, 83, 80, 0.22); color: #7f2927; }
    .round-notice strong { font-size: 0.85rem; }
    .round-notice span { font-size: 0.82rem; font-weight: 700; }
    .round-notice small { font-size: 0.72rem; color: #687580; }

    .timeout-summary { width: 100%; box-sizing: border-box; margin: 0 0 18px; padding: 11px 13px; border-radius: 12px; background: rgba(239, 83, 80, 0.11); border: 1px solid rgba(239, 83, 80, 0.2); color: #7f2927; text-align: left; line-height: 1.4; }
    .timeout-summary strong { display: block; margin-bottom: 4px; font-size: 0.8rem; }
    .timeout-summary div { font-size: 0.75rem; overflow-wrap: anywhere; }

    .rematch-panel {
        margin-top: 22px;
        padding: 16px;
        border-radius: 14px;
        background: rgba(33, 150, 243, 0.08);
        border: 1px solid rgba(33, 150, 243, 0.16);
    }
    .rematch-status { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; line-height: 1.4; }
    .rematch-status strong { color: var(--primary-dark); }
    .rematch-status span { color: #566; font-size: 0.9rem; }
    .rematch-status.confirmed strong { color: var(--success); }
    .rematch-status.declined strong { color: var(--danger); }
    .rematch-panel .btn-row { justify-content: center; }
    .rematch-panel button:disabled { opacity: 0.7; cursor: wait; }

    .final-scores { display: flex; justify-content: center; gap: 40px; margin: 30px 0; }
    .final-score-item { display: flex; flex-direction: column; }
    .final-score-item .label { font-size: 0.9rem; color: #888; }
    .final-score-item .value { font-size: 3rem; font-weight: 900; color: var(--primary); }

    .reward-icons { display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 800; font-size: 1.2rem; }
    .reward-icon { width: 50px; }

    .progress-summary {
        width: 100%;
        box-sizing: border-box;
        margin-top: 18px;
        padding: 16px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(33, 150, 243, 0.18);
        text-align: left;
    }
    .progress-summary-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
    }
    .progress-summary-heading h3 { margin: 0; font-size: 1rem; color: var(--primary-dark); }
    .progress-save-state { font-size: 0.75rem; font-weight: 800; white-space: nowrap; }
    .progress-save-state.saved { color: var(--success); }
    .progress-save-state.recording { color: #88704a; }
    .progress-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
    }
    .progress-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        padding: 10px;
        border-radius: 11px;
        background: rgba(33, 150, 243, 0.08);
    }
    .progress-stat.highlight { background: rgba(255, 215, 0, 0.2); }
    .progress-stat span,
    .progress-streak-line span { color: #667; font-size: 0.72rem; line-height: 1.25; }
    .progress-stat strong { color: var(--text); font-size: 1.05rem; overflow-wrap: anywhere; }
    .progress-stat.highlight strong { color: #9a7200; }
    .progress-streak-line {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 2px 4px;
    }
    .progress-rewards { margin-top: 10px; }
    .progress-rewards > strong { font-size: 0.82rem; color: var(--primary-dark); }
    .reward-chip-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .reward-chip {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 4px 9px;
        border-radius: 999px;
        background: rgba(102, 187, 106, 0.14);
        color: #2e7d32;
        font-size: 0.75rem;
        font-weight: 700;
    }

    .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid rgba(0,0,0,0.1);
        border-top: 5px solid var(--primary);
        border-radius: 50%;
        margin: 0 auto 20px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .mt-20 { margin-top: 20px; }

    /* Responsive lobby hierarchy */
    @media (max-width: 1080px) {
        .lobby-layout {
            grid-template-areas:
                "main main"
                "players chat";
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            width: min(100%, 900px);
            height: auto;
            min-height: 0;
        }
        .lobby-main-panel { min-height: min(48vh, 430px); }
        .players-panel,
        .lobby-chat-panel { min-height: 300px; }
        .lobby-layout .glass-card { padding: clamp(18px, 3vw, 26px); }
    }

    @media (max-width: 680px) {
        .ui-overlay { justify-content: flex-start; padding: 12px; }
        .lobby-layout {
            grid-template-areas:
                "main"
                "players"
                "chat";
            grid-template-columns: minmax(0, 1fr);
            width: 100%;
            gap: 14px;
        }
        .lobby-main-panel { min-height: 0; }
        .players-panel,
        .lobby-chat-panel { min-height: 280px; }
        .lobby-layout .glass-card { padding: 18px; border-radius: 16px; }
        .main-lobby-card { padding: 20px 16px; }
        .stats-row { gap: 10px 18px; margin: 16px 0; }
        .stat-item { font-size: 0.9rem; }
        .player-item { align-items: stretch; }
        .player-item span { display: flex; align-items: center; }
        .chat-messages { min-height: 150px; }
        .chat-input-row { gap: 6px; }
        .chat-input-row button { min-width: 68px; padding-inline: 10px; }
        .q-header { align-items: flex-start; flex-direction: column; gap: 8px; }
        .question-timer { align-self: stretch; justify-content: center; }
        .answers-grid { grid-template-columns: 1fr; }
        .final-scores { gap: 20px; }
        .final-score-item .value { font-size: 2rem; }
        .progress-summary { padding: 13px; }
        .progress-summary-heading { align-items: flex-start; flex-direction: column; gap: 4px; }
        .progress-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .lobby-progress-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .progress-overview-heading { align-items: flex-start; flex-direction: column; gap: 3px; }
        .trend-window-label { text-align: left; }
        .lobby-history-card { padding: 15px; }
        .duel-history-topline { align-items: flex-start; }
        .duel-history-result { flex-wrap: wrap; }
    }

    @media (max-height: 560px) and (orientation: landscape) {
        .ui-overlay { justify-content: flex-start; padding: 12px; }
        .lobby-layout {
            grid-template-areas:
                "main players"
                "main chat";
            grid-template-columns: minmax(0, 1.2fr) minmax(220px, 0.8fr);
            width: 100%;
            height: auto;
            min-height: calc(100vh - 24px);
            gap: 12px;
        }
        .lobby-main-panel { min-height: calc(100vh - 24px); }
        .players-panel,
        .lobby-chat-panel { min-height: 0; height: calc((100vh - 36px) / 2); }
        .lobby-layout .glass-card { padding: 16px; border-radius: 16px; }
        .main-lobby-card { padding: 18px 16px; }
        .lobby-progress-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .progress-overview-heading { align-items: flex-start; flex-direction: column; gap: 3px; }
        .trend-window-label { text-align: left; }
        .lobby-history-card { padding: 15px; }
        .logo-medium { width: 58px; margin-bottom: 8px; }
        .main-lobby-card h2 { margin: 8px 0; }
        .stats-row { margin: 12px 0; gap: 10px; }
        .primary-btn.large-btn { margin-top: 12px; }
    }
`;
document.head.appendChild(style);

function leaveSessionOnPageExit() {
    if (!currentUser || isSessionClosing) return;
    isSessionClosing = true;
    const match = currentMatch;
    stopHeartbeat();
    stopRealtime();
    removeOwnQueue();
    if (match && match.status === 'active') {
        transactSafe(db.tx.matches[match.id].update({
            status: 'finished',
            finishedAt: Date.now(),
            endedBy: currentUser.id,
            endReason: 'disconnected',
            updatedAt: Date.now()
        }));
    }
    // Keep the player record so XP, milestones, and collectible rewards remain persistent.
    // The lobby already expires offline users through the lastSeen heartbeat window.
}

window.addEventListener('pagehide', leaveSessionOnPageExit);
window.addEventListener('beforeunload', leaveSessionOnPageExit);

// Initial render
render();
