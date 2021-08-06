const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);
afterAll(() => mongoose.disconnect());
test('Should Sign Up a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Arun David',
      email: 'davidreddy293@gmail.com',
      password: 'testPass',
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: 'Arun David',
      email: 'davidreddy293@gmail.com',
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe('testPass');
});

test('Should Not create New user if email is already taken.', async () => {
  await request(app).post('/users').send(userOne).expect(400);
});

test('Should Login Existing User', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(response.body).toMatchObject({
    token: user.tokens[1].token,
  });
});

test('Should not login Non Existing User', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'testoihsdf@asdf.sdf',
      password: userOne.password,
    })
    .expect(400);
});

test('Should Get User Profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not Get User Profile If user not authenticated', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should Delete User Profile', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user).toBeNull();
});

test('Should not Delete User Profile If user not authenticated', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('Should Upload Avatar Image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/image.png')
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update user data if authenticated', async () => {
  const newUserData = {
    name: 'Arun Dave',
    email: 'davidreddy@gmail.com',
    password: 'testPass123',
  };
  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send(newUserData)
    .expect(200);

  const user = await User.findById(userOne._id);

  delete newUserData.password;

  expect(user).toMatchObject({ ...newUserData });

  expect(user.password).not.toBe('testPass123');
});

test('Should Not update user Not authenticated', async () => {
  const newUserData = {
    name: 'Arun Dave',
    email: 'davidreddy@gmail.com',
    password: 'testPass123',
  };
  const response = await request(app)
    .patch('/users/me')
    .send(newUserData)
    .expect(401);
});

test('Should Not update user If you send bad update data', async () => {
  const newUserData = {
    location: 'Hyderabad',
  };
  const response = await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send(newUserData)
    .expect(400);
});
