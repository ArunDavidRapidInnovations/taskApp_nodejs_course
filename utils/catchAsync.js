const resHandler = require('../utils/resHandler');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .then((data) => {
      // console.log(data);
      resHandler(res, data);
    })
    .catch((err) => next(err));
};

module.exports = catchAsync;
