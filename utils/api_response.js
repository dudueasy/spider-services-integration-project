let logger = require('./loggers/logger');

module.exports = (req, res) => {
  const {data, err} = req;

  if (err) {
    logger('error', 'uncaughtException error: %s', err.message, err.stack);
    res.send({code: err.errorCode, msg: err.message});
  }
  else {
    console.log('apiRes receive data from req.data: ', JSON.stringify(data));
    const responseData = {
      code: 0,
      data: req.data,
    };

    if (data.token) {
      res.cookie('jwt-token', JSON.stringify(data.token));
    }

    res.json(responseData);
  }
};