const todoService = require('../services/todoService');
const { ok, fail } = require('../utils/responseHelper');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * todoController.js
 */

const createTodo = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { title, category_id, due_date, description } = req.body;
    console.log(`[TODO:CTRL] 할일 생성 요청 - user_id: ${userId}, title: "${title}", category_id: ${category_id}`);

    if (!title || title.trim().length === 0) {
      return fail(res, ERROR_CODES.INVALID_TITLE, '제목은 1자 이상 200자 이내로 입력해 주세요.', 400);
    }

    if (!category_id || !due_date) {
      return fail(res, ERROR_CODES.MISSING_REQUIRED_FIELD, '필수 입력값이 누락되었습니다.', 400);
    }

    const todo = await todoService.createTodo(userId, {
      title,
      categoryId: category_id,
      dueDate: due_date,
      description,
    });

    console.log(`[TODO:CTRL] 할일 생성 완료 - todo_id: ${todo.todo_id}`);
    return ok(res, todo, 201);
  } catch (error) {
    if (error.code) {
      return fail(res, error.code, error.message, error.status);
    }
    next(error);
  }
};

const getTodos = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { category_id, due_date_from, due_date_to, is_completed } = req.query;
    console.log(`[TODO:CTRL] 할일 목록 조회 요청 - user_id: ${userId}, filters: ${JSON.stringify(req.query)}`);

    const todos = await todoService.getTodos(userId, {
      category_id,
      due_date_from,
      due_date_to,
      is_completed,
    });

    return ok(res, todos);
  } catch (error) {
    if (error.code) {
      return fail(res, error.code, error.message, error.status);
    }
    next(error);
  }
};

const updateTodo = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { todoId } = req.params;
    const { title, category_id, due_date, description } = req.body;
    console.log(`[TODO:CTRL] 할일 수정 요청 - user_id: ${userId}, todo_id: ${todoId}, fields: ${JSON.stringify(req.body)}`);

    const fields = {};
    if (title !== undefined) fields.title = title;
    if (category_id !== undefined) fields.category_id = category_id;
    if (due_date !== undefined) fields.due_date = due_date;
    if (description !== undefined) fields.description = description;

    const todo = await todoService.updateTodo(userId, todoId, fields);

    return ok(res, todo);
  } catch (error) {
    if (error.code) {
      return fail(res, error.code, error.message, error.status);
    }
    next(error);
  }
};

const deleteTodo = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { todoId } = req.params;
    console.log(`[TODO:CTRL] 할일 삭제 요청 - user_id: ${userId}, todo_id: ${todoId}`);

    await todoService.deleteTodo(userId, todoId);

    console.log(`[TODO:CTRL] 할일 삭제 완료 - todo_id: ${todoId}`);
    return res.status(204).end();
  } catch (error) {
    if (error.code) {
      return fail(res, error.code, error.message, error.status);
    }
    next(error);
  }
};

const toggleTodo = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { todoId } = req.params;
    console.log(`[TODO:CTRL] 할일 토글 요청 - user_id: ${userId}, todo_id: ${todoId}`);

    const todo = await todoService.toggleTodo(userId, todoId);

    return ok(res, {
      todo_id: todo.todo_id,
      is_completed: todo.is_completed,
      updated_at: todo.updated_at,
    });
  } catch (error) {
    if (error.code) {
      return fail(res, error.code, error.message, error.status);
    }
    next(error);
  }
};

const getTodo = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { todoId } = req.params;
    console.log(`[TODO:CTRL] 할일 단건 조회 요청 - user_id: ${userId}, todo_id: ${todoId}`);

    const todo = await todoService.getTodoById(userId, todoId);

    return ok(res, todo);
  } catch (error) {
    if (error.code) {
      return fail(res, error.code, error.message, error.status);
    }
    next(error);
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  toggleTodo,
};
