const express = require('express');
const router = express.Router();
const taskRoute = require('./task.route');
const userRoute = require('./user.route');

const defaultRoutes = [
  {
    path: '/tasks',
    route: taskRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
