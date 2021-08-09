const mongoose = require('mongoose');
const express = require('express');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middleware/error');

const app = express();
const morgan = require('./config/morgan');

const port = process.env.PORT || 3000;

app.use(morgan.successHandler);
app.use(morgan.errorHandler);

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

app.use('/', routes);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
