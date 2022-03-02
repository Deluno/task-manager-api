const contentType = 'Content-Type';
const allowOrigin = 'Access-Control-Allow-Origin';
const allowMethods = 'Access-Control-Allow-Methods';
const allowHeaders = 'Access-Control-Allow-Headers';

exports.setHeaders = (req, res, next) => {
  res.setHeader(allowOrigin, '*');
  res.setHeader(allowMethods, 'GET, POST, PATCH, DELETE');
  res.setHeader(allowHeaders, 'Content-Type, Authorization');
  res.setHeader(contentType, 'application/json');
  next();
};

exports.isUserOrAdmin = (user, req) => {
  if (user.username === req.username) return true;
  if (req.role === 'admin') return true;
  return false;
};

exports.isAdmin = (req) => {
  if (req.role === 'admin') return true;
  return false;
};
