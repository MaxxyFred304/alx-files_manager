const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

const router = express.Router();

// Define your routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Add the new user creation endpoint
router.post('/users', UsersController.postNew);

module.exports = router;
