const express = require('express');
const router = new express.Router();
const chalk = require('chalk');
const User = require('../models/user.model');
const auth = require('../middleware/auth');

router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token: token });
  } catch (error) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password,
    );
    const token = await user.generateAuthToken();
    res.send({ user, token: token });
  } catch (error) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(({ token }) => {
      return token !== req.token;
    });

    await req.user.save();
    res.send('Logged Out');
  } catch (e) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send('Logged Out Of all accounts');
  } catch (e) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return res.status(400).send({ errorMessage: 'Invalid Updates' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.send(req.user);
  } catch (error) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    console.log(chalk.red(error.message));
    res.status(400).send({ errorMessage: error.message });
  }
});

module.exports = router;
