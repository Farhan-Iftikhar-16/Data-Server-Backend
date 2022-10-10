/***
 * Customer router
 */
 const express = require('express');
 const router = express.Router();
 const userController = require('../controllers/user');

router.post('/signup', userController.singup);
router.post('/login', userController.login);
router.get('/searchUsers/:id/:query', userController.searchUsers);


module.exports = router;
