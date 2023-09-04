const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

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

// Add the new file upload endpoint
router.post('/files', FilesController.postUpload);

// Add new file retrieval endpoints
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

// Add new file publishing/unpublishing endpoints
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

// Add the new file data retrieval endpoint
router.get('/files/:id/data', FilesController.getFile);

module.exports = router;
