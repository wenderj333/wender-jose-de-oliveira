/**
 * Challenges definition for Phase 1: O Deserto dos Patriarcas
 */
export const PHASE_1_CHALLENGES = [
    {
        type: 'quiz',
        question: 'Quem foi o primeiro patriarca chamado por Deus para sair de sua terra e ir para uma terra que Ele lhe mostraria?',
        options: ['Noé', 'Abraão', 'Moisés', 'Ló'],
        answer: 1, // Index of Abraão
        recordTitle: 'O chamado de Abraão',
        correctAnswer: 'Abraão',
        teaching: 'A fé começa quando confiamos no chamado de Deus e caminhamos para a promessa, mesmo sem conhecer todo o caminho.',
        reference: 'Gênesis 12:1-4',
        context: {
            moment: 'Abrão recebe a ordem de deixar sua terra, sua parentela e a casa de seu pai para iniciar uma peregrinação guiada pela promessa de Deus.',
            characters: 'Deus chama Abrão, que parte com Sarai e Ló. A família ainda não conhece o destino, mas se coloca a caminho pela confiança.',
            connection: 'O chamado torna visível que a fé é uma resposta concreta: o ensinamento guardado nasce quando a confiança se transforma em passo, mesmo antes de o caminho inteiro ser revelado.'
        },
        reviewQuestion: 'Quem ouviu o chamado para sair de sua terra e seguir para a promessa?',
        reviewOptions: ['Abraão', 'José', 'Moisés', 'Noé'],
        reviewAnswer: 0,
        reviewExplanation: 'A fé de Abraão se tornou um primeiro passo da história da promessa.',
        explanation: 'Gênesis 12:1 - "Ora, o Senhor disse a Abrão: Sai-te da tua terra... para a terra que eu te mostrarei."'
    },
    {
        type: 'ordering',
        question: 'Ordene cronologicamente os quatro grandes patriarcas:',
        items: ['Jacó', 'Abraão', 'José', 'Isaque'],
        correctOrder: ['Abraão', 'Isaque', 'Jacó', 'José'],
        recordTitle: 'A linhagem dos patriarcas',
        correctAnswer: 'Abraão → Isaque → Jacó → José',
        teaching: 'A história da promessa atravessa gerações: Deus age na continuidade da aliança e conduz seu povo em cada etapa.',
        reference: 'Gênesis 12–50',
        context: {
            moment: 'A narrativa acompanha a promessa ao longo de várias gerações, desde o chamado de Abraão até a descida de José e sua família ao Egito.',
            characters: 'Abraão e Isaque iniciam a linhagem; Jacó, também chamado Israel, torna-se pai de muitos filhos; José preserva a família em meio à fome e à mudança de terra.',
            connection: 'A sequência ensina que a Palavra guardada não pertence a um único instante. A fidelidade é recebida, vivida e transmitida de geração em geração.'
        },
        reviewQuestion: 'Qual sequência preserva a linhagem dos patriarcas estudada?',
        reviewOptions: ['José → Jacó → Isaque → Abraão', 'Abraão → Isaque → Jacó → José', 'Isaque → Abraão → José → Jacó', 'Jacó → José → Abraão → Isaque'],
        reviewAnswer: 1,
        reviewExplanation: 'A sequência recorda como a promessa atravessou gerações, de Abraão até José.',
        explanation: 'A linhagem patriarcal seguiu de Abraão para seu filho Isaque, depois para Jacó, e culminou com a história de José no Egito.'
    },
    {
        type: 'verse',
        question: 'Complete o versículo fundamental da Criação:',
        verse: 'No princípio, criou Deus os céus e a ______.',
        correct: 'terra',
        recordTitle: 'O princípio da criação',
        correctAnswer: 'terra',
        teaching: 'A Bíblia começa afirmando que Deus é o Criador de todas as coisas; reconhecer essa origem orienta toda a leitura da Palavra.',
        reference: 'Gênesis 1:1',
        context: {
            moment: 'O livro de Gênesis abre a grande narrativa bíblica com uma afirmação sobre a origem de tudo: antes de qualquer história humana, Deus é apresentado como Criador.',
            characters: 'Deus é o único agente nomeado neste versículo; os céus e a terra aparecem como a obra que recebe existência por sua palavra e vontade.',
            connection: 'Recordar o princípio coloca todo ensinamento no horizonte da criação. A contemplação começa reconhecendo que a vida, a história e a própria leitura têm uma origem recebida.'
        },
        reviewQuestion: 'Complete a memória de Gênesis 1:1: “No princípio, criou Deus os céus e a...”',
        reviewOptions: ['vida', 'luz', 'terra', 'aliança'],
        reviewAnswer: 2,
        reviewExplanation: 'A palavra “terra” recorda que toda a criação encontra sua origem em Deus.',
        explanation: 'Gênesis 1:1 é o fundamento de toda a revelação bíblica sobre a origem do universo.'
    },
    {
        type: 'quiz',
        question: 'Qual era o sinal da aliança que Deus fez com Noé após o Dilúvio?',
        options: ['O Arco-íris', 'A Circuncisão', 'As Tábuas da Lei', 'O Tabernáculo'],
        answer: 0,
        recordTitle: 'O sinal da aliança',
        correctAnswer: 'O Arco-íris',
        teaching: 'O arco-íris recorda a fidelidade de Deus e sua aliança de misericórdia com a criação depois do Dilúvio.',
        reference: 'Gênesis 9:12-13',
        context: {
            moment: 'Depois que as águas do Dilúvio baixam, Deus estabelece uma aliança com Noé e com todos os seres vivos, prometendo que as águas não voltarão a destruir a terra dessa maneira.',
            characters: 'Noé é o destinatário da aliança, mas a promessa alcança sua família, as gerações futuras e toda a criação. O arco na nuvem se torna o sinal visível.',
            connection: 'O sinal transforma uma lembrança difícil em esperança. O ensinamento guardado convida a reconhecer a misericórdia e a fidelidade de Deus mesmo depois de uma grande ruptura.'
        },
        reviewQuestion: 'Qual sinal passou a lembrar a aliança de Deus com Noé?',
        reviewOptions: ['O arco-íris', 'A sarça', 'A arca', 'A estrela'],
        reviewAnswer: 0,
        reviewExplanation: 'O arco-íris permanece como sinal visível da fidelidade e da misericórdia de Deus.',
        explanation: 'Gênesis 9:13 - "O meu arco tenho posto na nuvem; este será por sinal da aliança entre mim e a terra."'
    },
    {
        type: 'teaching-ordering',
        question: 'Reorganize os fragmentos até formar a explicação completa sobre o sinal da aliança:',
        items: [
            'Depois do Dilúvio, Deus estabelece uma aliança com Noé e com toda a criação.',
            'O arco colocado na nuvem se torna o sinal visível dessa aliança.',
            'Por isso, a lembrança das águas não termina no medo: transforma-se em promessa de misericórdia e esperança.'
        ],
        correctOrder: [
            'Depois do Dilúvio, Deus estabelece uma aliança com Noé e com toda a criação.',
            'O arco colocado na nuvem se torna o sinal visível dessa aliança.',
            'Por isso, a lembrança das águas não termina no medo: transforma-se em promessa de misericórdia e esperança.'
        ],
        recordTitle: 'O sentido que a aliança comunica',
        correctAnswer: 'Depois do Dilúvio, Deus estabelece uma aliança com Noé e com toda a criação. → O arco colocado na nuvem se torna o sinal visível dessa aliança. → Por isso, a lembrança das águas não termina no medo: transforma-se em promessa de misericórdia e esperança.',
        teaching: 'A explicação começa no acontecimento, passa pelo sinal e chega ao sentido. Assim, o arco-íris não é apenas uma imagem bonita: torna visível a promessa de misericórdia e ajuda a comunidade a lembrar que a criação pode recomeçar.',
        reference: 'Gênesis 9:12-16',
        orderExplanation: 'A ordem comunica melhor o ensinamento porque apresenta primeiro a aliança que nasce depois do Dilúvio, depois o arco como sinal visível e, por fim, a esperança que esse sinal permite compreender. O sentido cresce do acontecimento para a imagem e da imagem para a promessa.',
        context: {
            moment: 'Depois do Dilúvio, a narrativa passa do recomeço da vida para a aliança que Deus estabelece com Noé e com toda a criação.',
            characters: 'Deus anuncia a aliança; Noé representa a humanidade que recebe a promessa; o arco na nuvem se torna um sinal que alcança as gerações.',
            connection: 'Reorganizar a explicação ajuda a perceber como uma passagem bíblica comunica sentido: o acontecimento dá origem ao sinal, e o sinal abre espaço para a esperança ser lembrada.'
        },
        reviewQuestion: 'Reorganize a explicação: acontecimento da aliança, sinal na nuvem e esperança comunicada.',
        reviewExplanation: 'A explicação fica completa quando acompanha o movimento da passagem: Deus estabelece a aliança, o arco a torna visível e a memória se abre para a esperança.',
        explanation: 'A ordem vai do acontecimento ao sinal e do sinal ao sentido. Por isso, a promessa de misericórdia não aparece solta: ela nasce da aliança e é lembrada pelo arco na nuvem.'
    },
    {
        type: 'interpretation',
        scenario: 'Durante a cópia de Gênesis 12, um aprendiz observa que Abrão parte sem conhecer todo o destino e pergunta o que essa cena ensina sobre a fé.',
        question: 'Qual leitura preserva melhor o sentido da passagem?',
        options: [
            'A fé é uma viagem sem direção, porque Deus não oferece promessa alguma.',
            'A fé responde ao chamado e caminha confiando numa promessa que ainda não está totalmente visível.',
            'A passagem ensina que obedecer exige abandonar todos os vínculos familiares para sempre.',
            'O chamado vale apenas como uma ordem antiga, sem relação com confiança e resposta hoje.'
        ],
        answer: 1,
        recordTitle: 'Quando a fé dá o primeiro passo',
        correctAnswer: 'A fé responde ao chamado e caminha confiando numa promessa que ainda não está totalmente visível.',
        teaching: 'Interpretar uma passagem é relacionar a ordem recebida à resposta concreta de Abrão: a fé não é desorientação nem isolamento, mas confiança que se põe a caminho.',
        reference: 'Gênesis 12:1-4',
        interpretation: 'A leitura mais coerente entende a fé como uma resposta confiante ao chamado: Abrão parte porque há uma promessa, mesmo que o caminho completo ainda não tenha sido mostrado.',
        contextualConnection: 'Em Gênesis 12:1-4, Deus ordena que Abrão saia de sua terra e, ao mesmo tempo, anuncia bênção e futuro. O movimento da passagem une chamado, promessa e partida; por isso, não se trata de caminhar sem direção, mas de confiar antes de possuir todas as respostas.',
        evidenceClues: [
            { source: 'Cenário', text: 'Abrão parte sem conhecer todo o destino.', relevant: true, explanation: 'A própria cena mostra uma partida que não controla o futuro inteiro; isso orienta a leitura para uma confiança que caminha.' },
            { source: 'Referência · Gênesis 12:2-3', text: 'O chamado vem acompanhado de promessa, bênção e futuro.', relevant: true, explanation: 'A promessa impede que a partida seja confundida com desorientação: há direção recebida, ainda que o caminho completo não apareça.' },
            { source: 'Pista enganosa · contexto', text: 'Deus entrega a Abrão um mapa detalhado de cada etapa da viagem.', relevant: false, explanation: 'O texto não apresenta um roteiro completo. Transformar a promessa em mapa pronto apaga justamente a tensão que torna a confiança necessária.' },
            { source: 'Pista enganosa · leitura apressada', text: 'Obedecer exige romper para sempre com Sarai, Ló e todos os vínculos familiares.', relevant: false, explanation: 'A narrativa mostra Abrão partindo com Sarai e Ló; a pista amplia a saída até convertê-la indevidamente em isolamento.' }
        ],
        evidenceAnswer: [0, 1],
        alternativeExplanations: [
            'Ela transforma a confiança em pura incerteza e ignora que o chamado vem acompanhado de uma promessa.',
            '',
            'Ela amplia a saída de Abrão para uma ruptura absoluta, mas o texto narra uma peregrinação com Sarai e Ló, não a rejeição de todos os vínculos.',
            'Ela reduz o episódio ao passado e deixa de perceber que a narrativa apresenta uma forma de responder à promessa por meio de passos concretos.'
        ],
        reviewQuestion: 'Um aprendiz pergunta: o que significa Abrão partir sem conhecer todo o destino? Escolha a leitura mais coerente.',
        reviewOptions: [
            'A fé é uma viagem sem direção, porque Deus não oferece promessa alguma.',
            'A fé responde ao chamado e caminha confiando numa promessa que ainda não está totalmente visível.',
            'Obedecer exige abandonar todos os vínculos familiares para sempre.',
            'O chamado vale apenas como uma ordem antiga, sem relação com confiança hoje.'
        ],
        reviewAnswer: 1,
        reviewExplanation: 'A passagem relaciona a partida de Abrão à promessa recebida: a fé caminha sem controlar todo o futuro, mas não caminha sem direção.'
    }
];

