const authService = require('../services/authService');
const { ok, fail } = require('../utils/responseHelper');

async function signup(req, res, next) {
  const { email, password, name } = req.body;
  try {
    const user = await authService.signup(email, password, name);
    return ok(res, user, 201);
  } catch (err) {
    if (err.code && err.status) {
      return fail(res, err.code, err.message, err.status);
    }
    next(err);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const result = await authService.login(email, password);
    return ok(res, result, 200);
  } catch (err) {
    if (err.code && err.status) {
      return fail(res, err.code, err.message, err.status);
    }
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    authService.logout();
    return ok(res, null, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, logout };
