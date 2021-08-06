const mongoose = require('mongoose');
const express = require('express');
const userRouter = require('./routes/user.route');
const taskRouter = require('./routes/task.route');

const app = express();

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use(express.json());
app.get('/', (req, res) => {
  res.send('Server is Up and Running');
});

app.use(userRouter);
app.use(taskRouter);

module.exports = app;