/**
 * Challenges definition for Phase 2: O Êxodo e a Lei
 */
export const PHASE_2_CHALLENGES = [
    {
        type: 'quiz',
        question: 'Onde Deus chamou Moisés para conduzir o povo de Israel para fora do Egito?',
        options: ['Na sarça ardente, no monte Horebe', 'No palácio do faraó', 'À margem do mar Vermelho', 'No monte Sinai, diante das tábuas'],
        answer: 0,
        recordTitle: 'O chamado de Moisés',
        correctAnswer: 'Na sarça ardente, no monte Horebe',
        teaching: 'Deus encontra Moisés no deserto e o envia com uma missão de libertação. O chamado nasce da presença de Deus e da atenção ao sofrimento do povo.',
        reference: 'Êxodo 3:1-10',
        context: {
            moment: 'Moisés pastoreia o rebanho de Jetro no deserto quando vê uma sarça que arde sem se consumir. Ali recebe a missão de voltar ao Egito e libertar Israel.',
            characters: 'Deus fala com Moisés, que se aproxima com reverência. O povo de Israel está sofrendo sob o faraó, e sua aflição é apresentada como algo que Deus ouviu e viu.',
            connection: 'O chamado nasce no encontro entre presença e compaixão. Guardar essa passagem é lembrar que a missão não começa na autossuficiência, mas na escuta do sofrimento e na confiança em quem envia.'
        },
        reviewQuestion: 'Em que lugar Deus chamou Moisés para conduzir Israel para fora do Egito?',
        reviewOptions: ['Na sarça ardente, no monte Horebe', 'No palácio do faraó', 'À margem do mar Vermelho', 'No monte Sinai'],
        reviewAnswer: 0,
        reviewExplanation: 'O chamado acontece diante da sarça ardente, no monte Horebe, onde Deus envia Moisés para ouvir e responder ao sofrimento de Israel.',
        explanation: 'Êxodo 3 relata que o Senhor falou com Moisés do meio da sarça ardente, no monte Horebe, e o chamou para tirar Israel do Egito.'
    },
    {
        type: 'ordering',
        question: 'Ordene os acontecimentos da libertação de Israel conforme a narrativa do Êxodo:',
        items: ['A aliança no monte Sinai', 'Moisés diante do faraó', 'A travessia do mar', 'A saída do Egito'],
        correctOrder: ['Moisés diante do faraó', 'A saída do Egito', 'A travessia do mar', 'A aliança no monte Sinai'],
        recordTitle: 'O caminho da libertação',
        correctAnswer: 'Moisés diante do faraó → A saída do Egito → A travessia do mar → A aliança no monte Sinai',
        teaching: 'A libertação é uma caminhada: Deus confronta a opressão, conduz o povo para fora, abre um caminho impossível e firma uma aliança para a nova vida.',
        reference: 'Êxodo 3–24',
        context: {
            moment: 'A narrativa passa do confronto com o faraó à saída apressada do Egito, à travessia do mar e, por fim, à chegada ao Sinai, onde a liberdade recebe uma forma de vida em aliança.',
            characters: 'Moisés conduz o povo diante do faraó; Israel caminha como comunidade; o faraó representa a resistência à libertação; Deus guia e abre o caminho.',
            connection: 'A ordem dos acontecimentos mostra que libertação não é apenas escapar de um lugar. É atravessar, aprender a confiar e receber uma responsabilidade comum diante de Deus.'
        },
        reviewQuestion: 'Qual sequência resume o caminho da libertação estudado?',
        reviewOptions: ['A saída do Egito → Moisés diante do faraó → Sinai → travessia do mar', 'Moisés diante do faraó → saída do Egito → travessia do mar → aliança no Sinai', 'Travessia do mar → saída do Egito → Sinai → Moisés diante do faraó', 'Aliança no Sinai → saída do Egito → Moisés diante do faraó → travessia do mar'],
        reviewAnswer: 1,
        reviewExplanation: 'A libertação começa com o confronto diante do faraó, passa pela saída e pela travessia, e chega ao Sinai, onde a liberdade se torna aliança.',
        explanation: 'Primeiro Moisés anuncia a palavra de Deus ao faraó; depois Israel sai do Egito, atravessa o mar e chega ao Sinai para receber a aliança.'
    },
    {
        type: 'verse',
        question: 'Complete a palavra de confiança proclamada diante do mar:',
        verse: 'O Senhor ______ por vós, e vós vos calareis. (Êxodo 14:14)',
        correct: 'pelejará',
        recordTitle: 'A travessia do mar',
        correctAnswer: 'pelejará',
        teaching: 'Diante do medo, Moisés convida o povo a confiar na ação de Deus. A travessia recorda que a libertação não depende apenas da força humana.',
        reference: 'Êxodo 14:14',
        context: {
            moment: 'Israel está encurralado entre o mar e o exército egípcio. O povo teme e questiona a saída, enquanto Moisés anuncia que Deus agirá em favor deles.',
            characters: 'Moisés fala ao povo assustado; os israelitas estão entre a memória da escravidão e o medo do futuro; o exército do faraó se aproxima como ameaça.',
            connection: 'O silêncio pedido por Moisés não é passividade vazia, mas uma pausa para reconhecer quem sustenta a travessia. O ensinamento guardado é confiança quando a força humana parece insuficiente.'
        },
        reviewQuestion: 'Complete a palavra de confiança: “O Senhor ______ por vós, e vós vos calareis.”',
        reviewOptions: ['pelejará', 'guiará', 'reunirá', 'vencerá'],
        reviewAnswer: 0,
        reviewExplanation: '“Pelejará” expressa a confiança de Moisés na ação de Deus quando o povo se vê sem saída diante do mar.',
        explanation: 'Êxodo 14:14 afirma: “O Senhor pelejará por vós, e vós vos calareis.” O versículo expressa confiança no cuidado de Deus no momento de maior ameaça.'
    },
    {
        type: 'quiz',
        question: 'O que Deus entregou a Moisés no monte Sinai como sinal da aliança e orientação para o povo?',
        options: ['As tábuas da Lei', 'O arco-íris', 'A túnica sacerdotal', 'A coroa do faraó'],
        answer: 0,
        recordTitle: 'A aliança no Sinai',
        correctAnswer: 'As tábuas da Lei',
        teaching: 'A liberdade recebida no Êxodo conduz a uma vida de aliança. No Sinai, Deus forma o povo por meio de sua Lei, ensinando justiça, fidelidade e responsabilidade.',
        reference: 'Êxodo 24:12-18; 31:18',
        context: {
            moment: 'Depois da saída do Egito e da travessia, Moisés sobe ao monte Sinai. Em meio à nuvem e à espera do povo, recebe as tábuas como sinal da aliança.',
            characters: 'Moisés permanece diante de Deus no monte; o povo de Israel aguarda ao pé do Sinai e começa a aprender que a liberdade precisa ser vivida em comunidade.',
            connection: 'As tábuas ligam o dom da libertação à prática cotidiana. A passagem ensina que preservar a Palavra é também deixar que ela forme escolhas justas, fiéis e responsáveis.'
        },
        reviewQuestion: 'O que Deus entregou a Moisés no monte Sinai como orientação para o povo?',
        reviewOptions: ['As tábuas da Lei', 'O arco-íris', 'A túnica sacerdotal', 'A coroa do faraó'],
        reviewAnswer: 0,
        reviewExplanation: 'As tábuas da Lei representam a aliança recebida depois da libertação e orientam a vida do povo em responsabilidade e fidelidade.',
        explanation: 'Êxodo 24 e 31 apresentam as tábuas da Lei como sinal da aliança estabelecida por Deus com Israel no monte Sinai.'
    },
    {
        type: 'interpretation',
        scenario: 'Ao copiar a cena do mar Vermelho, um aprendiz pergunta se o silêncio pedido por Moisés significa desistir de agir ou confiar diante do medo.',
        question: 'Qual leitura preserva melhor o ensinamento de Êxodo 14:14?',
        options: [
            'O povo deveria abandonar toda responsabilidade, porque a fé torna qualquer ação humana desnecessária.',
            'Moisés convida o povo a reconhecer a ação de Deus e a atravessar com confiança, não a permanecer para sempre imóvel.',
            'O versículo promete que pessoas fiéis nunca mais enfrentarão ameaças ou situações assustadoras.',
            'A passagem ensina que o medo deve ser escondido e que perguntas em momentos de crise são sempre falta de fé.'
        ],
        answer: 1,
        recordTitle: 'Silêncio que prepara a travessia',
        correctAnswer: 'Moisés convida o povo a reconhecer a ação de Deus e a atravessar com confiança, não a permanecer para sempre imóvel.',
        teaching: 'A confiança diante do mar não elimina a travessia: ela interrompe o pânico para que o povo reconheça o cuidado de Deus e avance quando o caminho se abre.',
        reference: 'Êxodo 14:10-16',
        interpretation: 'A leitura mais coerente entende o silêncio como uma pausa de confiança diante do medo, que prepara Israel para seguir a orientação de Deus e atravessar.',
        contextualConnection: 'Êxodo 14:10-16 mostra Israel encurralado, temeroso e questionando Moisés. A palavra “O Senhor pelejará por vós” não encerra a narrativa em passividade: logo depois, Moisés recebe a ordem de mandar o povo avançar. O contexto une confiança e movimento.',
        evidenceClues: [
            { source: 'Cenário', text: 'Israel está encurralado entre o mar e o exército egípcio.', relevant: true, explanation: 'O medo nasce de uma ameaça concreta. Reconhecer o perigo ajuda a entender o silêncio como pausa diante do pânico, não como negação da crise.' },
            { source: 'Referência · Êxodo 14:15-16', text: 'Depois da palavra de confiança, Moisés recebe a ordem de mandar o povo avançar.', relevant: true, explanation: 'A sequência da referência impede uma leitura de imobilidade permanente: confiar prepara o movimento quando Deus orienta o próximo passo.' },
            { source: 'Pista enganosa · contexto', text: 'O silêncio encerra toda responsabilidade do povo durante a travessia.', relevant: false, explanation: 'A pista transforma uma pausa de confiança em desistência. O próprio texto continua com uma ordem para avançar.' },
            { source: 'Pista enganosa · leitura apressada', text: 'Se a fé estiver presente, nenhuma ameaça voltará a assustar o povo.', relevant: false, explanation: 'A passagem começa justamente com medo e perigo. Ela ensina confiança no meio da ameaça, não uma promessa de vida sem crises.' }
        ],
        evidenceAnswer: [0, 1],
        alternativeExplanations: [
            'Ela transforma a confiança em abandono da responsabilidade e ignora que o povo ainda deverá responder à orientação e caminhar.',
            '',
            'Ela promete uma vida sem ameaça, embora o próprio contexto comece com o medo diante do exército egípcio e do mar.',
            'Ela apaga a crise real do povo; a narrativa registra o medo e a pergunta para mostrar como a confiança é formada no meio da dificuldade.'
        ],
        reviewQuestion: 'No mar Vermelho, o que significa o silêncio pedido por Moisés? Escolha a leitura mais coerente.',
        reviewOptions: [
            'A fé torna qualquer ação humana desnecessária.',
            'É uma pausa de confiança que prepara o povo para reconhecer a ação de Deus e atravessar.',
            'A fidelidade garante que nenhuma ameaça voltará a existir.',
            'Perguntar em uma crise é sempre falta de fé e deve ser escondido.'
        ],
        reviewAnswer: 1,
        reviewExplanation: 'O contexto liga a confiança à travessia: o povo é chamado a parar de alimentar o pânico, mas também a avançar quando Deus abre o caminho.'
    }
];

