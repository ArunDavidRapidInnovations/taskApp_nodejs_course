const express = require('express');
const router = new express.Router();
const chalk = require('chalk');
const User = require('../models/user.model');
const auth = require('../middleware/auth');

const multer = require('multer');

const sharp = require('sharp');

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

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|JPG)$/)) {
      return cb(new Error('File Must be a JPG Image'));
    }
    cb(undefined, true);
  },
});

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 300, height: 300 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ errorMessage: error.message });
  },
);

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
