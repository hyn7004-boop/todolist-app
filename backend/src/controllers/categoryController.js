const categoryService = require('../services/categoryService');
const { ok, fail } = require('../utils/responseHelper');

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getCategories(req.user.user_id);
    return ok(res, categories);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  const { name } = req.body;
  try {
    const category = await categoryService.createCategory(req.user.user_id, name);
    return ok(res, category, 201);
  } catch (err) {
    if (err.code && err.status) {
      return fail(res, err.code, err.message, err.status);
    }
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  const { categoryId } = req.params;
  try {
    await categoryService.deleteCategory(req.user.user_id, categoryId);
    return res.status(204).send();
  } catch (err) {
    if (err.code && err.status) {
      return fail(res, err.code, err.message, err.status);
    }
    next(err);
  }
}

module.exports = { getCategories, createCategory, deleteCategory };