/**
 * Challenges definition for Phase 3: A Terra Prometida
 */
export const PHASE_3_CHALLENGES = [
    {
        type: 'quiz',
        question: 'Qual cidade de muralhas marcava a primeira grande passagem da entrada de Israel na Terra Prometida?',
        options: ['Jericó', 'Belém', 'Nazaré', 'Damasco'],
        answer: 0,
        recordTitle: 'As muralhas de Jericó',
        correctAnswer: 'Jericó',
        teaching: 'Jericó aparece como a primeira cidade enfrentada na narrativa da conquista. A cena ensina que a passagem não é apenas uma vitória militar, mas um chamado à confiança e à obediência.',
        reference: 'Josué 6:1-20',
        context: {
            moment: 'Jericó está fechada e fortificada diante de Israel. A narrativa descreve dias de marcha ao redor da cidade e o sétimo dia, quando o povo segue a orientação recebida.',
            characters: 'Josué conduz Israel; os sacerdotes carregam as trombetas; o povo marcha em silêncio; os habitantes de Jericó permanecem dentro das muralhas.',
            connection: 'A passagem guarda uma imagem de obediência perseverante: antes do grito que anuncia a queda, há escuta, disciplina e confiança. O ensinamento não se separa do modo como a comunidade caminha.'
        },
        reviewQuestion: 'Qual cidade de muralhas aparece como a primeira grande passagem da entrada de Israel na Terra Prometida?',
        reviewOptions: ['Jericó', 'Belém', 'Nazaré', 'Damasco'],
        reviewAnswer: 0,
        reviewExplanation: 'Jericó é a cidade fortificada cuja queda marca a primeira grande passagem narrada depois da travessia e da preparação do povo.',
        explanation: 'Josué 6 narra a queda das muralhas de Jericó depois que o povo percorreu a cidade conforme a orientação recebida e o toque das trombetas anunciou o momento decisivo.'
    },
    {
        type: 'ordering',
        question: 'Ordene os sinais da passagem do povo rumo à Terra Prometida:',
        items: ['As muralhas de Jericó caem', 'Josué envia os espias', 'O povo atravessa o Jordão', 'As pedras memoriais são levantadas'],
        correctOrder: ['Josué envia os espias', 'O povo atravessa o Jordão', 'As pedras memoriais são levantadas', 'As muralhas de Jericó caem'],
        recordTitle: 'A entrada na terra prometida',
        correctAnswer: 'Josué envia os espias → O povo atravessa o Jordão → As pedras memoriais são levantadas → As muralhas de Jericó caem',
        teaching: 'A entrada é marcada por discernimento, travessia e memória. Antes de avançar, o povo aprende a observar, recordar o cuidado recebido e caminhar unido.',
        reference: 'Josué 2–6',
        context: {
            moment: 'A entrada em Canaã se desenvolve em etapas: primeiro os espias observam a terra, depois o povo atravessa o Jordão, ergue um memorial e se aproxima de Jericó.',
            characters: 'Josué envia os espias, o povo atravessa unido e os sacerdotes participam da travessia com a arca. As gerações futuras são incluídas por meio das pedras memoriais.',
            connection: 'A sequência revela que avançar requer discernimento e lembrança. O ensinamento preservado convida a não tratar a promessa como pressa, mas como caminho partilhado e testemunhado.'
        },
        reviewQuestion: 'Qual sequência resume os sinais da entrada rumo à Terra Prometida?',
        reviewOptions: ['Jordão → espias → Jericó → pedras memoriais', 'Espias → Jordão → pedras memoriais → muralhas de Jericó', 'Pedras memoriais → Jericó → espias → Jordão', 'Jericó → Jordão → espias → pedras memoriais'],
        reviewAnswer: 1,
        reviewExplanation: 'Os espias vêm primeiro; depois ocorre a travessia do Jordão, as pedras guardam a memória e, então, o povo se aproxima de Jericó.',
        explanation: 'Em Josué 2, os espias são enviados; em Josué 3, o povo atravessa o Jordão; em Josué 4, as pedras recordam a travessia; então Josué 6 apresenta Jericó.'
    },
    {
        type: 'verse',
        question: 'Complete a palavra que sustentaria Josué diante do novo caminho:',
        verse: 'Sê forte e muito ______; não temas, nem te espantes. (Josué 1:9)',
        correct: 'corajoso',
        recordTitle: 'Coragem para caminhar',
        correctAnswer: 'corajoso',
        teaching: 'A coragem bíblica não significa ausência de medo. Ela nasce da presença de Deus e permite avançar com fidelidade mesmo diante de muralhas e incertezas.',
        reference: 'Josué 1:9',
        context: {
            moment: 'Após a morte de Moisés, Josué recebe a responsabilidade de conduzir o povo. Antes da travessia e das batalhas, ele é encorajado a permanecer firme na presença e na instrução de Deus.',
            characters: 'Deus fala a Josué, o novo líder de Israel. O povo depende de sua coragem, mas a promessa de companhia divina é o fundamento de sua missão.',
            connection: 'A coragem não é apresentada como ausência de temor, e sim como fidelidade em movimento. Guardar essa palavra é lembrar que o caminho pode ser enfrentado sem negar sua dificuldade.'
        },
        reviewQuestion: 'Complete a palavra dirigida a Josué: “Sê forte e muito ______; não temas, nem te espantes.”',
        reviewOptions: ['corajoso', 'silencioso', 'poderoso', 'tranquilo'],
        reviewAnswer: 0,
        reviewExplanation: '“Corajoso” liga a firmeza de Josué à presença de Deus, não à ausência de dificuldades no caminho.',
        explanation: 'Josué 1:9 liga a coragem à certeza de que Deus acompanha o caminho: “não temas, nem te espantes, porque o Senhor teu Deus é contigo, por onde quer que andares.”'
    },
    {
        type: 'quiz',
        question: 'O que as pedras tiradas do Jordão deveriam ajudar as futuras gerações a recordar?',
        options: ['Que Deus conduziu o povo na travessia', 'Que o povo construiu uma nova cidade', 'Que Josué recebeu uma coroa', 'Que o rio nunca mais teria água'],
        answer: 0,
        recordTitle: 'Pedras de memória',
        correctAnswer: 'Que Deus conduziu o povo na travessia',
        teaching: 'A memória transforma uma experiência em ensinamento. As pedras levantadas em Gilgal ajudariam os filhos a perguntar e ouvir como Deus havia conduzido o povo pelo Jordão.',
        reference: 'Josué 4:6-7',
        context: {
            moment: 'Depois que Israel atravessa o Jordão, Josué manda escolher pedras do leito do rio e levantá-las em Gilgal como um sinal visível para o futuro.',
            characters: 'Josué orienta representantes das tribos; os pais e as futuras crianças aparecem na própria finalidade do memorial, pois um dia perguntarão o significado das pedras.',
            connection: 'O memorial transforma a travessia em conversa entre gerações. O ensinamento guardado permanece vivo quando a memória provoca perguntas e permite que a história do cuidado de Deus seja contada novamente.'
        },
        reviewQuestion: 'O que as pedras tiradas do Jordão deveriam ajudar as futuras gerações a recordar?',
        reviewOptions: ['Que Deus conduziu o povo na travessia', 'Que o povo construiu uma nova cidade', 'Que Josué recebeu uma coroa', 'Que o rio nunca mais teria água'],
        reviewAnswer: 0,
        reviewExplanation: 'As pedras eram um memorial para que os filhos perguntassem e ouvissem novamente como Deus havia conduzido o povo pelo Jordão.',
        explanation: 'Josué 4:6-7 explica que as pedras seriam um sinal entre o povo: quando os filhos perguntassem o que significavam, a história da travessia seria contada novamente.'
    },
    {
        type: 'interpretation',
        scenario: 'Ao contemplar as pedras tiradas do Jordão, um aprendiz pergunta se o memorial é apenas uma lembrança privada da vitória ou uma escola para as próximas gerações.',
        question: 'Qual leitura preserva melhor a intenção do memorial?',
        options: [
            'As pedras funcionam como um amuleto que garante que nenhuma nova travessia será difícil.',
            'O memorial conserva a ação de Deus para despertar perguntas e transmitir a história às futuras gerações.',
            'As pedras celebram somente a habilidade de Josué e dispensam a memória da comunidade.',
            'O sinal pede que o povo fique preso ao passado e não interprete mais sua história.'
        ],
        answer: 1,
        recordTitle: 'Memória que ensina a atravessar',
        correctAnswer: 'O memorial conserva a ação de Deus para despertar perguntas e transmitir a história às futuras gerações.',
        teaching: 'O memorial bíblico não é um objeto mágico nem uma nostalgia fechada: ele cria uma conversa entre gerações para que a travessia se torne testemunho e aprendizado.',
        reference: 'Josué 4:1-7',
        interpretation: 'A leitura mais coerente entende as pedras como um sinal comunitário: elas preservam a travessia para que os filhos perguntem e a história do cuidado de Deus seja contada novamente.',
        contextualConnection: 'Em Josué 4:1-7, as pedras são retiradas do Jordão depois da travessia e recebem uma finalidade explícita: quando os filhos perguntarem, os adultos contarão o que Deus fez. O contexto desloca o memorial do poder do objeto para a responsabilidade de lembrar e ensinar.',
        evidenceClues: [
            { source: 'Contexto', text: 'As pedras são retiradas do Jordão depois que o povo atravessa.', relevant: true, explanation: 'A origem das pedras liga o memorial a um acontecimento real de cuidado e travessia; elas apontam para a história, não para um poder próprio.' },
            { source: 'Referência · Josué 4:6-7', text: 'Os filhos perguntarão o que as pedras significam, e os adultos contarão a travessia.', relevant: true, explanation: 'A finalidade declarada é pedagógica e comunitária: a memória provoca perguntas e transmite o testemunho às próximas gerações.' },
            { source: 'Pista enganosa · leitura apressada', text: 'O objeto garante automaticamente que nenhuma nova travessia será difícil.', relevant: false, explanation: 'Nada na referência transforma as pedras em amuleto. O sinal recorda o cuidado recebido, mas não elimina futuros desafios.' },
            { source: 'Pista enganosa · cenário', text: 'O memorial celebra apenas a habilidade particular de Josué.', relevant: false, explanation: 'A cena envolve representantes das tribos e os filhos do povo. Reduzi-la ao líder apaga o propósito comunitário do sinal.' }
        ],
        evidenceAnswer: [0, 1],
        alternativeExplanations: [
            'Ela transforma o memorial em amuleto e substitui a confiança e o testemunho por uma suposta garantia automática.',
            '',
            'Ela concentra a passagem em um líder, mas o sinal é levantado para o povo e para as gerações que ainda perguntarão.',
            'Ela confunde memória com imobilidade; no texto, recordar a travessia prepara a comunidade para seguir adiante com consciência.'
        ],
        reviewQuestion: 'Por que as pedras do Jordão foram levantadas? Escolha a leitura mais coerente.',
        reviewOptions: [
            'Para funcionar como um amuleto contra qualquer dificuldade futura.',
            'Para despertar perguntas e transmitir às futuras gerações como Deus conduziu a travessia.',
            'Para celebrar somente a habilidade de Josué.',
            'Para prender o povo ao passado e impedir novas interpretações.'
        ],
        reviewAnswer: 1,
        reviewExplanation: 'O próprio propósito do memorial aparece nas perguntas dos filhos: a lembrança se torna testemunho quando a comunidade conta novamente o cuidado recebido.'
    }
];

