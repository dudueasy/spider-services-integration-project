module.exports = (req, res) => {
  const {data, err} = req;
  console.log('apiRes receive data from req.data: ', JSON.stringify(data));

  if (err) {
    res.render('error', {message: err.message, error: err});
  }

  const {userList, sub, userFound, token} = data;

  const responseData = {
    code: 0,
    data: {
      userList: userList,
      user: userFound,
      sub: sub,
      token,
    },
  };

  if (token) {
    res.cookie('jwt-token', JSON.stringify(token));
  }

  res.json(responseData);
};