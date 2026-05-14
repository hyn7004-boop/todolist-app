const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const todoRoutes = require('./todoRoutes');

// 공개 라우트 (인증 불필요)
router.use('/auth', authRoutes);

// 보호 라우트 (JWT 인증 필요)
router.use('/users', authMiddleware, userRoutes);
router.use('/categories', authMiddleware, categoryRoutes);
router.use('/todos', authMiddleware, todoRoutes);

module.exports = router;
