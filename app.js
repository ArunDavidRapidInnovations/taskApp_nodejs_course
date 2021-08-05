const mongoose = require('mongoose');
const chalk = require('chalk');
const express = require('express');
const userRouter = require('./routes/user.route');
const taskRouter = require('./routes/task.route');

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.get('/', (req, res) => {
  res.send('Server is Up and Running');
});

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(chalk.green.inverse('Server Running on port ' + port));
});
