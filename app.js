const result = require('dotenv').config();

const mongoose = require('mongoose');
const chalk = require('chalk');
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

app.listen(port, () => {
  console.log(chalk.green.inverse('Server Running on port ' + port));
});
