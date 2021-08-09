const express = require('express');
const router = new express.Router();
const chalk = require('chalk');
const Task = require('../models/task.model');
const auth = require('../middleware/auth');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

router.post(
  '/',
  auth,
  catchAsync(async (req, res, next) => {
    try {
      const newTask = await Task.create({ ...req.body, owner: req.user._id });
      return newTask;
    } catch (error) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

// GET /tasks/?completed=Boolean&limit=5&skip=10&sortBy=createdAt_desc
router.get(
  '/',
  auth,
  catchAsync(async (req, res, next) => {
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

      return tasksInSystem;
    } catch (error) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

router.get(
  '/:id',
  auth,
  catchAsync(async (req, res, next) => {
    const _id = req.params.id;
    try {
      const task = await Task.findOne({ _id, owner: req.user._id });
      if (!task) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'There is no data with that ID ',
        );
      }
      return task;
    } catch (error) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

router.patch(
  '/:id',
  auth,
  catchAsync(async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'complected'];

    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Update');
    }
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });
      if (!task) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'There is no data with that ID',
        );
      }
      updates.forEach((update) => (task[update] = req.body[update]));
      await task.save();
      return task;
    } catch (error) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

router.delete(
  '/:id',
  auth,
  catchAsync(async (req, res, next) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });
      if (!task) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'There is no data with that ID',
        );
      }
      await task.remove();
      return task;
    } catch (error) {
      console.log(chalk.red(error.message));
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
  }),
);

module.exports = router;
