module.exports = (err, req, res, next) => {
  res.render('error', {message: err.message, error: err})
}