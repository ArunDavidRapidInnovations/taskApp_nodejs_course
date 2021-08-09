const express = require('express');
const chalk = require('chalk');
const multer = require('multer');
const sharp = require('sharp');

const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const User = require('../models/user.model');
const auth = require('../middleware/auth');
const {
  sendWelcomeEmail,
  sendCancellationEmail,
} = require('../emails/account');

const router = new express.Router();
const catchAsync = require('../utils/catchAsync');

router.post(
  '/',
  catchAsync(async (req, res) => {
    try {
      const user = await User.create(req.body);
      sendWelcomeEmail(user.email, user.name);
      const token = await user.generateAuthToken();
      return { user, token: token };
    } catch (error) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

router.post(
  '/login',
  catchAsync(async (req, res) => {
    try {
      const user = await User.findByCredentials(
        req.body.email,
        req.body.password,
      );
      const token = await user.generateAuthToken();
      return { user, token: token };
    } catch (error) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

router.post(
  '/logout',
  auth,
  catchAsync(async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter(({ token }) => {
        return token !== req.token;
      });

      await req.user.save();
      return 'Logged Out';
    } catch (e) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

router.post(
  '/logoutAll',
  auth,
  catchAsync(async (req, res) => {
    try {
      req.user.tokens = [];

      await req.user.save();
      return 'Logged Out Of all accounts';
    } catch (e) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

router.get(
  '/me',
  auth,
  catchAsync(async (req, res) => {
    return req.user;
  }),
);

router.patch(
  '/me',
  auth,
  catchAsync(async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Update');
    }

    try {
      updates.forEach((update) => (req.user[update] = req.body[update]));

      await req.user.save();

      return req.user;
    } catch (error) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

router.delete(
  '/me',
  auth,
  catchAsync(async (req, res) => {
    try {
      await req.user.remove();
      sendCancellationEmail(req.user.email, req.user.name);

      return req.user;
    } catch (error) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

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
  '/me/avatar',
  auth,
  upload.single('avatar'),
  catchAsync(async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 300, height: 300 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    await req.user.save();
    return 'Saved';
  }),
  catchAsync(async (error, req, res, next) => {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }),
);

router.delete(
  '/me/avatar',
  auth,
  catchAsync(async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    return 'Avatar removed';
  }),
);

router.get(
  '/:id/avatar',
  catchAsync(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user || !user.avatar) {
        throw new Error();
      }

      res.set('Content-Type', 'image/png');
      res.send(user.avatar);
    } catch (error) {
      throw new ApiError(httpStatus.NOT_FOUND, '');
    }
  }),
);

module.exports = router;
