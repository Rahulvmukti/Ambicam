const express = require('express');
const { getAllCameras, addDevice, getStreamDetails, updateCamera, shareCamera, getSharedCamera, getSharedEmails, removeSharedCamera, getMultiplePageCamera, getOnlineCamera, dashboardData, removeUserCamera, saveDeviceImage } = require('../controllers/cameraController');
const { isAuthenticatedUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/getAllCameras', isAuthenticatedUser, getAllCameras);
router.post('/addDevice', isAuthenticatedUser, addDevice);
router.get('/getStreamDetails', isAuthenticatedUser, getStreamDetails);
router.put('/updateCamera/:id', isAuthenticatedUser, updateCamera);
router.post('/shareCamera', isAuthenticatedUser, shareCamera);
router.get('/getSharedCamera', isAuthenticatedUser, getSharedCamera);
router.get('/getSharedEmails', isAuthenticatedUser, getSharedEmails);
router.post('/removeSharedCamera', isAuthenticatedUser, removeSharedCamera);
router.post('/removeUserCamera', isAuthenticatedUser, removeUserCamera);
router.get('/getMultiplePageCamera', isAuthenticatedUser, getMultiplePageCamera);
router.get('/getOnlineCamera', isAuthenticatedUser, getOnlineCamera);
router.get('/dashboardData', isAuthenticatedUser, dashboardData);
router.post('/saveDeviceImage', isAuthenticatedUser, saveDeviceImage);

module.exports = router;