/**
 * Challenges definition for Phase 4: O Exílio e a Esperança
 */
export const PHASE_4_CHALLENGES = [
    {
        type: 'quiz',
        question: 'Qual rei pediu a Deus um coração sábio para governar o povo com discernimento?',
        options: ['Saul', 'Salomão', 'Josué', 'Ezequias'],
        answer: 1,
        recordTitle: 'Sabedoria para servir',
        correctAnswer: 'Salomão',
        teaching: 'A sabedoria bíblica não é apenas acumular conhecimento: é pedir discernimento para ouvir, julgar com justiça e servir uma comunidade com responsabilidade.',
        reference: '1 Reis 3:5-12',
        context: {
            moment: 'No início de seu reinado, Salomão reconhece que a tarefa de governar é grande demais para ser sustentada apenas por sua própria experiência.',
            characters: 'Deus aparece em sonho e pergunta o que Salomão deseja receber. O rei pede um coração compreensivo para discernir entre o bem e o mal ao conduzir o povo.',
            connection: 'A cena desloca o centro da liderança: em vez de pedir riqueza ou vitória, Salomão pede escuta e discernimento. Preservar esse ensinamento é aprender que conhecimento deve se tornar serviço justo.'
        },
        reviewQuestion: 'Quem pediu a Deus um coração sábio para governar com discernimento?',
        reviewOptions: ['Saul', 'Salomão', 'Josué', 'Ezequias'],
        reviewAnswer: 1,
        reviewExplanation: 'Salomão pediu um coração compreensivo para discernir o bem do mal e servir o povo com justiça.',
        explanation: 'Em 1 Reis 3, Salomão reconhece sua responsabilidade e pede sabedoria para ouvir e julgar o povo com discernimento, em vez de buscar apenas benefícios pessoais.'
    },
    {
        type: 'ordering',
        question: 'Ordene as passagens que ligam a monarquia, a ruptura e o retorno do povo:',
        items: ['O povo retorna e inicia a reconstrução', 'Davi é ungido como rei', 'Jerusalém é destruída e o povo vai para o exílio', 'Salomão edifica o templo'],
        correctOrder: ['Davi é ungido como rei', 'Salomão edifica o templo', 'Jerusalém é destruída e o povo vai para o exílio', 'O povo retorna e inicia a reconstrução'],
        recordTitle: 'Da cidade ao recomeço',
        correctAnswer: 'Davi é ungido como rei → Salomão edifica o templo → Jerusalém é destruída e o povo vai para o exílio → O povo retorna e inicia a reconstrução',
        teaching: 'A história atravessa brilho, ruptura e recomeço. Ordenar esses momentos ajuda a perceber que a esperança bíblica não ignora a perda: ela acompanha a comunidade até que a reconstrução se torne possível.',
        reference: '1 Samuel 16; 1 Reis 6; 2 Reis 25; Esdras 3',
        context: {
            moment: 'A narrativa passa da escolha de Davi à construção do templo por Salomão, atravessa a destruição de Jerusalém e chega ao retorno dos exilados para reconstruir.',
            characters: 'Davi representa a formação da monarquia; Salomão, a edificação do templo; os exilados carregam a memória da perda; os que retornam retomam o trabalho comunitário.',
            connection: 'A sequência impede que o retorno seja lido como se nada tivesse acontecido. A memória preserva a grandeza, nomeia a ferida e reconhece o trabalho paciente de começar novamente.'
        },
        reviewQuestion: 'Qual sequência resume o caminho da cidade, da ruptura e do recomeço?',
        reviewOptions: ['Davi é ungido → Salomão edifica o templo → Jerusalém é destruída e ocorre o exílio → o povo retorna e reconstrói', 'Exílio → Davi é ungido → retorno → templo de Salomão', 'Templo de Salomão → retorno → Davi é ungido → exílio', 'Retorno → exílio → templo de Salomão → Davi é ungido'],
        reviewAnswer: 0,
        reviewExplanation: 'A história passa pela formação da monarquia, pela construção do templo, pela ruptura do exílio e pelo trabalho de reconstrução.',
        explanation: 'Davi é ungido antes de Salomão edificar o templo; depois Jerusalém é destruída e o povo é levado ao exílio; por fim, os que retornam começam a reconstruir.'
    },
    {
        type: 'verse',
        question: 'Complete a orientação dada ao povo que vivia no exílio:',
        verse: 'E procurai a ______ da cidade... e orai por ela ao Senhor; porque na sua paz vós tereis paz. (Jeremias 29:7)',
        correct: 'paz',
        recordTitle: 'Florescer no lugar da espera',
        correctAnswer: 'paz',
        teaching: 'Mesmo longe de casa, o povo é chamado a buscar o bem comum. A esperança não é fuga da realidade: é uma forma paciente de cuidar da cidade, cultivar vínculos e permanecer fiel durante a espera.',
        reference: 'Jeremias 29:7',
        context: {
            moment: 'A carta de Jeremias alcança os exilados na Babilônia e oferece uma orientação para viver um longo período de espera sem abandonar a responsabilidade pelo lugar onde estão.',
            characters: 'O profeta escreve à comunidade levada para longe de Jerusalém. Famílias, anciãos e gerações futuras são convidados a construir uma vida possível e a orar pela cidade.',
            connection: 'A passagem educa a esperança para que ela não seja apenas desejo de voltar. Procurar a paz é participar do bem comum agora, enquanto a promessa de retorno ainda amadurece.'
        },
        reviewQuestion: 'Complete: “E procurai a ______ da cidade... e orai por ela ao Senhor.”',
        reviewOptions: ['paz', 'riqueza', 'vingança', 'fama'],
        reviewAnswer: 0,
        reviewExplanation: '“Paz” expressa o chamado para buscar o bem da cidade e cuidar do bem comum mesmo durante o exílio.',
        explanation: 'Jeremias 29:7 orienta os exilados a procurarem a paz da cidade onde vivem e a orarem por ela, transformando o tempo de espera em responsabilidade comunitária.'
    },
    {
        type: 'teaching-ordering',
        question: 'Reorganize os fragmentos até formar a explicação completa sobre a esperança do retorno:',
        items: [
            'Depois do exílio, o povo retorna e começa a reconstruir Jerusalém e o templo.',
            'A reconstrução reúne memória da perda, trabalho comum e escuta da Lei.',
            'Assim, o recomeço não nega a ruptura: transforma a esperança em responsabilidade compartilhada.'
        ],
        correctOrder: [
            'Depois do exílio, o povo retorna e começa a reconstruir Jerusalém e o templo.',
            'A reconstrução reúne memória da perda, trabalho comum e escuta da Lei.',
            'Assim, o recomeço não nega a ruptura: transforma a esperança em responsabilidade compartilhada.'
        ],
        recordTitle: 'Esperança que reconstrói',
        correctAnswer: 'Depois do exílio, o povo retorna e começa a reconstruir Jerusalém e o templo. → A reconstrução reúne memória da perda, trabalho comum e escuta da Lei. → Assim, o recomeço não nega a ruptura: transforma a esperança em responsabilidade compartilhada.',
        teaching: 'O retorno ganha sentido quando acontecimento, prática e compreensão permanecem ligados. A esperança bíblica se torna educativa ao mostrar que reconstruir é lembrar, trabalhar juntos e deixar a Palavra orientar o futuro.',
        reference: 'Esdras 3:10-13; Neemias 8:1-12',
        orderExplanation: 'A ordem começa com o retorno concreto, mostra como a comunidade reconstrói com memória e escuta, e chega ao sentido educativo do recomeço: a esperança se transforma em responsabilidade compartilhada.',
        context: {
            moment: 'Ao voltar do exílio, o povo encontra ruínas e precisa reconstruir. A celebração dos fundamentos e a leitura pública da Lei devolvem palavras comuns à comunidade.',
            characters: 'Os que retornam, sacerdotes, levitas, anciãos, Esdras e Neemias participam de um recomeço que envolve tanto o espaço da cidade quanto a formação do povo.',
            connection: 'Os fragmentos mostram que reconstrução é mais que levantar paredes. É recuperar memória, reunir pessoas e ouvir a Palavra para que o futuro não repita a ruptura.'
        },
        reviewQuestion: 'Reorganize: retorno concreto, trabalho e escuta da Lei, sentido educativo do recomeço.',
        reviewExplanation: 'A explicação cresce do retorno para a prática comunitária e chega ao sentido: a esperança se torna responsabilidade quando a memória e a Palavra orientam a reconstrução.',
        explanation: 'O retorno inicia a reconstrução; o trabalho comum e a escuta da Lei dão forma ao recomeço; então a comunidade compreende que esperança também é responsabilidade compartilhada.'
    },
    {
        type: 'interpretation',
        scenario: 'Ao ler a carta aos exilados, um aprendiz pergunta se buscar a paz da cidade significa esquecer Jerusalém ou assumir uma responsabilidade enquanto a espera continua.',
        question: 'Qual leitura preserva melhor o sentido de Jeremias 29:7?',
        options: [
            'A comunidade deve buscar o bem da cidade onde vive, sem negar a dor do exílio nem abandonar a esperança do retorno.',
            'Buscar a paz exige considerar o exílio encerrado e abandonar toda memória de Jerusalém.',
            'A orientação permite aceitar qualquer injustiça da cidade, pois a paz seria apenas silêncio e conformidade.',
            'O versículo promete que a espera terminará imediatamente assim que a comunidade começar a orar.'
        ],
        answer: 0,
        recordTitle: 'Esperança responsável no exílio',
        correctAnswer: 'A comunidade deve buscar o bem da cidade onde vive, sem negar a dor do exílio nem abandonar a esperança do retorno.',
        teaching: 'A esperança de Jeremias não é fuga nem conformidade cega: ela ensina a cuidar do lugar presente enquanto a comunidade mantém viva a memória e aguarda o futuro de Deus.',
        reference: 'Jeremias 29:4-14',
        interpretation: 'A leitura mais coerente entende “procurai a paz da cidade” como um chamado ao bem comum durante a espera: os exilados podem florescer e servir sem apagar a ferida nem a esperança de retorno.',
        contextualConnection: 'Jeremias 29:4-14 é uma carta dirigida aos exilados na Babilônia. O texto orienta famílias a construir uma vida possível, buscar a paz da cidade e orar por ela, mas também conserva a promessa de que Deus não abandonou seu povo. O contexto mantém juntas responsabilidade presente, memória e esperança.',
        evidenceClues: [
            { source: 'Cenário', text: 'A orientação é uma carta enviada a famílias que vivem no exílio da Babilônia.', relevant: true, explanation: 'Nomear os destinatários impede uma leitura abstrata: a busca da paz acontece dentro de uma espera difícil, com memória e identidade preservadas.' },
            { source: 'Referência · Jeremias 29:5-7', text: 'O povo é chamado a construir, plantar, buscar a paz da cidade e orar por ela.', relevant: true, explanation: 'Essas ações mostram uma responsabilidade presente e ativa. A espera não é fuga do mundo, mas cuidado com o bem comum enquanto a promessa amadurece.' },
            { source: 'Pista enganosa · leitura apressada', text: 'Buscar a paz significa esquecer Jerusalém e considerar o exílio encerrado.', relevant: false, explanation: 'A carta mantém a memória e fala de um tempo de espera. Cuidar da cidade presente não apaga a história nem a esperança de retorno.' },
            { source: 'Pista enganosa · promessa apressada', text: 'A oração garante que a volta acontecerá imediatamente.', relevant: false, explanation: 'O tom da carta é paciente e comunitário. A referência não promete uma solução instantânea, mas ensina a viver fielmente durante a espera.' }
        ],
        evidenceAnswer: [0, 1],
        alternativeExplanations: [
            '',
            'Ela faz do cuidado com a cidade uma renúncia à identidade e à promessa, embora a carta preserve justamente a memória e o futuro do povo.',
            'Ela confunde paz com silêncio diante da injustiça; no contexto, buscar a paz envolve o bem da cidade e a vida comunitária, não a aprovação de todo comportamento.',
            'Ela transforma uma orientação de longa espera em uma promessa de solução instantânea, contrariando o tom paciente da carta aos exilados.'
        ],
        reviewQuestion: 'Durante o exílio, o que significa buscar a paz da cidade? Escolha a leitura mais coerente.',
        reviewOptions: [
            'Cuidar do bem comum sem negar a dor do exílio nem abandonar a esperança do retorno.',
            'Esquecer Jerusalém e considerar o exílio encerrado.',
            'Aceitar qualquer injustiça, porque paz é apenas silêncio e conformidade.',
            'Esperar uma solução imediata assim que a comunidade orar.'
        ],
        reviewAnswer: 0,
        reviewExplanation: 'Jeremias une cuidado presente e esperança futura: a comunidade pode servir à cidade onde está sem concluir que sua história ou sua promessa foram apagadas.'
    }
];

