module.exports = (req, res) => {
  const {data, err} = req;
  console.log('apiRes receive data from req.data: ', JSON.stringify(data));

  if (err) {
    res.render('error', {message: err.message, error: err});
  }

  const responseData = {
    code: 0,
    data: req.data,
  };

  if (data.token) {
    res.cookie('jwt-token', JSON.stringify(data.token));
  }

  res.json(responseData);
};