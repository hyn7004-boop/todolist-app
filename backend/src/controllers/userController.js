const userService = require('../services/userService');
const { ok, fail } = require('../utils/responseHelper');

async function updateMe(req, res, next) {
  const { name, current_password, new_password } = req.body;
  try {
    const result = await userService.updateMe(req.user.user_id, {
      name,
      currentPassword: current_password,
      newPassword: new_password,
    });
    return ok(res, result);
  } catch (err) {
    if (err.code && err.status) {
      return fail(res, err.code, err.message, err.status);
    }
    next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    await userService.deleteMe(req.user.user_id);
    return ok(res, null);
  } catch (err) {
    if (err.code && err.status) {
      return fail(res, err.code, err.message, err.status);
    }
    next(err);
  }
}

module.exports = { updateMe, deleteMe };