/**
 * Glossário breve para a leitura contextual de cada passagem preservada.
 * As chaves seguem o formato fase-índice da passagem.
 */
export const PASSAGE_GLOSSARY = {
    '1-0': [
        { word: 'Chamado', definition: 'Convite de Deus para uma missão; aqui, é o convite para Abraão deixar sua terra e caminhar pela promessa.' },
        { word: 'Promessa', definition: 'Palavra de compromisso que aponta para um futuro cuidado por Deus, mesmo quando o caminho ainda não está claro.' },
        { word: 'Peregrinação', definition: 'Caminhada de quem parte confiando e aprendendo ao longo do caminho, sem possuir todas as respostas desde o início.' }
    ],
    '1-1': [
        { word: 'Patriarca', definition: 'Antepassado reconhecido como origem de uma família ou povo; Abraão, Isaque, Jacó e José formam a linhagem estudada.' },
        { word: 'Linhagem', definition: 'Sequência de gerações que preserva uma história familiar e ajuda a acompanhar como a promessa foi transmitida.' },
        { word: 'Aliança', definition: 'Compromisso estabelecido entre Deus e seu povo, marcado por fidelidade e responsabilidade ao longo das gerações.' }
    ],
    '1-2': [
        { word: 'Princípio', definition: 'O começo de tudo; Gênesis usa essa palavra para abrir a narrativa da criação.' },
        { word: 'Criação', definition: 'A obra pela qual Deus dá existência e ordem aos céus, à terra e a tudo o que vive.' },
        { word: 'Céus', definition: 'A dimensão elevada da criação mencionada junto da terra, formando a expressão que abrange o universo criado.' }
    ],
    '1-3': [
        { word: 'Dilúvio', definition: 'Grande inundação narrada em Gênesis, depois da qual Noé recebe uma palavra de recomeço e esperança.' },
        { word: 'Aliança', definition: 'Compromisso de cuidado e fidelidade; nesta passagem, alcança Noé, sua descendência e toda a criação.' },
        { word: 'Misericórdia', definition: 'Compaixão que preserva e oferece um novo começo, mesmo depois de uma experiência de juízo e ruptura.' }
    ],
    '1-4': [
        { word: 'Sinal', definition: 'Marca visível que aponta para uma realidade maior; o arco na nuvem recorda a aliança de Deus.' },
        { word: 'Esperança', definition: 'Confiança em um futuro de cuidado e recomeço, nascida da promessa de misericórdia.' },
        { word: 'Compreensão', definition: 'Sentido que se forma quando os acontecimentos, os sinais e o ensinamento são relacionados com clareza.' }
    ],
    '2-0': [
        { word: 'Êxodo', definition: 'Saída de Israel do Egito; o nome também identifica a grande narrativa de libertação conduzida por Deus.' },
        { word: 'Sarça', definition: 'Arbusto que aparece ardendo sem se consumir; diante dele, Moisés percebe um encontro santo e recebe sua missão.' },
        { word: 'Libertação', definition: 'Ação de tirar alguém da opressão e conduzi-lo para uma vida nova, com dignidade e responsabilidade.' }
    ],
    '2-1': [
        { word: 'Opressão', definition: 'Domínio que pesa sobre um povo e limita sua liberdade; no Êxodo, é a condição vivida por Israel no Egito.' },
        { word: 'Travessia', definition: 'Passagem de um lado a outro que representa risco, confiança e transformação durante o caminho da libertação.' },
        { word: 'Sinai', definition: 'Monte onde Israel recebe a aliança e aprende como viver como povo depois de sair do Egito.' }
    ],
    '2-2': [
        { word: 'Pelejará', definition: 'Lutará ou agirá em favor de alguém; Moisés usa a palavra para anunciar que Deus sustentará Israel diante do mar.' },
        { word: 'Confiança', definition: 'Atitude de se apoiar em Deus mesmo quando o medo mostra apenas obstáculos e nenhuma saída visível.' },
        { word: 'Livramento', definition: 'Ação de ser protegido ou retirado de uma ameaça; aqui, liga a travessia à presença cuidadosa de Deus.' }
    ],
    '2-3': [
        { word: 'Lei', definition: 'Orientação para organizar a vida do povo com justiça, fidelidade e responsabilidade depois da libertação.' },
        { word: 'Sinai', definition: 'Lugar do encontro em que Moisés recebe as tábuas e a liberdade passa a ser vivida em comunidade.' },
        { word: 'Aliança', definition: 'Relação de compromisso entre Deus e Israel, na qual a Palavra orienta escolhas e relações cotidianas.' }
    ],
    '3-0': [
        { word: 'Terra Prometida', definition: 'A terra apresentada como destino da promessa; sua entrada exige confiança, preparação e obediência.' },
        { word: 'Muralhas', definition: 'Fortificações que cercavam Jericó e simbolizam o grande obstáculo diante do povo.' },
        { word: 'Obediência', definition: 'Escuta que se transforma em prática; na narrativa, o povo segue a orientação recebida antes de ver o resultado.' }
    ],
    '3-1': [
        { word: 'Espias', definition: 'Pessoas enviadas para observar a terra e trazer informações antes de uma decisão importante.' },
        { word: 'Jordão', definition: 'Rio cuja travessia marca a entrada de Israel na terra prometida e uma nova etapa da narrativa.' },
        { word: 'Memorial', definition: 'Sinal preparado para manter uma experiência viva na memória e despertar perguntas nas gerações futuras.' }
    ],
    '3-2': [
        { word: 'Coragem', definition: 'Firmeza para agir apesar do medo; em Josué, ela nasce da certeza de que Deus acompanha o caminho.' },
        { word: 'Presença', definition: 'Companhia ativa de Deus, apresentada como fundamento para não temer diante das responsabilidades.' },
        { word: 'Liderança', definition: 'Responsabilidade de conduzir uma comunidade com fidelidade, escuta e cuidado no caminho recebido.' }
    ],
    '3-3': [
        { word: 'Memorial', definition: 'Marca visível que ajuda uma comunidade a lembrar o cuidado recebido e a contar sua história.' },
        { word: 'Gilgal', definition: 'Lugar onde as pedras tiradas do Jordão foram levantadas como sinal para as futuras gerações.' },
        { word: 'Testemunho', definition: 'Relato que confirma o que foi vivido e permite transmitir uma experiência de fé a outras pessoas.' }
    ],
    '4-0': [
        { word: 'Sabedoria', definition: 'Discernimento para ouvir, julgar e agir com justiça; Salomão pede esse dom para servir o povo.' },
        { word: 'Discernimento', definition: 'Capacidade de reconhecer o que é justo e responsável diante de uma decisão.' },
        { word: 'Serviço', definition: 'Uso de uma responsabilidade em favor do bem de outras pessoas, e não apenas de interesses pessoais.' }
    ],
    '4-1': [
        { word: 'Monarquia', definition: 'Forma de governo associada aos reis de Israel; nesta passagem, ela faz parte de uma história que também conhece ruptura e recomeço.' },
        { word: 'Exílio', definition: 'Experiência de viver longe da própria terra depois da destruição de Jerusalém, carregando perdas e memória.' },
        { word: 'Reconstrução', definition: 'Trabalho de recomeçar a vida comum depois da ruptura, reunindo memória, esforço e esperança.' }
    ],
    '4-2': [
        { word: 'Exílio', definition: 'Tempo de espera vivido longe de Jerusalém, no qual a comunidade é chamada a continuar responsável pelo bem comum.' },
        { word: 'Paz', definition: 'Bem-estar e possibilidade de florescimento buscados para toda a cidade, não apenas para um grupo.' },
        { word: 'Esperança', definition: 'Confiança ativa que permite cuidar do presente enquanto se aguarda um futuro de retorno e restauração.' }
    ],
    '4-3': [
        { word: 'Retorno', definition: 'Volta do povo à terra depois do exílio, acompanhada pelo desafio concreto de reconstruir a cidade e a vida comunitária.' },
        { word: 'Reconstrução', definition: 'Reerguimento de espaços e relações, com trabalho comum, memória da perda e escuta da Lei.' },
        { word: 'Recomeço', definition: 'Novo início que não apaga a ruptura, mas transforma a esperança em responsabilidade compartilhada.' }
    ],
    '1-5': [
        { word: 'Interpretação', definition: 'Leitura que relaciona as palavras, o contexto e o ensinamento de uma passagem sem isolá-la de sua história.' },
        { word: 'Chamado', definition: 'Convite de Deus que, na história de Abrão, vem acompanhado de promessa e pede uma resposta concreta.' },
        { word: 'Confiança', definition: 'Resposta de quem caminha sem controlar todo o futuro, mas se apoia na promessa recebida.' }
    ],
    '2-4': [
        { word: 'Travessia', definition: 'Passagem para uma nova margem; no Êxodo, ela une a confiança na ação de Deus ao movimento do povo.' },
        { word: 'Pausa', definition: 'Interrupção do pânico para escutar e reconhecer o cuidado de Deus antes de agir.' },
        { word: 'Confiança', definition: 'Firmeza que não nega o medo, mas permite avançar quando o caminho se abre.' }
    ],
    '3-4': [
        { word: 'Memorial', definition: 'Sinal comunitário que desperta perguntas e ajuda as gerações a contar novamente o cuidado recebido.' },
        { word: 'Testemunho', definition: 'Palavra que transmite uma experiência vivida e a transforma em ensinamento para outras pessoas.' },
        { word: 'Gerações', definition: 'Pessoas de diferentes tempos ligadas por uma memória que continua sendo contada e interpretada.' }
    ],
    '4-4': [
        { word: 'Paz', definition: 'Bem comum procurado para a cidade, não mero silêncio ou conformidade diante de qualquer injustiça.' },
        { word: 'Exílio', definition: 'Tempo de viver longe da própria terra, mantendo memória, identidade e responsabilidade pelo presente.' },
        { word: 'Esperança', definition: 'Confiança ativa que cuida do presente enquanto aguarda um futuro de retorno e restauração.' }
    ]
};
