/*
 * Catálogo do app: áreas de licenciatura, pacotes de questões e concursos.
 *
 * PACOTES (dados/*.js) chamam registrarPacote({...}): questões que não são de uma prova específica.
 * O app carrega os pacotes com areas '*' e os da área escolhida pela pessoa.
 *
 * CONCURSOS (dados/concursos/<id>.js) chamam registrarConcurso({...}): um arquivo por concurso, com os
 * dados do edital e, quando houver, as questões da prova. Para adicionar um concurso:
 *   1. criar dados/concursos/<id>.js (copiar um parecido e trocar os dados)
 *   2. colocar o <id> na lista "concursos" abaixo
 *
 * Campos de um concurso:
 *   nome, orgao, cargo, banca, ano   identificação que aparece em cada questão
 *   formato     'ce' (certo ou errado) ou 'me' (múltipla escolha)
 *   pontuacao   'liquida' (cada erro anula um acerto) ou 'acertos'
 *   areas       '*' (todas) ou lista de áreas, ex.: ['biologia', 'quimica']
 *   link        página oficial do concurso (o app não guarda PDF de edital)
 *   apostilas   menu das apostilas do concurso no site (https://www.gizegabarito.com.br/estudar/<id>/): enquanto o
 *               concurso não acaba, a tela inicial mostra "Estude grátis agora mesmo!", que abre esse menu (com
 *               ?cargo=) depois de um anúncio premiado próprio
 *   inscricoes  {inicio, fim} em aaaa-mm-dd: enquanto não passar o fim, aparece em "Inscrições abertas"
 *   prova       data da prova objetiva (aaaa-mm-dd)
 *   encerrado   true ou data aaaa-mm-dd do resultado final: a partir daí aparece em "Finalizados"
 *               (sem isso, depois das inscrições fica em "Em andamento")
 *   previsto    true para um concurso que ainda não tem edital: aparece em "Previstos" (sem ano, inscrições nem questões)
 *   duracao     minutos de prova, se o edital disser; discursiva: true se tiver prova discursiva
 *   estrutura, minimos, materiasGerais, local   para montar o simulado de um edital sem questões próprias
 *   distribuicao  {matéria: quantidade} das gerais na prova, ex.: {'Língua Portuguesa': 10, ...}; o simulado do
 *               edital sorteia as gerais nessa proporção (a soma é a de estrutura.gerais). O conteúdo com local
 *               (lei municipal, história e geografia do município) entra no simulado do edital com qualquer banca
 *   etapa       'anos-finais' quando o cargo é só dos anos finais do fundamental: no foco, o edital vem marcado no
 *               Fundamental 2 (dados/niveis.js). Sem etapa, os níveis do edital saem do tipo de órgão (prefeitura,
 *               estado, IF). Também vale num cargo da lista cargos ({id, nome, area, etapa})
 *   gabaritoPreliminar  true se as questões usam o gabarito preliminar
 *   cargos      prova com vários cargos: lista de {id, nome, area}. Cada cargo aparece como um concurso na
 *               lista do app, com as questões gerais e as específicas daquele cargo (campo cargo na questão)
 * Cada questão de prova traz numero, tipo, grupo, area (nas específicas), materia, enunciado, gabarito e
 * comentario. Os comentários são escritos por nós; nunca copiar explicações de outros professores.
 */
