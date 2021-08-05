const express = require('express');
const router = new express.Router();
const chalk = require('chalk');
const Task = require('../models/task.model');
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res) => {
  try {
    const newTask = await Task.create({ ...req.body, owner: req.user._id });
    res.status(201).send(newTask);
  } catch (error) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

// GET /tasks/?completed=Boolean&limit=5&skip=10&sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split('_');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  try {
    const tasksInSystem = await Task.find({
      owner: req.user._id,
      ...match,
    })
      .skip(parseInt(req.query.skip))
      .limit(parseInt(req.query.limit))
      .sort(sort);

    res.send(tasksInSystem);
  } catch (error) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send('There is no data with that ID  ');
    }
    res.send(task);
  } catch (error) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'complected'];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return res.status(400).send({ errorMessage: 'Invalid Updates' });
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send('There is no data with that ID  ');
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send('There is no data with that ID');
    }
    await task.remove();
    res.send(task);
  } catch (error) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

module.exports = router;
