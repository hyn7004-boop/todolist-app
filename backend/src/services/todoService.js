const todoRepository = require('../repositories/todoRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { isValidDueDate, isValidDateFormat, isValidDateRange } = require('../utils/dateUtils');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * todoService.js
 */

const createTodo = async (userId, { title, categoryId, dueDate, description }) => {
  if (!isValidDueDate(dueDate)) {
    console.warn(`[TODO:SVC] 유효하지 않은 종료예정일 - user_id: ${userId}, due_date: ${dueDate}`);
    const error = new Error('종료예정일은 오늘 날짜 이상이어야 합니다.');
    error.code = ERROR_CODES.INVALID_DUE_DATE;
    error.status = 400;
    throw error;
  }

  const category = await categoryRepository.findById(categoryId, userId);
  if (!category) {
    console.warn(`[TODO:SVC] 유효하지 않은 카테고리 - user_id: ${userId}, category_id: ${categoryId}`);
    const error = new Error('유효하지 않은 카테고리입니다.');
    error.code = ERROR_CODES.INVALID_CATEGORY;
    error.status = 400;
    throw error;
  }

  if (!title || title.trim().length === 0 || title.length > 200) {
    console.warn(`[TODO:SVC] 유효하지 않은 제목 - user_id: ${userId}, title length: ${title?.length}`);
    const error = new Error('제목은 1자 이상 200자 이내로 입력해 주세요.');
    error.code = ERROR_CODES.INVALID_TITLE;
    error.status = 400;
    throw error;
  }

  console.log(`[TODO:SVC] 할일 생성 - user_id: ${userId}, category_id: ${categoryId}, due_date: ${dueDate}`);
  return await todoRepository.create(userId, {
    title,
    categoryId,
    dueDate,
    description,
  });
};

const getTodos = async (userId, filters) => {
  if (filters.due_date_from && !isValidDateFormat(filters.due_date_from)) {
    const error = new Error('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)');
    error.code = ERROR_CODES.INVALID_DATE_FORMAT;
    error.status = 400;
    throw error;
  }
  if (filters.due_date_to && !isValidDateFormat(filters.due_date_to)) {
    const error = new Error('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)');
    error.code = ERROR_CODES.INVALID_DATE_FORMAT;
    error.status = 400;
    throw error;
  }
  if (filters.due_date_from && filters.due_date_to && !isValidDateRange(filters.due_date_from, filters.due_date_to)) {
    const error = new Error('시작일은 종료일보다 이전이어야 합니다.');
    error.code = ERROR_CODES.INVALID_DATE_RANGE;
    error.status = 400;
    throw error;
  }

  return await todoRepository.findAllByUserId(userId, filters);
};

const updateTodo = async (userId, todoId, fields) => {
  const todo = await todoRepository.findById(todoId, userId);
  if (!todo) {
    console.warn(`[TODO:SVC] 할일 없음 (수정) - user_id: ${userId}, todo_id: ${todoId}`);
    const error = new Error('할일을 찾을 수 없습니다.');
    error.code = ERROR_CODES.TODO_NOT_FOUND;
    error.status = 404;
    throw error;
  }

  if (todo.is_completed) {
    const error = new Error('완료된 할일은 수정할 수 없습니다.');
    error.code = ERROR_CODES.TODO_ALREADY_COMPLETED;
    error.status = 400;
    throw error;
  }

  if (fields.title !== undefined) {
    if (fields.title.trim().length === 0 || fields.title.length > 200) {
      const error = new Error('제목은 1자 이상 200자 이내로 입력해 주세요.');
      error.code = ERROR_CODES.INVALID_TITLE;
      error.status = 400;
      throw error;
    }
  }

  if (fields.due_date !== undefined) {
    if (!isValidDueDate(fields.due_date)) {
      const error = new Error('종료예정일은 오늘 날짜 이상이어야 합니다.');
      error.code = ERROR_CODES.INVALID_DUE_DATE;
      error.status = 400;
      throw error;
    }
  }

  if (fields.category_id !== undefined) {
    const category = await categoryRepository.findById(fields.category_id, userId);
    if (!category) {
      const error = new Error('유효하지 않은 카테고리입니다.');
      error.code = ERROR_CODES.INVALID_CATEGORY;
      error.status = 400;
      throw error;
    }
  }

  return await todoRepository.update(todoId, fields);
};

const deleteTodo = async (userId, todoId) => {
  const todo = await todoRepository.findById(todoId, userId);
  if (!todo) {
    console.warn(`[TODO:SVC] 할일 없음 (삭제) - user_id: ${userId}, todo_id: ${todoId}`);
    const error = new Error('할일을 찾을 수 없습니다.');
    error.code = ERROR_CODES.TODO_NOT_FOUND;
    error.status = 404;
    throw error;
  }

  console.log(`[TODO:SVC] 할일 삭제 - todo_id: ${todoId}`);
  await todoRepository.deleteById(todoId);
};

const toggleTodo = async (userId, todoId) => {
  const todo = await todoRepository.findById(todoId, userId);
  if (!todo) {
    console.warn(`[TODO:SVC] 할일 없음 (토글) - user_id: ${userId}, todo_id: ${todoId}`);
    const error = new Error('할일을 찾을 수 없습니다.');
    error.code = ERROR_CODES.TODO_NOT_FOUND;
    error.status = 404;
    throw error;
  }

  console.log(`[TODO:SVC] 할일 토글 - todo_id: ${todoId}, ${todo.is_completed} → ${!todo.is_completed}`);
  return await todoRepository.toggleCompleted(todoId, todo.is_completed);
};

const getTodoById = async (userId, todoId) => {
  const todo = await todoRepository.findById(todoId, userId);
  if (!todo) {
    console.warn(`[TODO:SVC] 할일 없음 (조회) - user_id: ${userId}, todo_id: ${todoId}`);
    const error = new Error('할일을 찾을 수 없습니다.');
    error.code = ERROR_CODES.TODO_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  return todo;
};

module.exports = {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  toggleTodo,
};
