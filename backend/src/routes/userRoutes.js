const router = require('express').Router();
const userController = require('../controllers/userController');

router.patch('/me', userController.updateMe);
router.delete('/me', userController.deleteMe);

module.exports = router;
