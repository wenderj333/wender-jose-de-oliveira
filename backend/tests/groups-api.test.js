// Testes automáticos da API de Grupos.
//   DATABASE_URL=postgres://postgres@localhost:5491/groupstest node tests/groups-api.test.js
// ATENÇÃO: apaga e recria o schema "public" da base indicada. Use só uma base de testes.
const assert = require('assert/strict');
const { db, resetDatabase, buildApp, createUser, notifications, uploads } = require('./groups-harness');
const { ensureGroupsSchema } = require('../src/db/groupsSchema');

if (!/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)) { console.error('Recuso-me a correr fora de uma base local.'); process.exit(1); }

let base; let server; let groupsRouter;
const results = [];
async function test(name, fn) {
  try { await fn(); results.push([true, name]); console.log('  ✓', name); }
  catch (error) { results.push([false, name, error]); console.log('  ✗', name, '\n    ', error.message); }
}
async function api(user, method, path, body, { form } = {}) {
  const headers = user ? { Authorization: `Bearer ${user.token}` } : {};
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const r = await fetch(`${base}/api/groups${path}`, { method, headers, body: payload });
  let data = null; try { data = await r.json(); } catch { /* sem corpo */ }
  return { status: r.status, data };
}
const flush = () => groupsRouter.flushNotifications();
const notesFor = (user, kind) => notifications.filter((n) => n.userId === String(user.id) && (!kind || n.data?.kind === kind));
const clearNotes = () => { notifications.length = 0; };

