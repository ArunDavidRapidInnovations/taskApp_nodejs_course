const request = require('supertest');
const app = require('../app');
const Task = require('../models/task.model');
const mongoose = require('mongoose');

const {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
} = require('./fixtures/db');

beforeEach(setupDatabase);
afterAll(() => mongoose.disconnect());

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'From my test',
    })
    .expect(200);
  const task = await Task.findById(response.body.data._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test('Should fetch user tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.data.length).toEqual(2);
});

test('Should not delete other users tasks', async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(400);
  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});
