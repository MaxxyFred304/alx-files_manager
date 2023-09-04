const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Define your routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Add the new user creation endpoint
router.post('/users', UsersController.postNew);

// Add new authentication endpoints
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

module.exports = router;