(async () => {
  await resetDatabase();
  // Dados "antigos" antes da migração nova: grupo, gosto e pedido de oração antigos
  const legacyOwner = await createUser('Pastor Antigo');
  const legacyFan = await createUser('Membro Antigo');
  const lg = (await db.query("INSERT INTO groups (name, description, creator_id, privacy) VALUES ('Grupo Antigo', 'criado antes', $1, 'private') RETURNING *", [legacyOwner.id])).rows[0];
  const lg2 = (await db.query("INSERT INTO groups (name, creator_id) VALUES ('Grupo Antigo Público', $1) RETURNING *", [legacyOwner.id])).rows[0];
  await db.query("INSERT INTO group_members (group_id,user_id,role) VALUES ($1,$2,'admin'),($1,$3,'member')", [lg.id, legacyOwner.id, legacyFan.id]);
  const lpost = (await db.query("INSERT INTO group_posts (group_id,author_id,content) VALUES ($1,$2,'Post antigo') RETURNING *", [lg.id, legacyOwner.id])).rows[0];
  await db.query('INSERT INTO group_post_likes (post_id,user_id) VALUES ($1,$2)', [lpost.id, legacyFan.id]);
  const lprayer = (await db.query("INSERT INTO group_prayers (group_id,author_id,content,is_answered) VALUES ($1,$2,'Orem pela minha mãe',true) RETURNING *", [lg.id, legacyFan.id])).rows[0];

  await ensureGroupsSchema((sql) => db.query(sql));
  const built = buildApp();
  groupsRouter = built.groups;
  server = built.app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;

  const ana = await createUser('Ana Souza');          // criadora
  const bruno = await createUser('Bruno Lima');        // membro
  const carla = await createUser('Carla Mendes', { language: 'es' }); // pede para entrar
  const davi = await createUser('Davi Rocha');         // estranho
  const elisa = await createUser('Elisa Prado');       // moderadora
  const fabio = await createUser('Fábio Nunes');       // será silenciado/bloqueado

  console.log('\nMigração e compatibilidade');
  await test('migração é idempotente (correr de novo não falha nem duplica)', async () => {
    const before = (await db.query('SELECT COUNT(*)::int c FROM group_posts')).rows[0].c;
    // nova instância do módulo para forçar outra execução
    delete require.cache[require.resolve('../src/db/groupsSchema')];
    await require('../src/db/groupsSchema').ensureGroupsSchema((sql) => db.query(sql));
    const after = (await db.query('SELECT COUNT(*)::int c FROM group_posts')).rows[0].c;
    assert.equal(after, before);
  });
  await test('grupos antigos recebem visibilidade correta (private→private, sem valor→public)', async () => {
    const rows = (await db.query('SELECT id, visibility FROM groups')).rows;
    assert.equal(rows.find((r) => r.id === lg.id).visibility, 'private');
    assert.equal(rows.find((r) => r.id === lg2.id).visibility, 'public');
  });
  await test('gosto antigo vira reação Amém e pedido antigo vira publicação de oração respondida', async () => {
    const r = await api(legacyFan, 'GET', `/${lg.id}/posts`);
    assert.equal(r.status, 200);
    const old = r.data.posts.find((p) => p.id === lpost.id);
    assert.equal(old.reactions.amen, 1); assert.equal(old.my_reaction, 'amen'); assert.equal(old.like_count, 1);
    const pr = r.data.posts.find((p) => p.legacy_prayer_id === lprayer.id || (p.post_type === 'prayer' && p.content.includes('minha mãe')));
    assert.ok(pr); assert.ok(pr.answered_at);
  });
  await test('rota antiga /tools continua a devolver orações e eventos', async () => {
    const r = await api(legacyFan, 'GET', `/${lg.id}/tools`);
    assert.equal(r.status, 200); assert.ok(r.data.prayers.length >= 1); assert.ok(Array.isArray(r.data.events));
  });

  console.log('\nCriar e descobrir');
  let pub; let priv; let hidden;
  await test('criar grupo público (JSON antigo com privacy)', async () => {
    const r = await api(ana, 'POST', '/', { name: 'Jovens em Cristo', description: 'Jovens <b>adorando</b>', privacy: 'public', category: 'youth', rules: ['Respeito', 'Sem spam'] });
    assert.equal(r.status, 201); pub = r.data.group;
    assert.equal(pub.visibility, 'public'); assert.equal(pub.member_role, 'admin');
    assert.equal(pub.description, 'Jovens adorando', 'HTML removido');
    assert.deepEqual(pub.rules_list, ['Respeito', 'Sem spam']);
  });
  await test('criar grupo privado com perguntas e capa (multipart)', async () => {
    const form = new FormData();
    form.append('name', 'Mulheres de Oração'); form.append('visibility', 'private'); form.append('category', 'women');
    form.append('questions', JSON.stringify(['Qual é a sua igreja?', 'Porque quer entrar?']));
    form.append('rules', JSON.stringify(['Confidencialidade']));
    form.append('cover', new Blob([Buffer.from('fakeimage')], { type: 'image/jpeg' }), 'capa.jpg');
    const r = await api(ana, 'POST', '/', undefined, { form });
    assert.equal(r.status, 201); priv = r.data.group;
    assert.equal(priv.visibility, 'private'); assert.equal(priv.privacy, 'private');
    assert.equal(priv.membership_questions.length, 2);
    assert.match(priv.cover_url, /cloudinary\.test/);
    assert.equal(uploads.length, 1);
  });
  await test('criar grupo oculto (funciona mesmo com o CHECK antigo de privacy)', async () => {
    const r = await api(ana, 'POST', '/', { name: 'Liderança Secreta', visibility: 'hidden' });
    assert.equal(r.status, 201); hidden = r.data.group;
    assert.equal(hidden.visibility, 'hidden'); assert.equal(hidden.privacy, 'private'); assert.ok(hidden.invite_code);
  });
  await test('validação: nome curto e privacidade inválida', async () => {
    assert.equal((await api(ana, 'POST', '/', { name: 'ab' })).status, 400);
    assert.equal((await api(ana, 'POST', '/', { name: 'Grupo X', visibility: 'secret' })).status, 400);
  });
  await test('lista/pesquisa exclui grupo oculto para quem não é membro', async () => {
    const r = await api(davi, 'GET', '/');
    const ids = r.data.groups.map((g) => g.id);
    assert.ok(ids.includes(pub.id)); assert.ok(ids.includes(priv.id)); assert.ok(!ids.includes(hidden.id));
    const s = await api(davi, 'GET', '/?q=Secreta');
    assert.equal(s.data.groups.length, 0);
    const mine = await api(ana, 'GET', '/?q=Secreta');
    assert.equal(mine.data.groups.length, 1, 'o membro vê o seu grupo oculto');
  });
  await test('pesquisa por texto e por categoria; sugeridos não incluem os meus', async () => {
    const r = await api(davi, 'GET', '/?q=jovens');
    assert.deepEqual(r.data.groups.map((g) => g.id), [pub.id]);
    const c = await api(davi, 'GET', '/?category=women');
    assert.deepEqual(c.data.groups.map((g) => g.id), [priv.id]);
    const a = await api(ana, 'GET', '/');
    assert.ok(a.data.suggested.every((g) => !g.is_member));
  });
  await test('grupo oculto: 404 sem convite, "Sobre" com convite válido', async () => {
    assert.equal((await api(davi, 'GET', `/${hidden.id}`)).status, 404);
    assert.equal((await api(davi, 'GET', `/${hidden.id}?invite=errado`)).status, 404);
    const ok = await api(davi, 'GET', `/${hidden.id}?invite=${hidden.invite_code}`);
    assert.equal(ok.status, 403); assert.equal(ok.data.group.name, 'Liderança Secreta'); assert.equal(ok.data.invite_valid, true);
    assert.equal((await api(davi, 'POST', `/${hidden.id}/join`, {})).status, 404);
    const j = await api(davi, 'POST', `/${hidden.id}/join`, { invite: hidden.invite_code });
    assert.equal(j.status, 200); assert.equal(j.data.joined, true);
  });

  console.log('\nEntrar, pedidos e permissões');
  await test('entrar num grupo público', async () => {
    for (const u of [bruno, elisa, fabio]) assert.equal((await api(u, 'POST', `/${pub.id}/join`)).data.joined, true);
  });
  await test('privado: não-membro só vê "Sobre" (403) e não acede a posts/membros/fotos/eventos', async () => {
    const d = await api(carla, 'GET', `/${priv.id}`);
    assert.equal(d.status, 403); assert.equal(d.data.group.membership_questions.length, 2);
    for (const p of ['/posts', '/members', '/photos', '/events']) assert.equal((await api(carla, 'GET', `/${priv.id}${p}`)).status, 403, p);
    assert.equal((await api(carla, 'POST', `/${priv.id}/posts`, { content: 'oi' })).status, 403);
  });
  await test('pedido com respostas → admins notificados → aprovar → pessoa notificada', async () => {
    clearNotes();
    // Elisa entra como moderadora do privado
    await db.query("INSERT INTO group_members (group_id,user_id,role) VALUES ($1,$2,'moderator')", [priv.id, elisa.id]);
    const r = await api(carla, 'POST', `/${priv.id}/join`, { answers: ['Igreja Batista Central', 'Quero orar <script>x</script>com irmãs'] });
    assert.equal(r.status, 202); assert.equal(r.data.requested, true);
    await flush();
    assert.equal(notesFor(ana, 'group_join_request').length, 1);
    assert.equal(notesFor(elisa, 'group_join_request').length, 1);
    assert.equal(notesFor(carla).length, 0, 'quem pede não é notificado');
    const list = await api(ana, 'GET', `/${priv.id}/requests`);
    assert.equal(list.data.requests[0].answers[0].answer, 'Igreja Batista Central');
    assert.equal(list.data.requests[0].answers[1].answer, 'Quero orar xcom irmãs');
    assert.equal(list.data.requests[0].answers[1].question, 'Porque quer entrar?');
    assert.equal((await api(bruno, 'POST', `/${priv.id}/requests/${carla.id}`, { action: 'approve' })).status, 403, 'não-gestor não aprova');
    assert.equal((await api(elisa, 'POST', `/${priv.id}/requests/${carla.id}`, { action: 'approve' })).status, 200);
    await flush();
    const n = notesFor(carla, 'group_approved');
    assert.equal(n.length, 1); assert.match(n[0].title, /Bienvenido/, 'notificação na língua de quem recebe');
    assert.equal((await api(carla, 'GET', `/${priv.id}/posts`)).status, 200);
  });
  await test('cancelar pedido pendente', async () => {
    assert.equal((await api(davi, 'POST', `/${priv.id}/join`, {})).status, 202);
    assert.equal((await api(davi, 'GET', `/${priv.id}`)).data.group.request_pending, true);
    await api(davi, 'DELETE', `/${priv.id}/join`);
    assert.equal((await api(davi, 'GET', `/${priv.id}`)).data.group.request_pending, false);
  });
  await test('membro comum não pode moderar (pin, apagar post de outro, remover, silenciar, definições, estatísticas)', async () => {
    const p = await api(ana, 'POST', `/${pub.id}/posts`, { content: 'Post da Ana' });
    const id = p.data.post.id;
    assert.equal((await api(bruno, 'PATCH', `/${pub.id}/posts/${id}/moderation`, { is_pinned: true })).status, 403);
    assert.equal((await api(bruno, 'DELETE', `/${pub.id}/posts/${id}`)).status, 403);
    assert.equal((await api(bruno, 'DELETE', `/${pub.id}/members/${fabio.id}`)).status, 403);
    assert.equal((await api(bruno, 'POST', `/${pub.id}/members/${fabio.id}/mute`, { days: 3 })).status, 403);
    assert.equal((await api(bruno, 'PATCH', `/${pub.id}/settings`, { name: 'Hack' })).status, 403);
    assert.equal((await api(bruno, 'GET', `/${pub.id}/insights`)).status, 403);
    assert.equal((await api(bruno, 'GET', `/${pub.id}/pending-posts`)).status, 403);
    assert.equal((await api(bruno, 'PATCH', `/${pub.id}/members/${fabio.id}/role`, { role: 'admin' })).status, 403);
    assert.equal((await api(bruno, 'DELETE', `/${pub.id}`)).status, 403);
  });
  await test('IDs inválidos dão 404 (não 500)', async () => {
    assert.equal((await api(ana, 'GET', '/nao-e-uuid')).status, 404);
    assert.equal((await api(ana, 'GET', `/${pub.id}/posts/xyz/comments`)).status, 404);
  });

  console.log('\nFunções');
  await test('admin promove moderador; moderador não promove; criador não pode ser despromovido', async () => {
    assert.equal((await api(ana, 'PATCH', `/${pub.id}/members/${elisa.id}/role`, { role: 'moderator' })).data.role, 'moderator');
    assert.equal((await api(elisa, 'PATCH', `/${pub.id}/members/${bruno.id}/role`, { role: 'moderator' })).status, 403);
    assert.equal((await api(ana, 'PATCH', `/${pub.id}/members/${ana.id}/role`, { role: 'member' })).status, 400);
    assert.equal((await api(ana, 'PATCH', `/${pub.id}/members/${bruno.id}/role`, { role: 'owner' })).status, 400);
    const m = await api(bruno, 'GET', `/${pub.id}/members`);
    assert.equal(m.data.admins.length, 1); assert.equal(m.data.moderators.length, 1); assert.equal(m.data.members.length, 2);
    const s = await api(bruno, 'GET', `/${pub.id}/members?q=fáb`);
    assert.equal(s.data.members.length, 1);
  });
  await test('admin promovido a admin não pode despromover o outro admin (só o criador)', async () => {
    assert.equal((await api(ana, 'PATCH', `/${pub.id}/members/${bruno.id}/role`, { role: 'admin' })).data.role, 'admin');
    assert.equal((await api(bruno, 'PATCH', `/${pub.id}/members/${elisa.id}/role`, { role: 'member' })).status, 200, 'admin mexe em moderador');
    await api(bruno, 'PATCH', `/${pub.id}/members/${elisa.id}/role`, { role: 'moderator' });
    const other = await createUser('Gabriel Alves');
    await api(other, 'POST', `/${pub.id}/join`);
    await api(ana, 'PATCH', `/${pub.id}/members/${other.id}/role`, { role: 'admin' });
    assert.equal((await api(bruno, 'PATCH', `/${pub.id}/members/${other.id}/role`, { role: 'member' })).status, 403);
    assert.equal((await api(ana, 'PATCH', `/${pub.id}/members/${other.id}/role`, { role: 'member' })).status, 200);
    assert.equal((await api(ana, 'PATCH', `/${pub.id}/members/${bruno.id}/role`, { role: 'member' })).data.role, 'member');
  });

  console.log('\nPublicações');
  let textPost; let pollPost; let prayerPost; let photoPost;
  await test('publicar texto → notifica membros com "Todas", não o autor', async () => {
    clearNotes();
    await api(fabio, 'PATCH', `/${pub.id}/notifications`, { level: 'off' });
    await api(elisa, 'PATCH', `/${pub.id}/notifications`, { level: 'highlights' });
    const r = await api(bruno, 'POST', `/${pub.id}/posts`, { content: 'Bom dia, família! Salmo 23 🙏' });
    assert.equal(r.status, 201); textPost = r.data.post;
    assert.equal(textPost.post_type, 'text');
    await flush();
    assert.equal(notesFor(ana, 'group_post').length, 1);
    assert.equal(notesFor(bruno).length, 0, 'autor não é notificado');
    assert.equal(notesFor(fabio).length, 0, 'Desligado');
    assert.equal(notesFor(elisa).length, 0, 'Destaques não recebe post normal');
    assert.equal(notesFor(ana)[0].data.url, `/grupos/${pub.id}?post=${textPost.id}`);
  });
  await test('anúncio de admin → membros com "Destaques" também recebem', async () => {
    clearNotes();
    const r = await api(ana, 'POST', `/${pub.id}/posts`, { content: 'Culto de jovens sábado!', is_announcement: true });
    assert.equal(r.data.post.is_announcement, true);
    await flush();
    assert.equal(notesFor(elisa, 'group_announcement').length, 1);
    assert.equal(notesFor(fabio).length, 0);
    const m = await api(bruno, 'POST', `/${pub.id}/posts`, { content: 'tentando anunciar', is_announcement: true });
    assert.equal(m.data.post.is_announcement, false, 'membro não cria anúncio');
  });
  await test('publicar com fotos (multipart, várias)', async () => {
    const form = new FormData();
    form.append('content', 'Fotos do retiro');
    form.append('photos', new Blob([Buffer.from('a')], { type: 'image/jpeg' }), '1.jpg');
    form.append('photos', new Blob([Buffer.from('b')], { type: 'image/png' }), '2.png');
    const r = await api(bruno, 'POST', `/${pub.id}/posts`, undefined, { form });
    assert.equal(r.status, 201); photoPost = r.data.post;
    assert.equal(photoPost.media_urls.length, 2); assert.equal(photoPost.media_url, photoPost.media_urls[0]);
    const f = await api(davi, 'GET', `/${pub.id}/photos`);
    assert.equal(f.status, 200, 'grupo público: fotos visíveis'); assert.equal(f.data.photos.length, 2);
  });
  await test('publicação vazia e enquete inválida são recusadas', async () => {
    assert.equal((await api(bruno, 'POST', `/${pub.id}/posts`, { content: '   ' })).status, 400);
    assert.equal((await api(bruno, 'POST', `/${pub.id}/posts`, { content: 'Qual?', post_type: 'poll', poll_options: ['Só uma'] })).status, 400);
    assert.equal((await api(bruno, 'POST', `/${pub.id}/posts`, { content: 'Qual?', post_type: 'poll', poll_options: ['A', 'a'] })).status, 400);
    assert.equal((await api(bruno, 'POST', `/${pub.id}/posts`, { content: 'Qual?', post_type: 'poll', poll_options: ['1', '2', '3', '4', '5', '6', '7'] })).status, 400);
  });
  await test('enquete: votar, mudar voto, contagens', async () => {
    const r = await api(ana, 'POST', `/${pub.id}/posts`, { content: 'Que dia para o estudo bíblico?', post_type: 'poll', poll_options: ['Terça', 'Quinta', 'Sábado'] });
    assert.equal(r.status, 201); pollPost = r.data.post;
    assert.equal(pollPost.poll.options.length, 3);
    const [o1, o2] = pollPost.poll.options;
    let v = await api(bruno, 'POST', `/${pub.id}/posts/${pollPost.id}/vote`, { option_id: o1.id });
    assert.equal(v.data.poll.total, 1); assert.equal(v.data.poll.my_vote, o1.id);
    await api(elisa, 'POST', `/${pub.id}/posts/${pollPost.id}/vote`, { option_id: o1.id });
    v = await api(bruno, 'POST', `/${pub.id}/posts/${pollPost.id}/vote`, { option_id: o2.id });
    assert.equal(v.data.poll.total, 2);
    assert.equal(v.data.poll.options.find((o) => o.id === o1.id).votes, 1);
    assert.equal(v.data.poll.options.find((o) => o.id === o2.id).votes, 1);
    assert.equal((await api(bruno, 'POST', `/${pub.id}/posts/${pollPost.id}/vote`, { option_id: textPost.id })).status, 400);
    assert.equal((await api(davi, 'POST', `/${pub.id}/posts/${pollPost.id}/vote`, { option_id: o1.id })).status, 403, 'não-membro não vota');
  });
  await test('reações: uma por pessoa, trocar, tirar, contagens e quem reagiu', async () => {
    let r = await api(ana, 'POST', `/${pub.id}/posts/${textPost.id}/react`, { reaction: 'amen' });
    assert.equal(r.data.my_reaction, 'amen');
    r = await api(ana, 'POST', `/${pub.id}/posts/${textPost.id}/react`, { reaction: 'love' });
    assert.deepEqual(r.data.reactions, { love: 1 });
    await api(elisa, 'POST', `/${pub.id}/posts/${textPost.id}/react`, { reaction: 'praise' });
    r = await api(carla, 'POST', `/${pub.id}/posts/${textPost.id}/react`, { reaction: 'sad' });
    assert.equal(r.status, 403, 'Carla não é membro do público');
    r = await api(bruno, 'POST', `/${pub.id}/posts/${textPost.id}/react`, { reaction: 'sad' });
    assert.equal(r.data.reaction_count, 3);
    r = await api(bruno, 'POST', `/${pub.id}/posts/${textPost.id}/react`, { reaction: null });
    assert.equal(r.data.reaction_count, 2); assert.equal(r.data.my_reaction, null);
    assert.equal((await api(bruno, 'POST', `/${pub.id}/posts/${textPost.id}/react`, { reaction: 'angry' })).status, 400);
    const who = await api(bruno, 'GET', `/${pub.id}/posts/${textPost.id}/reactions`);
    assert.deepEqual(who.data.reactions.map((x) => x.full_name).sort(), ['Ana Souza', 'Elisa Prado']);
    const legacy = await api(bruno, 'POST', `/${pub.id}/posts/${textPost.id}/like`);
    assert.equal(legacy.data.liked, true); assert.equal(legacy.data.like_count, 3);
  });
  await test('comentários + respostas (um nível) + notificações ao autor e a quem foi respondido', async () => {
    clearNotes();
    const c1 = await api(ana, 'POST', `/${pub.id}/posts/${textPost.id}/comments`, { content: 'Amém, Bruno!' });
    assert.equal(c1.status, 201);
    await flush();
    assert.equal(notesFor(bruno, 'group_comment').length, 1);
    clearNotes();
    const r1 = await api(elisa, 'POST', `/${pub.id}/posts/${textPost.id}/comments`, { content: 'Concordo, Ana', parent_id: c1.data.comment.id });
    assert.equal(r1.data.comment.parent_id, c1.data.comment.id);
    const r2 = await api(bruno, 'POST', `/${pub.id}/posts/${textPost.id}/comments`, { content: 'Obrigado Elisa', parent_id: r1.data.comment.id });
    assert.equal(r2.data.comment.parent_id, c1.data.comment.id, 'resposta a resposta fica no mesmo fio');
    await flush();
    assert.equal(notesFor(ana, 'group_reply').length, 1, 'Ana: respondeu ao comentário dela');
    assert.equal(notesFor(bruno, 'group_comment').length, 1, 'Bruno: comentário no post dele');
    assert.equal(notesFor(elisa, 'group_reply').length, 1, 'Elisa: Bruno respondeu-lhe');
    assert.equal(notesFor(bruno, 'group_reply').length, 0, 'Bruno não se notifica a si próprio');
    const list = await api(davi, 'GET', `/${pub.id}/posts/${textPost.id}/comments`);
    assert.equal(list.data.comments.length, 3);
  });
  await test('editar/apagar comentários: só o autor edita; gestor apaga qualquer um', async () => {
    const c = await api(bruno, 'POST', `/${pub.id}/posts/${textPost.id}/comments`, { content: 'erro de digitação' });
    const id = c.data.comment.id;
    assert.equal((await api(elisa, 'PATCH', `/${pub.id}/comments/${id}`, { content: 'x' })).status, 403);
    const e = await api(bruno, 'PATCH', `/${pub.id}/comments/${id}`, { content: 'corrigido' });
    assert.equal(e.data.comment.content, 'corrigido'); assert.ok(e.data.comment.edited_at);
    assert.equal((await api(fabio, 'DELETE', `/${pub.id}/comments/${id}`)).status, 403);
    assert.equal((await api(elisa, 'DELETE', `/${pub.id}/comments/${id}`)).status, 200, 'moderadora apaga');
  });
  await test('editar/apagar publicação: autor edita, gestor apaga', async () => {
    const p = await api(fabio, 'POST', `/${pub.id}/posts`, { content: 'texto original' });
    const id = p.data.post.id;
    assert.equal((await api(ana, 'PATCH', `/${pub.id}/posts/${id}`, { content: 'admin não edita' })).status, 403);
    const e = await api(fabio, 'PATCH', `/${pub.id}/posts/${id}`, { content: 'texto editado' });
    assert.equal(e.data.post.content, 'texto editado'); assert.ok(e.data.post.edited_at);
    assert.equal((await api(elisa, 'DELETE', `/${pub.id}/posts/${id}`)).status, 200);
    assert.equal((await api(ana, 'GET', `/${pub.id}/posts/${id}`)).status, 404);
  });
  await test('fixar (Destaques no topo) e notificar quem escolheu Destaques', async () => {
    clearNotes();
    const r = await api(elisa, 'PATCH', `/${pub.id}/posts/${pollPost.id}/moderation`, { is_pinned: true });
    assert.equal(r.data.post.is_pinned, true);
    await flush();
    assert.equal(notesFor(elisa).length, 0, 'quem fixa não é notificado');
    const feed = await api(bruno, 'GET', `/${pub.id}/posts`);
    assert.equal(feed.data.pinned[0].id, pollPost.id);
    assert.ok(!feed.data.posts.some((p) => p.id === pollPost.id), 'não aparece duplicado');
  });
  await test('desligar comentários: membros não comentam, gestor sim; autor pode desligar no seu', async () => {
    await api(ana, 'PATCH', `/${pub.id}/posts/${textPost.id}/moderation`, { comments_off: true });
    assert.equal((await api(fabio, 'POST', `/${pub.id}/posts/${textPost.id}/comments`, { content: 'oi' })).status, 403);
    assert.equal((await api(elisa, 'POST', `/${pub.id}/posts/${textPost.id}/comments`, { content: 'nota da moderação' })).status, 201);
    assert.equal((await api(bruno, 'PATCH', `/${pub.id}/posts/${textPost.id}/moderation`, { comments_off: false })).status, 200, 'autor');
    assert.equal((await api(fabio, 'PATCH', `/${pub.id}/posts/${photoPost.id}/moderation`, { comments_off: true })).status, 403);
  });
  await test('paginação com cursor ("carregar mais")', async () => {
    for (let i = 0; i < 5; i += 1) await db.query("INSERT INTO group_posts (group_id,author_id,content,created_at) VALUES ($1,$2,$3,NOW() - ($4 || ' days')::interval)", [pub.id, ana.id, `antigo ${i}`, String(10 + i)]);
    const p1 = await api(bruno, 'GET', `/${pub.id}/posts?limit=4`);
    assert.equal(p1.data.posts.length, 4); assert.ok(p1.data.next_cursor);
    const p2 = await api(bruno, 'GET', `/${pub.id}/posts?limit=4&cursor=${encodeURIComponent(p1.data.next_cursor)}`);
    const ids1 = new Set(p1.data.posts.map((p) => p.id));
    assert.ok(p2.data.posts.every((p) => !ids1.has(p.id)));
    assert.equal(p2.data.pinned.length, 0, 'destaques só na 1.ª página');
    assert.equal((await api(bruno, 'GET', `/${pub.id}/posts?cursor=lixo`)).status, 400);
  });
  await test('denunciar publicação/comentário → fila do grupo para gestores', async () => {
    assert.equal((await api(fabio, 'POST', `/${pub.id}/reports`, { post_id: textPost.id, reason: 'spam' })).status, 201);
    await api(fabio, 'POST', `/${pub.id}/reports`, { post_id: textPost.id, reason: 'spam' });
    assert.equal((await api(fabio, 'POST', `/${pub.id}/reports`, { post_id: textPost.id, reason: 'nada' })).status, 400);
    const q = await api(elisa, 'GET', `/${pub.id}/reports`);
    assert.equal(q.data.reports.length, 1, 'denúncia repetida não duplica');
    assert.equal(q.data.reports[0].content, 'Bom dia, família! Salmo 23 🙏');
    assert.equal((await api(bruno, 'GET', `/${pub.id}/reports`)).status, 403);
    assert.equal((await api(elisa, 'PATCH', `/${pub.id}/reports/${q.data.reports[0].id}`, { status: 'dismissed' })).status, 200);
    assert.equal((await api(elisa, 'GET', `/${pub.id}/reports`)).data.reports.length, 0);
  });
  await test('limite de publicações por pessoa (429)', async () => {
    const prev = process.env.GROUPS_POST_LIMIT; process.env.GROUPS_POST_LIMIT = '2';
    const u = await createUser('Pressa Silva');
    await api(u, 'POST', `/${pub.id}/join`);
    assert.equal((await api(u, 'POST', `/${pub.id}/posts`, { content: '1' })).status, 201);
    assert.equal((await api(u, 'POST', `/${pub.id}/posts`, { content: '2' })).status, 201);
    assert.equal((await api(u, 'POST', `/${pub.id}/posts`, { content: '3' })).status, 429);
    process.env.GROUPS_POST_LIMIT = prev || '';
    if (!prev) delete process.env.GROUPS_POST_LIMIT;
  });

  console.log('\nOrações');
  await test('pedido de oração, "Orei" uma vez por pessoa, respondida com testemunho', async () => {
    clearNotes();
    const r = await api(carla, 'POST', `/${priv.id}/posts`, { content: 'Orem pela cirurgia do meu pai', post_type: 'prayer' });
    assert.equal(r.status, 201); prayerPost = r.data.post;
    await flush();
    assert.equal(notesFor(ana, 'group_prayer_post').length, 1);
    let p = await api(ana, 'POST', `/${priv.id}/posts/${prayerPost.id}/pray`);
    assert.equal(p.data.prayed_count, 1);
    p = await api(ana, 'POST', `/${priv.id}/posts/${prayerPost.id}/pray`);
    assert.equal(p.data.prayed_count, 1); assert.equal(p.data.already, true);
    await api(elisa, 'POST', `/${priv.id}/posts/${prayerPost.id}/pray`);
    assert.equal((await api(ana, 'POST', `/${priv.id}/posts/${textPost.id}/pray`)).status, 404);
    const other = await createUser('Helena Costa');
    await db.query('INSERT INTO group_members (group_id,user_id) VALUES ($1,$2)', [priv.id, other.id]);
    assert.equal((await api(other, 'POST', `/${priv.id}/posts/${prayerPost.id}/answered`, {})).status, 403);
    const a = await api(carla, 'POST', `/${priv.id}/posts/${prayerPost.id}/answered`, { testimony: 'A cirurgia correu bem! Glória a Deus' });
    assert.ok(a.data.post.answered_at); assert.equal(a.data.post.testimony, 'A cirurgia correu bem! Glória a Deus');
    const list = await api(elisa, 'GET', `/${priv.id}/posts?type=prayer`);
    assert.equal(list.data.posts[0].prayed_count, 2);
    assert.equal((await api(elisa, 'GET', `/${priv.id}/posts?type=prayer&answered=false`)).data.posts.length, 0);
  });
  await test('rota antiga POST /prayers cria uma publicação de oração', async () => {
    const r = await api(bruno, 'POST', `/${pub.id}/prayers`, { content: 'Pela minha família' });
    assert.equal(r.status, 201); assert.equal(r.data.prayer.post_type, 'prayer');
  });

  console.log('\nEventos');
  let ev;
  await test('criar evento, validar link, RSVP Vou/Talvez/Não vou e contagens', async () => {
    clearNotes();
    const startsAt = new Date(Date.now() + 3 * 24 * 3600e3).toISOString();
    assert.equal((await api(bruno, 'POST', `/${pub.id}/events`, { title: 'Vigília', starts_at: startsAt, online_url: 'javascript:alert(1)' })).status, 400);
    assert.equal((await api(bruno, 'POST', `/${pub.id}/events`, { title: 'Vigília', starts_at: '2001-01-01T10:00:00Z' })).status, 400);
    const r = await api(bruno, 'POST', `/${pub.id}/events`, { title: 'Vigília de oração', description: 'Traga sua Bíblia', starts_at: startsAt, location: 'Igreja Central', online_url: 'https://meet.example.com/vigilia' });
    assert.equal(r.status, 201); ev = r.data.event;
    await flush();
    assert.equal(notesFor(ana, 'group_event_new').length, 1);
    assert.equal(notesFor(bruno).length, 0);
    await api(ana, 'POST', `/${pub.id}/events/${ev.id}/rsvp`, { status: 'going' });
    await api(elisa, 'POST', `/${pub.id}/events/${ev.id}/rsvp`, { status: 'maybe' });
    let x = await api(fabio, 'POST', `/${pub.id}/events/${ev.id}/rsvp`, { status: 'declined' });
    assert.equal(x.data.event.going_count, 2); assert.equal(x.data.event.maybe_count, 1); assert.equal(x.data.event.declined_count, 1);
    x = await api(fabio, 'POST', `/${pub.id}/events/${ev.id}/rsvp`, { status: 'going' });
    assert.equal(x.data.event.going_count, 3); assert.equal(x.data.event.my_rsvp, 'going');
    assert.equal((await api(fabio, 'POST', `/${pub.id}/events/${ev.id}/rsvp`, { status: 'sim' })).status, 400);
    const list = await api(davi, 'GET', `/${pub.id}/events`);
    assert.equal(list.data.upcoming.length, 1); assert.equal(list.data.past.length, 0);
  });
  await test('eventos passados ficam em "past"', async () => {
    await db.query("INSERT INTO group_events (group_id,creator_id,title,starts_at) VALUES ($1,$2,'Retiro 2025', NOW() - INTERVAL '30 days')", [pub.id, ana.id]);
    const list = await api(bruno, 'GET', `/${pub.id}/events`);
    assert.equal(list.data.past.length, 1);
  });
  await test('lembrete ~1h antes para Vou/Talvez, uma única vez (idempotente)', async () => {
    clearNotes();
    await db.query("UPDATE group_events SET starts_at = NOW() + INTERVAL '50 minutes' WHERE id=$1", [ev.id]);
    await api(fabio, 'POST', `/${pub.id}/events/${ev.id}/rsvp`, { status: 'declined' });
    assert.equal(await groupsRouter.runEventReminders(), 1);
    assert.equal(await groupsRouter.runEventReminders(), 0, 'segunda corrida não reenvia');
    const got = notifications.filter((n) => n.data.kind === 'group_event_reminder').map((n) => n.userId).sort();
    assert.deepEqual(got, [ana.id, bruno.id, elisa.id].map(String).sort());
  });
  await test('só o criador do evento ou gestor apaga o evento', async () => {
    assert.equal((await api(fabio, 'DELETE', `/${pub.id}/events/${ev.id}`)).status, 403);
    assert.equal((await api(elisa, 'DELETE', `/${pub.id}/events/${ev.id}`)).status, 200);
  });

  console.log('\nModeração de membros');
  await test('silenciar: não publica nem comenta; tirar silêncio volta a permitir', async () => {
    assert.equal((await api(elisa, 'POST', `/${pub.id}/members/${fabio.id}/mute`, { days: 3 })).status, 200);
    const p = await api(fabio, 'POST', `/${pub.id}/posts`, { content: 'oi' });
    assert.equal(p.status, 403); assert.equal(p.data.code, 'muted');
    assert.equal((await api(fabio, 'POST', `/${pub.id}/posts/${photoPost.id}/comments`, { content: 'oi' })).status, 403);
    assert.equal((await api(elisa, 'POST', `/${pub.id}/members/${fabio.id}/mute`, { days: 99 })).status, 400);
    const m = await api(ana, 'GET', `/${pub.id}/members`);
    assert.ok(m.data.members.find((x) => x.id === fabio.id).muted_until);
    await api(ana, 'POST', `/${pub.id}/members/${fabio.id}/mute`, { days: 0 });
    assert.equal((await api(fabio, 'POST', `/${pub.id}/posts/${photoPost.id}/comments`, { content: 'voltei' })).status, 201);
  });
  await test('moderador não remove admin; ninguém remove o criador', async () => {
    assert.equal((await api(elisa, 'DELETE', `/${pub.id}/members/${ana.id}`)).status, 403);
    await api(ana, 'PATCH', `/${pub.id}/members/${bruno.id}/role`, { role: 'admin' });
    assert.equal((await api(bruno, 'DELETE', `/${pub.id}/members/${ana.id}`)).status, 403);
    await api(ana, 'PATCH', `/${pub.id}/members/${bruno.id}/role`, { role: 'member' });
  });
  await test('remover e bloquear: não volta a entrar; desbloquear permite', async () => {
    assert.equal((await api(elisa, 'DELETE', `/${pub.id}/members/${fabio.id}?block=true`)).data.blocked, true);
    const j = await api(fabio, 'POST', `/${pub.id}/join`);
    assert.equal(j.status, 403); assert.equal(j.data.code, 'blocked');
    assert.equal((await api(fabio, 'POST', `/${pub.id}/posts`, { content: 'oi' })).status, 403);
    const bans = await api(ana, 'GET', `/${pub.id}/bans`);
    assert.equal(bans.data.bans[0].user_id, fabio.id);
    await api(ana, 'DELETE', `/${pub.id}/bans/${fabio.id}`);
    assert.equal((await api(fabio, 'POST', `/${pub.id}/join`)).data.joined, true);
  });
  await test('remover sem bloquear permite voltar', async () => {
    await api(ana, 'DELETE', `/${pub.id}/members/${fabio.id}`);
    assert.equal((await api(fabio, 'POST', `/${pub.id}/join`)).data.joined, true);
  });
  await test('bloquear quem tem pedido pendente remove o pedido; aprovar bloqueado é recusado', async () => {
    const u = await createUser('Igor Martins');
    await api(u, 'POST', `/${priv.id}/join`, { answers: ['a', 'b'] });
    await api(ana, 'DELETE', `/${priv.id}/members/${u.id}?block=1`);
    assert.equal((await api(ana, 'GET', `/${priv.id}/requests`)).data.requests.length, 0);
    assert.equal((await api(u, 'POST', `/${priv.id}/join`, {})).status, 403);
  });

  console.log('\nAprovação de publicações');
  await test('com "aprovar publicações": post de membro fica pendente, gestor aprova → publicado e notificado', async () => {
    assert.equal((await api(ana, 'PATCH', `/${priv.id}/settings`, { post_approval: true })).data.group.post_approval, true);
    clearNotes();
    const r = await api(carla, 'POST', `/${priv.id}/posts`, { content: 'Testemunho: Deus é fiel!' });
    assert.equal(r.status, 201); assert.equal(r.data.pending, true);
    await flush();
    assert.equal(notifications.filter((n) => n.data.kind === 'group_post').length, 0, 'pendente não notifica membros');
    let feed = await api(elisa, 'GET', `/${priv.id}/posts`);
    assert.ok(!feed.data.posts.some((p) => p.id === r.data.post.id));
    const mine = await api(carla, 'GET', `/${priv.id}/posts`);
    assert.equal(mine.data.my_pending, 1);
    const q = await api(elisa, 'GET', `/${priv.id}/pending-posts`);
    assert.equal(q.data.posts.length, 1);
    assert.equal((await api(elisa, 'POST', `/${priv.id}/pending-posts/${r.data.post.id}`, { action: 'approve' })).data.status, 'published');
    await flush();
    assert.equal(notesFor(carla, 'group_post_approved').length, 1);
    assert.equal(notesFor(ana, 'group_post').length, 1);
    feed = await api(elisa, 'GET', `/${priv.id}/posts`);
    assert.ok(feed.data.posts.some((p) => p.id === r.data.post.id));
    const admin = await api(ana, 'POST', `/${priv.id}/posts`, { content: 'Admin publica direto' });
    assert.equal(admin.data.pending, false);
    const d = await api(carla, 'POST', `/${priv.id}/posts`, { content: 'vai ser recusado' });
    assert.equal((await api(ana, 'POST', `/${priv.id}/pending-posts/${d.data.post.id}`, { action: 'decline' })).data.status, 'declined');
    assert.equal((await api(ana, 'GET', `/${priv.id}/pending-posts`)).data.posts.length, 0);
  });

  console.log('\nDefinições, convites e estatísticas');
  await test('editar definições (nome, descrição, categoria, privacidade, regras, perguntas, capa)', async () => {
    const form = new FormData();
    form.append('name', 'Mulheres de Fé e Oração'); form.append('description', 'Nova descrição'); form.append('category', 'prayer');
    form.append('visibility', 'public'); form.append('rules', JSON.stringify(['Amor', 'Respeito', 'Oração']));
    form.append('questions', JSON.stringify(['Qual é a sua igreja?']));
    form.append('cover', new Blob([Buffer.from('img')], { type: 'image/png' }), 'c.png');
    const r = await api(ana, 'PATCH', `/${priv.id}/settings`, undefined, { form });
    assert.equal(r.status, 200);
    const g = r.data.group;
    assert.equal(g.name, 'Mulheres de Fé e Oração'); assert.equal(g.visibility, 'public'); assert.equal(g.privacy, 'public');
    assert.deepEqual(g.rules_list, ['Amor', 'Respeito', 'Oração']); assert.equal(g.rules, 'Amor\nRespeito\nOração');
    assert.equal(g.membership_questions.length, 1); assert.match(g.cover_url, /cloudinary/);
    assert.equal((await api(elisa, 'PATCH', `/${priv.id}/settings`, { name: 'Moderadora não muda' })).status, 403, 'definições: só admins');
    const back = await api(ana, 'PATCH', `/${priv.id}/settings`, { visibility: 'private' });
    assert.equal(back.data.group.visibility, 'private');
    assert.equal((await api(ana, 'PATCH', `/${priv.id}/settings`, { privacy: 'public' })).data.group.visibility, 'public', 'campo antigo privacy');
    await api(ana, 'PATCH', `/${priv.id}/settings`, { visibility: 'private' });
  });
  await test('novo link de convite invalida o antigo', async () => {
    const old = hidden.invite_code;
    const r = await api(ana, 'POST', `/${hidden.id}/invite-code`);
    assert.notEqual(r.data.invite_code, old);
    const stranger = await createUser('Joana Reis');
    assert.equal((await api(stranger, 'GET', `/${hidden.id}?invite=${old}`)).status, 404);
    assert.equal((await api(stranger, 'GET', `/${hidden.id}?invite=${r.data.invite_code}`)).status, 403);
    assert.equal((await api(elisa, 'POST', `/${hidden.id}/invite-code`)).status, 404, 'não-membro do oculto');
  });
  await test('convidar amigos: só amigos aceites recebem notificação com link de convite', async () => {
    clearNotes();
    const friend = await createUser('Lucas Ferreira');
    const notFriend = await createUser('Marta Gomes');
    await db.query("INSERT INTO friendships (requester_id, addressee_id, status) VALUES ($1,$2,'accepted')", [friend.id, ana.id]);
    const r = await api(ana, 'POST', `/${hidden.id}/invite`, { user_ids: [friend.id, notFriend.id] });
    assert.equal(r.data.invited, 1);
    await flush();
    const n = notesFor(friend, 'group_invite');
    assert.equal(n.length, 1); assert.match(n[0].data.url, /convite=/);
    assert.equal(notesFor(notFriend).length, 0);
  });
  await test('definição de notificações inválida é recusada; não-membro não pode', async () => {
    assert.equal((await api(ana, 'PATCH', `/${pub.id}/notifications`, { level: 'loud' })).status, 400);
    assert.equal((await api(carla, 'PATCH', `/${pub.id}/notifications`, { level: 'off' })).status, 403);
  });
  await test('estatísticas: membros, novos, publicações e mais ativos', async () => {
    await db.query("UPDATE group_members SET joined_at = NOW() - INTERVAL '20 days' WHERE group_id=$1 AND user_id=$2", [pub.id, elisa.id]);
    const r = await api(elisa, 'GET', `/${pub.id}/insights`);
    assert.equal(r.status, 200);
    const k = r.data.insights;
    const total = (await db.query('SELECT COUNT(*)::int c FROM group_members WHERE group_id=$1', [pub.id])).rows[0].c;
    assert.equal(k.members_total, total);
    assert.equal(k.new_members_7d, total - 1); assert.equal(k.new_members_30d, total);
    assert.ok(k.posts_7d >= 5); assert.ok(k.posts_30d >= k.posts_7d);
    assert.ok(k.top_members.length >= 2); assert.ok(k.top_members[0].posts + k.top_members[0].comments > 0);
  });
  await test('detalhe do grupo para membro inclui contagens de admin e definição de notificações', async () => {
    const r = await api(ana, 'GET', `/${priv.id}`);
    assert.equal(r.status, 200); assert.equal(r.data.my_role, 'admin');
    assert.ok('pending_posts' in r.data.counts); assert.equal(r.data.group.my_notify_level, 'all');
    assert.ok(r.data.group.invite_code);
    const m = await api(carla, 'GET', `/${priv.id}`);
    assert.equal(m.data.counts.pending_posts, undefined, 'membro comum não vê contagens de admin');
  });

  console.log('\nApagar grupo');
  await test('apagar grupo: membro não; nome errado recusado; admin com nome certo apaga', async () => {
    assert.equal((await api(carla, 'DELETE', `/${priv.id}`, { confirm_name: 'Mulheres de Fé e Oração' })).status, 403);
    assert.equal((await api(ana, 'DELETE', `/${priv.id}`, { confirm_name: 'outro nome' })).status, 400);
    assert.equal((await api(ana, 'DELETE', `/${priv.id}`, { confirm_name: 'mulheres de fé e oração' })).status, 200);
    assert.equal((await api(ana, 'GET', `/${priv.id}`)).status, 404);
    assert.equal((await db.query('SELECT COUNT(*)::int c FROM group_posts WHERE group_id=$1', [priv.id])).rows[0].c, 0);
  });

  const failed = results.filter((r) => !r[0]);
  console.log(`\n${results.length - failed.length}/${results.length} testes passaram.`);
  if (failed.length) { failed.forEach((f) => console.log('FALHOU:', f[1], '\n', f[2].stack)); }
  server.close();
  await db.query('SELECT 1');
  process.exit(failed.length ? 1 : 0);
})().catch((error) => { console.error(error); process.exit(1); });
