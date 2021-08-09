const resHandler = (res, data) => {
  res.status(200).send({
    success: true,
    code: 200,
    data,
  });
};

module.exports = resHandler;
