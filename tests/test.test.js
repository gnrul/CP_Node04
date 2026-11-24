const request = require('supertest');
const app = require('../app');
const { signAccessToken, verifyAccessToken } = require('../src/utils/jwt');

const t = Date.now();
const mail1 = `a_${t}@mail.ru`;
const mail2 = `b_${t}@mail.ru`;
const pass = '123456';

let token1 = '';
let token2 = '';
let postId = 0;

test('jwt тест', () => {
  const tok = signAccessToken({ id: 5, role: 'USER' });
  const dec = verifyAccessToken(tok);
  expect(dec.id).toBe(5);
});

test('регистрация', async () => {
  const res = await request(app)
    .post('/auth/register')
    .send({ email: mail1, name: 'Антон', password: pass });
  expect(res.status).toBe(201);
});

test('дубль email при регистрации', async () => {
  const res = await request(app)
    .post('/auth/register')
    .send({ email: mail1, name: 'Антон', password: pass });
  expect(res.status).toBe(409);
});

test('логин ок', async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: mail1, password: pass });
  expect(res.status).toBe(200);
  token1 = res.body.accessToken;
});

test('логин неверный пароль', async () => {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: mail1, password: '000' });
  expect(res.status).toBe(401);
});

test('me без и с токеном', async () => {
  const r1 = await request(app).get('/auth/me');
  expect(r1.status).toBe(401);

  const r2 = await request(app)
    .get('/auth/me')
    .set('Authorization', `Bearer ${token1}`);
  expect(r2.status).toBe(200);
});

test('чужой не удалит пост (403)', async () => {
  const p = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token1}`)
    .send({ title: 'Тест', content: 'Текст', published: true });
  postId = p.body.id;

  await request(app)
    .post('/auth/register')
    .send({ email: mail2, name: 'Второй', password: pass });

  const l2 = await request(app)
    .post('/auth/login')
    .send({ email: mail2, password: pass });
  token2 = l2.body.accessToken;

  const del = await request(app)
    .delete(`/api/posts/${postId}`)
    .set('Authorization', `Bearer ${token2}`);
  expect(del.status).toBe(403);
});

test('свой пост удаляется', async () => {
  const del = await request(app)
    .delete(`/api/posts/${postId}`)
    .set('Authorization', `Bearer ${token1}`);
  expect(del.status).toBe(200);
});