window.CATALOGO = {
  areas: [
    { id: 'pedagogia', nome: 'Pedagogia', detalhe: 'Educação infantil e anos iniciais' },
    { id: 'portugues', nome: 'Língua Portuguesa' },
    { id: 'ingles', nome: 'Língua Inglesa' },
    { id: 'espanhol', nome: 'Língua Espanhola' },
    { id: 'matematica', nome: 'Matemática' },
    { id: 'ciencias', nome: 'Ciências', detalhe: 'Anos finais do fundamental' },
    { id: 'biologia', nome: 'Biologia' },
    { id: 'quimica', nome: 'Química' },
    { id: 'fisica', nome: 'Física' },
    { id: 'historia', nome: 'História' },
    { id: 'geografia', nome: 'Geografia' },
    { id: 'filosofia', nome: 'Filosofia' },
    { id: 'sociologia', nome: 'Sociologia' },
    { id: 'artes', nome: 'Artes' },
    { id: 'educacao-fisica', nome: 'Educação Física' },
    { id: 'ensino-religioso', nome: 'Ensino Religioso' },
    { id: 'educacao-especial', nome: 'Educação Especial', detalhe: 'AEE e inclusão' },
    { id: 'libras', nome: 'Libras', detalhe: 'Língua Brasileira de Sinais' }
  ],

  // disciplinas de cada área, para o treino rápido por foco: cada uma junta as matérias (campo materia) das questões.
  // Matéria nova numa área? Coloque-a numa disciplina daqui; senão ela aparece em "Outros temas".
  disciplinas: {
    pedagogia: [
      { id: 'infantil', nome: 'Educação infantil', materias: ['Educação infantil'] },
      { id: 'alfabetizacao', nome: 'Alfabetização e letramento', materias: ['Alfabetização e letramento'] },
      { id: 'didatica', nome: 'Didática e planejamento', materias: ['Didática e planejamento', 'Didática e organização do trabalho pedagógico'] },
      { id: 'metodologias', nome: 'Metodologias de ensino', materias: ['Metodologias de ensino'] },
      { id: 'psicologia', nome: 'Psicologia da educação', materias: ['Psicologia da educação', 'Desenvolvimento e aprendizagem'] },
      { id: 'inclusiva', nome: 'Educação inclusiva', materias: ['Educação inclusiva'] },
      { id: 'politicas', nome: 'Políticas e currículo', materias: ['Política de ensino do Recife'] }
    ],
    portugues: [
      { id: 'gramatica', nome: 'Gramática e linguística', materias: ['Gramática e linguística'] },
      { id: 'leitura', nome: 'Leitura e interpretação', materias: ['Leitura e interpretação de textos'] },
      { id: 'literatura', nome: 'Literatura', materias: ['Literatura'] },
      { id: 'ensino', nome: 'Ensino de língua portuguesa', materias: ['Ensino de língua portuguesa', 'Letramento', 'Avaliação'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    ingles: [
      { id: 'leitura', nome: 'Leitura e interpretação', materias: ['Leitura e interpretação em inglês'] },
      { id: 'gramatica', nome: 'Gramática', materias: ['Gramática da língua inglesa'] },
      { id: 'vocabulario', nome: 'Vocabulário', materias: ['Vocabulário'] },
      { id: 'ensino', nome: 'Ensino de língua inglesa', materias: ['Ensino de língua inglesa', 'Ensino de línguas estrangeiras'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    espanhol: [
      { id: 'leitura', nome: 'Leitura e interpretação', materias: ['Leitura e interpretação em espanhol'] },
      { id: 'gramatica', nome: 'Gramática', materias: ['Gramática da língua espanhola'] },
      { id: 'cultura', nome: 'Vocabulário e cultura hispânica', materias: ['Vocabulário em espanhol'] },
      { id: 'ensino', nome: 'Ensino de espanhol', materias: ['Ensino de línguas estrangeiras'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    matematica: [
      { id: 'aritmetica', nome: 'Aritmética', materias: ['Aritmética', 'Álgebra e aritmética'] },
      { id: 'algebra', nome: 'Álgebra e funções', materias: ['Álgebra e funções'] },
      { id: 'geometria', nome: 'Geometria', materias: ['Geometria'] },
      { id: 'estatistica', nome: 'Estatística e probabilidade', materias: ['Estatística e probabilidade'] },
      { id: 'ensino', nome: 'Ensino de matemática', materias: ['Ensino de matemática'] },
      { id: 'historia', nome: 'História da matemática', materias: ['História da matemática'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    ciencias: [
      { id: 'ensino', nome: 'Ensino de ciências', materias: ['Ensino de ciências'] },
      { id: 'corpo', nome: 'Corpo humano e saúde', materias: ['Saúde', 'Biologia celular e fisiologia', 'Imunologia'] },
      { id: 'citologia', nome: 'Citologia', materias: ['Citologia'] },
      { id: 'zoologia', nome: 'Seres vivos e zoologia', materias: ['Zoologia', 'Botânica', 'Microbiologia'] },
      { id: 'genetica', nome: 'Genética e evolução', materias: ['Genética', 'Evolução'] },
      { id: 'ecologia', nome: 'Ecologia e meio ambiente', materias: ['Ecologia', 'Meio ambiente'] },
      { id: 'fisica', nome: 'Física', materias: ['Física'] },
      { id: 'quimica', nome: 'Química', materias: ['Química'] },
      { id: 'terra', nome: 'Terra e universo', materias: ['Terra e universo'] }
    ],
    biologia: [
      { id: 'citologia', nome: 'Citologia e microscopia', materias: ['Célula e microscopia'] },
      { id: 'bioquimica', nome: 'Bioquímica', materias: ['Bioquímica'] },
      { id: 'genetica', nome: 'Genética', materias: ['Genética'] },
      { id: 'evolucao', nome: 'Evolução e diversidade', materias: ['Evolução e diversidade'] },
      { id: 'zoologia', nome: 'Zoologia', materias: ['Zoologia'] },
      { id: 'botanica', nome: 'Botânica', materias: ['Botânica'] },
      { id: 'microbiologia', nome: 'Microbiologia', materias: ['Microbiologia'] },
      { id: 'ecologia', nome: 'Ecologia e meio ambiente', materias: ['Ecologia', 'Meio ambiente e legislação ambiental'] },
      { id: 'corpo', nome: 'Corpo humano e saúde', materias: ['Corpo humano', 'Saúde'] },
      { id: 'terra', nome: 'Terra, mar e recursos naturais', materias: ['Terra e universo', 'Geociências', 'Oceanografia', 'Aquicultura e recursos pesqueiros'] },
      { id: 'fisquim', nome: 'Física e química da vida', materias: ['Física e química'] },
      { id: 'ensino', nome: 'Ensino de biologia', materias: ['Ensino de biologia'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    quimica: [
      { id: 'geral', nome: 'Química geral e inorgânica', materias: ['Química geral e inorgânica'] },
      { id: 'fisicoquimica', nome: 'Físico-química', materias: ['Físico-química'] },
      { id: 'analitica', nome: 'Química analítica', materias: ['Química analítica'] },
      { id: 'organica', nome: 'Química orgânica', materias: ['Química orgânica'] },
      { id: 'polimeros', nome: 'Polímeros e materiais', materias: ['Polímeros e materiais'] },
      { id: 'bioquimica', nome: 'Bioquímica', materias: ['Bioquímica'] },
      { id: 'processos', nome: 'Processos e operações unitárias', materias: ['Processos e operações unitárias'] },
      { id: 'ambiental', nome: 'Química ambiental', materias: ['Química ambiental'] },
      { id: 'ensino', nome: 'Ensino de química', materias: ['Ensino de química'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    fisica: [
      { id: 'mecanica', nome: 'Mecânica', materias: ['Mecânica'] },
      { id: 'termologia', nome: 'Termologia', materias: ['Termologia'] },
      { id: 'optica', nome: 'Óptica e ondas', materias: ['Óptica e ondas'] },
      { id: 'eletricidade', nome: 'Eletricidade e magnetismo', materias: ['Eletricidade e magnetismo'] },
      { id: 'moderna', nome: 'Física moderna', materias: ['Física moderna'] },
      { id: 'ensino', nome: 'Ensino de física', materias: ['Ensino de física'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    historia: [
      { id: 'brasil', nome: 'História do Brasil', materias: ['História do Brasil'] },
      { id: 'antiga', nome: 'História antiga e medieval', materias: ['História antiga e medieval'] },
      { id: 'moderna', nome: 'História moderna', materias: ['História moderna'] },
      { id: 'contemporanea', nome: 'História contemporânea', materias: ['História contemporânea'] },
      { id: 'geral', nome: 'História geral', materias: ['História geral'] },
      { id: 'africa', nome: 'História da África e afro-brasileira', materias: ['História da África'] },
      { id: 'teoria', nome: 'Teoria da história', materias: ['Teoria da história'] },
      { id: 'ensino', nome: 'Ensino de história', materias: ['Metodologias de ensino', 'Política de ensino do Recife'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    geografia: [
      { id: 'fisica', nome: 'Geografia física', materias: ['Geografia física'] },
      { id: 'humana', nome: 'Geografia humana e econômica', materias: ['Geografia econômica', 'Geografia humana e econômica'] },
      { id: 'urbana', nome: 'Geografia urbana e da população', materias: ['Geografia urbana e da população'] },
      { id: 'cartografia', nome: 'Cartografia', materias: ['Cartografia'] },
      { id: 'ambiente', nome: 'Meio ambiente', materias: ['Meio ambiente'] },
      { id: 'pensamento', nome: 'Pensamento geográfico', materias: ['Pensamento geográfico'] },
      { id: 'ensino', nome: 'Ensino de geografia', materias: ['Ensino de geografia', 'Política de ensino do Recife', 'Avaliação'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    filosofia: [
      { id: 'antiga', nome: 'Filosofia antiga e medieval', materias: ['Filosofia antiga e medieval'] },
      { id: 'moderna', nome: 'Filosofia moderna e contemporânea', materias: ['Filosofia moderna e contemporânea'] },
      { id: 'etica', nome: 'Ética e filosofia política', materias: ['Ética e filosofia política'] },
      { id: 'conhecimento', nome: 'Lógica e teoria do conhecimento', materias: ['Lógica e teoria do conhecimento'] },
      { id: 'estetica', nome: 'Estética', materias: ['Estética'] },
      { id: 'ensino', nome: 'Ensino de filosofia', materias: ['Ensino de filosofia'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    sociologia: [
      { id: 'classicos', nome: 'Clássicos da sociologia', materias: ['Clássicos da sociologia'] },
      { id: 'cultura', nome: 'Cultura, identidade e sociedade', materias: ['Cultura, identidade e sociedade'] },
      { id: 'politica', nome: 'Política, poder e Estado', materias: ['Política, poder e Estado'] },
      { id: 'trabalho', nome: 'Trabalho e desigualdade', materias: ['Trabalho e desigualdade'] },
      { id: 'antropologia', nome: 'Antropologia', materias: ['Antropologia'] },
      { id: 'ensino', nome: 'Ensino de sociologia', materias: ['Ensino de sociologia'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    artes: [
      { id: 'visuais', nome: 'Artes visuais', materias: ['Artes visuais'] },
      { id: 'historia', nome: 'História da arte', materias: ['História da arte'] },
      { id: 'musica', nome: 'Música', materias: ['Música', 'Educação musical', 'Canto coral', 'Teoria e harmonia', 'História da música'] },
      { id: 'teatro', nome: 'Teatro', materias: ['Teatro', 'História do teatro', 'Ensino de teatro'] },
      { id: 'danca', nome: 'Dança', materias: ['Dança'] },
      { id: 'cultura', nome: 'Cultura popular e patrimônio', materias: ['Cultura popular e patrimônio'] },
      { id: 'ensino', nome: 'Ensino de arte', materias: ['Ensino de arte'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Didática e planejamento', 'Currículo de Pernambuco'] }
    ],
    'educacao-fisica': [
      { id: 'cultura', nome: 'Cultura corporal e práticas corporais', materias: ['Cultura corporal e práticas corporais', 'Dança'] },
      { id: 'abordagens', nome: 'Abordagens pedagógicas', materias: ['Abordagens pedagógicas'] },
      { id: 'motor', nome: 'Desenvolvimento e aprendizagem motora', materias: ['Desenvolvimento e aprendizagem motora'] },
      { id: 'historia', nome: 'História da educação física', materias: ['História da educação física'] },
      { id: 'didatica', nome: 'Didática, planejamento e avaliação', materias: ['Didática e planejamento', 'Avaliação'] },
      { id: 'legislacao', nome: 'BNCC e legislação', materias: ['BNCC e legislação', 'Legislação educacional'] },
      { id: 'pedagogicos', nome: 'Temas educacionais e pedagógicos', materias: ['Educação inclusiva', 'Currículo de Pernambuco'] }
    ],
    'ensino-religioso': [
      { id: 'fenomeno', nome: 'Fenômeno religioso', materias: ['Fenômeno religioso'] },
      { id: 'tradicoes', nome: 'Tradições e culturas religiosas', materias: ['Tradições e culturas religiosas'] },
      { id: 'textos', nome: 'Textos sagrados', materias: ['Textos sagrados'] },
      { id: 'ethos', nome: 'Ethos, ética e valores', materias: ['Ethos, ética e valores'] },
      { id: 'ensino', nome: 'Ensino religioso e legislação', materias: ['Ensino religioso e legislação'] }
    ],
    'educacao-especial': [
      { id: 'aee', nome: 'AEE e salas de recursos', materias: ['AEE e salas de recursos'] },
      { id: 'intelectual', nome: 'Deficiência intelectual', materias: ['Deficiência intelectual'] },
      { id: 'visual', nome: 'Deficiência visual', materias: ['Deficiência visual'] },
      { id: 'surdez', nome: 'Surdez', materias: ['Surdez'] },
      { id: 'tea', nome: 'Transtorno do espectro autista', materias: ['Transtorno do espectro autista'] },
      { id: 'altas', nome: 'Altas habilidades', materias: ['Altas habilidades'] },
      { id: 'politicas', nome: 'Políticas de inclusão', materias: ['Políticas de inclusão'] }
    ],
    libras: [
      { id: 'linguistica', nome: 'Linguística da Libras', materias: ['Linguística da Libras'] },
      { id: 'surdos', nome: 'Educação de surdos', materias: ['Ensino de Libras e educação de surdos'] },
      { id: 'traducao', nome: 'Tradução e interpretação', materias: ['Tradução e interpretação'] }
    ]
  },

  // questões inéditas e material de estudo: saem quando o banco tiver só provas anteriores
  pacotes: [
    { id: 'gerais', arquivo: 'dados/gerais.js', areas: '*' },
    { id: 'legislacao-al', arquivo: 'dados/legislacao-al.js', areas: '*' },
    // legislação e história e geografia de Campo Alegre/AL: as questões têm local, então só aparecem no edital do município
    { id: 'legislacao-campo-alegre', arquivo: 'dados/legislacao-campo-alegre.js', areas: '*' },
    { id: 'historia-geografia-campo-alegre', arquivo: 'dados/historia-geografia-campo-alegre.js', areas: '*' },
    // simulados e apostila de terceiros: só para uso pessoal, sai da versão da Play Store
    { id: 'biologia', arquivo: 'dados/biologia.js', areas: ['biologia'] },
    // inéditas da SEE-PE (os "Para fixar" das apostilas e as escritas à parte), geradas por
    // ferramentas-scully/geradores/see_pe_ineditas.py; as de lei estadual e do Currículo de PE têm local PE
    { id: 'see-pe-ineditas', arquivo: 'dados/see-pe-ineditas.js', areas: '*' },
    // autorais novas (+1/3 por área e as áreas que não tinham nenhuma), geradas por ferramentas-mulder/autorais/gerar.py
    { id: 'autorais-biologia', arquivo: 'dados/autorais-biologia.js', areas: ['biologia'] },
    { id: 'autorais-ciencias', arquivo: 'dados/autorais-ciencias.js', areas: ['ciencias'] },
    { id: 'autorais-pedagogia', arquivo: 'dados/autorais-pedagogia.js', areas: ['pedagogia'] },
    { id: 'autorais-educacao-especial', arquivo: 'dados/autorais-educacao-especial.js', areas: ['educacao-especial'] },
    { id: 'autorais-matematica', arquivo: 'dados/autorais-matematica.js', areas: ['matematica'] },
    { id: 'autorais-quimica', arquivo: 'dados/autorais-quimica.js', areas: ['quimica'] },
    { id: 'autorais-fisica', arquivo: 'dados/autorais-fisica.js', areas: ['fisica'] },
    { id: 'autorais-historia', arquivo: 'dados/autorais-historia.js', areas: ['historia'] },
    { id: 'autorais-geografia', arquivo: 'dados/autorais-geografia.js', areas: ['geografia'] },
    // temas comuns da P2 da SEE-PE: uma cópia por área das 13 disciplinas
    { id: 'autorais-comuns', arquivo: 'dados/autorais-comuns.js', areas: ['artes', 'biologia', 'educacao-fisica', 'filosofia', 'fisica', 'geografia', 'historia', 'espanhol', 'ingles', 'portugues', 'matematica', 'quimica', 'sociologia'] },
    // gerais autorais (sem Campo Alegre); as de estatuto estadual têm local (PE ou AL)
    { id: 'autorais-gerais', arquivo: 'dados/autorais-gerais.js', areas: '*' },
    { id: 'autorais-ensino-religioso', arquivo: 'dados/autorais-ensino-religioso.js', areas: ['ensino-religioso'] },
    { id: 'autorais-libras', arquivo: 'dados/autorais-libras.js', areas: ['libras'] },
    { id: 'autorais-portugues', arquivo: 'dados/autorais-portugues.js', areas: ['portugues'] },
    { id: 'autorais-artes', arquivo: 'dados/autorais-artes.js', areas: ['artes'] },
    { id: 'autorais-sociologia', arquivo: 'dados/autorais-sociologia.js', areas: ['sociologia'] },
    { id: 'autorais-filosofia', arquivo: 'dados/autorais-filosofia.js', areas: ['filosofia'] },
    { id: 'autorais-ingles', arquivo: 'dados/autorais-ingles.js', areas: ['ingles'] },
    { id: 'autorais-educacao-fisica', arquivo: 'dados/autorais-educacao-fisica.js', areas: ['educacao-fisica'] },
    { id: 'autorais-espanhol', arquivo: 'dados/autorais-espanhol.js', areas: ['espanhol'] },
    // certo ou errado no estilo Cebraspe para a SEE-PE (pedido do dono de 08/11/2026), também por gerar.py
    { id: 'see-pe-ce-biologia', arquivo: 'dados/see-pe-ce-biologia.js', areas: ['biologia'] },
    // a P1 (gerais); as do Estatuto de PE têm local PE
    { id: 'see-pe-ce-gerais', arquivo: 'dados/see-pe-ce-gerais.js', areas: '*' },
    // os temas educacionais e pedagógicos da P2: uma cópia por área das 13 disciplinas; as do Currículo de PE têm local PE
    { id: 'see-pe-ce-comuns', arquivo: 'dados/see-pe-ce-comuns.js', areas: ['artes', 'biologia', 'educacao-fisica', 'filosofia', 'fisica', 'geografia', 'historia', 'espanhol', 'ingles', 'portugues', 'matematica', 'quimica', 'sociologia'] },
    { id: 'see-pe-ce-matematica', arquivo: 'dados/see-pe-ce-matematica.js', areas: ['matematica'] }
  ],

  concursos: [
    'seduc-al-2026',
    'campo-alegre-2026',
    'pao-de-acucar-2026',
    'jati-2026',
    'altos-2026',
    'terra-nova-2026',
    'japaratinga-2025',
    'sao-jose-do-campestre-2025',
    'sao-jose-do-serido-2025',
    'serraria-2025',
    'calumbi-2024',
    'cupira-2024',
    'afogados-da-ingazeira-2024',
    'afogados-da-ingazeira-2025',
    'garanhuns-2024',
    'garanhuns-2024-integral',
    'pombos-2023',
    'surubim-2023',
    'triunfo-2023',
    'arcoverde-2023',
    'tupanatinga-2023',
    'maceio-2017-professor-ii',
    'maceio-2017-professor-nm',
    'recife-2023',
    'recife-2010',
    'recife-2010-portugues',
    'recife-2014',
    'seduc-al-2018',
    'inhapi-2012',
    'gramado-2019',
    'colegio-pedro-ii-2022',
    'colegio-pedro-ii-2018',
    'ifc-2013',
    'ifc-2015',
    'ifro-2014',
    'seec-rn-2011',
    'seduc-pi-2012',
    'seduc-mt-2021',
    'turvo-2018',
    'sao-joao-do-sul-2021',
    'senhor-do-bonfim-2023',
    'ifrn-2009',
    'sc-act-2024',
    'sc-act-2024-2363',
    'porteiras-2018',
    'maraial-2010',
    'ifpr-2014',
    'porto-alegre-2025-matematica',
    'ifpr-2019',
    'ifb-2016',
    'ifnmg-2010',
    'sao-jose-2013',
    'seed-pr-pde-2024',
    'ifam-2014',
    'ifsc-2015',
    'fumep-2010',
    'see-pe-2022',
    'see-pe-proximo',
    'joinville-2023',
    'camacari-2023',
    'joinville-2022',
    'estancia-2021',
    'barra-dos-coqueiros-2020',
    'sao-cristovao-2019',
    'iff-2018',
    'see-df-2017'
  ]
};
