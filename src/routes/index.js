/***
 * Customer router
 */
 const express = require('express');
 const router = express.Router();
 const indexController = require('../controllers/index');

router.get('/list/:id', indexController.listFilesAndFolder);
router.post('/delete', indexController.deleteFileOrFolder);
router.post('/create', indexController.createFileOrFolder);
router.post('/saveFileContent', indexController.saveFileContent);
router.get('/getFileContent/:fileId', indexController.getFileContent);
router.post('/shareFoldersOrFilesWithUsers', indexController.shareFoldersOrFilesWithUsers);

module.exports = router;
