const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

/**
 * todoRoutes.js
 * 모든 라우트에 authMiddleware가 이미 적용되어 있음 (routes/index.js에서 처리)
 */

router.get('/', todoController.getTodos);
router.post('/', todoController.createTodo);
router.get('/:todoId', todoController.getTodo);
router.patch('/:todoId', todoController.updateTodo);
router.delete('/:todoId', todoController.deleteTodo);
router.patch('/:todoId/toggle', todoController.toggleTodo);

module.exports = router;
